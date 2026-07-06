# Renew

Renew is a marketplace for buying and selling used PC hardware — GPUs,
CPUs, and everything in between. Instead of stock photos and seller
claims, every listing carries a diagnostic report (condition grade,
benchmark score, tested power draw) filled in by the seller, backed by
photo proof, so buyers can trust a used part before it ships. Buyers and
sellers can then message each other directly, scoped to that one listing.

Personal project / portfolio piece. Auth (including password reset), real
Prisma-backed listings (browse/filter/create/edit/delete/save), the
account dashboard, and listing-scoped realtime chat are all live. Payments
are next.

## Tech stack

- **Next.js 15** (App Router) + **TypeScript** + **React 19**
- **Tailwind CSS v4** — CSS-first config, no `tailwind.config.js`
- **Prisma** + **Supabase Postgres** — all data access, no separate API layer
- **Supabase Auth** — email/password (incl. reset) + Google OAuth
- **Supabase Storage** — listing photos, chat attachments, avatars (compressed via `sharp`)
- **Supabase Realtime** — live chat message delivery

## Project structure

```
app/
  layout.tsx              Root layout: fonts, metadata, theme flash-prevention script
  page.tsx                 Homepage — assembles Hero, CategoryStrip, listings grid, TrustBar, SellCta
  globals.css                Tailwind v4 theme tokens — see "Design system" below
  browse/                   Full listing browse page: category tabs, filters, sort, search, pagination
  signin/, signup/          Auth pages (redirect home if already signed in)
  forgot-password/          Request a password-reset email
  reset-password/           Set a new password (reached via the emailed recovery link)
  auth/callback/route.ts    Exchanges a Google OAuth or password-recovery code for a session
  account/                  Seller dashboard — your listings / saved items / settings tabs
  account/actions.ts          updateProfileAction, avatar upload — Server Actions for the settings tab
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
  SearchBar                                                  Navbar search — submits to /browse?q=
  ListingCard, ConditionBadge, DiagnosticTag                 Listing summary + the signature diagnostic readout
  ThemeToggle                                                Light/dark switch
  icons/GpuMark.tsx                                          Abstract SVG placeholder art (no brand imagery)
  auth/           SignInForm, SignUpForm, GoogleSignInButton, SignOutButton,
                  ForgotPasswordForm, UpdatePasswordForm
  account/        AccountView (tabs) + ManageListingCard, SavedListingCard, SettingsPanel, AvatarUploadForm, MarkSoldButton
  browse/         BrowseView (client-side filter/sort/search/paginate state), FilterSidebar
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
                            (see image.ts for compression target sizes per use case)
  format.ts, chatFormat.ts  Display formatting (price, message timestamps)
  supabase/
    client.ts                Browser Supabase client
    server.ts                 Server Component / Server Action Supabase client (cookie-based session)
    middleware.ts              Session-refresh helper, called from the root middleware.ts
    admin.ts                   Service-role client — bypasses RLS, server-only

prisma/
  schema.prisma             User, Listing, ListingPhoto, SavedListing, Conversation, Message
  migrations/               Applied migrations (see schema.prisma for the RLS note on Conversation/Message)
  seed.ts                   Seeds placeholder sellers + listings for local dev

middleware.ts               Refreshes the Supabase session cookie on every request
next.config.ts               Image remote patterns (*.supabase.co) + CSP headers
.env.example                 Required env vars, copy to .env.local (and .env for the Prisma CLI)
```

## How things connect

**Auth.** Sign-in/sign-up/Google forms talk to Supabase Auth directly from
the client — there's no `/api/login` route. Supabase sets session cookies,
and root `middleware.ts` refreshes that session on every request. Server
Components and Server Actions read the session server-side rather than
trusting anything the client sends. Google OAuth and password-reset links
both land on `app/auth/callback/route.ts`, which exchanges the code for a
session before redirecting on.

**Listings (read + write).** There's no REST/GraphQL API for listings —
Server Components fetch via `lib/listings.ts` at render time and hand the
data to client components for interactive bits (filters, save/share
buttons). Writes go through `"use server"` Server Actions co-located as
`actions.ts` next to the route that owns them. Every action re-checks auth
(and ownership, for edits/deletes) itself, since the client is never
trusted to only act on its own data.

**Chat (realtime).** Messaging a seller finds-or-creates a conversation
scoped to `(listing, buyer)` and opens `/messages/[id]`, which
server-renders history and then subscribes client-side to Supabase
Realtime for new messages. Sending a message is a Server Action
(auth- and participant-checked); the other participant sees it arrive
live through their own subscription.

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

The chat migration enables RLS and Realtime as part of `prisma migrate dev`
itself — no separate manual Supabase dashboard step needed, as long as your
project has Realtime enabled (on by default).

## Design system

The signature element is the **diagnostic tag** (`DiagnosticTag.tsx`) — a
small inspection-sticker-style readout (grade, benchmark score, wattage
draw, boot status) filled in by the seller and shown on the listing,
backed by their own proof photos. `ConditionBadge.tsx` is the compact
variant (grade only) used on grid cards. The idea: for *used* hardware,
trust comes from data and evidence, not stock photography, so the design
leans into that instead of a generic dark-mode tech-marketplace look.

Theming (light/dark tokens, fonts) lives in `app/globals.css` as CSS
variables fed into Tailwind v4's `@theme inline` — see the comments there
for how that wiring works. Light is the default; `ThemeToggle.tsx` flips
`[data-theme="dark"]` on `<html>` and persists the choice to
`localStorage`. Fonts: Space Grotesk (display), Inter (body), JetBrains
Mono (specs/prices/numbers).

## Conventions worth knowing

- Prices are USD, formatted via `formatPrice()` in `lib/format.ts` — don't
  format currency inline.
- Mutations are Server Actions, not API routes — look for `actions.ts`
  next to the page that owns the flow you're changing.
- Every Server Action re-checks auth (and ownership/participant status,
  where relevant) itself. Never assume the client only calls an action
  for its own data.
- Photo compression always goes through `compressImage()` in
  `lib/image.ts` — see that file for target sizes per use case.
- RLS is deliberately narrow (see `prisma/schema.prisma`) — don't assume
  it's protecting a table unless it's one of the ones noted there.
- URL category slugs (`/sell/gpu`, `/browse?category=GPU`) are just the
  lowercased `Category` enum value — see `categoryFromSlug()` in
  `lib/category.ts`.
