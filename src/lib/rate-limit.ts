import { headers } from "next/headers";

type Bucket = { count: number; resetAt: number };
const buckets = new Map<string, Bucket>();

/**
 * Rate limiter simple en memoria (ventana fija). Suficiente para una tienda de
 * una sola instancia. Para producción multi-instancia conviene Redis/Upstash.
 */
export function rateLimit(
  key: string,
  max: number,
  windowMs: number
): { ok: boolean; retryAfterSec: number } {
  const now = Date.now();

  // Limpieza ocasional para que el Map no crezca infinito.
  if (buckets.size > 5000) {
    for (const [k, b] of buckets) if (b.resetAt < now) buckets.delete(k);
  }

  const b = buckets.get(key);
  if (!b || b.resetAt < now) {
    buckets.set(key, { count: 1, resetAt: now + windowMs });
    return { ok: true, retryAfterSec: 0 };
  }
  if (b.count >= max) {
    return { ok: false, retryAfterSec: Math.ceil((b.resetAt - now) / 1000) };
  }
  b.count++;
  return { ok: true, retryAfterSec: 0 };
}

/** IP del cliente (best-effort). En localhost suele ser "local". */
export async function getClientIp(): Promise<string> {
  const h = await headers();
  const xff = h.get("x-forwarded-for");
  if (xff) return xff.split(",")[0].trim();
  return h.get("x-real-ip") ?? "local";
}

/** Texto amigable para el tiempo de espera. */
export function waitText(sec: number): string {
  if (sec >= 60) return `${Math.ceil(sec / 60)} minuto(s)`;
  return `${sec} segundo(s)`;
}
