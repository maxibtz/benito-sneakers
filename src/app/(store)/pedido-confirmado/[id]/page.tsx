import Link from "next/link";
import { notFound } from "next/navigation";
import { getOrder, getSiteSettings } from "@/lib/dal";
import { OrderTracker } from "@/components/OrderTracker";
import { syncMpPayment } from "@/actions/mercadopago";
import { waLink } from "@/lib/whatsapp";

function formatARS(value: number) {
  return new Intl.NumberFormat("es-AR", { style: "currency", currency: "ARS" }).format(value);
}

const PAYMENT_BANNER: Record<
  string,
  { text: string; className: string }
> = {
  approved: {
    text: "✓ Pago aprobado por Mercado Pago. ¡Ya estamos preparando tu pedido!",
    className: "border-green-500/40 bg-green-500/10 text-green-300",
  },
  in_process: {
    text: "⏳ Mercado Pago está procesando tu pago. Te avisamos en cuanto se acredite.",
    className: "border-amber-500/40 bg-amber-500/10 text-amber-300",
  },
  pending: {
    text: "⏳ Pago pendiente. Si elegiste efectivo (Pago Fácil/Rapipago), completá el pago para confirmarlo.",
    className: "border-amber-500/40 bg-amber-500/10 text-amber-300",
  },
  rejected: {
    text: "✕ El pago fue rechazado. Podés reintentar el pago o elegir otro método; tu pedido quedó guardado.",
    className: "border-red-500/40 bg-red-500/10 text-red-300",
  },
};

