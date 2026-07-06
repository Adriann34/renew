import Link from "next/link";

const STEPS = [
  {
    n: 1,
    title: "Pick a category",
    desc: "The diagnostic report is tailored to the part — you're never asked for numbers that don't apply.",
  },
  {
    n: 2,
    title: "Fill the diagnostic report",
    desc: "Grade, benchmark score, and tested wattage — whichever fields apply to what you're selling.",
  },
  {
    n: 3,
    title: "Attach proof photos",
    desc: "Physical condition, burn-in test, benchmark screen, and boot check to back the numbers up.",
  },
];

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
          <Link
            href="/sell"
            className="inline-flex items-center bg-teal text-bg-inset text-[14px] font-medium px-6 h-11 rounded-(--radius-tag) hover:bg-teal/90 transition-colors"
          >
            Start your first listing
          </Link>
        </div>

        <div className="border border-line bg-bg-elevated">
          <div className="px-4 h-10 flex items-center border-b border-line text-ink-dim text-[10px] font-mono uppercase tracking-widest">
            How listing works
          </div>
          <div className="p-6">
            {STEPS.map((step, i) => {
              const last = i === STEPS.length - 1;
              return (
                <div key={step.n} className="flex gap-4">
                  <div className="flex flex-col items-center">
                    <span className="w-7 h-7 rounded-full border border-teal/40 text-teal font-mono text-[12px] flex items-center justify-center shrink-0">
                      {step.n}
                    </span>
                    {!last && <span className="w-px flex-1 bg-line my-1" />}
                  </div>
                  <div className={last ? "" : "pb-6"}>
                    <h3 className="font-display font-medium text-[15px] mb-1">
                      {step.title}
                    </h3>
                    <p className="text-ink-dim text-[13px] leading-relaxed">
                      {step.desc}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
          <div className="px-6 py-3 border-t border-line flex items-center gap-2 font-mono text-[12px] text-teal">
            <span>→</span> Listing goes live with proof attached
          </div>
        </div>
      </div>
    </section>
  );
}
