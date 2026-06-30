import Link from "next/link";
import { getOrders } from "@/lib/dal";
import { deleteOrderAction } from "@/actions/orders";

function formatARS(value: number) {
  return new Intl.NumberFormat("es-AR", { style: "currency", currency: "ARS" }).format(value);
}

const STATUS_LABEL: Record<string, string> = {
  NUEVO: "Nuevo",
  EN_PREPARACION: "En preparación",
  ENVIADO: "Enviado",
  ENTREGADO: "Entregado",
  CANCELADO: "Cancelado",
};

const STATUS_COLOR: Record<string, string> = {
  NUEVO: "bg-blue-100 text-blue-700 dark:bg-blue-500/20 dark:text-blue-300",
  EN_PREPARACION: "bg-amber-100 text-amber-700 dark:bg-amber-500/20 dark:text-amber-300",
  ENVIADO: "bg-purple-100 text-purple-700 dark:bg-purple-500/20 dark:text-purple-300",
  ENTREGADO: "bg-green-100 text-green-700 dark:bg-green-500/20 dark:text-green-300",
  CANCELADO: "bg-red-100 text-red-700 dark:bg-red-500/20 dark:text-red-300",
};

export default async function OrdersPage() {
  const orders = await getOrders();

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-bold text-[var(--color-navy)] dark:text-white">Pedidos</h1>
        <p className="text-sm text-gray-500 dark:text-gray-400">
          {orders.length} pedidos recibidos
        </p>
      </div>

      <div className="overflow-hidden rounded-xl bg-white shadow-sm dark:bg-[#151833] dark:shadow-none">
        <table className="w-full text-left text-sm">
          <thead className="bg-gray-50 text-gray-500 dark:bg-white/5 dark:text-gray-400">
            <tr>
              <th className="px-4 py-3">Fecha</th>
              <th className="px-4 py-3">Cliente</th>
              <th className="px-4 py-3">Teléfono</th>
              <th className="px-4 py-3">Total</th>
              <th className="px-4 py-3">Estado</th>
              <th className="px-4 py-3"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 dark:divide-gray-700 dark:text-gray-200">
            {orders.map((order) => (
              <tr key={order.id}>
                <td className="px-4 py-3">{order.createdAt.toLocaleDateString("es-AR")}</td>
                <td className="px-4 py-3 font-medium text-[var(--color-navy)] dark:text-white">
                  {order.customerName}
                </td>
                <td className="px-4 py-3">{order.phone}</td>
                <td className="px-4 py-3">{formatARS(order.total)}</td>
                <td className="px-4 py-3">
                  <span
                    className={`rounded-full px-3 py-1 text-xs font-semibold ${STATUS_COLOR[order.status]}`}
                  >
                    {STATUS_LABEL[order.status]}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <div className="flex gap-3">
                    <Link
                      href={`/admin/pedidos/${order.id}`}
                      className="text-sm font-medium text-[var(--color-navy)] hover:underline dark:text-[var(--color-lilac-light)]"
                    >
                      Ver detalle
                    </Link>
                    <form action={deleteOrderAction.bind(null, order.id)}>
                      <button
                        type="submit"
                        className="text-sm font-medium text-red-600 hover:underline dark:text-red-400"
                      >
                        Eliminar
                      </button>
                    </form>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {orders.length === 0 && (
          <p className="px-4 py-6 text-center text-sm text-gray-500 dark:text-gray-400">
            Todavía no llegaron pedidos.
          </p>
        )}
      </div>
    </div>
  );
}
