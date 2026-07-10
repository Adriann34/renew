/**
 * One-time setup: creates the PRIVATE `chat-attachments` storage bucket that chat
 * image attachments live in. Idempotent — safe to run more than once.
 *
 * Run with:  npm run setup:chat-bucket
 * Requires NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SECRET_KEY in the environment.
 */
import { createClient } from "@supabase/supabase-js";

const BUCKET = "chat-attachments";

async function main() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SECRET_KEY;
  if (!url || !key) {
    throw new Error(
      "Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SECRET_KEY in the environment."
    );
  }

  const admin = createClient(url, key, {
    auth: { autoRefreshToken: false, persistSession: false },
  });

  const { error } = await admin.storage.createBucket(BUCKET, {
    public: false, // the whole point — no anonymous read
    fileSizeLimit: 10 * 1024 * 1024,
    allowedMimeTypes: ["image/webp"], // uploads are compressed to webp before storing
  });

  if (error) {
    // Supabase returns a "already exists" error on re-runs — treat that as success.
    if (/already exists/i.test(error.message)) {
      console.log(`✓ Bucket "${BUCKET}" already exists — nothing to do.`);
      return;
    }
    throw error;
  }

  console.log(`✓ Created private bucket "${BUCKET}".`);
}

main().catch((err) => {
  console.error("Failed to set up chat bucket:", err);
  process.exit(1);
});
