# Renew

Renew is a marketplace for buying and selling used PC hardware — GPUs,
CPUs, and everything in between. Instead of stock photos and seller
claims, every listing carries a diagnostic report (condition grade,
benchmark score, tested power draw) filled in by the seller, backed by
photo proof, so buyers can trust a used part before it ships. Buyers and
sellers can then message each other directly, scoped to that one listing.

Personal project / portfolio piece. Auth, real Prisma-backed listings
(browse/filter/create/edit/delete/save), the account dashboard, and
listing-scoped realtime chat are all live. Payments are next.

## Tech stack

- **Next.js 15** (App Router) + **TypeScript** + **React 19**
- **Tailwind CSS v4** — CSS-first config, no `tailwind.config.js`
- **Prisma** + **Supabase Postgres** — all data access, no separate API layer
- **Supabase Auth** — email/password + Google OAuth
- **Supabase Storage** — listing photos, chat attachments, avatars (compressed via `sharp`)
- **Supabase Realtime** — live chat message delivery

## Project structure

```
app/
  layout.tsx              Root layout: fonts, metadata, theme flash-prevention script
  page.tsx                 Homepage — assembles Hero, CategoryStrip, listings grid, TrustBar, SellCta
  globals.css                Tailwind v4 theme tokens — see "Design system" below
  browse/                   Full listing browse page: category tabs, filters, sort, pagination
  signin/, signup/          Auth pages (redirect home if already signed in)
  auth/callback/route.ts    Exchanges the Google OAuth code for a session
  account/                  Seller dashboard — your listings / saved items / settings tabs
  sell/                     Category picker (sell/page.tsx) → per-category create form (sell/[category]/)
  sell/actions.ts             createListingAction — validates, uploads photos, writes the listing
  listing/[id]/             Listing detail page
  listing/[id]/edit/         Edit-listing page (owner-only)
  listing/actions.ts         update/delete/toggle-status/toggle-save Server Actions
  messages/                 Chat inbox (list + thread), realtime, listing-scoped
  messages/actions.ts        start/send/mark-read Server Actions
  about/, faq/              Static content pages
  api/cities/route.ts       Offline city-search endpoint (backs LocationAutocomplete)

components/
  Navbar, Hero, CategoryStrip, TrustBar, SellCta, Footer     Homepage/shared chrome
  ListingCard, ConditionBadge, DiagnosticTag                 Listing summary + the signature diagnostic readout
  ThemeToggle                                                Light/dark switch
  icons/GpuMark.tsx                                          Abstract SVG placeholder art (no brand imagery)
  auth/           SignInForm, SignUpForm, GoogleSignInButton, SignOutButton
  account/        AccountView (tabs) + ManageListingCard, SavedListingCard, SettingsPanel, AvatarUploadForm, MarkSoldButton
  browse/         BrowseView (client-side filter/sort/paginate state), FilterSidebar
  listing/        CreateListingForm, EditListingForm, ListingGallery, ListingActions,
                  DeleteListingButton, MessageSellerButton, LocationAutocomplete,
                  PhotoWorkspace, ListingPreviewCard
  messages/       MessagesShell, ConversationList, ChatThread, MessageComposer, ContextPanel

lib/
  prisma.ts                 Prisma client singleton (dev-safe against hot reload)
  listings.ts, saved.ts, conversations.ts   Prisma query functions — no ORM/service layer, just functions
  category.ts               Category order/labels + which diagnostic fields each category asks for
  grade.ts                  Grade (A/B/C) labels and colors
  listingValidation.ts      Shared field validation for create + edit listing forms
  photoUpload.ts, chatUpload.ts, image.ts   Upload to Supabase Storage, compressed via sharp
  format.ts, chatFormat.ts  Display formatting (price, message timestamps)
  supabase/
    client.ts                Browser Supabase client
    server.ts                 Server Component / Server Action Supabase client (cookie-based session)
    middleware.ts              Session-refresh helper, called from the root middleware.ts
    admin.ts                   Service-role client — bypasses RLS, server-only

prisma/
  schema.prisma             User, Listing, ListingPhoto, SavedListing, Conversation, Message
  migrations/               Applied migrations (the chat migration also sets up RLS + Realtime — see below)
  seed.ts                   Seeds placeholder sellers + listings for local dev

middleware.ts               Refreshes the Supabase session cookie on every request
next.config.ts               Image remote patterns (*.supabase.co) + CSP headers
.env.example                 Required env vars, copy to .env.local (and .env for the Prisma CLI)
```

## How things connect

**Auth.** `SignInForm`/`SignUpForm`/`GoogleSignInButton` (client components)
call the browser Supabase client (`lib/supabase/client.ts`) directly —
there's no `/api/login` route. Supabase sets session cookies, and
`middleware.ts` → `lib/supabase/middleware.ts` calls `supabase.auth.getUser()`
on every request to revalidate/refresh that session. Server Components and
Server Actions read the session via `lib/supabase/server.ts`'s cookie-based
client. Google OAuth is the one flow with a real route: `GoogleSignInButton`
redirects to Google, which redirects back to `app/auth/callback/route.ts`,
which exchanges the auth code for a session and redirects to `?next=`.

