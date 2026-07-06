"use client";

import { useState } from "react";
import Link from "next/link";
import { SignOutButton } from "@/components/auth/SignOutButton";
import { ManageListingCard } from "@/components/account/ManageListingCard";
import { SavedListingCard } from "@/components/account/SavedListingCard";
import { SettingsPanel } from "@/components/account/SettingsPanel";
import type { ListingWithRelations, ListingWithSaveCount } from "@/lib/listings";

type Tab = "listings" | "saved" | "settings";
type StatusFilter = "all" | "ACTIVE" | "SOLD";

export function AccountView({
  profile,
  listings,
  saved,
}: {
  profile: {
    name: string | null;
    email: string;
    phone: string | null;
    location: string | null;
    avatarUrl: string | null;
    createdAt: Date;
  };
  listings: ListingWithSaveCount[];
  saved: ListingWithRelations[];
}) {
  const [tab, setTab] = useState<Tab>("listings");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");

  const displayName = profile.name || profile.email;
  const initials = displayName.slice(0, 2).toUpperCase();
  const memberSince = profile.createdAt.toLocaleDateString(undefined, { month: "short", year: "numeric" });

  const filteredListings =
    statusFilter === "all" ? listings : listings.filter((l) => l.status === statusFilter);

  return (
    <div className="max-w-7xl mx-auto px-6 py-10 grid lg:grid-cols-[272px_1fr] gap-7 items-start">
      <aside className="flex flex-col gap-4 lg:sticky lg:top-22">
        <div className="border border-line bg-bg-elevated p-5">
          <div className="w-13 h-13 rounded-(--radius-tag) overflow-hidden bg-amber text-bg-inset font-mono font-bold text-[17px] flex items-center justify-center mb-3.5">
            {profile.avatarUrl ? (
              <img src={profile.avatarUrl} alt={displayName} className="w-full h-full object-cover" />
            ) : (
              initials
            )}
          </div>
          <p className="font-display font-semibold text-[17px] mb-0.5 truncate">{displayName}</p>
          <p className="text-ink-dim text-[13px] mb-2.5 break-all">{profile.email}</p>
          <div className="flex flex-col gap-1.5 text-[12.5px] text-ink-dim pt-2.5 border-t border-line">
            {profile.location && <div>{profile.location}</div>}
            <div>Member since {memberSince}</div>
          </div>
        </div>

        <nav className="border border-line bg-bg-elevated p-1.5 flex flex-col gap-0.5">
          <button
            type="button"
            onClick={() => setTab("listings")}
            className={`flex items-center gap-2.5 text-left px-3 h-10 text-[14px] font-medium transition-colors rounded-(--radius-tag) ${
              tab === "listings" ? "bg-amber-dim/40 text-amber" : "text-ink-dim hover:bg-bg-inset hover:text-ink"
            }`}
          >
            Your listings
            <span className="ml-auto font-mono text-[11px] text-ink-dim">{listings.length}</span>
          </button>
          <button
            type="button"
            onClick={() => setTab("saved")}
            className={`flex items-center gap-2.5 text-left px-3 h-10 text-[14px] font-medium transition-colors rounded-(--radius-tag) ${
              tab === "saved" ? "bg-amber-dim/40 text-amber" : "text-ink-dim hover:bg-bg-inset hover:text-ink"
            }`}
          >
            Saved items
            <span className="ml-auto font-mono text-[11px] text-ink-dim">{saved.length}</span>
          </button>
          <button
            type="button"
            onClick={() => setTab("settings")}
            className={`flex items-center gap-2.5 text-left px-3 h-10 text-[14px] font-medium transition-colors rounded-(--radius-tag) ${
              tab === "settings" ? "bg-amber-dim/40 text-amber" : "text-ink-dim hover:bg-bg-inset hover:text-ink"
            }`}
          >
            Account settings
          </button>
          <div className="h-px bg-line my-1" />
          <SignOutButton className="text-left px-3 h-10 text-[14px] font-medium text-danger hover:bg-danger/10 rounded-(--radius-tag) transition-colors" />
        </nav>
      </aside>

      <main className="min-w-0">
        {tab === "listings" && (
          <>
            <div className="flex flex-wrap items-center justify-between gap-3 mb-5">
              <h2 className="font-display font-semibold text-xl">Your listings</h2>
              <div className="flex items-center gap-3">
                <div className="flex border border-line bg-bg-elevated p-1 gap-0.5">
                  {(["all", "ACTIVE", "SOLD"] as const).map((f) => (
                    <button
                      key={f}
                      type="button"
                      onClick={() => setStatusFilter(f)}
                      className={`px-3 h-7 text-[12.5px] font-medium rounded-(--radius-tag) transition-colors ${
                        statusFilter === f ? "bg-ink text-bg" : "text-ink-dim hover:text-ink"
                      }`}
                    >
                      {f === "all" ? "All" : f === "ACTIVE" ? "Active" : "Sold"}
                    </button>
                  ))}
                </div>
                <Link
                  href="/sell"
                  className="bg-amber text-bg-inset text-[13px] font-medium px-4 h-9 flex items-center rounded-(--radius-tag) hover:bg-amber/90 transition-colors"
                >
                  List an item
                </Link>
              </div>
            </div>

            {filteredListings.length === 0 ? (
              <div className="border border-dashed border-line px-6 py-12 text-center">
                <p className="font-display font-medium text-[15px] mb-1">
                  {listings.length === 0 ? "No listings yet" : "Nothing here"}
                </p>
                <p className="text-ink-dim text-[13px]">
                  {listings.length === 0
                    ? "Your listings will show up here once you list something."
                    : "Try a different filter."}
                </p>
              </div>
            ) : (
              <div className="grid sm:grid-cols-2 xl:grid-cols-3 gap-4">
                {filteredListings.map((listing) => (
                  <ManageListingCard key={listing.id} listing={listing} />
                ))}
              </div>
            )}
          </>
        )}

        {tab === "saved" && (
          <>
            <h2 className="font-display font-semibold text-xl mb-5">Saved items</h2>
            {saved.length === 0 ? (
              <div className="border border-dashed border-line px-6 py-12 text-center">
                <p className="font-display font-medium text-[15px] mb-1">Nothing saved yet</p>
                <p className="text-ink-dim text-[13px]">
                  Tap the heart icon on a listing to save it here for later.
                </p>
              </div>
            ) : (
              <div className="grid sm:grid-cols-2 xl:grid-cols-3 gap-4">
                {saved.map((listing) => (
                  <SavedListingCard key={listing.id} listing={listing} />
                ))}
              </div>
            )}
          </>
        )}

        {tab === "settings" && (
          <>
            <h2 className="font-display font-semibold text-xl mb-5">Account settings</h2>
            <SettingsPanel
              email={profile.email}
              name={profile.name ?? ""}
              phone={profile.phone ?? ""}
              location={profile.location ?? ""}
              avatarUrl={profile.avatarUrl}
            />
          </>
        )}
      </main>
    </div>
  );
}
