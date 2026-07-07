import { NextResponse } from "next/server";
import { quoteZipnova, isZipnovaConfigured } from "@/lib/zipnova";
import { rateLimit, getClientIp } from "@/lib/rate-limit";

/**
 * Cotiza el envío por código postal con Zipnova.
 * Body: { zipcode: string, quantity?: number, declaredValue?: number }
 * Respuesta:
 *   { ok:true, options:[...] }
 *   { ok:false, configured:false }  -> el checkout usa la tabla por provincia
 *   { ok:false, error:"..." }       -> CP inválido / API caída / timeout
 * NUNCA rompe: siempre responde JSON.
 */
export async function POST(request: Request) {
  try {
    // Anti-abuso de la API paga: 20 cotizaciones por minuto por IP.
    const ip = await getClientIp();
    const rl = rateLimit(`envio:${ip}`, 20, 60 * 1000);
    if (!rl.ok) {
      return NextResponse.json(
        { ok: false, error: "Demasiadas consultas seguidas. Esperá un momento." },
        { status: 429 }
      );
    }

    if (!isZipnovaConfigured()) {
      // No configurado: el cliente cae al envío por tabla de provincia.
      return NextResponse.json({ ok: false, configured: false });
    }

    const body = await request.json().catch(() => null);
    const zipcode = String(body?.zipcode ?? "").trim();
    const quantity = Math.max(1, Math.floor(Number(body?.quantity)) || 1);
    const declaredValue = Math.max(0, Number(body?.declaredValue) || 0);

    if (!zipcode) {
      return NextResponse.json(
        { ok: false, error: "Ingresá tu código postal.", configured: true },
        { status: 400 }
      );
    }

    const result = await quoteZipnova({ zipcode, quantity, declaredValue });
    if (!result.ok) {
      // 400 para CP inválido; 502 si es un problema del proveedor.
      const status = result.error.includes("código postal") ? 400 : 502;
      return NextResponse.json(result, { status });
    }
    return NextResponse.json(result);
  } catch {
    return NextResponse.json(
      { ok: false, error: "No pudimos cotizar el envío.", configured: true },
      { status: 500 }
    );
  }
}
