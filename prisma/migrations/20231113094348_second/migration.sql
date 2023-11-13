/*
  Warnings:

  - Added the required column `chainType` to the `wallets` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "wallets" DROP CONSTRAINT "wallets_chainId_fkey";

-- AlterTable
ALTER TABLE "wallets" ADD COLUMN     "additionalData" JSONB,
ADD COLUMN     "chainType" TEXT NOT NULL,
ALTER COLUMN "chainId" DROP NOT NULL;

-- AddForeignKey
ALTER TABLE "wallets" ADD CONSTRAINT "wallets_chainId_fkey" FOREIGN KEY ("chainId") REFERENCES "evm-chains"("id") ON DELETE SET NULL ON UPDATE CASCADE;
