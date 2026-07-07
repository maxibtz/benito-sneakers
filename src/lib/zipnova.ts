/**
 * Integración con la API de Zipnova (ex Zippin) para cotizar envíos por CP.
 * Doc oficial: https://docs.zipnova.com/envios
 *  - Base URL AR:   https://api.zipnova.com.ar/v2/
 *  - Auth (Basic):  Authorization: Basic base64(API_TOKEN:API_SECRET)
 *  - Cotización:    POST /v2/shipments/quote
 *
 * Variables de entorno (ver .env.example):
 *   ZIPNOVA_API_TOKEN      token de la integración
 *   ZIPNOVA_API_SECRET     secret de la integración
 *   ZIPNOVA_ACCOUNT_ID     id de cuenta (entero)
 *   ZIPNOVA_ORIGIN_ID      id de la dirección de origen cargada en Zipnova (entero)
 *   ZIPNOVA_BASE_URL       opcional, por defecto https://api.zipnova.com.ar/v2
 *   ZIPNOVA_PACKAGE_WEIGHT_G  opcional, peso por par en gramos (default 1500)
 *   ZIPNOVA_PACKAGE_L/W/H_CM  opcional, dimensiones de la caja en cm (default 35/25/13)
 */

export type ZipnovaOption = {
  code: string; // service_type.code — se usa para re-cotizar en el servidor
  name: string; // ej: "Estándar a domicilio"
  carrier: string;
  price: number; // lo que paga el cliente (con impuestos)
  deliveryEstimate: string | null; // ISO date del arribo estimado
  cheapest: boolean;
};

export type ZipnovaQuoteResult =
  | { ok: true; options: ZipnovaOption[] }
  | { ok: false; error: string; configured: boolean };

const DEFAULT_BASE = "https://api.zipnova.com.ar/v2";

export function isZipnovaConfigured(): boolean {
  return Boolean(
    process.env.ZIPNOVA_API_TOKEN &&
      process.env.ZIPNOVA_API_SECRET &&
      process.env.ZIPNOVA_ACCOUNT_ID &&
      process.env.ZIPNOVA_ORIGIN_ID
  );
}

/** Normaliza y valida un código postal argentino (4 dígitos, con CPA opcional). */
export function normalizeZip(raw: string): string | null {
  const z = String(raw ?? "").trim().toUpperCase().replace(/\s+/g, "");
  if (/^[A-Z]?\d{4}[A-Z]{0,3}$/.test(z)) return z;
  return null;
}

function authHeader(): string {
  const token = process.env.ZIPNOVA_API_TOKEN ?? "";
  const secret = process.env.ZIPNOVA_API_SECRET ?? "";
  return "Basic " + Buffer.from(`${token}:${secret}`).toString("base64");
}

function packageItem(quantity: number) {
  const weight = Number(process.env.ZIPNOVA_PACKAGE_WEIGHT_G) || 1500;
  const height = Number(process.env.ZIPNOVA_PACKAGE_H_CM) || 13;
  const width = Number(process.env.ZIPNOVA_PACKAGE_W_CM) || 25;
  const length = Number(process.env.ZIPNOVA_PACKAGE_L_CM) || 35;
  // Un ítem por par; Zipnova arma el packaging (type_packaging: "dynamic").
  return Array.from({ length: Math.max(1, Math.min(quantity, 50)) }, () => ({
    weight,
    height,
    width,
    length,
    description: "Par de zapatillas",
  }));
}

/**
 * Cotiza el envío a un CP. NUNCA lanza: ante cualquier problema devuelve
 * { ok:false }, así el checkout puede caer a la tabla por provincia.
 */
export async function quoteZipnova(params: {
  zipcode: string;
  quantity: number;
  declaredValue: number;
}): Promise<ZipnovaQuoteResult> {
  if (!isZipnovaConfigured()) {
    return { ok: false, error: "Zipnova no está configurado.", configured: false };
  }

  const zip = normalizeZip(params.zipcode);
  if (!zip) {
    return { ok: false, error: "El código postal no es válido.", configured: true };
  }

  const base = (process.env.ZIPNOVA_BASE_URL ?? DEFAULT_BASE).replace(/\/$/, "");
  const body = {
    account_id: Number(process.env.ZIPNOVA_ACCOUNT_ID),
    origin_id: Number(process.env.ZIPNOVA_ORIGIN_ID),
    declared_value: Math.max(0, Math.round(params.declaredValue) || 0),
    destination: { zipcode: zip },
    items: packageItem(params.quantity),
    type_packaging: "dynamic",
    sort_by: "price",
  };

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 8000);
  try {
    const res = await fetch(`${base}/shipments/quote`, {
      method: "POST",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
        Authorization: authHeader(),
      },
      body: JSON.stringify(body),
      signal: controller.signal,
    });

    if (!res.ok) {
      return {
        ok: false,
        error: `Zipnova respondió ${res.status}. Probá de nuevo o usá el envío estándar.`,
        configured: true,
      };
    }

    const data = (await res.json()) as {
      results?: Record<string, RawResult>;
    };
    const results = data.results ?? {};
    const options: ZipnovaOption[] = Object.values(results)
      .filter((r) => r && r.selectable !== false)
      .map((r) => ({
        code: r.service_type?.code ?? "",
        name: r.service_type?.name ?? "Envío",
        carrier: r.carrier?.name ?? "",
        price: Number(r.amounts?.price_incl_tax ?? r.amounts?.price ?? 0),
        deliveryEstimate: r.delivery_time?.estimated_delivery ?? null,
        cheapest: Array.isArray(r.tags) && r.tags.includes("cheapest"),
      }))
      .filter((o) => o.code && o.price > 0)
      .sort((a, b) => a.price - b.price);

    if (options.length === 0) {
      return {
        ok: false,
        error: "No hay envíos disponibles para ese código postal.",
        configured: true,
      };
    }
    return { ok: true, options };
  } catch (err) {
    const aborted = err instanceof Error && err.name === "AbortError";
    return {
      ok: false,
      error: aborted
        ? "La cotización tardó demasiado. Probá de nuevo."
        : "No pudimos cotizar el envío en este momento.",
      configured: true,
    };
  } finally {
    clearTimeout(timeout);
  }
}

type RawResult = {
  selectable?: boolean;
  carrier?: { name?: string };
  service_type?: { code?: string; name?: string };
  delivery_time?: { estimated_delivery?: string };
  amounts?: { price_incl_tax?: number; price?: number };
  tags?: string[];
};
