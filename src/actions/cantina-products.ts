"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { requireAdmin } from "@/lib/auth";

export type CantinaProductFormState = { error?: string; ok?: boolean };

function revalidate() {
  revalidatePath("/admin/cantina");
  revalidatePath("/admin/cantina/productos");
  revalidatePath("/admin/cantina/vender");
}

function parseProductFields(formData: FormData) {
  const name = String(formData.get("name") ?? "").trim();
  const categoryId = String(formData.get("categoryId") ?? "").trim() || null;
  const supplierId = String(formData.get("supplierId") ?? "").trim() || null;
  const price = Math.max(0, Number(formData.get("price")) || 0);
  const stock = Math.max(0, Math.floor(Number(formData.get("stock"))) || 0);
  const minStock = Math.max(0, Math.floor(Number(formData.get("minStock"))) || 0);
  const unit = String(formData.get("unit") ?? "unidad").trim() || "unidad";
  const active = formData.get("active") === "on";

  // Costo: si se carga por cajón (caseCost + unitsPerCase), el costo por
  // unidad se recalcula SIEMPRE en el servidor (nunca se confía en el
  // cálculo hecho en el navegador). Si no, se usa el costo unitario tipeado.
  const caseCost = Math.max(0, Number(formData.get("caseCost")) || 0);
  const unitsPerCase = Math.max(1, Math.floor(Number(formData.get("unitsPerCase"))) || 1);
  const manualCost = Math.max(0, Number(formData.get("cost")) || 0);
  const cost = caseCost > 0 ? caseCost / unitsPerCase : manualCost;

  return {
    name,
    categoryId,
    supplierId,
    cost,
    caseCost,
    unitsPerCase,
    price,
    stock,
    minStock,
    unit,
    active,
  };
}

export async function createCantinaProductAction(
  _prev: CantinaProductFormState,
  formData: FormData
): Promise<CantinaProductFormState> {
  await requireAdmin();
  const f = parseProductFields(formData);
  if (!f.name) return { error: "Ponele un nombre al producto." };
  if (f.price <= 0) return { error: "El precio de venta debe ser mayor a 0." };

  await db.cantinaProduct.create({ data: f });
  revalidate();
  redirect("/admin/cantina/productos");
}

export async function updateCantinaProductAction(
  id: string,
  _prev: CantinaProductFormState,
  formData: FormData
): Promise<CantinaProductFormState> {
  await requireAdmin();
  const f = parseProductFields(formData);
  if (!f.name) return { error: "Ponele un nombre al producto." };
  if (f.price <= 0) return { error: "El precio de venta debe ser mayor a 0." };

  await db.cantinaProduct.update({ where: { id }, data: f });
  revalidate();
  redirect("/admin/cantina/productos");
}

/** Reponer stock contando cajones/paquetes recibidos, no unidad por unidad. */
export async function restockCantinaProductAction(
  id: string,
  _prev: CantinaProductFormState,
  formData: FormData
): Promise<CantinaProductFormState> {
  await requireAdmin();
  const cases = Math.max(0, Math.floor(Number(formData.get("cases"))) || 0);
  if (cases <= 0) return { error: "Poné cuántos cajones/paquetes llegaron." };

  const product = await db.cantinaProduct.findUnique({ where: { id } });
  if (!product) return { error: "Producto no encontrado." };

  await db.cantinaProduct.update({
    where: { id },
    data: { stock: product.stock + cases * product.unitsPerCase },
  });
  revalidate();
  return { ok: true };
}

export async function toggleCantinaProductActiveAction(id: string, active: boolean) {
  await requireAdmin();
  await db.cantinaProduct.update({ where: { id }, data: { active } });
  revalidate();
}

export async function deleteCantinaProductAction(id: string) {
  await requireAdmin();

  // Si ya tiene ventas registradas, no se puede borrar (quedarían tickets
  // históricos sin producto). Se oculta en vez de eliminar.
  const sales = await db.cantinaSaleItem.count({ where: { productId: id } });
  if (sales > 0) {
    await db.cantinaProduct.update({ where: { id }, data: { active: false } });
    revalidate();
    redirect("/admin/cantina/productos?aviso=con-ventas");
  }

  await db.cantinaProduct.delete({ where: { id } });
  revalidate();
  redirect("/admin/cantina/productos");
}
