export function SellCta() {
  return (
    <section className="border-b border-line">
      <div className="max-w-7xl mx-auto px-6 py-20 grid lg:grid-cols-2 gap-12 items-center">
        <div>
          <p className="font-mono text-[11px] uppercase tracking-[0.2em] text-teal mb-4">
            For sellers
          </p>
          <h2 className="font-display font-semibold text-3xl md:text-4xl mb-5 leading-tight">
            Old rig sitting in a closet?
            <br />
            List it with proof, not promises.
          </h2>
          <p className="text-ink-dim text-[15px] leading-relaxed max-w-md mb-8">
            Download our diagnostic tool, run a 5-minute test, and attach the
            report to your listing. Verified listings sell faster and for
            better prices.
          </p>
          <a
            href="#"
            className="inline-flex items-center bg-teal text-bg-inset text-[14px] font-medium px-6 h-11 rounded-[var(--radius-tag)] hover:bg-teal/90 transition-colors"
          >
            Start your first listing
          </a>
        </div>

        <div className="border border-line bg-bg-elevated font-mono text-[13px]">
          <div className="px-4 h-10 flex items-center border-b border-line text-ink-dim text-[10px] uppercase tracking-widest">
            renew-diag.sh — output
          </div>
          <div className="p-5 space-y-2 text-ink-dim">
            <p><span className="text-pass">✓</span> GPU detected: RTX 3080 Ti</p>
            <p><span className="text-pass">✓</span> VRAM check: 12288MB — OK</p>
            <p><span className="text-pass">✓</span> Thermal test: 68°C @ load</p>
            <p><span className="text-pass">✓</span> Time Spy score: 18,340</p>
            <p><span className="text-amber">→</span> Suggested grade: B</p>
            <p><span className="text-ink">$</span> report saved to renew_report.json</p>
          </div>
        </div>
      </div>
    </section>
  );
}
