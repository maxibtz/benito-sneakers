-- CreateTable
CREATE TABLE "CantinaSupplier" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "contact" TEXT NOT NULL DEFAULT '',
    "notes" TEXT NOT NULL DEFAULT '',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateTable
CREATE TABLE "CantinaCategory" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateTable
CREATE TABLE "CantinaProduct" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "type" TEXT NOT NULL DEFAULT 'SIMPLE',
    "categoryId" TEXT,
    "supplierId" TEXT,
    "cost" REAL NOT NULL DEFAULT 0,
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

-- CreateTable
CREATE TABLE "CantinaIngredient" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "supplierId" TEXT,
    "cost" REAL NOT NULL DEFAULT 0,
    "stock" REAL NOT NULL DEFAULT 0,
    "minStock" REAL NOT NULL DEFAULT 0,
    "unit" TEXT NOT NULL DEFAULT 'unidad',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "CantinaIngredient_supplierId_fkey" FOREIGN KEY ("supplierId") REFERENCES "CantinaSupplier" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "CantinaRecipeLine" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "productId" TEXT NOT NULL,
    "ingredientId" TEXT NOT NULL,
    "quantity" REAL NOT NULL,
    CONSTRAINT "CantinaRecipeLine_productId_fkey" FOREIGN KEY ("productId") REFERENCES "CantinaProduct" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "CantinaRecipeLine_ingredientId_fkey" FOREIGN KEY ("ingredientId") REFERENCES "CantinaIngredient" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "CantinaSale" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "soldAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "paymentMethod" TEXT NOT NULL,
    "total" REAL NOT NULL DEFAULT 0,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateTable
CREATE TABLE "CantinaSaleItem" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "saleId" TEXT NOT NULL,
    "productId" TEXT NOT NULL,
    "quantity" INTEGER NOT NULL,
    "unitPrice" REAL NOT NULL,
    CONSTRAINT "CantinaSaleItem_saleId_fkey" FOREIGN KEY ("saleId") REFERENCES "CantinaSale" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "CantinaSaleItem_productId_fkey" FOREIGN KEY ("productId") REFERENCES "CantinaProduct" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "CantinaCategory_name_key" ON "CantinaCategory"("name");

-- CreateIndex
CREATE UNIQUE INDEX "CantinaRecipeLine_productId_ingredientId_key" ON "CantinaRecipeLine"("productId", "ingredientId");
