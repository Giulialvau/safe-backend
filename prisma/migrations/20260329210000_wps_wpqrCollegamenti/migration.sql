-- AlterTable
ALTER TABLE "Wps" ADD COLUMN "note" TEXT,
ADD COLUMN "materialeId" TEXT;

-- CreateIndex
CREATE INDEX "Wps_materialeId_idx" ON "Wps"("materialeId");

-- AddForeignKey
ALTER TABLE "Wps" ADD CONSTRAINT "Wps_materialeId_fkey" FOREIGN KEY ("materialeId") REFERENCES "Materiale"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AlterTable
ALTER TABLE "Wpqr" ADD COLUMN "note" TEXT,
ADD COLUMN "qualificaId" TEXT;

-- CreateIndex
CREATE INDEX "Wpqr_qualificaId_idx" ON "Wpqr"("qualificaId");

-- AddForeignKey
ALTER TABLE "Wpqr" ADD CONSTRAINT "Wpqr_qualificaId_fkey" FOREIGN KEY ("qualificaId") REFERENCES "Qualifica"("id") ON DELETE SET NULL ON UPDATE CASCADE;
