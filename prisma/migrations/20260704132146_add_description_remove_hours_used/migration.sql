-- AlterTable
ALTER TABLE "Listing" ADD COLUMN "description" TEXT NOT NULL DEFAULT '';
ALTER TABLE "Listing" DROP COLUMN "hoursUsed";
