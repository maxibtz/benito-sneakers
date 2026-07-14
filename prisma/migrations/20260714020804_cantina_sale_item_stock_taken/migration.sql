-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_CantinaSaleItem" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "saleId" TEXT NOT NULL,
    "productId" TEXT NOT NULL,
    "quantity" INTEGER NOT NULL,
    "unitPrice" REAL NOT NULL,
    "stockTaken" INTEGER NOT NULL DEFAULT 0,
    CONSTRAINT "CantinaSaleItem_saleId_fkey" FOREIGN KEY ("saleId") REFERENCES "CantinaSale" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "CantinaSaleItem_productId_fkey" FOREIGN KEY ("productId") REFERENCES "CantinaProduct" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_CantinaSaleItem" ("id", "productId", "quantity", "saleId", "unitPrice") SELECT "id", "productId", "quantity", "saleId", "unitPrice" FROM "CantinaSaleItem";
DROP TABLE "CantinaSaleItem";
ALTER TABLE "new_CantinaSaleItem" RENAME TO "CantinaSaleItem";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