export default async function OrderConfirmedPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const { id } = await params;
  const sp = await searchParams;

  // Si volvemos desde Mercado Pago, sincronizamos el estado del pago.
  const paymentId = (sp.payment_id ?? sp.collection_id) as string | undefined;
  if (paymentId) {
    await syncMpPayment(paymentId);
  }

  const order = await getOrder(id);
  if (!order) notFound();

  const settings = await getSiteSettings();
  const banner =
    order.paymentMethod === "MERCADOPAGO" ? PAYMENT_BANNER[order.paymentStatus] : null;

  const trackingWaLink = waLink(
    settings.whatsapp,
    `¡Hola! Soy ${order.customerName}. Mi pedido #${order.id.slice(-8)} ya está pagado. ` +
      `¿Me pasás el código de seguimiento del envío? 📦`
  );

  // Transferencia: alias + total + comprobante por WhatsApp.
  const isTransferPending =
    order.paymentMethod === "TRANSFERENCIA" && order.paymentStatus !== "approved";
  const transferWaLink = waLink(
    settings.whatsapp,
    `¡Hola! Soy ${order.customerName} 👋 Acabo de transferir ${formatARS(order.total)} ` +
      `por mi pedido #${order.id.slice(-8)}. Te adjunto el comprobante 🧾`
  );

  return (
    <div className="mx-auto flex max-w-2xl flex-col gap-6 px-5 py-12 sm:px-8">
      <div className="text-center">
        <h1 className="font-display text-3xl font-medium tracking-tight text-white">
          ¡Gracias por tu compra, {order.customerName}!
        </h1>
        <p className="mt-3 text-sm text-[var(--color-store-muted)]">
          Pedido <strong className="text-white">#{order.id.slice(-8)}</strong> — te contactamos al{" "}
          {order.phone} para coordinar pago y envío. Guardá este link para seguir tu pedido en
          cualquier momento.
        </p>
      </div>

      {banner && (
        <div className={`rounded-2xl border px-5 py-4 text-sm ${banner.className}`}>
          {banner.text}
        </div>
      )}

      {/* Transferencia: el paso a paso para cerrar el pago */}
      {isTransferPending && (
        <div className="rounded-2xl border border-[var(--color-lilac-vivid)]/40 bg-[var(--color-lilac-vivid)]/10 p-6">
          <h2 className="mb-4 text-center font-medium text-white">
            Último paso: transferí y mandanos el comprobante 👇
          </h2>
          <ol className="flex flex-col gap-3 text-sm text-white/90">
            <li className="flex items-start gap-3">
              <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-[var(--color-lilac-vivid)] text-xs font-bold text-white">1</span>
              <span>
                Transferí <strong className="text-white">{formatARS(order.total)}</strong> al
                alias:
              </span>
            </li>
          </ol>
          {settings.transferAlias && (
            <p className="my-3 rounded-xl border border-white/15 bg-black/20 py-3 text-center font-mono text-xl font-bold tracking-wide text-white">
              {settings.transferAlias}
            </p>
          )}
          <ol className="flex flex-col gap-3 text-sm text-white/90">
            <li className="flex items-start gap-3">
              <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-[var(--color-lilac-vivid)] text-xs font-bold text-white">2</span>
              <span>Sacale captura al comprobante.</span>
            </li>
            <li className="flex items-start gap-3">
              <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-[var(--color-lilac-vivid)] text-xs font-bold text-white">3</span>
              <span>Mandánoslo por WhatsApp tocando el botón (el mensaje ya va escrito):</span>
            </li>
          </ol>
          {transferWaLink && (
            <a
              href={transferWaLink}
              target="_blank"
              rel="noopener noreferrer"
              className="btn-press mt-4 flex items-center justify-center gap-2 rounded-full bg-[#25D366] px-6 py-3.5 text-sm font-semibold text-white transition hover:brightness-95"
            >
              ✅ Ya transferí — enviar comprobante
            </a>
          )}
          <p className="mt-3 text-center text-xs text-[var(--color-store-muted)]">
            Tu pedido queda reservado. Apenas confirmemos el pago te llega un email y preparamos
            el envío.
          </p>
        </div>
      )}

      <OrderTracker orderId={order.id} initialStatus={order.status} />

      {trackingWaLink && (
        <div className="flex flex-col items-center gap-3 rounded-2xl border border-[#25D366]/30 bg-[#25D366]/10 p-6 text-center">
          <p className="text-sm text-white/90">
            Cuando despachemos tu pedido vas a tener un <strong>código de seguimiento</strong> del
            correo. Pedinoslo por WhatsApp y te lo pasamos.
          </p>
          <a
            href={trackingWaLink}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 rounded-full bg-[#25D366] px-6 py-3 text-sm font-semibold text-white transition hover:brightness-95 active:scale-[0.98]"
          >
            <svg viewBox="0 0 24 24" fill="currentColor" className="h-5 w-5" aria-hidden="true">
              <path d="M.057 24l1.687-6.163a11.867 11.867 0 01-1.587-5.945C.16 5.335 5.495 0 12.05 0a11.817 11.817 0 018.413 3.488 11.824 11.824 0 013.48 8.414c-.003 6.557-5.338 11.892-11.893 11.892a11.9 11.9 0 01-5.688-1.448L.057 24zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884a9.86 9.86 0 001.51 5.26l-.999 3.648 3.477-.711zm11.387-5.464c-.074-.124-.272-.198-.57-.347-.297-.149-1.758-.868-2.031-.967-.272-.099-.47-.149-.669.149-.198.297-.768.967-.941 1.165-.173.198-.347.223-.644.074-.297-.149-1.255-.462-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.521.151-.172.2-.296.3-.495.099-.198.05-.372-.025-.521-.075-.148-.669-1.611-.916-2.206-.242-.579-.487-.501-.669-.51l-.57-.01c-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.71.306 1.263.489 1.694.626.712.226 1.36.194 1.872.118.571-.085 1.758-.719 2.006-1.413.247-.694.247-1.289.173-1.413z" />
            </svg>
            Pedir código de seguimiento
          </a>
        </div>
      )}

      <div className="rounded-2xl border border-white/10 bg-[var(--color-store-surface)] p-6">
        <h2 className="mb-4 font-medium text-white">Tu pedido</h2>
        <ul className="flex flex-col divide-y divide-white/10">
          {order.items.map((item) => (
            <li
              key={item.id}
              className="flex items-center justify-between py-3 text-sm text-white/85"
            >
              <span>
                {item.product.brand} {item.product.model} — Talle {item.variant.size} x
                {item.quantity}
              </span>
              <span className="font-medium">{formatARS(item.unitPrice * item.quantity)}</span>
            </li>
          ))}
        </ul>
        <div className="mt-4 flex flex-col gap-1 border-t border-white/10 pt-4 text-sm">
          <div className="flex justify-between text-[var(--color-store-muted)]">
            <span>Subtotal</span>
            <span>{formatARS(order.total - order.shippingCost + order.discount)}</span>
          </div>
          {order.discount > 0 && (
            <div className="flex justify-between text-green-400">
              <span>Cupón {order.couponCode}</span>
              <span>−{formatARS(order.discount)}</span>
            </div>
          )}
          <div className="flex justify-between text-[var(--color-store-muted)]">
            <span>{order.shippingMethod === "pickup" ? "Retiro en persona" : "Envío"}</span>
            <span>{order.shippingCost === 0 ? "Gratis" : formatARS(order.shippingCost)}</span>
          </div>
        </div>
        <div className="mt-4 flex justify-between border-t border-white/10 pt-4 font-medium text-white">
          <span>Total</span>
          <span>{formatARS(order.total)}</span>
        </div>
      </div>

      <div className="rounded-2xl border border-white/10 bg-[var(--color-store-surface)] p-6">
        <h2 className="mb-2 font-medium text-white">
          {order.shippingMethod === "pickup" ? "Retiro en persona" : "Envío a"}
        </h2>
        {order.shippingMethod === "pickup" ? (
          <p className="text-sm text-[var(--color-store-muted)]">
            Coordinamos el retiro con vos. Datos de contacto: {order.phone}.
          </p>
        ) : (
          <p className="text-sm text-[var(--color-store-muted)]">
            {order.street} {order.streetNumber}
            {order.floorApt ? `, ${order.floorApt}` : ""} — {order.city}, {order.province} (
            {order.postalCode})
          </p>
        )}
      </div>

      <Link
        href="/"
        className="mx-auto mt-2 rounded-full bg-white px-6 py-3 text-sm font-medium text-[var(--color-store-bg)] transition hover:bg-white/85"
      >
        Seguir comprando
      </Link>
    </div>
  );
}
