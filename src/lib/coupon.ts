import { db } from "@/lib/db";

export type CouponResult = { code: string; discountPercent: number };

export async function evaluateCoupon(code: string): Promise<CouponResult | null> {
  const input = code.trim().toLowerCase();
  if (!input) return null;

  const coupons = await db.coupon.findMany({ where: { enabled: true } });
  const match = coupons.find((c) => c.code.trim().toLowerCase() === input);
  if (!match || match.discountPercent <= 0) return null;
  if (match.expiresAt && match.expiresAt.getTime() <= Date.now()) return null;

  return { code: match.code, discountPercent: match.discountPercent };
}
