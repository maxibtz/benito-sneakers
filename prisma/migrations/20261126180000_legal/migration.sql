-- Datos legales del titular (editables desde Admin › Ajustes).
ALTER TABLE "SiteSettings" ADD COLUMN "legalName" TEXT NOT NULL DEFAULT '';
ALTER TABLE "SiteSettings" ADD COLUMN "legalCuit" TEXT NOT NULL DEFAULT '';
ALTER TABLE "SiteSettings" ADD COLUMN "legalAddress" TEXT NOT NULL DEFAULT '';
ALTER TABLE "SiteSettings" ADD COLUMN "legalEmail" TEXT NOT NULL DEFAULT '';
ALTER TABLE "SiteSettings" ADD COLUMN "dataFiscalUrl" TEXT NOT NULL DEFAULT '';
ALTER TABLE "SiteSettings" ADD COLUMN "dataFiscalImg" TEXT NOT NULL DEFAULT '';

-- Botón de arrepentimiento (Res. 424/2020 SCI).
CREATE TABLE "RevocationRequest" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "code" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "phone" TEXT NOT NULL,
    "dni" TEXT NOT NULL DEFAULT '',
    "orderRef" TEXT NOT NULL DEFAULT '',
    "orderId" TEXT,
    "details" TEXT NOT NULL DEFAULT '',
    "status" TEXT NOT NULL DEFAULT 'PENDIENTE',
    "adminNote" TEXT NOT NULL DEFAULT '',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);
CREATE UNIQUE INDEX "RevocationRequest_code_key" ON "RevocationRequest"("code");
