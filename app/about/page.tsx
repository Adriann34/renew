import { BackButton } from "@/components/BackButton";

const sections = [
  {
    id: "about",
    title: "About",
    body: [
      "Renew is a marketplace for buying and selling used PC hardware — GPUs, CPUs, and everything around them. Instead of relying on stock photos or seller claims, every listing carries a diagnostic report — condition grade, benchmark score, and tested power draw — filled in by the seller and backed by photo proof.",
      "The goal is simple — make it possible to trust a used part before it ships, based on data instead of guesswork.",
    ],
  },
  {
    id: "contact",
    title: "Contact",
    body: [
      "This site is created and owned by Adrian Tan. You can reach out with questions, feedback, or bug reports at adriantanbusiness34@gmail.com.",
    ],
  },
];

export default function AboutPage() {
  return (
    <div className="relative max-w-3xl mx-auto px-6 pt-14 pb-20">
      <BackButton />
      <p className="font-mono text-[11px] uppercase tracking-[0.2em] text-amber mb-4">
        Company
      </p>
      <h1 className="font-display font-semibold text-3xl mb-12">
        About &amp; contact
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
