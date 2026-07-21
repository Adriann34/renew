import type { Metadata } from "next";
import { Space_Grotesk, Inter, JetBrains_Mono } from "next/font/google";
import { cookies, headers } from "next/headers";
import "./globals.css";
import { CurrencyProvider } from "@/components/CurrencyProvider";
import { getRates } from "@/lib/exchangeRates";
import { CURRENCY_COOKIE, resolveDisplayCurrency } from "@/lib/currency";
import { createClient } from "@/lib/supabase/server";
import { prisma } from "@/lib/prisma";

const spaceGrotesk = Space_Grotesk({
  subsets: ["latin"],
  variable: "--font-display",
  weight: ["500", "600", "700"],
});

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-body",
  weight: ["400", "500", "600"],
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
  weight: ["400", "500"],
});

export const metadata: Metadata = {
  title: "Renew | Used Hardware with Proof",
  description:
    "Buy and sell with the confidence you need.",
  icons: {
    // BMP-encoded .ico (16/32/48) — Safari can't decode SVG favicons or
    // PNG-compressed .ico frames, so this is the one file every browser reads.
    icon: [{ url: "/favicon.ico", sizes: "48x48" }],
    apple: [{ url: "/apple-touch-icon.png", sizes: "180x180" }],
  },
  manifest: "/site.webmanifest",
};

export default async function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  // Resolve which currency to show prices in, and load approximate FX rates. The
  // cookie (set by the switcher / settings) short-circuits everything, so the auth
  // + DB lookup for a saved preference only runs for cookieless visitors.
  const cookieStore = await cookies();
  const cookieCurrency = cookieStore.get(CURRENCY_COOKIE)?.value ?? null;

  let signedIn = false;
  let preferred: string | null = null;
  if (!cookieCurrency) {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    signedIn = !!user;
    if (user) {
      // A saved account preference overrides auto-detect (and follows the user
      // across devices). A DB hiccup here just falls through to auto-detect.
      preferred = await prisma.user
        .findUnique({ where: { id: user.id }, select: { preferredCurrency: true } })
        .then((u) => u?.preferredCurrency ?? null)
        .catch(() => null);
    }
  } else {
    // Cookie already decided the currency; we still only persist for signed-in
    // users, but savePreferredCurrencyAction re-checks auth itself, so a cheap
    // "always allow the attempt" is fine here.
    signedIn = true;
  }

  // Vercel injects the visitor's geolocated country at the edge. Absent locally
  // (dev) and for unknown IPs → resolves to USD; a manual pick or account setting
  // overrides it.
  const country = (await headers()).get("x-vercel-ip-country");
  const displayCurrency = resolveDisplayCurrency({
    cookie: cookieCurrency,
    preferred,
    country,
  });
  const rates = await getRates();

  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        {/* Runs before paint so a saved dark-mode choice doesn't flash
            light first. Light stays the default when nothing is saved. */}
        <script
          dangerouslySetInnerHTML={{
            __html: `try {
              var t = localStorage.getItem('renew-theme');
              if (t === 'dark') document.documentElement.dataset.theme = 'dark';
            } catch (e) {}`,
          }}
        />
      </head>
      <body
        className={`${spaceGrotesk.variable} ${inter.variable} ${jetbrainsMono.variable} antialiased`}
      >
        <CurrencyProvider
          initialDisplayCurrency={displayCurrency}
          rates={rates}
          canPersist={signedIn}
        >
          {children}
        </CurrencyProvider>
      </body>
    </html>
  );
}
