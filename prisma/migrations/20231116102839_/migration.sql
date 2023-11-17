/*
  Warnings:

  - The values [PENDING,CONFIRMED,FAILED] on the enum `TransactionStatus` will be removed. If these variants are still used in the database, this will fail.
  - Added the required column `confirmations` to the `transactions` table without a default value. This is not possible if the table is not empty.
  - Added the required column `transactionType` to the `transactions` table without a default value. This is not possible if the table is not empty.
  - Added the required column `firstName` to the `users` table without a default value. This is not possible if the table is not empty.
  - Added the required column `lastName` to the `users` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "TransactionType" AS ENUM ('DEPOSIT', 'WITHDRAWAL', 'TRANSFER');

-- AlterEnum
BEGIN;
CREATE TYPE "TransactionStatus_new" AS ENUM ('APPROVED', 'PROCESSED', 'PROCESSING', 'CANCELLED');
ALTER TABLE "transactions" ALTER COLUMN "status" TYPE "TransactionStatus_new" USING ("status"::text::"TransactionStatus_new");
ALTER TYPE "TransactionStatus" RENAME TO "TransactionStatus_old";
ALTER TYPE "TransactionStatus_new" RENAME TO "TransactionStatus";
DROP TYPE "TransactionStatus_old";
COMMIT;

-- AlterTable
ALTER TABLE "transactions" ADD COLUMN     "confirmations" INTEGER NOT NULL,
ADD COLUMN     "transactionType" "TransactionType" NOT NULL;

-- AlterTable
ALTER TABLE "users" ADD COLUMN     "firstName" TEXT NOT NULL,
ADD COLUMN     "lastName" TEXT NOT NULL;

-- CreateTable
CREATE TABLE "WalletContract" (
    "id" TEXT NOT NULL,
    "address" TEXT NOT NULL,
    "blockchainId" TEXT,
    "reserved" BOOLEAN NOT NULL DEFAULT false,
    "chainType" "ChainType" NOT NULL,
    "network" "Network" NOT NULL,

    CONSTRAINT "WalletContract_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "WalletContract_address_key" ON "WalletContract"("address");
