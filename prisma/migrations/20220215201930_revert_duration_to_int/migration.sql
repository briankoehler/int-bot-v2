/*
  Warnings:

  - You are about to alter the column `duration` on the `match` table. The data in that column could be lost. The data in that column will be cast from `BigInt` to `Integer`.

*/
-- AlterTable
ALTER TABLE "match" ALTER COLUMN "duration" SET DATA TYPE INTEGER;
