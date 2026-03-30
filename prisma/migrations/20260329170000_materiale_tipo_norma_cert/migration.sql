-- AlterTable
ALTER TABLE "Materiale" ADD COLUMN     "tipo" TEXT,
ADD COLUMN     "norma" TEXT,
ADD COLUMN     "certificatoDocumentoId" TEXT;

-- CreateIndex
CREATE INDEX "Materiale_certificatoDocumentoId_idx" ON "Materiale"("certificatoDocumentoId");

-- AddForeignKey
ALTER TABLE "Materiale" ADD CONSTRAINT "Materiale_certificatoDocumentoId_fkey" FOREIGN KEY ("certificatoDocumentoId") REFERENCES "Documento"("id") ON DELETE SET NULL ON UPDATE CASCADE;
