-- AlterTable
ALTER TABLE "Order" ADD COLUMN "trackingCode" TEXT;
ALTER TABLE "Order" ADD COLUMN "trackingSentAt" DATETIME;

-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Customer" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "passwordHash" TEXT NOT NULL,
    "phone" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "lastLoginAt" DATETIME,
    "emailVerified" BOOLEAN NOT NULL DEFAULT false,
    "verifyCode" TEXT,
    "resetToken" TEXT,
    "resetExpires" DATETIME
);
INSERT INTO "new_Customer" ("createdAt", "email", "id", "lastLoginAt", "name", "passwordHash", "phone") SELECT "createdAt", "email", "id", "lastLoginAt", "name", "passwordHash", "phone" FROM "Customer";
DROP TABLE "Customer";
ALTER TABLE "new_Customer" RENAME TO "Customer";
CREATE UNIQUE INDEX "Customer_email_key" ON "Customer"("email");
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
    "updatedAt" DATETIME NOT NULL
);
INSERT INTO "new_SiteSettings" ("heroBadge", "heroCtaLink", "heroCtaText", "heroImage", "heroProductId", "heroSubtitle", "heroTitle", "id", "instagram", "mpAccessToken", "mpPublicKey", "pickupEnabled", "pickupNote", "pickupProvince", "shipDefaultRate", "shipFreeThreshold", "shipOriginCp", "shipPackageH", "shipPackageL", "shipPackageW", "shipPackageWeight", "shipRates", "storeAccent", "storeBg", "storeFont", "tiktok", "transferAlias", "updatedAt", "whatsapp", "whatsappMessage") SELECT "heroBadge", "heroCtaLink", "heroCtaText", "heroImage", "heroProductId", "heroSubtitle", "heroTitle", "id", "instagram", "mpAccessToken", "mpPublicKey", "pickupEnabled", "pickupNote", "pickupProvince", "shipDefaultRate", "shipFreeThreshold", "shipOriginCp", "shipPackageH", "shipPackageL", "shipPackageW", "shipPackageWeight", "shipRates", "storeAccent", "storeBg", "storeFont", "tiktok", "transferAlias", "updatedAt", "whatsapp", "whatsappMessage" FROM "SiteSettings";
DROP TABLE "SiteSettings";
ALTER TABLE "new_SiteSettings" RENAME TO "SiteSettings";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
