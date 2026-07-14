"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { requireAdmin } from "@/lib/auth";

export type CantinaProductFormState = { error?: string };

function revalidate() {
  revalidatePath("/admin/cantina");
  revalidatePath("/admin/cantina/productos");
  revalidatePath("/admin/cantina/vender");
}

function parseProductFields(formData: FormData) {
  const name = String(formData.get("name") ?? "").trim();
  const categoryId = String(formData.get("categoryId") ?? "").trim() || null;
  const supplierId = String(formData.get("supplierId") ?? "").trim() || null;
  const cost = Math.max(0, Number(formData.get("cost")) || 0);
  const price = Math.max(0, Number(formData.get("price")) || 0);
  const stock = Math.max(0, Math.floor(Number(formData.get("stock"))) || 0);
  const minStock = Math.max(0, Math.floor(Number(formData.get("minStock"))) || 0);
  const unit = String(formData.get("unit") ?? "unidad").trim() || "unidad";
  const active = formData.get("active") === "on";
  return { name, categoryId, supplierId, cost, price, stock, minStock, unit, active };
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
