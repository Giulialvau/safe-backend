-- CreateEnum
CREATE TYPE "CommessaStato" AS ENUM ('BOZZA', 'IN_CORSO', 'SOSPESA', 'CHIUSA');

-- CreateEnum
CREATE TYPE "DocumentoStatoApprovazione" AS ENUM ('BOZZA', 'IN_REVISIONE', 'APPROVATO', 'RESPINTO');

-- CreateEnum
CREATE TYPE "ChecklistStato" AS ENUM ('APERTA', 'IN_CORSO', 'COMPLETATA', 'ARCHIVIATA');

-- CreateEnum
CREATE TYPE "NcTipo" AS ENUM ('INTERNA', 'ESTERNA', 'FORNITORE', 'PROCESSO');

-- CreateEnum
CREATE TYPE "NcGravita" AS ENUM ('BASSA', 'MEDIA', 'ALTA', 'CRITICA');

-- CreateEnum
CREATE TYPE "NcStato" AS ENUM ('APERTA', 'IN_ANALISI', 'IN_CORSO_AZIONI', 'CHIUSA');

-- CreateEnum
CREATE TYPE "AuditEsito" AS ENUM ('CONFORME', 'NON_CONFORME', 'PARZIALE');

-- CreateEnum
CREATE TYPE "PianoControlloEsito" AS ENUM ('IN_ATTESA', 'CONFORME', 'NON_CONFORME', 'NON_APPLICABILE');

