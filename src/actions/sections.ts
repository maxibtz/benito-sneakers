"use server";

import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import { requireAdmin } from "@/lib/auth";

export type SectionFormState = { ok?: boolean; error?: string };

function revalidate() {
  revalidatePath("/admin/secciones");
  revalidatePath("/admin/productos");
  revalidatePath("/", "layout");
}

export async function createSectionAction(
  _prev: SectionFormState,
  formData: FormData
): Promise<SectionFormState> {
  await requireAdmin();
  const name = String(formData.get("name") ?? "").trim();
  if (!name) return { error: "Poné un nombre (ej: Gorras)." };

  const exists = await db.section.findUnique({ where: { name } });
  if (exists) return { error: "Ya existe una sección con ese nombre." };

  const count = await db.section.count();
  await db.section.create({ data: { name, order: count, active: true } });
  revalidate();
  return { ok: true };
}

export async function renameSectionAction(
  id: string,
  _prev: SectionFormState,
  formData: FormData
): Promise<SectionFormState> {
  await requireAdmin();
  const name = String(formData.get("name") ?? "").trim();
  if (!name) return { error: "El nombre no puede quedar vacío." };

  const other = await db.section.findUnique({ where: { name } });
  if (other && other.id !== id) return { error: "Ya hay otra sección con ese nombre." };

  // Mantenemos product.category en sintonía con el nombre de la sección.
  await db.$transaction([
    db.section.update({ where: { id }, data: { name } }),
    db.product.updateMany({ where: { sectionId: id }, data: { category: name } }),
  ]);
  revalidate();
  return { ok: true };
}

export async function toggleSectionAction(id: string, active: boolean) {
  await requireAdmin();
  await db.section.update({ where: { id }, data: { active } });
  revalidate();
}

export async function moveSectionAction(id: string, dir: number) {
  await requireAdmin();
  const sections = await db.section.findMany({ orderBy: { order: "asc" } });
  const idx = sections.findIndex((s) => s.id === id);
  const swap = idx + dir;
  if (idx < 0 || swap < 0 || swap >= sections.length) return;
  await db.$transaction([
    db.section.update({ where: { id: sections[idx].id }, data: { order: swap } }),
    db.section.update({ where: { id: sections[swap].id }, data: { order: idx } }),
  ]);
  revalidate();
}

export async function deleteSectionAction(id: string) {
  await requireAdmin();
  // Los productos de esta sección quedan sin sección (sectionId = null).
  await db.product.updateMany({ where: { sectionId: id }, data: { sectionId: null } });
  await db.section.delete({ where: { id } });
  revalidate();
}
