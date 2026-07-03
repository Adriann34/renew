-- CreateEnum
CREATE TYPE "Grade" AS ENUM ('A', 'B', 'C');

-- CreateEnum
CREATE TYPE "Category" AS ENUM ('GPU', 'CPU', 'MOTHERBOARD', 'RAM', 'STORAGE', 'PSU', 'OTHER');

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "name" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Listing" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "category" "Category" NOT NULL,
    "price" INTEGER NOT NULL,
    "grade" "Grade" NOT NULL,
    "spec" TEXT NOT NULL,
    "benchmarkScore" INTEGER NOT NULL,
    "benchmarkLabel" TEXT NOT NULL,
    "wattageDraw" INTEGER NOT NULL,
    "hoursUsed" INTEGER NOT NULL,
    "bootVerified" BOOLEAN NOT NULL DEFAULT false,
    "sellerId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Listing_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- AddForeignKey
ALTER TABLE "Listing" ADD CONSTRAINT "Listing_sellerId_fkey" FOREIGN KEY ("sellerId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