**Listings (read + write).** There's no REST/GraphQL API for listings —
Server Components call `lib/listings.ts` Prisma functions directly at
render time (e.g. `app/page.tsx`, `app/browse/page.tsx`,
`app/listing/[id]/page.tsx`), then hand the data down as props to client
components for interactive bits (`BrowseView`'s filters, `ListingActions`'
save/share buttons). Writes go through `"use server"` Server Actions
co-located as `actions.ts` next to the route that owns them
(`app/sell/actions.ts`, `app/listing/actions.ts`). Every action re-checks
`auth.getUser()` and, for edits/deletes, ownership — the client is never
trusted. Photo uploads run through `lib/photoUpload.ts`, which compresses
via `sharp` (`lib/image.ts`) before writing to the `listing-photos` Supabase
Storage bucket.

**Chat (realtime).** `MessageSellerButton` on a listing calls
`startConversationAction`, which finds-or-creates a `Conversation` row keyed
by `(listingId, buyerId)` and routes to `/messages/[id]`. That page
server-renders the message history, then `ChatThread` (client) subscribes
directly to Supabase Realtime for `INSERT`s on the `Message` table filtered
to that conversation. Sending a message calls `sendMessageAction` (a Server
Action — auth- and participant-checked, writes via Prisma, which uses the
direct DB connection and bypasses RLS); the *other* participant receives it
live through their Realtime subscription. Row-Level Security is enabled on
`Conversation`/`Message` specifically so that subscription can only ever
stream rows the signed-in user is actually part of — every other table in
the app has no RLS and relies entirely on server-side auth checks instead.

## Setup

```bash
npm install
cp .env.example .env.local   # fill in your Supabase project values
cp .env.local .env           # the Prisma CLI reads .env, not .env.local
npx prisma migrate dev       # creates/updates all tables, RLS policies, and Realtime setup
npm run dev
```

Open http://localhost:3000. Optionally seed demo data:

```bash
npx prisma db seed           # placeholder sellers + listings, see prisma/seed.ts
```

Other scripts: `npm run build` / `npm run start` (production), `npm run
lint`, `npm run prisma:studio` (DB browser).

The chat migration (`prisma/migrations/*_chat/migration.sql`) enables RLS
and adds `Message` to the `supabase_realtime` publication as part of
`prisma migrate dev` itself — no separate manual Supabase dashboard step
needed, as long as your project has Realtime enabled (on by default).

## Design system

The signature element is the **diagnostic tag** (`DiagnosticTag.tsx`) — a
small inspection-sticker-style readout (grade, benchmark score, wattage
draw, boot status) filled in by the seller and shown on the listing,
backed by their own proof photos. `ConditionBadge.tsx` is the compact
variant (grade only) used on grid cards. The idea: for *used* hardware,
trust comes from data and evidence, not stock photography, so the design
leans into that instead of a generic dark-mode tech-marketplace look.

### Tailwind v4

This project has **no `tailwind.config.js`**. Instead:

- `postcss.config.mjs` just registers `@tailwindcss/postcss`.
- `app/globals.css` does `@import "tailwindcss";` then defines design
  tokens (colors, fonts, radii) inside `@theme` / `@theme inline` blocks.
  Those become real CSS custom properties *and* Tailwind utility classes
  at once — e.g. `--color-amber` gives you `bg-amber`, `text-amber`,
  `border-amber` for free.
- Content detection is automatic in v4 — no `content: [...]` array.

If you add a UI library shipping its own Tailwind v3 config, check
compatibility first — v3 plugins/configs don't always drop into v4 cleanly.

### Light / dark theme

Light is the default. Colors are defined twice in `app/globals.css` — once
under `:root` (light), once under `[data-theme="dark"]` — then fed into
Tailwind via `@theme inline`, so `bg-amber`, `text-ink`, etc. respond to
the theme switch with zero extra CSS generated. `ThemeToggle.tsx` flips
`data-theme` on `<html>` and remembers the choice in `localStorage`.
`app/layout.tsx` has a small inline script that runs before paint, so a
saved dark-mode preference doesn't flash light first on reload.

### Fonts & color tokens

Space Grotesk (display/headings), Inter (body), JetBrains Mono
(specs, prices, benchmark numbers). Color tokens: `bg`/`bg-elevated`/
`bg-inset`, `ink`/`ink-dim`, `line` for surfaces/text; `amber` (primary
accent), `teal` (secondary/seller actions), `pass`/`danger` (diagnostic
pass/fail states).

## Conventions worth knowing

- Prices are USD, formatted via `formatPrice()` in `lib/format.ts` — don't
  format currency inline.
- Mutations are Server Actions, not API routes — look for `actions.ts`
  next to the page that owns the flow you're changing.
- Every Server Action re-checks `auth.getUser()` (and ownership/participant
  status, where relevant) itself. Never assume the client only calls an
  action for its own data.
- Photo compression always goes through `compressImage()` in `lib/image.ts`
  with a `targetBytes` tuned per use case (listing photos ~200KB, chat
  attachments and avatars ~150KB).
- RLS is deliberately narrow — only `Conversation`/`Message` have it, to
  authorize Realtime subscriptions. Everything else is Prisma (direct
  connection, bypasses RLS) + server-side checks. Don't assume RLS is
  protecting a table unless it's one of those two.
- URL category slugs (`/sell/gpu`, `/browse?category=GPU`) are just the
  lowercased `Category` enum value — see `categoryFromSlug()` in
  `lib/category.ts`.

