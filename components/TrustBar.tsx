const items = [
  {
    n: "01",
    title: "Diagnostic Report",
    body: "Sellers fill in the specs, Renew will do the rest.",
    
  },
  {
    n: "02",
    title: "Grading you can trust",
    body: "Renew checks if the item really is in its claimed condition through our verification system.",
  },
  {
    n: "03",
    title: "Verify your listings",
    body: "Attach trustworthy photos and get the verified badge!",
  },
  {
    n: "04",
    title: "7-day return window",
    body: "Check the item yourself. If it doesn't match the report or photos, send it back for a full refund.",
  },
];

export function TrustBar() {
  return (
    <section className="border-b border-line bg-bg-elevated">
      <div className="max-w-7xl mx-auto px-6 py-16 grid md:grid-cols-4 gap-10">
        {items.map((item) => (
          <div key={item.n}>
            <p className="font-mono text-amber text-[13px] mb-3">{item.n}</p>
            <h3 className="font-display font-medium text-[15px] mb-2">
              {item.title}
            </h3>
            <p className="text-ink-dim text-[13px] leading-relaxed">
              {item.body}
            </p>
          </div>
        ))}
      </div>
    </section>
  );
}
