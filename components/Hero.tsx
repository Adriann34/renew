import { GpuMark } from "@/components/icons/GpuMark";
import { DiagnosticTag } from "@/components/DiagnosticTag";
import { formatPrice } from "@/lib/format";

export function Hero() {
  return (
    <section className="border-b border-line">
      <div className="max-w-7xl mx-auto px-6 py-20 grid lg:grid-cols-2 gap-16 items-center">
        <div>
          <p className="font-mono text-[11px] uppercase tracking-[0.2em] text-amber mb-5">
            482 listings · every one with a diagnostic report
          </p>
          <h1 className="font-display font-semibold text-[44px] md:text-[54px] leading-[1.05] mb-6">
            Used hardware,
            <br />
            with the numbers
            <br />
            to prove it.
          </h1>
          <p className="text-ink-dim text-[15px] leading-relaxed max-w-md mb-8">
            Every GPU, CPU, and PSU on Renew ships with a diagnostic
            report — grade, benchmark score, and tested wattage — filled
            in by the seller and backed by photo proof, so you know
            exactly what you&apos;re buying before it arrives.
          </p>
          <div className="flex flex-wrap gap-3">
            <a
              href="#listings"
              className="bg-amber text-bg-inset text-[14px] font-medium px-6 h-11 flex items-center rounded-(--radius-tag) hover:bg-amber/90 transition-colors"
            >
              Browse listings
            </a>
            <a
              href="/sell"
              className="border border-line text-[14px] px-6 h-11 flex items-center rounded-(--radius-tag) hover:border-ink-dim transition-colors"
            >
              Sell your hardware
            </a>
          </div>
        </div>

        <div className="border border-line bg-bg-elevated">
          <div className="flex items-center justify-between px-4 h-10 border-b border-line font-mono text-[10px] uppercase tracking-widest text-ink-dim">
            <span>Diagnostic report</span>
            <span className="text-pass">● photo-backed</span>
          </div>
          <div className="p-8 flex items-center justify-center border-b border-line">
            <GpuMark className="w-48 h-auto text-ink-dim" />
          </div>
          <div className="p-5 space-y-4">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-[10px] uppercase tracking-widest text-ink-dim mb-1">
                  GPU · 24GB GDDR6X
                </p>
                <h3 className="font-display font-medium text-lg">
                  RTX 4090 Founders Edition
                </h3>
              </div>
              <p className="font-mono text-amber text-lg">{formatPrice(1450)}</p>
            </div>
            <DiagnosticTag
              grade="A"
              benchmarkScore={35120}
              benchmarkLabel="Time Spy"
              wattageDraw={411}
              bootVerified={true}
            />
          </div>
        </div>
      </div>
    </section>
  );
}
