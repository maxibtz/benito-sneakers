import crypto from "crypto";
import { NextResponse } from "next/server";
import { syncMpPayment } from "@/actions/mercadopago";

/**
 * Valida la firma x-signature de Mercado Pago (si hay clave configurada).
 * Formato MP: header `x-signature: ts=...,v1=...` donde v1 es un HMAC-SHA256
 * del manifiesto `id:{data.id};request-id:{x-request-id};ts:{ts};`.
 * Si MP_WEBHOOK_SECRET no está configurada, no se exige (compatibilidad).
 */
function isValidSignature(request: Request, dataId: string | undefined): boolean {
  const secret = process.env.MP_WEBHOOK_SECRET;
  if (!secret) return true; // sin clave configurada, no exigimos firma

  const signature = request.headers.get("x-signature");
  const requestId = request.headers.get("x-request-id");
  if (!signature || !dataId) return false;

  const parts = Object.fromEntries(
    signature.split(",").map((p) => p.trim().split("=", 2) as [string, string])
  );
  const ts = parts["ts"];
  const v1 = parts["v1"];
  if (!ts || !v1) return false;

  const manifest = `id:${dataId.toLowerCase()};request-id:${requestId ?? ""};ts:${ts};`;
  const expected = crypto.createHmac("sha256", secret).update(manifest).digest("hex");
  try {
    return crypto.timingSafeEqual(Buffer.from(expected), Buffer.from(v1));
  } catch {
    return false;
  }
}

/**
 * Webhook de Mercado Pago. MP notifica los cambios de estado de un pago.
 * Acepta los formatos `?type=payment&data.id=...` y `?topic=payment&id=...`,
 * y también el body JSON `{ type, data: { id } }`.
 */
export async function POST(request: Request) {
  try {
    const url = new URL(request.url);
    const type = url.searchParams.get("type") ?? url.searchParams.get("topic");
    let paymentId =
      url.searchParams.get("data.id") ?? url.searchParams.get("id") ?? undefined;

    if (!paymentId) {
      const body = await request.json().catch(() => null);
      if (body?.data?.id) paymentId = String(body.data.id);
    }

    if (!isValidSignature(request, paymentId)) {
      return NextResponse.json({ error: "invalid signature" }, { status: 401 });
    }

    const isPayment = !type || type === "payment";
    if (isPayment && paymentId) {
      await syncMpPayment(paymentId);
    }

    // MP espera un 200 rápido para no reintentar.
    return NextResponse.json({ received: true });
  } catch (err) {
    console.error("[mercadopago] webhook error:", err);
    return NextResponse.json({ received: true });
  }
}

export async function GET() {
  return NextResponse.json({ ok: true });
}
