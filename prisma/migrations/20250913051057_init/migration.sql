/*
  Warnings:

  - A unique constraint covering the columns `[referralCode]` on the table `Waitlist` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "Waitlist_referralCode_key" ON "Waitlist"("referralCode");
