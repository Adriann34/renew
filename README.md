# Renew

Renew is a marketplace for buying and selling used PC hardware — GPUs,
CPUs, and everything in between — built with Next.js 15, TypeScript,
Tailwind CSS v4, Prisma, and Supabase. Instead of stock photos and seller
claims, every listing carries a diagnostic report (condition grade,
benchmark score, tested power draw) filled in by the seller when they
list, backed by photo proof, so buyers can trust a used part before it
ships.

Personal project / portfolio piece. Homepage, FAQ, About/contact, and
sign in/sign up pages are built. Supabase Auth (email/password + Google)
and the Prisma/Supabase Postgres connection are both wired up and live.
Listings still come from mock data — payments, the real listing model,
and a seller dashboard are next.

## Stack
- Next.js 15 (App Router) + TypeScript
- Tailwind CSS v4 (CSS-first config, no `tailwind.config.js`)
- Supabase Auth — email/password + Google OAuth, wired up
- Prisma + Supabase Postgres — connected, initial migration applied
- Express API (next step, not included yet)

## Getting started

```bash
npm install
cp .env.example .env.local   # fill in your Supabase project values
npx prisma migrate dev       # creates the User/Listing tables
npm run dev
```

Open http://localhost:3000.

Prisma reads `.env`, not `.env.local` — if you run `prisma` commands
directly (outside `npm run dev`), copy `.env.local` to `.env` too, or
they won't find your database credentials.

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
- `app/signin/page.tsx`, `app/signup/page.tsx` — sign in/up, backed by
  real Supabase Auth; redirect home if already signed in
- `app/auth/callback/route.ts` — OAuth callback that exchanges the
  Supabase auth code for a session
- `components/auth/` — `SignInForm`, `SignUpForm`, `GoogleSignInButton`,
  `SignOutButton`
- `components/Hero.tsx`, `Navbar.tsx`, `CategoryStrip.tsx`,
  `ListingCard.tsx`, `ConditionBadge.tsx`, `DiagnosticTag.tsx`,
  `TrustBar.tsx`, `SellCta.tsx`, `Footer.tsx` — `Navbar` reads the
  Supabase session server-side to show sign in vs. account state
- `lib/supabase/{client,server,middleware}.ts` — browser client, server
  client, and the session-refresh helper used by `middleware.ts`
- `middleware.ts` — refreshes the Supabase session cookie on every request
- `lib/prisma.ts` — Prisma client singleton (dev-safe against hot reload)
- `lib/data.ts` — mock listings; homepage still reads from here, not
  Prisma yet
- `prisma/schema.prisma` — schema (User, Listing), connected to Supabase
  Postgres; `prisma/migrations/` has the initial migration
- `.env.example` — copy to `.env.local` (and `.env`, for the Prisma CLI)
  and fill in your Supabase project values

## Design notes

The signature element is the **diagnostic tag** (`DiagnosticTag.tsx`) — a
small inspection-sticker-style readout (grade, benchmark score, wattage
draw, boot status) filled in by the seller and shown on the listing,
backed by their own proof photos. `ConditionBadge.tsx` is the compact
variant (grade only) used on homepage grid cards. The idea: for *used*
hardware, trust comes from data and evidence, not stock photography, so
the design leans into that instead of a generic dark-mode tech-marketplace
look.

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

1. Replace `lib/data.ts` with real Prisma queries against the now-connected
   Supabase Postgres database
2. Individual listing page + create-listing flow (seller fills in the
   diagnostic report and uploads photos backing it up — burn-in test,
   benchmark screenshot, physical condition)
3. Build the Express API for anything that shouldn't live in Next route
   handlers (e.g. Stripe webhooks, background jobs)
4. Stripe Checkout for fixed-price purchases

## Keeping the project alive (planned, not implemented)

The free-tier Supabase project now backing this app pauses after a period
of inactivity. Plan is to add a scheduled GitHub Actions workflow (cron)
that pings the app/DB periodically to prevent that. Not set up yet — just
a placeholder note for later.
