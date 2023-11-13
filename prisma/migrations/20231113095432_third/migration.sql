/*
  Warnings:

  - Changed the type of `chainType` on the `wallets` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

*/
-- CreateEnum
CREATE TYPE "ChainType" AS ENUM ('EVM', 'BTC', 'LTC', 'DOGE');

-- AlterTable
ALTER TABLE "wallets" DROP COLUMN "chainType",
ADD COLUMN     "chainType" "ChainType" NOT NULL;
