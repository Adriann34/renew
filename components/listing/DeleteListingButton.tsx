"use client";

import { useState, useTransition } from "react";
import { deleteListingAction } from "@/app/listing/actions";

export function DeleteListingButton({ listingId }: { listingId: string }) {
  const [confirming, setConfirming] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  function handleDelete() {
    startTransition(async () => {
      setError(null);
      // On success the action redirects (throws NEXT_REDIRECT), so control
      // only returns here when it hands back an error object.
      const result = await deleteListingAction(listingId);
      if (result?.error) setError(result.error);
    });
  }

  if (!confirming) {
    return (
      <button
        type="button"
        onClick={() => setConfirming(true)}
        className="inline-flex items-center gap-1.5 text-[13px] font-medium px-3 h-9 rounded-(--radius-tag) border border-danger/40 text-danger hover:bg-danger/10 transition-colors"
      >
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <polyline points="3 6 5 6 21 6" />
          <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" />
          <path d="M10 11v6M14 11v6" />
          <path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2" />
        </svg>
        Delete listing
      </button>
    );
  }

  return (
    <div className="flex items-center gap-2 flex-wrap">
      <span className="text-[12px] text-ink-dim">
        {error ?? "Delete this listing permanently?"}
      </span>
      <button
        type="button"
        onClick={handleDelete}
        disabled={pending}
        className="text-[12px] font-medium px-3 h-8 flex items-center rounded-(--radius-tag) bg-danger text-bg-inset hover:bg-danger/90 disabled:opacity-50 transition-colors"
      >
        {pending ? "Deleting…" : "Yes, delete"}
      </button>
      <button
        type="button"
        onClick={() => {
          setConfirming(false);
          setError(null);
        }}
        disabled={pending}
        className="text-[12px] px-3 h-8 flex items-center rounded-(--radius-tag) border border-line text-ink-dim hover:text-ink disabled:opacity-50 transition-colors"
      >
        Cancel
      </button>
    </div>
  );
}
