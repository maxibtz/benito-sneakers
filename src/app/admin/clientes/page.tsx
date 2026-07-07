import { getCustomerStats, getCouponCustomers } from "@/lib/dal";

function formatARS(value: number) {
  return new Intl.NumberFormat("es-AR", { style: "currency", currency: "ARS" }).format(value);
}

export default async function ClientesPage() {
  const [{ registered, active, recent }, couponOrders] = await Promise.all([
    getCustomerStats(),
    getCouponCustomers(),
  ]);
  const inactive = registered - active;

  const cards = [
    { label: "Clientes registrados", value: registered },
    { label: "Activos (últimos 30 días)", value: active },
    { label: "Inactivos", value: inactive < 0 ? 0 : inactive },
  ];

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-bold text-[var(--color-navy)] dark:text-white">Clientes</h1>
        <p className="text-sm text-gray-500 dark:text-gray-400">
          Cuentas creadas en la tienda y su actividad.
        </p>
      </div>

      <div className="grid grid-cols-2 gap-4 md:grid-cols-3">
        {cards.map((c) => (
          <div
            key={c.label}
            className="rounded-xl bg-white p-5 shadow-sm dark:bg-[#151833] dark:shadow-none"
          >
            <p className="text-sm text-gray-500 dark:text-gray-400">{c.label}</p>
            <p className="mt-1 text-2xl font-bold text-[var(--color-navy)] dark:text-white">
              {c.value}
            </p>
          </div>
        ))}
      </div>

      <div className="overflow-x-auto rounded-xl bg-white shadow-sm dark:bg-[#151833] dark:shadow-none">
        <table className="w-full text-left text-sm">
          <thead className="bg-gray-50 text-gray-500 dark:bg-white/5 dark:text-gray-400">
            <tr>
              <th className="px-4 py-3">Cliente</th>
              <th className="px-4 py-3">Email</th>
              <th className="px-4 py-3">Registro</th>
              <th className="px-4 py-3">Último ingreso</th>
              <th className="px-4 py-3">Pedidos</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 dark:divide-gray-700 dark:text-gray-200">
            {recent.map((c) => (
              <tr key={c.id}>
                <td className="px-4 py-3 font-medium text-[var(--color-navy)] dark:text-white">
                  {c.name}
                </td>
                <td className="px-4 py-3">{c.email}</td>
                <td className="px-4 py-3">{c.createdAt.toLocaleDateString("es-AR")}</td>
                <td className="px-4 py-3">
                  {c.lastLoginAt ? c.lastLoginAt.toLocaleDateString("es-AR") : "—"}
                </td>
                <td className="px-4 py-3">{c._count.orders}</td>
              </tr>
            ))}
          </tbody>
        </table>
        {recent.length === 0 && (
          <p className="px-4 py-6 text-center text-sm text-gray-500 dark:text-gray-400">
            Todavía no hay clientes registrados.
          </p>
        )}
      </div>

      <div>
        <h2 className="mb-3 text-lg font-semibold text-[var(--color-navy)] dark:text-white">
          Pedidos con cupón
        </h2>
        <div className="overflow-x-auto rounded-xl bg-white shadow-sm dark:bg-[#151833] dark:shadow-none">
          <table className="w-full text-left text-sm">
            <thead className="bg-gray-50 text-gray-500 dark:bg-white/5 dark:text-gray-400">
              <tr>
                <th className="px-4 py-3">Cliente</th>
                <th className="px-4 py-3">Cupón</th>
                <th className="px-4 py-3">Descuento</th>
                <th className="px-4 py-3">Total</th>
                <th className="px-4 py-3">Fecha</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-gray-700 dark:text-gray-200">
              {couponOrders.map((o) => (
                <tr key={o.id}>
                  <td className="px-4 py-3 font-medium text-[var(--color-navy)] dark:text-white">
                    {o.customerName}
                    <span className="block text-xs font-normal text-gray-400">{o.email}</span>
                  </td>
                  <td className="px-4 py-3">
                    <span className="rounded-full bg-[var(--color-lilac-light)] px-2.5 py-1 text-xs font-semibold text-[var(--color-navy)]">
                      {o.couponCode}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-green-600 dark:text-green-400">
                    −{formatARS(o.discount)}
                  </td>
                  <td className="px-4 py-3">{formatARS(o.total)}</td>
                  <td className="px-4 py-3">{o.createdAt.toLocaleDateString("es-AR")}</td>
                </tr>
              ))}
            </tbody>
          </table>
          {couponOrders.length === 0 && (
            <p className="px-4 py-6 text-center text-sm text-gray-500 dark:text-gray-400">
              Todavía nadie usó un cupón.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
