"use server";

import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import { requireAdmin } from "@/lib/auth";

export type CantinaCategoryFormState = { ok?: boolean; error?: string };

function revalidate() {
  revalidatePath("/admin/cantina/productos");
  revalidatePath("/admin/cantina/vender");
  revalidatePath("/admin/cantina");
}

export async function createCantinaCategoryAction(
  _prev: CantinaCategoryFormState,
  formData: FormData
): Promise<CantinaCategoryFormState> {
  await requireAdmin();
  const name = String(formData.get("name") ?? "").trim();
  if (!name) return { error: "Poné un nombre (ej: Gaseosas)." };

  const exists = await db.cantinaCategory.findUnique({ where: { name } });
  if (exists) return { error: "Ya existe una categoría con ese nombre." };

  await db.cantinaCategory.create({ data: { name } });
  revalidate();
  return { ok: true };
}

export async function deleteCantinaCategoryAction(id: string) {
  await requireAdmin();
  // Los productos de esta categoría quedan sin categoría (no se borran).
  await db.cantinaProduct.updateMany({ where: { categoryId: id }, data: { categoryId: null } });
  await db.cantinaCategory.delete({ where: { id } });
  revalidate();
}
