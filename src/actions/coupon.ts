"use server";

import { evaluateCoupon } from "@/lib/coupon";
import { rateLimit, getClientIp } from "@/lib/rate-limit";

export type CouponCheck =
  | { ok: true; code: string; discountPercent: number }
  | { ok: false; error: string };

export async function validateCouponAction(code: string): Promise<CouponCheck> {
  // Anti-enumeración: máx 15 intentos por minuto por IP.
  const ip = await getClientIp();
  const rl = rateLimit(`coupon:${ip}`, 15, 60 * 1000);
  if (!rl.ok) {
    return { ok: false, error: "Demasiados intentos. Esperá un momento." };
  }

  const result = await evaluateCoupon(code);
  if (!result) {
    return { ok: false, error: "Cupón inválido o vencido." };
  }
  return { ok: true, code: result.code, discountPercent: result.discountPercent };
}
