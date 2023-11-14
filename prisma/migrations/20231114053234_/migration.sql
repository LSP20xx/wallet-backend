/*
  Warnings:

  - Made the column `chainId` on table `blockchains` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "blockchains" ALTER COLUMN "chainId" SET NOT NULL;
