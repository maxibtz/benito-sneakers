-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Product" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "brand" TEXT NOT NULL,
    "model" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "sectionId" TEXT,
    "sku" TEXT NOT NULL,
    "price" REAL NOT NULL,
    "salePrice" REAL,
    "priceCurrency" TEXT NOT NULL DEFAULT 'ARS',
    "priceUsd" REAL,
    "salePriceUsd" REAL,
    "cost" REAL DEFAULT 0,
    "costBreakdown" TEXT NOT NULL DEFAULT '[]',
    "images" TEXT NOT NULL,
    "videos" TEXT NOT NULL DEFAULT '',
    "active" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Product_sectionId_fkey" FOREIGN KEY ("sectionId") REFERENCES "Section" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_Product" ("active", "brand", "category", "cost", "costBreakdown", "createdAt", "description", "id", "images", "model", "price", "salePrice", "sectionId", "sku", "updatedAt", "videos") SELECT "active", "brand", "category", "cost", "costBreakdown", "createdAt", "description", "id", "images", "model", "price", "salePrice", "sectionId", "sku", "updatedAt", "videos" FROM "Product";
DROP TABLE "Product";
ALTER TABLE "new_Product" RENAME TO "Product";
CREATE UNIQUE INDEX "Product_sku_key" ON "Product"("sku");
CREATE TABLE "new_SiteSettings" (
    "id" TEXT NOT NULL PRIMARY KEY DEFAULT 'default',
    "whatsapp" TEXT NOT NULL DEFAULT '',
    "whatsappMessage" TEXT NOT NULL DEFAULT '',
    "instagram" TEXT NOT NULL DEFAULT '',
    "tiktok" TEXT NOT NULL DEFAULT '',
    "transferAlias" TEXT NOT NULL DEFAULT '',
    "storeBg" TEXT NOT NULL DEFAULT '#0a0f24',
    "storeAccent" TEXT NOT NULL DEFAULT '#8b6dff',
    "storeFont" TEXT NOT NULL DEFAULT 'moderna',
    "mpAccessToken" TEXT NOT NULL DEFAULT '',
    "mpPublicKey" TEXT NOT NULL DEFAULT '',
    "smtpUser" TEXT NOT NULL DEFAULT '',
    "smtpPass" TEXT NOT NULL DEFAULT '',
    "mailFromName" TEXT NOT NULL DEFAULT 'Benito Sneakers',
    "heroProductId" TEXT NOT NULL DEFAULT '',
    "heroImage" TEXT NOT NULL DEFAULT '',
    "heroTitle" TEXT NOT NULL DEFAULT '',
    "heroSubtitle" TEXT NOT NULL DEFAULT '',
    "heroBadge" TEXT NOT NULL DEFAULT '',
    "heroCtaText" TEXT NOT NULL DEFAULT '',
    "heroCtaLink" TEXT NOT NULL DEFAULT '',
    "shipPackageWeight" REAL NOT NULL DEFAULT 1,
    "shipPackageL" INTEGER NOT NULL DEFAULT 30,
    "shipPackageW" INTEGER NOT NULL DEFAULT 20,
    "shipPackageH" INTEGER NOT NULL DEFAULT 15,
    "shipOriginCp" TEXT NOT NULL DEFAULT '3600',
    "shipFreeThreshold" REAL NOT NULL DEFAULT 0,
    "shipDefaultRate" REAL NOT NULL DEFAULT 0,
    "shipRates" TEXT NOT NULL DEFAULT '{}',
    "pickupEnabled" BOOLEAN NOT NULL DEFAULT true,
    "pickupProvince" TEXT NOT NULL DEFAULT 'Formosa',
    "pickupNote" TEXT NOT NULL DEFAULT '',
    "usdRate" REAL NOT NULL DEFAULT 0,
    "usdRateSource" TEXT NOT NULL DEFAULT 'cripto',
    "usdRateUpdatedAt" DATETIME,
    "updatedAt" DATETIME NOT NULL
);
INSERT INTO "new_SiteSettings" ("heroBadge", "heroCtaLink", "heroCtaText", "heroImage", "heroProductId", "heroSubtitle", "heroTitle", "id", "instagram", "mailFromName", "mpAccessToken", "mpPublicKey", "pickupEnabled", "pickupNote", "pickupProvince", "shipDefaultRate", "shipFreeThreshold", "shipOriginCp", "shipPackageH", "shipPackageL", "shipPackageW", "shipPackageWeight", "shipRates", "smtpPass", "smtpUser", "storeAccent", "storeBg", "storeFont", "tiktok", "transferAlias", "updatedAt", "whatsapp", "whatsappMessage") SELECT "heroBadge", "heroCtaLink", "heroCtaText", "heroImage", "heroProductId", "heroSubtitle", "heroTitle", "id", "instagram", "mailFromName", "mpAccessToken", "mpPublicKey", "pickupEnabled", "pickupNote", "pickupProvince", "shipDefaultRate", "shipFreeThreshold", "shipOriginCp", "shipPackageH", "shipPackageL", "shipPackageW", "shipPackageWeight", "shipRates", "smtpPass", "smtpUser", "storeAccent", "storeBg", "storeFont", "tiktok", "transferAlias", "updatedAt", "whatsapp", "whatsappMessage" FROM "SiteSettings";
DROP TABLE "SiteSettings";
ALTER TABLE "new_SiteSettings" RENAME TO "SiteSettings";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;

