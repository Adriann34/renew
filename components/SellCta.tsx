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
            Fill in your diagnostic report — grade, benchmark score, and
            tested wattage — when you list, then back it up with photos
            (burn-in test, benchmark screen, physical condition).
            Proof-backed listings sell faster and for better prices.
          </p>
          <a
            href="/sell"
            className="inline-flex items-center bg-teal text-bg-inset text-[14px] font-medium px-6 h-11 rounded-(--radius-tag) hover:bg-teal/90 transition-colors"
          >
            Start your first listing
          </a>
        </div>

        <div className="border border-line bg-bg-elevated font-mono text-[13px]">
          <div className="px-4 h-10 flex items-center border-b border-line text-ink-dim text-[10px] uppercase tracking-widest">
            diagnostic-report.json
          </div>
          <div className="p-5 space-y-2 text-ink-dim">
            <p><span className="text-pass">✓</span> Grade: B — Good condition</p>
            <p><span className="text-pass">✓</span> Time Spy score: 18,340</p>
            <p><span className="text-pass">✓</span> Draw under load: 350W</p>
            <p><span className="text-pass">✓</span> Boot verified: PASS</p>
            <p><span className="text-amber">→</span> Attach photos to back this up</p>
            <p><span className="text-ink">$</span> report saved to listing draft</p>
          </div>
        </div>
      </div>
    </section>
  );
}
