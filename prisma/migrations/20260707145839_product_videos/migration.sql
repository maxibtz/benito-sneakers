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
    "cost" REAL DEFAULT 0,
    "costBreakdown" TEXT NOT NULL DEFAULT '[]',
    "images" TEXT NOT NULL,
    "videos" TEXT NOT NULL DEFAULT '',
    "active" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Product_sectionId_fkey" FOREIGN KEY ("sectionId") REFERENCES "Section" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_Product" ("active", "brand", "category", "cost", "costBreakdown", "createdAt", "description", "id", "images", "model", "price", "salePrice", "sectionId", "sku", "updatedAt") SELECT "active", "brand", "category", "cost", "costBreakdown", "createdAt", "description", "id", "images", "model", "price", "salePrice", "sectionId", "sku", "updatedAt" FROM "Product";
DROP TABLE "Product";
ALTER TABLE "new_Product" RENAME TO "Product";
CREATE UNIQUE INDEX "Product_sku_key" ON "Product"("sku");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
