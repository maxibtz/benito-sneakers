-- AlterTable
ALTER TABLE "Product" ADD COLUMN "cost" REAL DEFAULT 0;

-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Order" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "customerId" TEXT,
    "customerName" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "phone" TEXT NOT NULL,
    "street" TEXT NOT NULL,
    "streetNumber" TEXT NOT NULL,
    "floorApt" TEXT,
    "city" TEXT NOT NULL,
    "province" TEXT NOT NULL,
    "postalCode" TEXT NOT NULL,
    "dni" TEXT NOT NULL,
    "total" REAL NOT NULL,
    "discount" REAL NOT NULL DEFAULT 0,
    "couponCode" TEXT,
    "status" TEXT NOT NULL DEFAULT 'NUEVO',
    "paymentMethod" TEXT NOT NULL,
    "paymentStatus" TEXT NOT NULL DEFAULT 'pending',
    "paymentRef" TEXT,
    "preferenceId" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Order_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES "Customer" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_Order" ("city", "couponCode", "createdAt", "customerId", "customerName", "discount", "dni", "email", "floorApt", "id", "paymentMethod", "paymentRef", "phone", "postalCode", "province", "status", "street", "streetNumber", "total", "updatedAt") SELECT "city", "couponCode", "createdAt", "customerId", "customerName", "discount", "dni", "email", "floorApt", "id", "paymentMethod", "paymentRef", "phone", "postalCode", "province", "status", "street", "streetNumber", "total", "updatedAt" FROM "Order";
DROP TABLE "Order";
ALTER TABLE "new_Order" RENAME TO "Order";
CREATE TABLE "new_SiteSettings" (
    "id" TEXT NOT NULL PRIMARY KEY DEFAULT 'default',
    "whatsapp" TEXT NOT NULL DEFAULT '',
    "instagram" TEXT NOT NULL DEFAULT '',
    "tiktok" TEXT NOT NULL DEFAULT '',
    "transferAlias" TEXT NOT NULL DEFAULT '',
    "storeBg" TEXT NOT NULL DEFAULT '#0a0f24',
    "storeAccent" TEXT NOT NULL DEFAULT '#8b6dff',
    "storeFont" TEXT NOT NULL DEFAULT 'moderna',
    "mpAccessToken" TEXT NOT NULL DEFAULT '',
    "mpPublicKey" TEXT NOT NULL DEFAULT '',
    "updatedAt" DATETIME NOT NULL
);
INSERT INTO "new_SiteSettings" ("id", "instagram", "storeAccent", "storeBg", "storeFont", "tiktok", "transferAlias", "updatedAt", "whatsapp") SELECT "id", "instagram", "storeAccent", "storeBg", "storeFont", "tiktok", "transferAlias", "updatedAt", "whatsapp" FROM "SiteSettings";
DROP TABLE "SiteSettings";
ALTER TABLE "new_SiteSettings" RENAME TO "SiteSettings";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
