-- DropForeignKey
ALTER TABLE "Round" DROP CONSTRAINT "Round_circuitId_fkey";

-- DropForeignKey
ALTER TABLE "Session" DROP CONSTRAINT "Session_roundId_fkey";

-- AlterTable
ALTER TABLE "Circuit" ALTER COLUMN "long" DROP NOT NULL,
ALTER COLUMN "long" SET DEFAULT 0,
ALTER COLUMN "lat" DROP NOT NULL,
ALTER COLUMN "lat" SET DEFAULT 0;

-- AlterTable
ALTER TABLE "Round" ALTER COLUMN "link" DROP NOT NULL;

-- AlterTable
ALTER TABLE "Session" ALTER COLUMN "number" DROP NOT NULL;

-- AddForeignKey
ALTER TABLE "Session" ADD CONSTRAINT "Session_roundId_fkey" FOREIGN KEY ("roundId") REFERENCES "Round"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Round" ADD CONSTRAINT "Round_circuitId_fkey" FOREIGN KEY ("circuitId") REFERENCES "Circuit"("id") ON DELETE CASCADE ON UPDATE CASCADE;
