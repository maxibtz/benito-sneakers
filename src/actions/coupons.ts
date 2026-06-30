"use server";

import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import { requireAdmin } from "@/lib/auth";

export type CouponFormState = { ok?: boolean; error?: string };

function normalizeCode(raw: string): string {
  return raw.trim().toUpperCase().replace(/\s+/g, "");
}

export async function createCouponAction(
  _prev: CouponFormState,
  formData: FormData
): Promise<CouponFormState> {
  await requireAdmin();
  const code = normalizeCode(String(formData.get("code") ?? ""));
  const discountPercent = Math.round(Number(formData.get("discountPercent")));
  const endsAtRaw = String(formData.get("expiresAt") ?? "").trim();

  if (!code) return { error: "Poné un código (ej: BIENVENIDO15)." };
  if (!Number.isFinite(discountPercent) || discountPercent <= 0 || discountPercent > 100) {
    return { error: "El descuento tiene que ser un número entre 1 y 100." };
  }

  const exists = await db.coupon.findUnique({ where: { code } });
  if (exists) return { error: "Ya existe un cupón con ese código." };

  let expiresAt: Date | null = null;
  if (endsAtRaw) {
    const d = new Date(endsAtRaw);
    if (!Number.isNaN(d.getTime())) expiresAt = d;
  }

  await db.coupon.create({ data: { code, discountPercent, expiresAt, enabled: true } });
  revalidatePath("/admin/cupones");
  return { ok: true };
}

export async function updateCouponAction(
  id: string,
  _prev: CouponFormState,
  formData: FormData
): Promise<CouponFormState> {
  await requireAdmin();
  const discountPercent = Math.round(Number(formData.get("discountPercent")));
  const endsAtRaw = String(formData.get("expiresAt") ?? "").trim();

  if (!Number.isFinite(discountPercent) || discountPercent <= 0 || discountPercent > 100) {
    return { error: "El descuento tiene que ser un número entre 1 y 100." };
  }

  let expiresAt: Date | null = null;
  if (endsAtRaw) {
    const d = new Date(endsAtRaw);
    if (!Number.isNaN(d.getTime())) expiresAt = d;
  }

  await db.coupon.update({ where: { id }, data: { discountPercent, expiresAt } });
  revalidatePath("/admin/cupones");
  return { ok: true };
}

export async function toggleCouponAction(id: string, enabled: boolean) {
  await requireAdmin();
  await db.coupon.update({ where: { id }, data: { enabled } });
  revalidatePath("/admin/cupones");
}

export async function deleteCouponAction(id: string) {
  await requireAdmin();
  await db.coupon.delete({ where: { id } });
  revalidatePath("/admin/cupones");
}
