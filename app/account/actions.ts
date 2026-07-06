"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { prisma } from "@/lib/prisma";
import { compressImage } from "@/lib/image";
import { ALLOWED_PHOTO_TYPES, storagePathFromUrl } from "@/lib/photoUpload";

const MAX_NAME_LEN = 80;
const MAX_PHONE_LEN = 30;
const MAX_LOCATION_LEN = 120;

const MAX_AVATAR_UPLOAD_BYTES = 4 * 1024 * 1024;
const AVATAR_TARGET_BYTES = 150 * 1024;
const AVATAR_MAX_DIMENSION = 512;

export type UpdateProfileState = { error: string | null; success?: boolean };

function str(formData: FormData, key: string): string {
  const value = formData.get(key);
  return typeof value === "string" ? value.trim() : "";
}

export async function updateProfileAction(
  _prevState: UpdateProfileState,
  formData: FormData
): Promise<UpdateProfileState> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "You must be signed in." };

  const name = str(formData, "name");
  const phone = str(formData, "phone");
  const location = str(formData, "location");

  if (name.length > MAX_NAME_LEN || phone.length > MAX_PHONE_LEN || location.length > MAX_LOCATION_LEN) {
    return { error: "One or more fields exceed their maximum length." };
  }

  await prisma.user.upsert({
    where: { id: user.id },
    update: { name: name || null, phone: phone || null, location: location || null },
    create: {
      id: user.id,
      email: user.email!,
      name: name || null,
      phone: phone || null,
      location: location || null,
    },
  });

  revalidatePath("/account");
  return { error: null, success: true };
}

export type UpdateAvatarState = { error: string | null };

export async function updateAvatarAction(
  _prevState: UpdateAvatarState,
  formData: FormData
): Promise<UpdateAvatarState> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "You must be signed in." };

  const file = formData.get("avatar");
  if (!(file instanceof File) || file.size === 0) {
    return { error: "Please choose a photo." };
  }
  if (!ALLOWED_PHOTO_TYPES.has(file.type)) {
    return { error: "Photo must be JPEG, PNG, WebP, or HEIC." };
  }
  if (file.size > MAX_AVATAR_UPLOAD_BYTES) {
    return { error: `Photo must be under ${MAX_AVATAR_UPLOAD_BYTES / (1024 * 1024)}MB.` };
  }

  const original = Buffer.from(await file.arrayBuffer());
  const compressed = await compressImage(original, {
    maxDimension: AVATAR_MAX_DIMENSION,
    targetBytes: AVATAR_TARGET_BYTES,
  });

  // Stable path (one avatar per user) so re-uploads overwrite instead of piling up.
  const path = `avatars/${user.id}.webp`;
  // The bucket's RLS policy is scoped to listing-photo paths, not this one —
  // use the admin client to bypass it. Safe here because `user` comes from a
  // verified session and the path is deterministically tied to their own id.
  const admin = createAdminClient();
  const { error: uploadError } = await admin.storage
    .from("listing-photos")
    .upload(path, compressed, { contentType: "image/webp", upsert: true });
  if (uploadError) {
    console.error("Avatar upload failed:", uploadError);
    return { error: "Failed to upload photo. Please try again." };
  }

  const { data } = supabase.storage.from("listing-photos").getPublicUrl(path);
  // Cache-bust: the path is stable across uploads, so the URL needs a
  // changing query param or callers keep seeing the old cached image.
  const avatarUrl = `${data.publicUrl}?v=${Date.now()}`;

  await prisma.user.upsert({
    where: { id: user.id },
    update: { avatarUrl },
    create: { id: user.id, email: user.email!, avatarUrl },
  });

  revalidatePath("/account");
  return { error: null };
}

export type UpdatePasswordState = { error: string | null; success?: boolean };

export async function updatePasswordAction(
  _prevState: UpdatePasswordState,
  formData: FormData
): Promise<UpdatePasswordState> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user || !user.email) return { error: "You must be signed in." };

  const currentPassword = str(formData, "currentPassword");
  const newPassword = str(formData, "newPassword");
  const confirmPassword = str(formData, "confirmPassword");

  if (!currentPassword || !newPassword || !confirmPassword) {
    return { error: "Please fill in all fields." };
  }
  if (newPassword.length < 8) {
    return { error: "New password must be at least 8 characters." };
  }
  if (newPassword !== confirmPassword) {
    return { error: "New passwords don't match." };
  }

  // Re-verify the current password before allowing a change — a signed-in
  // session alone shouldn't be enough to take over the password.
  const { error: reauthError } = await supabase.auth.signInWithPassword({
    email: user.email,
    password: currentPassword,
  });
  if (reauthError) {
    return { error: "Current password is incorrect." };
  }

  const { error } = await supabase.auth.updateUser({ password: newPassword });
  if (error) {
    return { error: "Failed to update password. Please try again." };
  }

  return { error: null, success: true };
}

export type DeleteAccountState = { error: string | null };

export async function deleteAccountAction(
  _prevState: DeleteAccountState,
  formData: FormData
): Promise<DeleteAccountState> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "You must be signed in." };

  const confirmEmail = str(formData, "confirmEmail");
  if (confirmEmail.toLowerCase() !== (user.email ?? "").toLowerCase()) {
    return { error: "Type your account email exactly to confirm deletion." };
  }

  const listings = await prisma.listing.findMany({
    where: { sellerId: user.id },
    include: { photos: true },
  });
  const storagePaths = listings
    .flatMap((l) => l.photos)
    .map((p) => storagePathFromUrl(p.url))
    .filter((p): p is string => Boolean(p));

  try {
    await prisma.$transaction([
      prisma.listing.deleteMany({ where: { sellerId: user.id } }),
      prisma.user.delete({ where: { id: user.id } }),
    ]);
  } catch {
    return { error: "Failed to delete your account data. Please try again." };
  }

  if (storagePaths.length > 0) {
    try {
      await supabase.storage.from("listing-photos").remove(storagePaths);
    } catch {
      // Non-fatal: the DB rows are already gone; orphaned storage files can be reaped later.
    }
  }

  try {
    const admin = createAdminClient();
    await admin.auth.admin.deleteUser(user.id);
  } catch {
    // App data is already gone at this point; the auth user may linger, but
    // signing back in will just start from a fresh, empty profile.
  }

  await supabase.auth.signOut();
  redirect("/");
}
