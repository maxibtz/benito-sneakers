"use server";

import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import { requireAdmin } from "@/lib/auth";
import { getMpPreferenceClient, getMpPaymentClient, getAppUrl } from "@/lib/mercadopago";

export type MpPreferenceResult =
  | { ok: true; initPoint: string }
  | { ok: false; error: string };

/**
 * Crea una preferencia de Checkout Pro para un pedido ya creado y devuelve el
 * link de pago (init_point) al que redirigimos al cliente.
 */
export async function createMpPreferenceAction(orderId: string): Promise<MpPreferenceResult> {
  const preferenceClient = await getMpPreferenceClient();
  if (!preferenceClient) {
    return {
      ok: false,
      error:
        "Mercado Pago no está configurado todavía. Cargá las credenciales en el panel (Ajustes › Mercado Pago).",
    };
  }

  const order = await db.order.findUnique({
    where: { id: orderId },
    include: { items: { include: { product: true } } },
  });
  if (!order) return { ok: false, error: "Pedido no encontrado." };
  if (order.total <= 0) return { ok: false, error: "El total del pedido es inválido." };

  const appUrl = getAppUrl();
  const isHttps = appUrl.startsWith("https://");
  const description =
    order.items.length === 1
      ? `${order.items[0].product.brand} ${order.items[0].product.model}`
      : `${order.items.reduce((s, i) => s + i.quantity, 0)} artículos`;

  try {
    // Usamos un único ítem con el total del pedido para respetar exactamente el
    // descuento del cupón ya calculado en el servidor.
    const result = await preferenceClient.create({
      body: {
        items: [
          {
            id: order.id,
            title: `Benito Sneakers — ${description}`,
            quantity: 1,
            unit_price: Math.round(order.total),
            currency_id: "ARS",
          },
        ],
        payer: {
          name: order.customerName,
          email: order.email,
        },
        external_reference: order.id,
        back_urls: {
          success: `${appUrl}/pedido-confirmado/${order.id}`,
          failure: `${appUrl}/pedido-confirmado/${order.id}`,
          pending: `${appUrl}/pedido-confirmado/${order.id}`,
        },
        ...(isHttps ? { auto_return: "approved" as const } : {}),
        notification_url: `${appUrl}/api/mp/webhook`,
        statement_descriptor: "BENITO SNEAKERS",
      },
    });

    const initPoint = result.init_point ?? result.sandbox_init_point;
    if (!initPoint) {
      return { ok: false, error: "Mercado Pago no devolvió un link de pago. Revisá las credenciales." };
    }

    await db.order.update({
      where: { id: order.id },
      data: { preferenceId: result.id ?? null },
    });

    return { ok: true, initPoint };
  } catch (err) {
    console.error("[mercadopago] preference error:", err);
    return {
      ok: false,
      error:
        "No pudimos generar el pago de Mercado Pago. Verificá el Access Token en el panel e intentá de nuevo.",
    };
  }
}

/**
 * Busca el último pago asociado a un pedido (por external_reference) y actualiza
 * su estado. Sirve para sincronizar sin webhook (por ej. corriendo en localhost).
 * Devuelve el estado normalizado o null si no encontró pagos.
 */
export async function syncMpPaymentByOrder(orderId: string): Promise<string | null> {
  const paymentClient = await getMpPaymentClient();
  if (!paymentClient) return null;

  try {
    const search = await paymentClient.search({
      options: { external_reference: orderId, sort: "date_created", criteria: "desc" },
    });
    const results = search.results ?? [];
    if (results.length === 0) return null;

    // Priorizamos un pago aprobado; si no, tomamos el más reciente.
    const approved = results.find((p) => p.status === "approved");
    const chosen = approved ?? results[0];
    const status = chosen.status;
    if (!status) return null;

    await db.order.update({
      where: { id: orderId },
      data: { paymentStatus: status, paymentRef: chosen.id ? String(chosen.id) : null },
    });
    return status;
  } catch (err) {
    console.error("[mercadopago] payment search error:", err);
    return null;
  }
}

/**
 * Server action para el botón del panel: refresca el estado de pago de un pedido.
 */
export async function refreshOrderPaymentAction(orderId: string) {
  await requireAdmin();
  await syncMpPaymentByOrder(orderId);
  revalidatePath(`/admin/pedidos/${orderId}`);
}

/**
 * Consulta un pago en Mercado Pago y actualiza el estado del pedido asociado.
 * Devuelve el estado normalizado o null si no se pudo resolver.
 */
export async function syncMpPayment(paymentId: string): Promise<string | null> {
  const paymentClient = await getMpPaymentClient();
  if (!paymentClient) return null;

  try {
    const payment = await paymentClient.get({ id: paymentId });
    const orderId = payment.external_reference;
    const status = payment.status; // approved | pending | in_process | rejected | ...
    if (!orderId || !status) return null;

    await db.order.update({
      where: { id: orderId },
      data: { paymentStatus: status, paymentRef: String(payment.id) },
    });
    return status;
  } catch (err) {
    console.error("[mercadopago] payment sync error:", err);
    return null;
  }
}
