import { createClient } from "@/lib/supabase/server";
import { faqSections } from "@/lib/supportKnowledge";
import { SupportChatWidget } from "@/components/support/SupportChatWidget";

export default async function FaqPage() {
  // Only signed-in users can chat; the widget shows a sign-in prompt otherwise
  // (the /api/support/chat route enforces the same rule server-side).
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  return (
    <>
      <div className="max-w-3xl mx-auto px-6 py-20">
        <p className="font-mono text-[11px] uppercase tracking-[0.2em] text-amber mb-4">
          Trust
        </p>
        <h1 className="font-display font-semibold text-3xl mb-12">
          Frequently asked questions
        </h1>
        <div className="space-y-14">
          {faqSections.map((section) => (
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

      <SupportChatWidget isAuthenticated={Boolean(user)} />
    </>
  );
}
