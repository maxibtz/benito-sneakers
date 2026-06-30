import { NextResponse } from "next/server";
import { syncMpPayment } from "@/actions/mercadopago";

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
      if (!type && body?.type) {
        // best effort: si el body trae el tipo
      }
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
