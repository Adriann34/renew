-- AI photo-verification fields on Listing.
-- aiVerdict stores the full structured verification result (JSONB); aiVerified is the
-- denormalized overall flag; aiCheckedAt records when the check last ran.
ALTER TABLE "Listing" ADD COLUMN "aiVerified" BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE "Listing" ADD COLUMN "aiVerdict" JSONB;
ALTER TABLE "Listing" ADD COLUMN "aiCheckedAt" TIMESTAMP(3);
