"use server";

import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import { requireAdmin } from "@/lib/auth";

export type ManualSaleState = { ok?: boolean; error?: string };

type ParsedItem = {
  productId?: string;
  variantId?: string;
  size?: string;
  description: string;
  quantity: number;
  unitPrice: number;
  stockTaken?: number; // unidades realmente descontadas del stock (para devolverlas al borrar)
};

/** Parsea las líneas de mercadería del formulario y calcula el total. */
function parseItems(raw: FormDataEntryValue | null): { items: ParsedItem[]; total: number } {
  if (typeof raw !== "string") return { items: [], total: 0 };
  try {
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return { items: [], total: 0 };
    const items: ParsedItem[] = parsed
      .map((it) => ({
        productId: it?.productId ? String(it.productId) : undefined,
        variantId: it?.variantId ? String(it.variantId) : undefined,
        size: it?.size ? String(it.size) : undefined,
        description: String(it?.description ?? "").trim(),
        quantity: Math.max(0, Math.floor(Number(it?.quantity)) || 0),
        unitPrice: Math.max(0, Number(it?.unitPrice) || 0),
      }))
      .filter((it) => it.description.length > 0 || it.unitPrice > 0);
    const total = items.reduce((sum, it) => sum + it.unitPrice * (it.quantity || 1), 0);
    return { items, total };
  } catch {
    return { items: [], total: 0 };
  }
}

export async function createManualSaleAction(
  _prev: ManualSaleState,
  formData: FormData
): Promise<ManualSaleState> {
  await requireAdmin();

  const { items, total } = parseItems(formData.get("items"));
  if (items.length === 0) {
    return { error: "Agregá al menos un ítem de mercadería con su monto." };
  }
  if (total <= 0) {
    return { error: "El total de la venta debe ser mayor a 0. Revisá los montos." };
  }

  const soldAtRaw = String(formData.get("soldAt") ?? "").trim();
  const soldAt = soldAtRaw ? new Date(soldAtRaw) : new Date();
  const cost = Math.max(0, Number(formData.get("cost")) || 0);

  let touchedStock = false;
  await db.$transaction(async (tx) => {
    // Descontamos stock por talle (sin ir a negativo) y guardamos cuánto se
    // descontó realmente en cada ítem, para poder devolverlo si se elimina.
    for (const it of items) {
      if (!it.variantId || it.quantity <= 0) continue;
      const v = await tx.variant.findUnique({ where: { id: it.variantId } });
      if (!v) continue;
      const taken = Math.min(it.quantity, v.stock);
      if (taken > 0) {
        await tx.variant.update({ where: { id: it.variantId }, data: { stock: v.stock - taken } });
        it.stockTaken = taken;
        touchedStock = true;
      }
    }

    await tx.manualSale.create({
      data: {
        soldAt: isNaN(soldAt.getTime()) ? new Date() : soldAt,
        customerName: String(formData.get("customerName") ?? "").trim(),
        channel: String(formData.get("channel") ?? "").trim(),
        paymentMethod: String(formData.get("paymentMethod") ?? "").trim(),
        items: JSON.stringify(items),
        total,
        cost,
        note: String(formData.get("note") ?? "").trim(),
      },
    });
  });

  revalidatePath("/admin/ventas");
  revalidatePath("/admin");
  if (touchedStock) revalidatePath("/", "layout"); // refresca stock en la tienda
  return { ok: true };
}

export async function deleteManualSaleAction(id: string) {
  await requireAdmin();

  const sale = await db.manualSale.findUnique({ where: { id } });
  if (!sale) return;

  // Devolvemos al stock los talles que se habían descontado.
  let restored = false;
  try {
    const items = JSON.parse(sale.items) as ParsedItem[];
    const moves = (Array.isArray(items) ? items : [])
      .map((it) => ({
        variantId: it?.variantId ? String(it.variantId) : "",
        // devolvemos exactamente lo que se descontó (stockTaken); si falta, la cantidad
        quantity: Math.floor(Number(it?.stockTaken ?? it?.quantity)) || 0,
      }))
      .filter((mv) => mv.variantId && mv.quantity > 0);

    await db.$transaction(async (tx) => {
      for (const mv of moves) {
        const v = await tx.variant.findUnique({ where: { id: mv.variantId } });
        if (v) {
          await tx.variant.update({
            where: { id: mv.variantId },
            data: { stock: v.stock + mv.quantity },
          });
          restored = true;
        }
      }
      await tx.manualSale.delete({ where: { id } });
    });
  } catch {
    await db.manualSale.delete({ where: { id } });
  }

  revalidatePath("/admin/ventas");
  revalidatePath("/admin");
  if (restored) revalidatePath("/", "layout");
}
