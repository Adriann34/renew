"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { startConversationAction } from "@/app/messages/actions";

export function BuyNowButton({ listingId }: { listingId: string }) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  function onClick() {
    setError(null);
    startTransition(async () => {
      const result = await startConversationAction(listingId);
      if ("error" in result) {
        if (result.error === "unauthenticated") {
          router.push(`/signin?next=/listing/${listingId}`);
        } else {
          setError(result.error);
        }
        return;
      }
      router.push(`/messages/${result.id}`);
    });
  }

  return (
    <div>
      <button
        type="button"
        onClick={onClick}
        disabled={pending}
        className="w-full bg-amber text-bg-inset text-[14px] font-medium h-11 rounded-(--radius-tag) hover:brightness-95 transition disabled:opacity-60"
      >
        {pending ? "Opening…" : "Buy Now"}
      </button>
      {error && (
        <p className="text-[12px] text-danger text-center mt-2.5">{error}</p>
      )}
    </div>
  );
}
