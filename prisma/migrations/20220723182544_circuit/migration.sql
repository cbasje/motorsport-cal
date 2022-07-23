/*
  Warnings:

  - You are about to drop the column `locationId` on the `Round` table. All the data in the column will be lost.
  - You are about to drop the `Location` table. If the table is not empty, all the data it contains will be lost.
  - Added the required column `circuitId` to the `Round` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "Round" DROP CONSTRAINT "Round_locationId_fkey";

-- AlterTable
ALTER TABLE "Round" DROP COLUMN "locationId",
ADD COLUMN     "circuitId" TEXT NOT NULL;

-- DropTable
DROP TABLE "Location";

-- CreateTable
CREATE TABLE "Circuit" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "title" TEXT NOT NULL,
    "long" DECIMAL(65,30) NOT NULL,
    "lat" DECIMAL(65,30) NOT NULL,

    CONSTRAINT "Circuit_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Circuit_title_key" ON "Circuit"("title");

-- AddForeignKey
ALTER TABLE "Round" ADD CONSTRAINT "Round_circuitId_fkey" FOREIGN KEY ("circuitId") REFERENCES "Circuit"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
