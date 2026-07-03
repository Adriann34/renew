# Renew

Renew is a marketplace for buying and selling used PC hardware — GPUs,
CPUs, and everything in between — built with Next.js 15, TypeScript,
Tailwind CSS v4, Prisma, and Supabase. Instead of stock photos and seller
claims, every listing carries a diagnostic report: condition grade,
benchmark score, and tested power draw, so buyers can trust a used part
before it ships.

Personal project / portfolio piece — currently a frontend scaffold with
mock data. Homepage, FAQ, About/contact, and sign in/sign up pages are
built; auth, payments, and a real database connection are next.

## Stack
- Next.js 15 (App Router) + TypeScript
- Tailwind CSS v4 (CSS-first config, no `tailwind.config.js`)
- Prisma + Supabase Postgres (schema stubbed, not wired up yet)
- Express API (next step, not included yet)

## Getting started

```bash
npm install
npm run dev
```

Open http://localhost:3000.

## About the Tailwind v4 setup

Tailwind v4 changed how config works, so this project does **not** have a
`tailwind.config.js`. Instead:

- `postcss.config.mjs` just registers `@tailwindcss/postcss`.
- `app/globals.css` does `@import "tailwindcss";` then defines all design
  tokens (colors, fonts, radii) inside an `@theme { ... }` block. Those
  become real CSS custom properties AND Tailwind utility classes at the same
  time — e.g. `--color-amber` in `@theme` gives you `bg-amber`, `text-amber`,
  `border-amber` for free.
- Content detection is automatic in v4 — no `content: [...]` array to
  maintain.

If you ever add a UI library that ships its own Tailwind v3 config, check
compatibility first — v3 plugins/configs don't always drop into v4 cleanly.

## What's here

- `app/page.tsx` — homepage, assembles all sections below
- `app/faq/page.tsx` — grading, buyer protection, and return policy
- `app/about/page.tsx` — about + contact
- `app/signin/page.tsx`, `app/signup/page.tsx` — frontend-only auth forms
  (no backend wired up yet, see [Next steps](#next-steps-in-order))
- `components/Hero.tsx`, `Navbar.tsx`, `CategoryStrip.tsx`,
  `ListingCard.tsx`, `DiagnosticTag.tsx`, `TrustBar.tsx`, `SellCta.tsx`,
  `Footer.tsx`
- `lib/data.ts` — mock listings, swap for real Prisma queries later
- `prisma/schema.prisma` — starter schema (User, Listing) for Supabase
- `.env.example` — copy to `.env` and fill in your Supabase project values

## Design notes

The signature element is the **diagnostic tag** (`DiagnosticTag.tsx`) — a
small inspection-sticker-style readout (grade, benchmark score, wattage
draw, boot status) attached to every listing. The idea: for *used* hardware,
trust comes from test data, not stock photography, so the design leans into
that instead of a generic dark-mode tech-marketplace look.

### Light / dark theme

Light is the default. All colors are defined twice in `app/globals.css` —
once under `:root` (light) and once under `[data-theme="dark"]` — then fed
into Tailwind via `@theme inline`, which tells Tailwind v4 to treat them as
live CSS variables instead of baking in a fixed value. That's what lets
`bg-amber`, `text-ink`, etc. respond to the theme switch with zero extra
CSS generated.

`components/ThemeToggle.tsx` flips `data-theme` on `<html>` and remembers
the choice in `localStorage`. `app/layout.tsx` has a small inline script
that runs before paint, so a saved dark-mode preference doesn't flash light
first on reload.

## Next steps (in order)

1. Wire up Supabase Auth behind the existing `/signin` and `/signup` forms
2. Replace `lib/data.ts` with real Prisma queries (`prisma/schema.prisma` →
   `prisma migrate dev` → `prisma generate`)
3. Build the Express API for anything that shouldn't live in Next route
   handlers (e.g. Stripe webhooks, background jobs)
4. Individual listing page + seller dashboard
5. Stripe Checkout for fixed-price purchases

## Keeping the project alive (planned, not implemented)

Once Supabase is wired up, its free-tier project pauses after a period of
inactivity. Plan is to add a scheduled GitHub Actions workflow (cron) that
pings the app/DB periodically to prevent that. Not set up yet — just a
placeholder note for later.
