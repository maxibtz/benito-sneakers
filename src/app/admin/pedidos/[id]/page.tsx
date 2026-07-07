import { notFound } from "next/navigation";
import { getOrder } from "@/lib/dal";
import { deleteOrderAction, confirmPaymentReceivedAction } from "@/actions/orders";
import { refreshOrderPaymentAction, syncMpPaymentByOrder } from "@/actions/mercadopago";
import { OrderStatusButton } from "@/components/forms/OrderStatusButton";
import { TrackingForm } from "@/components/forms/TrackingForm";

function formatARS(value: number) {
  return new Intl.NumberFormat("es-AR", { style: "currency", currency: "ARS" }).format(value);
}

const STATUSES = ["NUEVO", "EN_PREPARACION", "ENVIADO", "ENTREGADO", "CANCELADO"] as const;
const STATUS_LABEL: Record<string, string> = {
  NUEVO: "Nuevo",
  EN_PREPARACION: "En preparación",
  ENVIADO: "Enviado",
  ENTREGADO: "Entregado",
  CANCELADO: "Cancelado",
};

const PAYMENT_STATUS_LABEL: Record<string, string> = {
  approved: "Aprobado",
  pending: "Pendiente",
  in_process: "En proceso",
  rejected: "Rechazado",
};

export default async function OrderDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  let order = await getOrder(id);
  if (!order) notFound();

  // Auto-sincronizamos el pago con Mercado Pago si todavía no está resuelto
  // (útil en localhost, donde el webhook no llega).
  if (order.paymentMethod === "MERCADOPAGO" && order.paymentStatus !== "approved") {
    const newStatus = await syncMpPaymentByOrder(order.id);
    if (newStatus && newStatus !== order.paymentStatus) {
      order = (await getOrder(id))!;
    }
  }

  return (
    <div className="flex max-w-3xl flex-col gap-6">
      <div>
        <h1 className="text-2xl font-bold text-[var(--color-navy)] dark:text-white">
          Pedido #{order.id.slice(-8)}
        </h1>
        <p className="text-sm text-gray-500 dark:text-gray-400">
          {order.createdAt.toLocaleString("es-AR")}
        </p>
      </div>

      <div className="grid gap-6 sm:grid-cols-2 rounded-xl bg-white p-6 shadow-sm dark:bg-[#151833] dark:shadow-none">
        <div>
          <h2 className="mb-2 font-semibold text-[var(--color-navy)] dark:text-white">
            Datos del cliente
          </h2>
          <p className="text-sm text-gray-700 dark:text-gray-300">{order.customerName}</p>
          <p className="text-sm text-gray-700 dark:text-gray-300">DNI: {order.dni}</p>
          <p className="text-sm text-gray-700 dark:text-gray-300">Tel: {order.phone}</p>
          <p className="text-sm text-gray-700 dark:text-gray-300">Email: {order.email}</p>
        </div>
        <div>
          <h2 className="mb-2 font-semibold text-[var(--color-navy)] dark:text-white">Envío</h2>
          <p className="text-sm text-gray-700 dark:text-gray-300">
            {order.street} {order.streetNumber}
            {order.floorApt ? `, ${order.floorApt}` : ""}
          </p>
          <p className="text-sm text-gray-700 dark:text-gray-300">
            {order.city}, {order.province} ({order.postalCode})
          </p>
        </div>
      </div>

      <div className="rounded-xl bg-white p-6 shadow-sm dark:bg-[#151833] dark:shadow-none">
        <h2 className="mb-4 font-semibold text-[var(--color-navy)] dark:text-white">Productos</h2>
        <ul className="flex flex-col divide-y divide-gray-100 dark:divide-gray-700">
          {order.items.map((item) => (
            <li
              key={item.id}
              className="flex items-center justify-between py-3 text-sm dark:text-gray-200"
            >
              <span>
                {item.product.brand} {item.product.model} — Talle {item.variant.size} x{item.quantity}
              </span>
              <span className="font-medium">{formatARS(item.unitPrice * item.quantity)}</span>
            </li>
          ))}
        </ul>
        <div className="mt-4 flex flex-col gap-1 border-t border-gray-100 pt-4 text-sm dark:border-gray-700">
          <div className="flex justify-between text-gray-500 dark:text-gray-400">
            <span>Subtotal</span>
            <span>{formatARS(order.total - order.shippingCost + order.discount)}</span>
          </div>
          {order.discount > 0 && (
            <div className="flex justify-between text-green-600 dark:text-green-400">
              <span>Cupón {order.couponCode}</span>
              <span>−{formatARS(order.discount)}</span>
            </div>
          )}
          <div className="flex justify-between text-gray-500 dark:text-gray-400">
            <span>{order.shippingMethod === "pickup" ? "Retiro en persona" : "Envío"}</span>
            <span>{order.shippingCost === 0 ? "Gratis" : formatARS(order.shippingCost)}</span>
          </div>
        </div>
        <div className="mt-4 flex justify-between border-t border-gray-100 pt-4 font-semibold text-[var(--color-navy)] dark:border-gray-700 dark:text-white">
          <span>Total</span>
          <span>{formatARS(order.total)}</span>
        </div>
        <div className="mt-2 flex flex-wrap items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
          <span>Método de pago: {order.paymentMethod.replaceAll("_", " ")}</span>
          {order.paymentMethod !== "MERCADOPAGO" &&
            (order.paymentStatus === "approved" ? (
              <span className="rounded-full bg-green-100 px-2.5 py-0.5 text-xs font-semibold text-green-700 dark:bg-green-500/20 dark:text-green-400">
                ✓ Pago confirmado
              </span>
            ) : (
              <>
                <span className="rounded-full bg-amber-100 px-2.5 py-0.5 text-xs font-semibold text-amber-700 dark:bg-amber-500/20 dark:text-amber-400">
                  Esperando pago
                </span>
                <form action={confirmPaymentReceivedAction.bind(null, order.id)}>
                  <button
                    type="submit"
                    className="rounded-full bg-green-600 px-3 py-0.5 text-xs font-semibold text-white hover:bg-green-700"
                  >
                    ✓ Confirmar pago recibido (avisa por email)
                  </button>
                </form>
              </>
            ))}
          {order.paymentMethod === "MERCADOPAGO" && (
            <span
              className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                order.paymentStatus === "approved"
                  ? "bg-green-100 text-green-700 dark:bg-green-500/20 dark:text-green-400"
                  : order.paymentStatus === "rejected"
                    ? "bg-red-100 text-red-700 dark:bg-red-500/20 dark:text-red-400"
                    : "bg-amber-100 text-amber-700 dark:bg-amber-500/20 dark:text-amber-400"
              }`}
            >
              MP: {PAYMENT_STATUS_LABEL[order.paymentStatus] ?? order.paymentStatus}
            </span>
          )}
          {order.paymentRef && (
            <span className="text-xs text-gray-400">pago #{order.paymentRef}</span>
          )}
          {order.paymentMethod === "MERCADOPAGO" && (
            <form action={refreshOrderPaymentAction.bind(null, order.id)}>
              <button
                type="submit"
                className="rounded-full border border-[var(--color-navy)] px-3 py-0.5 text-xs font-medium text-[var(--color-navy)] hover:bg-[var(--color-lilac-light)] dark:border-[var(--color-lilac)] dark:text-[var(--color-lilac-light)] dark:hover:bg-[var(--color-lilac)]/10"
              >
                ↻ Actualizar pago
              </button>
            </form>
          )}
        </div>
      </div>

      <div className="rounded-xl bg-white p-6 shadow-sm dark:bg-[#151833] dark:shadow-none">
        <h2 className="mb-4 font-semibold text-[var(--color-navy)] dark:text-white">
          Estado del pedido
        </h2>
        <div className="flex flex-wrap items-start gap-2">
          {STATUSES.map((status) => (
            <OrderStatusButton
              key={status}
              orderId={order.id}
              status={status}
              label={STATUS_LABEL[status]}
              isCurrent={order.status === status}
            />
          ))}
        </div>
        <p className="mt-3 text-xs text-gray-500 dark:text-gray-400">
          Al cancelar un pedido, el stock de los talles se devuelve automáticamente. Si lo
          reactivás (sacarlo de &quot;Cancelado&quot;), se vuelve a descontar — si ya no hay
          stock suficiente, no se va a permitir el cambio.
        </p>
      </div>

      <TrackingForm
        orderId={order.id}
        currentCode={order.trackingCode}
        sentAt={order.trackingSentAt}
      />

      <div className="rounded-xl border border-red-100 bg-red-50 p-6 dark:border-red-500/20 dark:bg-red-500/10">
        <h2 className="mb-2 font-semibold text-red-700 dark:text-red-400">Eliminar pedido</h2>
        <p className="mb-3 text-sm text-red-600 dark:text-red-300">
          Esto borra el pedido definitivamente. Si no estaba cancelado, el stock reservado se
          devuelve automáticamente antes de eliminarlo.
        </p>
        <form action={deleteOrderAction.bind(null, order.id)}>
          <button
            type="submit"
            className="rounded-md bg-red-600 px-4 py-2 text-sm font-semibold text-white hover:bg-red-700"
          >
            Eliminar pedido
          </button>
        </form>
      </div>
    </div>
  );
}
