import { db } from "@/lib/db";
import type { CantinaPaymentMethod } from "@/generated/prisma/client";

// ============================================================================
// Cantina — data access. Módulo independiente del catálogo de zapatillas.
// ============================================================================

export async function getCantinaCategories() {
  return db.cantinaCategory.findMany({ orderBy: { name: "asc" } });
}

export async function getCantinaSuppliers() {
  return db.cantinaSupplier.findMany({ orderBy: { name: "asc" } });
}

export type CantinaSupplierWithStats = {
  id: string;
  name: string;
  contact: string;
  notes: string;
  productCount: number;
};

export async function getCantinaSuppliersWithStats(): Promise<CantinaSupplierWithStats[]> {
  const [suppliers, counts] = await Promise.all([
    db.cantinaSupplier.findMany({ orderBy: { name: "asc" } }),
    db.cantinaProduct.groupBy({ by: ["supplierId"], _count: { _all: true } }),
  ]);
  const countMap = new Map(counts.map((c) => [c.supplierId ?? "", c._count._all]));
  return suppliers.map((s) => ({
    id: s.id,
    name: s.name,
    contact: s.contact,
    notes: s.notes,
    productCount: countMap.get(s.id) ?? 0,
  }));
}

export type CantinaProductRow = {
  id: string;
  name: string;
  categoryId: string | null;
  categoryName: string | null;
  supplierId: string | null;
  supplierName: string | null;
  cost: number;
  price: number;
  stock: number;
  minStock: number;
  unit: string;
  active: boolean;
  lowStock: boolean;
  marginAmount: number;
  marginPct: number;
};

function toProductRow(p: {
  id: string;
  name: string;
  categoryId: string | null;
  category: { name: string } | null;
  supplierId: string | null;
  supplier: { name: string } | null;
  cost: number;
  price: number;
  stock: number;
  minStock: number;
  unit: string;
  active: boolean;
}): CantinaProductRow {
  const marginAmount = p.price - p.cost;
  const marginPct = p.price > 0 ? Math.round((marginAmount / p.price) * 100) : 0;
  return {
    id: p.id,
    name: p.name,
    categoryId: p.categoryId,
    categoryName: p.category?.name ?? null,
    supplierId: p.supplierId,
    supplierName: p.supplier?.name ?? null,
    cost: p.cost,
    price: p.price,
    stock: p.stock,
    minStock: p.minStock,
    unit: p.unit,
    active: p.active,
    lowStock: p.stock <= p.minStock,
    marginAmount,
    marginPct,
  };
}

export async function getCantinaProducts(): Promise<CantinaProductRow[]> {
  const products = await db.cantinaProduct.findMany({
    include: { category: true, supplier: true },
    orderBy: { name: "asc" },
  });
  return products.map(toProductRow);
}

export async function getCantinaProduct(id: string) {
  return db.cantinaProduct.findUnique({ where: { id }, include: { category: true, supplier: true } });
}

/** Productos activos, livianos, para la pantalla de carga rápida de ventas. */
export async function getCantinaProductsForSale() {
  const products = await db.cantinaProduct.findMany({
    where: { active: true },
    include: { category: true },
    orderBy: { name: "asc" },
  });
  return products.map((p) => ({
    id: p.id,
    name: p.name,
    price: p.price,
    stock: p.stock,
    unit: p.unit,
    categoryId: p.categoryId,
    categoryName: p.category?.name ?? null,
  }));
}

export type CantinaSaleRow = {
  id: string;
  soldAt: Date;
  paymentMethod: CantinaPaymentMethod;
  total: number;
  items: { productName: string; quantity: number; unitPrice: number }[];
};

export async function getCantinaSales(): Promise<CantinaSaleRow[]> {
  const sales = await db.cantinaSale.findMany({
    include: { items: { include: { product: true } } },
    orderBy: { soldAt: "desc" },
  });
  return sales.map((s) => ({
    id: s.id,
    soldAt: s.soldAt,
    paymentMethod: s.paymentMethod,
    total: s.total,
    items: s.items.map((it) => ({
      productName: it.product.name,
      quantity: it.quantity,
      unitPrice: it.unitPrice,
    })),
  }));
}

// ---------- Dashboard ----------

export type CantinaSaleForDashboard = {
  id: string;
  soldAt: Date;
  paymentMethod: CantinaPaymentMethod;
  total: number;
  items: {
    productId: string;
    productName: string;
    categoryName: string | null;
    supplierName: string | null;
    quantity: number;
    unitPrice: number;
    cost: number;
  }[];
};

/** Trae TODAS las ventas con lo necesario para calcular el dashboard en el cliente por período. */
export async function getCantinaSalesForDashboard(): Promise<CantinaSaleForDashboard[]> {
  const sales = await db.cantinaSale.findMany({
    include: {
      items: { include: { product: { include: { category: true, supplier: true } } } },
    },
    orderBy: { soldAt: "desc" },
  });
  return sales.map((s) => ({
    id: s.id,
    soldAt: s.soldAt,
    paymentMethod: s.paymentMethod,
    total: s.total,
    items: s.items.map((it) => ({
      productId: it.productId,
      productName: it.product.name,
      categoryName: it.product.category?.name ?? null,
      supplierName: it.product.supplier?.name ?? null,
      quantity: it.quantity,
      unitPrice: it.unitPrice,
      cost: it.product.cost,
    })),
  }));
}

export async function getCantinaLowStockProducts() {
  const products = await db.cantinaProduct.findMany({
    where: { active: true },
    include: { category: true },
  });
  return products
    .filter((p) => p.stock <= p.minStock)
    .map((p) => ({
      id: p.id,
      name: p.name,
      categoryName: p.category?.name ?? null,
      stock: p.stock,
      minStock: p.minStock,
      unit: p.unit,
    }))
    .sort((a, b) => a.stock - b.stock);
}
