"use server";

import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import { requireAdmin } from "@/lib/auth";

export type CantinaSupplierFormState = { ok?: boolean; error?: string };

function revalidate() {
  revalidatePath("/admin/cantina/proveedores");
  revalidatePath("/admin/cantina/productos");
  revalidatePath("/admin/cantina");
}

export async function createCantinaSupplierAction(
  _prev: CantinaSupplierFormState,
  formData: FormData
): Promise<CantinaSupplierFormState> {
  await requireAdmin();
  const name = String(formData.get("name") ?? "").trim();
  if (!name) return { error: "Poné un nombre para el proveedor." };

  await db.cantinaSupplier.create({
    data: {
      name,
      contact: String(formData.get("contact") ?? "").trim(),
      notes: String(formData.get("notes") ?? "").trim(),
    },
  });
  revalidate();
  return { ok: true };
}

export async function updateCantinaSupplierAction(
  id: string,
  _prev: CantinaSupplierFormState,
  formData: FormData
): Promise<CantinaSupplierFormState> {
  await requireAdmin();
  const name = String(formData.get("name") ?? "").trim();
  if (!name) return { error: "El nombre no puede quedar vacío." };

  await db.cantinaSupplier.update({
    where: { id },
    data: {
      name,
      contact: String(formData.get("contact") ?? "").trim(),
      notes: String(formData.get("notes") ?? "").trim(),
    },
  });
  revalidate();
  return { ok: true };
}

export async function deleteCantinaSupplierAction(id: string) {
  await requireAdmin();
  // Productos e ingredientes de este proveedor quedan sin proveedor asignado.
  await db.$transaction([
    db.cantinaProduct.updateMany({ where: { supplierId: id }, data: { supplierId: null } }),
    db.cantinaIngredient.updateMany({ where: { supplierId: id }, data: { supplierId: null } }),
    db.cantinaSupplier.delete({ where: { id } }),
  ]);
  revalidate();
}
