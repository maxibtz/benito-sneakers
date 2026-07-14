-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_CantinaProduct" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "type" TEXT NOT NULL DEFAULT 'SIMPLE',
    "categoryId" TEXT,
    "supplierId" TEXT,
    "cost" REAL NOT NULL DEFAULT 0,
    "caseCost" REAL NOT NULL DEFAULT 0,
    "unitsPerCase" INTEGER NOT NULL DEFAULT 1,
    "price" REAL NOT NULL DEFAULT 0,
    "stock" INTEGER NOT NULL DEFAULT 0,
    "minStock" INTEGER NOT NULL DEFAULT 0,
    "unit" TEXT NOT NULL DEFAULT 'unidad',
    "active" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "CantinaProduct_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "CantinaCategory" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "CantinaProduct_supplierId_fkey" FOREIGN KEY ("supplierId") REFERENCES "CantinaSupplier" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_CantinaProduct" ("active", "categoryId", "cost", "createdAt", "id", "minStock", "name", "price", "stock", "supplierId", "type", "unit", "updatedAt") SELECT "active", "categoryId", "cost", "createdAt", "id", "minStock", "name", "price", "stock", "supplierId", "type", "unit", "updatedAt" FROM "CantinaProduct";
DROP TABLE "CantinaProduct";
ALTER TABLE "new_CantinaProduct" RENAME TO "CantinaProduct";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
