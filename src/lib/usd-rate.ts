import { db } from "@/lib/db";

// Dólar "cripto" (USDT) — misma referencia que comprar USDT en Binance y
// transferirlo al proveedor, que es como se pagan los perfumes.
const DOLARAPI_URL = "https://dolarapi.com/v1/dolares/cripto";
const RATE_SOURCE = "cripto";

// Se considera "vieja" después de 20hs (no 24) para tener margen y que el
// chequeo periódico (cada 6hs) siempre la agarre dentro del mismo día.
const STALE_MS = 20 * 60 * 60 * 1000;

export type UsdRateInfo = { rate: number; source: string; updatedAt: Date | null };

export function roundToStep(value: number, step: number): number {
  return Math.round(value / step) * step;
}

async function fetchCryptoRate(): Promise<number | null> {
  try {
    const res = await fetch(DOLARAPI_URL, { signal: AbortSignal.timeout(8000), cache: "no-store" });
    if (!res.ok) return null;
    const data = await res.json();
    const venta = Number(data?.venta);
    return Number.isFinite(venta) && venta > 0 ? venta : null;
  } catch (err) {
    console.error("[usd-rate] error consultando dolarapi:", err);
    return null;
  }
}

/** Recalcula price/salePrice (ARS) de todos los productos cargados en USD. */
export async function refreshUsdPricedProducts(rate: number) {
  const products = await db.product.findMany({
    where: { priceCurrency: "USD" },
    select: { id: true, priceUsd: true, salePriceUsd: true },
  });
  for (const p of products) {
    if (p.priceUsd == null || p.priceUsd <= 0) continue;
    const price = roundToStep(p.priceUsd * rate, 100);
    const salePrice =
      p.salePriceUsd != null && p.salePriceUsd > 0 ? roundToStep(p.salePriceUsd * rate, 100) : null;
    await db.product.update({ where: { id: p.id }, data: { price, salePrice } });
  }
}

async function readSettings() {
  return db.siteSettings.upsert({ where: { id: "default" }, update: {}, create: { id: "default" } });
}

async function storeFreshRate(rate: number) {
  const updated = await db.siteSettings.update({
    where: { id: "default" },
    data: { usdRate: rate, usdRateSource: RATE_SOURCE, usdRateUpdatedAt: new Date() },
  });
  await refreshUsdPricedProducts(rate);
  return updated;
}

/**
 * Devuelve la cotización guardada. Si tiene más de ~20hs, la actualiza sola
 * (y recalcula los precios en pesos de los productos en USD) antes de
 * devolverla. Llamado desde las acciones de producto y desde el chequeo
 * periódico en instrumentation.ts — así se mantiene al día sin cron externo.
 */
export async function getUsdRate(): Promise<UsdRateInfo> {
  const settings = await readSettings();
  const stale = !settings.usdRateUpdatedAt || Date.now() - settings.usdRateUpdatedAt.getTime() > STALE_MS;
  if (!stale) {
    return { rate: settings.usdRate, source: settings.usdRateSource, updatedAt: settings.usdRateUpdatedAt };
  }

  const fresh = await fetchCryptoRate();
  if (fresh == null) {
    // No se pudo actualizar (sin internet / API caída): seguimos con lo último guardado.
    return { rate: settings.usdRate, source: settings.usdRateSource, updatedAt: settings.usdRateUpdatedAt };
  }

  const updated = await storeFreshRate(fresh);
  return { rate: updated.usdRate, source: updated.usdRateSource, updatedAt: updated.usdRateUpdatedAt };
}

/** Fuerza una actualización ahora mismo, ignorando el chequeo de antigüedad. */
export async function forceRefreshUsdRate(): Promise<UsdRateInfo> {
  const fresh = await fetchCryptoRate();
  if (fresh == null) {
    const settings = await readSettings();
    return { rate: settings.usdRate, source: settings.usdRateSource, updatedAt: settings.usdRateUpdatedAt };
  }
  const updated = await storeFreshRate(fresh);
  return { rate: updated.usdRate, source: updated.usdRateSource, updatedAt: updated.usdRateUpdatedAt };
}
