-- Multi-currency support.
-- `Listing.currency` records the currency a listing is priced in. Existing rows
-- were all implicitly USD, so the default backfills them non-destructively.
-- `User.preferredCurrency` is the viewer's chosen display currency (nullable =
-- fall back to auto-detect, then USD).

-- AlterTable
ALTER TABLE "Listing" ADD COLUMN "currency" TEXT NOT NULL DEFAULT 'USD';

-- AlterTable
ALTER TABLE "User" ADD COLUMN "preferredCurrency" TEXT;
