"use server";

import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import { requireAdmin } from "@/lib/auth";

export type ManualSaleState = { ok?: boolean; error?: string };

type ParsedItem = { description: string; quantity: number; unitPrice: number };

/** Parsea las líneas de mercadería del formulario y calcula el total. */
function parseItems(raw: FormDataEntryValue | null): { items: ParsedItem[]; total: number } {
  if (typeof raw !== "string") return { items: [], total: 0 };
  try {
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return { items: [], total: 0 };
    const items = parsed
      .map((it) => ({
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

  await db.manualSale.create({
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

  revalidatePath("/admin/ventas");
  revalidatePath("/admin");
  return { ok: true };
}

export async function deleteManualSaleAction(id: string) {
  await requireAdmin();
  await db.manualSale.delete({ where: { id } });
  revalidatePath("/admin/ventas");
  revalidatePath("/admin");
}
