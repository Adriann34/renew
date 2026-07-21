"use client";

import { useActionState, useState } from "react";
import {
  updateProfileAction,
  updatePasswordAction,
  deleteAccountAction,
  type UpdateProfileState,
  type UpdatePasswordState,
  type DeleteAccountState,
} from "@/app/account/actions";
import { AvatarUploadForm } from "@/components/account/AvatarUploadForm";
import { CURRENCIES } from "@/lib/currency";

const inputClass =
  "w-full border border-line bg-bg-inset px-3 h-10 text-[14px] text-ink placeholder:text-ink-dim outline-none focus:border-amber transition-colors disabled:opacity-60";
const labelClass = "block text-[12px] text-ink-dim mb-1.5";

const profileInitial: UpdateProfileState = { error: null };
const passwordInitial: UpdatePasswordState = { error: null };
const deleteInitial: DeleteAccountState = { error: null };

export function SettingsPanel({
  email,
  name,
  phone,
  location,
  avatarUrl,
  preferredCurrency,
}: {
  email: string;
  name: string;
  phone: string;
  location: string;
  avatarUrl: string | null;
  /** "" = no saved preference (auto-detect from browser locale). */
  preferredCurrency: string;
}) {
  const [profileState, profileAction, profilePending] = useActionState(updateProfileAction, profileInitial);
  const [passwordState, passwordAction, passwordPending] = useActionState(updatePasswordAction, passwordInitial);
  const [deleteState, deleteActionFn, deletePending] = useActionState(deleteAccountAction, deleteInitial);
  const [confirmingDelete, setConfirmingDelete] = useState(false);

  return (
    <div className="flex flex-col gap-6">
      <section className="border border-line bg-bg-elevated p-6">
        <h3 className="font-display font-semibold text-[16px] mb-1">Profile information</h3>
        <p className="text-ink-dim text-[13px] mb-5">
          Shown to buyers and sellers you interact with on renew.
        </p>

        <div className="mb-5 pb-5 border-b border-line">
          <AvatarUploadForm avatarUrl={avatarUrl} initials={(name || email).slice(0, 2).toUpperCase()} />
        </div>

        <form action={profileAction} className="space-y-4">
          {profileState.error && (
            <p className="text-[13px] text-danger border border-danger/40 bg-danger/5 px-3 py-2">
              {profileState.error}
            </p>
          )}
          {profileState.success && (
            <p className="text-[13px] text-pass border border-pass/40 bg-pass/5 px-3 py-2">
              Saved.
            </p>
          )}
          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label htmlFor="name" className={labelClass}>Full name</label>
              <input id="name" name="name" type="text" defaultValue={name} className={inputClass} />
            </div>
            <div>
              <label htmlFor="email" className={labelClass}>Email</label>
              <input id="email" type="email" value={email} disabled className={inputClass} />
            </div>
            <div>
              <label htmlFor="phone" className={labelClass}>Phone</label>
              <input id="phone" name="phone" type="text" defaultValue={phone} placeholder="+63 917 555 0142" className={inputClass} />
            </div>
            <div>
              <label htmlFor="location" className={labelClass}>Location</label>
              <input id="location" name="location" type="text" defaultValue={location} placeholder="Manila, Philippines" className={inputClass} />
            </div>
            <div>
              <label htmlFor="preferredCurrency" className={labelClass}>Display currency</label>
              <select
                id="preferredCurrency"
                name="preferredCurrency"
                defaultValue={preferredCurrency}
                className={inputClass}
              >
                <option value="">Auto-detect</option>
                {CURRENCIES.map((c) => (
                  <option key={c.code} value={c.code}>
                    {c.code} — {c.name}
                  </option>
                ))}
              </select>
              <p className="text-[11.5px] text-ink-dim mt-1">
                Prices are shown converted into this currency. Sellers always set their own.
              </p>
            </div>
          </div>
          <div className="flex justify-end">
            <button
              type="submit"
              disabled={profilePending}
              className="bg-amber text-bg-inset text-[13.5px] font-semibold px-5 h-10 rounded-(--radius-tag) hover:bg-amber/90 disabled:opacity-60 transition-colors"
            >
              {profilePending ? "Saving…" : "Save changes"}
            </button>
          </div>
        </form>
      </section>

      <section className="border border-line bg-bg-elevated p-6">
        <h3 className="font-display font-semibold text-[16px] mb-1">Password &amp; security</h3>
        <p className="text-ink-dim text-[13px] mb-5">
          Use a strong password you&apos;re not using anywhere else.
        </p>

        <form
          action={passwordAction}
          className="space-y-4"
          onSubmit={(e) => {
            const form = e.currentTarget;
            if (form.newPassword.value !== form.confirmPassword.value) {
              e.preventDefault();
            }
          }}
        >
          {passwordState.error && (
            <p className="text-[13px] text-danger border border-danger/40 bg-danger/5 px-3 py-2">
              {passwordState.error}
            </p>
          )}
          {passwordState.success && (
            <p className="text-[13px] text-pass border border-pass/40 bg-pass/5 px-3 py-2">
              Password updated.
            </p>
          )}
          <div>
            <label htmlFor="currentPassword" className={labelClass}>Current password</label>
            <input id="currentPassword" name="currentPassword" type="password" required className={inputClass} />
          </div>
          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label htmlFor="newPassword" className={labelClass}>New password</label>
              <input id="newPassword" name="newPassword" type="password" required minLength={8} className={inputClass} />
            </div>
            <div>
              <label htmlFor="confirmPassword" className={labelClass}>Confirm new password</label>
              <input id="confirmPassword" name="confirmPassword" type="password" required minLength={8} className={inputClass} />
            </div>
          </div>
          <div className="flex justify-end">
            <button
              type="submit"
              disabled={passwordPending}
              className="bg-amber text-bg-inset text-[13.5px] font-semibold px-5 h-10 rounded-(--radius-tag) hover:bg-amber/90 disabled:opacity-60 transition-colors"
            >
              {passwordPending ? "Updating…" : "Update password"}
            </button>
          </div>
        </form>
      </section>

      <section className="border border-danger/40 bg-bg-elevated p-6">
        <h3 className="font-display font-semibold text-[16px] mb-1">Danger zone</h3>
        <p className="text-ink-dim text-[13px] mb-5">
          Deleting your account removes your listings, photos, and saved items permanently. This
          can&apos;t be undone.
        </p>

        {!confirmingDelete ? (
          <button
            type="button"
            onClick={() => setConfirmingDelete(true)}
            className="border border-danger text-danger text-[13.5px] font-semibold px-5 h-10 rounded-(--radius-tag) hover:bg-danger/10 transition-colors"
          >
            Delete my account
          </button>
        ) : (
          <form action={deleteActionFn} className="space-y-3 max-w-sm">
            {deleteState.error && (
              <p className="text-[13px] text-danger border border-danger/40 bg-danger/5 px-3 py-2">
                {deleteState.error}
              </p>
            )}
            <div>
              <label htmlFor="confirmEmail" className={labelClass}>
                Type <span className="font-mono text-ink">{email}</span> to confirm
              </label>
              <input id="confirmEmail" name="confirmEmail" type="text" required className={inputClass} />
            </div>
            <div className="flex gap-2">
              <button
                type="submit"
                disabled={deletePending}
                className="bg-danger text-bg-inset text-[13.5px] font-semibold px-5 h-10 rounded-(--radius-tag) hover:bg-danger/90 disabled:opacity-60 transition-colors"
              >
                {deletePending ? "Deleting…" : "Permanently delete account"}
              </button>
              <button
                type="button"
                onClick={() => setConfirmingDelete(false)}
                disabled={deletePending}
                className="border border-line text-[13.5px] px-5 h-10 rounded-(--radius-tag) text-ink-dim hover:text-ink disabled:opacity-50 transition-colors"
              >
                Cancel
              </button>
            </div>
          </form>
        )}
      </section>
    </div>
  );
}
