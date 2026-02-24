-- AlterTable
ALTER TABLE "User" ADD COLUMN     "lastCreditReset" TIMESTAMP(3),
ADD COLUMN     "monthlyCredits" INTEGER NOT NULL DEFAULT 0;
