"use client";

import { useState } from "react";

export function ListingActions() {
  const [liked, setLiked] = useState(false);
  const [showToast, setShowToast] = useState(false);

  function share() {
    navigator.clipboard.writeText(window.location.href).catch(() => {});
    setShowToast(true);
    setTimeout(() => setShowToast(false), 1400);
  }

  return (
    <div className="flex gap-2 shrink-0 pt-1">
      <button
        type="button"
        onClick={() => setLiked((v) => !v)}
        aria-pressed={liked}
        aria-label="Save listing"
        className={`w-9 h-9 flex items-center justify-center rounded-(--radius-tag) border transition-colors ${
          liked
            ? "border-danger text-danger bg-danger/10"
            : "border-line text-ink-dim hover:border-ink-dim hover:text-ink"
        }`}
      >
        <svg width="16" height="16" viewBox="0 0 24 24" fill={liked ? "currentColor" : "none"} stroke="currentColor" strokeWidth="2">
          <path d="M20.8 4.6a5.5 5.5 0 00-7.8 0L12 5.6l-1-1a5.5 5.5 0 10-7.8 7.8l1 1L12 21l7.8-7.8 1-1a5.5 5.5 0 000-7.8z" />
        </svg>
      </button>
      <div className="relative">
        <button
          type="button"
          onClick={share}
          aria-label="Share listing"
          className="w-9 h-9 flex items-center justify-center rounded-(--radius-tag) border border-line text-ink-dim hover:border-ink-dim hover:text-ink transition-colors"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="18" cy="5" r="3" />
            <circle cx="6" cy="12" r="3" />
            <circle cx="18" cy="19" r="3" />
            <line x1="8.6" y1="10.6" x2="15.4" y2="6.4" />
            <line x1="8.6" y1="13.4" x2="15.4" y2="17.6" />
          </svg>
        </button>
        <span
          className={`absolute -top-9 right-0 whitespace-nowrap bg-ink text-bg text-[11px] font-mono px-2 py-1 rounded-(--radius-tag) transition-opacity ${
            showToast ? "opacity-100" : "opacity-0 pointer-events-none"
          }`}
        >
          Link copied
        </span>
      </div>
    </div>
  );
}
