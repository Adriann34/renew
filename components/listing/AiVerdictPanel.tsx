import type { AiVerificationResult, AiClaimStatus, AiVerificationStatus } from "@/lib/aiVerify";

const OVERALL: Record<
  AiVerificationStatus,
  { label: string; cls: string; dot: string }
> = {
  verified: {
    label: "AI-verified against photos",
    cls: "border-pass text-pass bg-pass/10",
    dot: "bg-pass",
  },
  flagged: {
    label: "AI flagged a mismatch",
    cls: "border-danger text-danger bg-danger/10",
    dot: "bg-danger",
  },
  insufficient: {
    label: "Not enough photo evidence",
    cls: "border-line text-ink-dim bg-bg-inset",
    dot: "bg-ink-dim",
  },
};

const CLAIM: Record<AiClaimStatus, { mark: string; cls: string; word: string }> = {
  match: { mark: "✓", cls: "text-pass", word: "Matches" },
  mismatch: { mark: "✗", cls: "text-danger", word: "Mismatch" },
  not_visible: { mark: "–", cls: "text-ink-dim", word: "Not visible" },
};

/**
 * Renders the AI photo-verification verdict on the listing page: an overall status,
 * a plain-language summary, and a per-claim breakdown of claimed-vs-observed. This is
 * the signature "trust through evidence" surface — it shows buyers that the diagnostic
 * report was checked against the seller's own proof photos, not just self-reported.
 */
export function AiVerdictPanel({ result }: { result: AiVerificationResult }) {
  const overall = OVERALL[result.status];
  const checked = new Date(result.checkedAt).toLocaleDateString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
  });

  return (
    <section className="border border-line bg-bg-elevated rounded-(--radius-tag) overflow-hidden mb-6">
      <header className="flex items-center gap-3 flex-wrap px-4 py-3 border-b border-line">
        <span className="font-mono text-[11px] uppercase tracking-[0.2em] text-amber">
          Photo check
        </span>
        <span
          className={`inline-flex items-center gap-1.5 border text-[11px] font-medium px-2.5 py-1 rounded-(--radius-tag) ${overall.cls}`}
        >
          <span className={`w-1.5 h-1.5 rounded-full ${overall.dot}`} />
          {overall.label}
        </span>
        <span className="ml-auto font-mono text-[11px] text-ink-dim">
          {Math.round(result.confidence * 100)}% confidence
        </span>
      </header>

      <p className="px-4 py-3 text-[13.5px] leading-relaxed text-ink border-b border-line">
        {result.summary}
      </p>

      <ul className="divide-y divide-line">
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
                  <span className={`text-[11px] font-mono shrink-0 ${c.cls}`}>{c.word}</span>
                </div>
                <div className="mt-1 grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-0.5 font-mono text-[11.5px] text-ink-dim">
                  <span className="truncate">
                    <span className="text-ink-dim/70">claimed:</span> {claim.claimed || "—"}
                  </span>
                  <span className="truncate">
                    <span className="text-ink-dim/70">observed:</span> {claim.observed || "—"}
                  </span>
                </div>
                {claim.note && (
                  <p className="mt-1 text-[12px] text-ink-dim leading-snug">{claim.note}</p>
                )}
              </div>
            </li>
          );
        })}
      </ul>

      <footer className="px-4 py-2.5 border-t border-line">
        <p className="text-[11px] text-ink-dim leading-snug">
          Automated check by {result.model} on {checked}. An evidence-based aid, not a
          guarantee — always review the proof photos yourself.
        </p>
      </footer>
    </section>
  );
}
