"use client";

import { useState } from "react";
import type { AiVerificationResult, AiClaimStatus, AiVerificationStatus } from "@/lib/aiVerify";

const OVERALL: Record<
  AiVerificationStatus,
  { label: string; cls: string; dot: string }
> = {
  verified: {
    label: "Verified against photos",
    cls: "border-pass text-pass bg-pass/10",
    dot: "bg-pass",
  },
  partial: {
    label: "Partially verified",
    cls: "border-amber text-amber bg-amber/10",
    dot: "bg-amber",
  },
  unverified: {
    label: "Not enough photo evidence",
    cls: "border-line text-ink-dim bg-bg-inset",
    dot: "bg-ink-dim",
  },
  flagged: {
    label: "Photos contradict the report",
    cls: "border-danger text-danger bg-danger/10",
    dot: "bg-danger",
  },
};

const CLAIM: Record<AiClaimStatus, { mark: string; cls: string; word: string }> = {
  match: { mark: "✓", cls: "text-pass", word: "Matches" },
  mismatch: { mark: "✗", cls: "text-danger", word: "Mismatch" },
  not_visible: { mark: "–", cls: "text-ink-dim", word: "Not visible" },
};

function InfoIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <circle cx="12" cy="12" r="10" />
      <line x1="12" y1="11" x2="12" y2="16" strokeLinecap="round" />
      <circle cx="12" cy="7.75" r="1.1" fill="currentColor" stroke="none" />
    </svg>
  );
}

/**
 * The AI photo-verification verdict on the listing page. Shows the overall state
 * (verified / partial / unverified / flagged), a plain summary, how many of the 4
 * checks were confirmed, and the model's confidence (with an explainer). The
 * per-claim breakdown is behind a toggle so the panel stays compact.
 */
export function AiVerdictPanel({ result }: { result: AiVerificationResult }) {
  const [open, setOpen] = useState(false);
  const overall = OVERALL[result.status];
  const totalChecks = result.claims.length;
  const mismatchConfidences = result.claims
    .filter((c) => c.status === "mismatch")
    .map((c) => c.confidence);
  const flagConfidence = mismatchConfidences.length ? Math.max(...mismatchConfidences) : 0;

  return (
    <section className="border border-line bg-bg-elevated rounded-(--radius-tag) overflow-hidden mb-6">
      <header className="px-4 py-3 border-b border-line">
        <div className="flex items-center gap-1.5">
          <span className="font-mono text-[11px] uppercase tracking-[0.2em] text-amber">Photo check</span>
          <span className="relative group inline-flex items-center">
            <button
              type="button"
              aria-label="How the photo check works"
              className="flex items-center text-ink-dim hover:text-ink transition-colors"
            >
              <InfoIcon />
            </button>
            <span className="pointer-events-none absolute left-0 top-full mt-2 z-10 w-64 opacity-0 group-hover:opacity-100 group-focus-within:opacity-100 transition-opacity border border-line bg-bg-inset rounded-(--radius-tag) px-3 py-2 text-[11.5px] leading-snug text-ink-dim">
              Each check below carries the model&rsquo;s self-reported confidence in that specific read.
              Low-confidence reads don&rsquo;t count toward the verdict — it&rsquo;s a display signal, not a
              calibrated probability.
            </span>
          </span>
        </div>
        <span
          className={`inline-flex items-center gap-1.5 border text-[11px] font-medium px-2.5 py-1 mt-2.5 rounded-(--radius-tag) ${overall.cls}`}
        >
          <span className={`w-1.5 h-1.5 rounded-full ${overall.dot}`} />
          {overall.label}
        </span>
      </header>

      <div className="px-4 py-3">
        <p className="text-[13.5px] leading-relaxed text-ink">{result.summary}</p>
        {result.status === "flagged" ? (
          flagConfidence > 0 && (
            <p className="mt-2 inline-flex items-center gap-1.5 text-[12px] font-medium text-danger">
              <span aria-hidden>⚠</span>
              Mismatch detected — {Math.round(flagConfidence * 100)}% confidence
            </p>
          )
        ) : (
          <p className="mt-1.5 font-mono text-[11px] text-ink-dim">
            {result.checksConfirmed} of {totalChecks} checks confirmed from the photos
          </p>
        )}
      </div>

      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
        className="w-full flex items-center justify-between gap-2 px-4 py-2.5 border-t border-line text-[12.5px] text-ink-dim hover:text-ink transition-colors"
      >
        <span>
          {open ? "Hide" : "Show"} breakdown
          <span className="font-mono text-[11px] text-ink-dim/70"> · {result.claims.length} checks</span>
        </span>
        <svg
          width="14"
          height="14"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          className={`transition-transform ${open ? "rotate-180" : ""}`}
        >
          <polyline points="6 9 12 15 18 9" />
        </svg>
      </button>

      {open && (
        <ul className="divide-y divide-line border-t border-line">
          {result.claims.map((claim, i) => {
            const c = CLAIM[claim.status];
            return (
              <li key={i} className="px-4 py-3 flex gap-3">
                <span className={`font-mono text-[15px] leading-5 shrink-0 ${c.cls}`} aria-hidden>
                  {c.mark}
                </span>
                <div className="min-w-0 flex-1">
                  <div className="flex items-baseline justify-between gap-3">
                    <p className="text-[13px] font-medium capitalize">{claim.field}</p>
                    <span className={`text-[11px] font-mono shrink-0 ${c.cls}`}>
                      {c.word}
                      {claim.confidence > 0 && ` · ${Math.round(claim.confidence * 100)}%`}
                    </span>
                  </div>
                  <div className="mt-1 grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-0.5 font-mono text-[11.5px] text-ink-dim">
                    <span className="truncate">
                      <span className="text-ink-dim/70">claimed:</span> {claim.claimed || "—"}
                    </span>
                    <span className="truncate">
                      <span className="text-ink-dim/70">observed:</span> {claim.observed || "—"}
                    </span>
                  </div>
                  {claim.note && <p className="mt-1 text-[12px] text-ink-dim leading-snug">{claim.note}</p>}
                </div>
              </li>
            );
          })}
        </ul>
      )}

      <p className="px-4 py-2.5 border-t border-line text-[11px] text-ink-dim leading-snug">
        An evidence-based aid, not a guarantee — always review the proof photos yourself.
      </p>
    </section>
  );
}
