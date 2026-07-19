/**
 * Single source of truth for customer-support knowledge.
 *
 * Two consumers read from here, so they can never drift apart:
 *  - the public FAQ page (app/faq/page.tsx) renders `faqSections`
 *  - the support chatbot (lib/aiSupport.ts) feeds the WHOLE knowledge base
 *    (FAQ + the extra policies below) into Gemini as grounding
 *
 * Kept in code on purpose: the knowledge base is small and stable, it fits
 * comfortably inside one prompt (no retrieval/embeddings needed), it's versioned
 * in git, and there's zero fetch-before-answer latency. If this ever needs to be
 * editable by non-engineers or grows large enough to need semantic search, the
 * only thing to change is `buildKnowledgeBase()` — swap it to read from Supabase.
 */

export type FaqSection = {
  id: string;
  title: string;
  body: string[];
};

/** The visible FAQ. Rendered by app/faq/page.tsx AND handed to the bot verbatim. */
export const faqSections: FaqSection[] = [
  {
    id: "how-grading-works",
    title: "How grading works",
    body: [
      "Every listing on Renew includes a diagnostic report filled in by the seller which includes condition grade, benchmark score, and tested power draw, plus photos backing up those numbers.",
      "Grades map to hours logged, wear, and boot stability, and every listing shows the seller's benchmark score and tested power draw alongside the grade and proof photos, so you're buying off data and evidence, not just a description.",
    ],
  },
  {
    id: "buyer-protection",
    title: "Buyer protection",
    body: [
      "Renew connects buyers and sellers through verified listings backed by diagnostic reports and supporting evidence.",
      "While transactions happen directly between buyers and sellers, we help you make informed decisions with transparent information.",
    ],
  },
  {
    id: "return-policy",
    title: "Return policy",
    body: [
      "Return policies are set by individual sellers and are shown on each listing.",
      "Review the listing details and included diagnostic report before completing your purchase.",
    ],
  },
];

/**
 * Where the bot points people when it can't help itself. Replace with a real
 * inbox before launch — it's referenced in the bot's escalation instructions.
 */
export const SUPPORT_EMAIL = "support@renew.example";

type KnowledgeTopic = {
  topic: string;
  facts: string[];
};

/**
 * Knowledge that goes BEYOND the visible FAQ — the stuff a support agent would
 * know but that isn't spelled out on the FAQ page. Kept deliberately grounded in
 * how the product actually works today; the bot is told NOT to invent anything
 * outside this knowledge (see lib/aiSupport.ts), so don't add speculative facts
 * here (e.g. exact fees or shipping rates that aren't finalized).
 */
export const supportPolicies: KnowledgeTopic[] = [
  {
    topic: "What Renew is",
    facts: [
      "Renew is a marketplace for buying and selling used PC hardware — GPUs, CPUs, and other components.",
      "The whole point is trust through data: every listing carries a seller-filled diagnostic report (condition grade, benchmark score, tested power draw, boot status) backed by proof photos, instead of relying on stock photos or seller claims alone.",
    ],
  },
  {
    topic: "The diagnostic report and AI verification",
    facts: [
      "When a seller creates a listing they fill in a diagnostic report and upload proof photos (a condition photo, a benchmark screenshot, a burn-in / power-draw screenshot, and a boot/POST screen).",
      "An AI check reads those proof photos and cross-checks them against the seller's stated numbers, so buyers can see whether the evidence actually supports the claims. This is about verifying photos against claims — it is not a guarantee, and buyers should still review the report and photos themselves.",
    ],
  },
  {
    topic: "Buying",
    facts: [
      "Browse and filter listings on the Browse page. Each listing's detail page shows the full diagnostic report, proof photos, and the seller.",
      "Online card checkout is not live yet. For now, to buy an item you message the seller from the listing to arrange the purchase.",
      "You can save listings to come back to them later from your account.",
    ],
  },
  {
    topic: "Selling",
    facts: [
      "Anyone with an account can sell. Start from the Sell page, pick the category, fill in the diagnostic report, and upload proof photos.",
      "You manage, edit, delete, and mark your listings as sold from your account dashboard.",
    ],
  },
  {
    topic: "Messaging",
    facts: [
      "Buyers and sellers talk through built-in chat that is scoped to a specific listing. Messages are delivered in real time and you can attach photos.",
      "For anything specific to an order or an item — availability, condition questions, arranging payment or shipping — message the seller directly from the listing.",
    ],
  },
  {
    topic: "Accounts",
    facts: [
      "You can sign up with email and password or with Google.",
      "From your account you manage your listings, your saved listings, and your settings (including your avatar), and you can delete your account.",
    ],
  },
  {
    topic: "Payments and shipping (status)",
    facts: [
      "Card payments via Stripe are planned but not wired up yet, so there is no on-site checkout at the moment — buyers and sellers arrange the transaction over chat.",
      "Specific fees, payout, and shipping arrangements are not published yet. If someone asks for exact numbers on these, don't guess — say it isn't finalized and point them to human support.",
    ],
  },
];

/**
 * Flattens the FAQ + extra policies into the plain-text knowledge block the bot
 * is grounded on. This is the one function to change if the knowledge ever moves
 * to a database.
 */
export function buildKnowledgeBase(): string {
  const faq = faqSections
    .map((s) => `## ${s.title}\n${s.body.map((p) => `- ${p}`).join("\n")}`)
    .join("\n\n");

  const policies = supportPolicies
    .map((t) => `## ${t.topic}\n${t.facts.map((f) => `- ${f}`).join("\n")}`)
    .join("\n\n");

  return `${faq}\n\n${policies}`;
}
