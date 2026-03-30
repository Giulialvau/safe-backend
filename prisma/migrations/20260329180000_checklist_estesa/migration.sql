-- CreateEnum
CREATE TYPE "ChecklistEsito" AS ENUM ('CONFORME', 'NON_CONFORME', 'PARZIALE', 'NON_APPLICABILE');

-- AlterTable
ALTER TABLE "Checklist" ADD COLUMN     "fase" TEXT,
ADD COLUMN     "dataCompilazione" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "esito" "ChecklistEsito",
ADD COLUMN     "note" TEXT,
ADD COLUMN     "operatore" TEXT,
ADD COLUMN     "allegati" JSONB;