-- CreateTable
CREATE TABLE "Commessa" (
    "id" TEXT NOT NULL,
    "codice" TEXT NOT NULL,
    "cliente" TEXT NOT NULL,
    "descrizione" TEXT,
    "dataInizio" TIMESTAMP(3),
    "dataFine" TIMESTAMP(3),
    "stato" "CommessaStato" NOT NULL DEFAULT 'BOZZA',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Commessa_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Materiale" (
    "id" TEXT NOT NULL,
    "codice" TEXT NOT NULL,
    "descrizione" TEXT NOT NULL,
    "certificato31" TEXT,
    "lotto" TEXT,
    "fornitore" TEXT,
    "dataCarico" TIMESTAMP(3),
    "commessaId" TEXT NOT NULL,

    CONSTRAINT "Materiale_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Documento" (
    "id" TEXT NOT NULL,
    "nome" TEXT NOT NULL,
    "tipo" TEXT NOT NULL,
    "versione" TEXT NOT NULL,
    "percorsoFile" TEXT NOT NULL,
    "statoApprovazione" "DocumentoStatoApprovazione" NOT NULL DEFAULT 'BOZZA',
    "commessaId" TEXT NOT NULL,

    CONSTRAINT "Documento_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Checklist" (
    "id" TEXT NOT NULL,
    "titolo" TEXT NOT NULL,
    "categoria" TEXT NOT NULL,
    "stato" "ChecklistStato" NOT NULL,
    "elementi" JSONB NOT NULL,
    "commessaId" TEXT,

    CONSTRAINT "Checklist_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Wps" (
    "id" TEXT NOT NULL,
    "codice" TEXT NOT NULL,
    "descrizione" TEXT,
    "processo" TEXT NOT NULL,
    "spessore" TEXT,
    "materialeBase" TEXT,
    "scadenza" TIMESTAMP(3),
    "commessaId" TEXT,

    CONSTRAINT "Wps_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Wpqr" (
    "id" TEXT NOT NULL,
    "codice" TEXT NOT NULL,
    "saldatore" TEXT NOT NULL,
    "wpsId" TEXT NOT NULL,
    "dataQualifica" TIMESTAMP(3) NOT NULL,
    "scadenza" TIMESTAMP(3),
    "commessaId" TEXT,

    CONSTRAINT "Wpqr_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Qualifica" (
    "id" TEXT NOT NULL,
    "nome" TEXT NOT NULL,
    "ruolo" TEXT NOT NULL,
    "scadenza" TIMESTAMP(3),
    "documento" TEXT,

    CONSTRAINT "Qualifica_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Attrezzatura" (
    "id" TEXT NOT NULL,
    "nome" TEXT NOT NULL,
    "matricola" TEXT NOT NULL,
    "tipo" TEXT NOT NULL,
    "dataManutenzione" TIMESTAMP(3),
    "dataTaratura" TIMESTAMP(3),
    "scadenza" TIMESTAMP(3),

    CONSTRAINT "Attrezzatura_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "NonConformita" (
    "id" TEXT NOT NULL,
    "titolo" TEXT NOT NULL,
    "descrizione" TEXT NOT NULL,
    "tipo" "NcTipo" NOT NULL,
    "gravita" "NcGravita" NOT NULL,
    "stato" "NcStato" NOT NULL,
    "azioniCorrettive" TEXT,
    "dataApertura" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "dataChiusura" TIMESTAMP(3),
    "commessaId" TEXT NOT NULL,

    CONSTRAINT "NonConformita_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Audit" (
    "id" TEXT NOT NULL,
    "titolo" TEXT NOT NULL,
    "data" TIMESTAMP(3) NOT NULL,
    "auditor" TEXT NOT NULL,
    "esito" "AuditEsito" NOT NULL,
    "note" TEXT,
    "commessaId" TEXT NOT NULL,

    CONSTRAINT "Audit_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PianoControllo" (
    "id" TEXT NOT NULL,
    "commessaId" TEXT NOT NULL,
    "fase" TEXT NOT NULL,
    "controlliRichiesti" JSONB NOT NULL,
    "esito" "PianoControlloEsito" NOT NULL,

    CONSTRAINT "PianoControllo_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Tracciabilita" (
    "id" TEXT NOT NULL,
    "materialeId" TEXT NOT NULL,
    "commessaId" TEXT NOT NULL,
    "posizione" TEXT NOT NULL,
    "quantita" DECIMAL(18,4) NOT NULL,

    CONSTRAINT "Tracciabilita_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Commessa_codice_key" ON "Commessa"("codice");

-- CreateIndex
CREATE INDEX "Materiale_commessaId_idx" ON "Materiale"("commessaId");

-- CreateIndex
CREATE UNIQUE INDEX "Materiale_commessaId_codice_key" ON "Materiale"("commessaId", "codice");

-- CreateIndex
CREATE INDEX "Documento_commessaId_idx" ON "Documento"("commessaId");

-- CreateIndex
CREATE INDEX "Checklist_commessaId_idx" ON "Checklist"("commessaId");

-- CreateIndex
CREATE UNIQUE INDEX "Wps_codice_key" ON "Wps"("codice");

-- CreateIndex
CREATE INDEX "Wps_commessaId_idx" ON "Wps"("commessaId");

-- CreateIndex
CREATE INDEX "Wpqr_wpsId_idx" ON "Wpqr"("wpsId");

-- CreateIndex
CREATE INDEX "Wpqr_commessaId_idx" ON "Wpqr"("commessaId");

-- CreateIndex
CREATE UNIQUE INDEX "Attrezzatura_matricola_key" ON "Attrezzatura"("matricola");

-- CreateIndex
CREATE INDEX "NonConformita_commessaId_idx" ON "NonConformita"("commessaId");

-- CreateIndex
CREATE INDEX "Audit_commessaId_idx" ON "Audit"("commessaId");

-- CreateIndex
CREATE INDEX "PianoControllo_commessaId_idx" ON "PianoControllo"("commessaId");

-- CreateIndex
CREATE INDEX "Tracciabilita_materialeId_idx" ON "Tracciabilita"("materialeId");

-- CreateIndex
CREATE INDEX "Tracciabilita_commessaId_idx" ON "Tracciabilita"("commessaId");

-- AddForeignKey
ALTER TABLE "Materiale" ADD CONSTRAINT "Materiale_commessaId_fkey" FOREIGN KEY ("commessaId") REFERENCES "Commessa"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Documento" ADD CONSTRAINT "Documento_commessaId_fkey" FOREIGN KEY ("commessaId") REFERENCES "Commessa"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Checklist" ADD CONSTRAINT "Checklist_commessaId_fkey" FOREIGN KEY ("commessaId") REFERENCES "Commessa"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Wps" ADD CONSTRAINT "Wps_commessaId_fkey" FOREIGN KEY ("commessaId") REFERENCES "Commessa"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Wpqr" ADD CONSTRAINT "Wpqr_wpsId_fkey" FOREIGN KEY ("wpsId") REFERENCES "Wps"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Wpqr" ADD CONSTRAINT "Wpqr_commessaId_fkey" FOREIGN KEY ("commessaId") REFERENCES "Commessa"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "NonConformita" ADD CONSTRAINT "NonConformita_commessaId_fkey" FOREIGN KEY ("commessaId") REFERENCES "Commessa"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Audit" ADD CONSTRAINT "Audit_commessaId_fkey" FOREIGN KEY ("commessaId") REFERENCES "Commessa"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PianoControllo" ADD CONSTRAINT "PianoControllo_commessaId_fkey" FOREIGN KEY ("commessaId") REFERENCES "Commessa"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Tracciabilita" ADD CONSTRAINT "Tracciabilita_materialeId_fkey" FOREIGN KEY ("materialeId") REFERENCES "Materiale"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Tracciabilita" ADD CONSTRAINT "Tracciabilita_commessaId_fkey" FOREIGN KEY ("commessaId") REFERENCES "Commessa"("id") ON DELETE CASCADE ON UPDATE CASCADE;
