"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { setListingStatusAction } from "@/app/listing/actions";

export function MarkSoldButton({ listingId }: { listingId: string }) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  function handleClick() {
    startTransition(async () => {
      setError(null);
      const result = await setListingStatusAction(listingId, "SOLD");
      if ("error" in result) {
        setError(result.error);
        return;
      }
      router.refresh();
    });
  }

  return (
    <div className="flex-1 min-w-0">
      <button
        type="button"
        onClick={handleClick}
        disabled={pending}
        className="w-full bg-teal text-bg-inset text-[12px] font-semibold px-3 h-8 rounded-(--radius-tag) hover:bg-teal/90 disabled:opacity-50 transition-colors whitespace-nowrap"
      >
        {pending ? "Marking…" : "Mark sold"}
      </button>
      {error && <p className="text-[11px] text-danger mt-1">{error}</p>}
    </div>
  );
}
