"use server";

import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import { requireAdmin } from "@/lib/auth";
import type { CantinaPaymentMethod } from "@/generated/prisma/client";

function revalidate() {
  revalidatePath("/admin/cantina");
  revalidatePath("/admin/cantina/productos");
  revalidatePath("/admin/cantina/vender");
  revalidatePath("/admin/cantina/ventas");
}

export type CreateCantinaSaleInput = {
  paymentMethod: CantinaPaymentMethod;
  items: { productId: string; quantity: number }[];
};

/**
 * Crea un ticket de venta. Los precios se leen SIEMPRE de la base (nunca del
 * cliente) y el stock se descuenta con clamp a 0 (nunca queda negativo);
 * guardamos cuánto se descontó realmente para poder devolverlo si se borra.
 */
export async function createCantinaSaleAction(input: CreateCantinaSaleInput): Promise<{ id: string }> {
  await requireAdmin();

  if (!Array.isArray(input.items) || input.items.length === 0 || input.items.length > 100) {
    throw new Error("El carrito está vacío o es inválido.");
  }
  const validPayment = ["EFECTIVO", "TRANSFERENCIA", "TARJETA"].includes(input.paymentMethod);
  if (!validPayment) {
    throw new Error("Medio de pago inválido.");
  }

  // Agrupamos por si el mismo producto aparece repetido.
  const qtyByProduct = new Map<string, number>();
  for (const it of input.items) {
    const qty = Math.floor(Number(it.quantity));
    if (!it.productId || !Number.isFinite(qty) || qty < 1 || qty > 999) {
      throw new Error("Hay una cantidad inválida en el carrito.");
    }
    qtyByProduct.set(it.productId, (qtyByProduct.get(it.productId) ?? 0) + qty);
  }

  const productIds = [...qtyByProduct.keys()];
  const products = await db.cantinaProduct.findMany({ where: { id: { in: productIds } } });
  const productById = new Map(products.map((p) => [p.id, p]));

  const lines = productIds.map((productId) => {
    const product = productById.get(productId);
    if (!product || !product.active) {
      throw new Error("Hay un producto inválido en el carrito. Actualizá la página.");
    }
    const quantity = qtyByProduct.get(productId)!;
    return { product, quantity };
  });

  const total = lines.reduce((sum, l) => sum + l.product.price * l.quantity, 0);

  const sale = await db.$transaction(async (tx) => {
    const created = await tx.cantinaSale.create({
      data: { paymentMethod: input.paymentMethod, total },
    });
    for (const l of lines) {
      const current = await tx.cantinaProduct.findUnique({ where: { id: l.product.id } });
      const stockTaken = Math.max(0, Math.min(l.quantity, current?.stock ?? 0));
      await tx.cantinaSaleItem.create({
        data: {
          saleId: created.id,
          productId: l.product.id,
          quantity: l.quantity,
          unitPrice: l.product.price,
          stockTaken,
        },
      });
      if (stockTaken > 0) {
        await tx.cantinaProduct.update({
          where: { id: l.product.id },
          data: { stock: (current?.stock ?? 0) - stockTaken },
        });
      }
    }
    return created;
  });

  revalidate();
  return { id: sale.id };
}

export async function deleteCantinaSaleAction(id: string) {
  await requireAdmin();

  const sale = await db.cantinaSale.findUnique({ where: { id }, include: { items: true } });
  if (!sale) return;

  await db.$transaction(async (tx) => {
    for (const item of sale.items) {
      if (item.stockTaken > 0) {
        await tx.cantinaProduct.update({
          where: { id: item.productId },
          data: { stock: { increment: item.stockTaken } },
        });
      }
    }
    await tx.cantinaSale.delete({ where: { id } });
  });

  revalidate();
}
