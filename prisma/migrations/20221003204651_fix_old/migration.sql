/*
  Warnings:

  - You are about to drop the column `createdAt` on the `Circuit` table. All the data in the column will be lost.
  - You are about to drop the column `long` on the `Circuit` table. All the data in the column will be lost.
  - You are about to alter the column `lat` on the `Circuit` table. The data in that column could be lost. The data in that column will be cast from `Decimal(65,30)` to `DoublePrecision`.
  - You are about to drop the column `createdAt` on the `Round` table. All the data in the column will be lost.
  - You are about to drop the column `createdAt` on the `Session` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[title,sport,season]` on the table `Round` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[type,number,roundId]` on the table `Session` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterEnum
ALTER TYPE "SessionType" ADD VALUE 'SPRINT';

-- DropForeignKey
ALTER TABLE "Round" DROP CONSTRAINT "Round_circuitId_fkey";

-- DropForeignKey
ALTER TABLE "Session" DROP CONSTRAINT "Session_roundId_fkey";

-- DropIndex
DROP INDEX "Round_title_key";

-- AlterTable
ALTER TABLE "Circuit" DROP COLUMN "createdAt",
DROP COLUMN "long",
ADD COLUMN     "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "lon" DOUBLE PRECISION,
ADD COLUMN     "wikipediaPageId" INTEGER,
ALTER COLUMN "lat" DROP DEFAULT,
ALTER COLUMN "lat" SET DATA TYPE DOUBLE PRECISION;

-- AlterTable
ALTER TABLE "Round" DROP COLUMN "createdAt",
ADD COLUMN     "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ALTER COLUMN "season" SET DATA TYPE VARCHAR;

-- AlterTable
ALTER TABLE "Session" DROP COLUMN "createdAt",
ADD COLUMN     "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ALTER COLUMN "number" DROP DEFAULT,
ALTER COLUMN "startDate" SET DATA TYPE TIMESTAMPTZ(6),
ALTER COLUMN "endDate" SET DATA TYPE TIMESTAMPTZ(6);

-- CreateIndex
CREATE UNIQUE INDEX "Round_title_sport_season_key" ON "Round"("title", "sport", "season");

-- CreateIndex
CREATE UNIQUE INDEX "Session_type_number_roundId_key" ON "Session"("type", "number", "roundId");

-- AddForeignKey
ALTER TABLE "Round" ADD CONSTRAINT "Round_circuitId_fkey" FOREIGN KEY ("circuitId") REFERENCES "Circuit"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Session" ADD CONSTRAINT "Session_roundId_fkey" FOREIGN KEY ("roundId") REFERENCES "Round"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
