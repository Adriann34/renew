const sections = [
  {
    id: "how-grading-works",
    title: "How grading works",
    body: [
      "Every listing on Renew includes a diagnostic report filled in by the seller — condition grade, benchmark score, and tested power draw — plus photos backing up those numbers.",
      "Grades (A/B/C) map to hours logged, wear, and boot stability, and every listing shows the seller's benchmark score and tested power draw alongside the grade and proof photos — so you're buying off data and evidence, not just a description.",
    ],
  },
  {
    id: "buyer-protection",
    title: "Buyer protection",
    body: [
      "Every order goes through escrow. Payment is held until you confirm the item you received matches its diagnostic report and photos.",
      "If it doesn't match, you can open a dispute before funds release to the seller, and Renew will step in to resolve it.",
    ],
  },
  {
    id: "return-policy",
    title: "Return policy",
    body: [
      "Every purchase comes with a 7-day return window. Check the item yourself against the diagnostic report and photos on the listing.",
      "If it doesn't match — grade, benchmark score, power draw, or what's shown in the photos — send it back for a full refund.",
    ],
  },
];

export default function FaqPage() {
  return (
    <div className="max-w-3xl mx-auto px-6 py-20">
      <p className="font-mono text-[11px] uppercase tracking-[0.2em] text-amber mb-4">
        Trust
      </p>
      <h1 className="font-display font-semibold text-3xl mb-12">
        Frequently asked questions
      </h1>
      <div className="space-y-14">
        {sections.map((section) => (
          <section key={section.id} id={section.id} className="scroll-mt-24">
            <h2 className="font-display font-medium text-xl mb-4">
              {section.title}
            </h2>
            <div className="space-y-4 text-ink-dim text-[15px] leading-relaxed">
              {section.body.map((paragraph) => (
                <p key={paragraph}>{paragraph}</p>
              ))}
            </div>
          </section>
        ))}
      </div>
    </div>
  );
}
