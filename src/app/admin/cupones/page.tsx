import { getCouponsWithUsage, getCouponCustomers } from "@/lib/dal";
import { toggleCouponAction, deleteCouponAction } from "@/actions/coupons";
import { NewCouponForm, CouponEditForm } from "@/components/forms/CouponForms";

function formatARS(value: number) {
  return new Intl.NumberFormat("es-AR", { style: "currency", currency: "ARS" }).format(value);
}

export default async function CuponesPage() {
  const [coupons, couponOrders] = await Promise.all([
    getCouponsWithUsage(),
    getCouponCustomers(),
  ]);

  return (
    <div className="flex max-w-4xl flex-col gap-6">
      <div>
        <h1 className="text-2xl font-bold text-[var(--color-navy)] dark:text-white">
          Códigos de descuento
        </h1>
        <p className="text-sm text-gray-500 dark:text-gray-400">
          Creá códigos, activá/desactivá cada uno y mirá cuánto se usaron. El % es el descuento que
          se aplica.
        </p>
      </div>

      <NewCouponForm />

      {/* Lista de cupones */}
      <div className="overflow-hidden rounded-xl bg-white shadow-sm dark:bg-[#151833] dark:shadow-none">
        <table className="w-full text-left text-sm">
          <thead className="bg-gray-50 text-gray-500 dark:bg-white/5 dark:text-gray-400">
            <tr>
              <th className="px-4 py-3">Código</th>
              <th className="px-4 py-3">Descuento</th>
              <th className="px-4 py-3">Usos</th>
              <th className="px-4 py-3">Descuento dado</th>
              <th className="px-4 py-3">Estado</th>
              <th className="px-4 py-3">Acciones</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 dark:divide-gray-700 dark:text-gray-200">
            {coupons.map((c) => {
              const expired = c.expiresAt && c.expiresAt.getTime() <= Date.now();
              return (
                <tr key={c.id} className="align-top">
                  <td className="px-4 py-3 font-mono font-semibold text-[var(--color-navy)] dark:text-white">
                    {c.code}
                  </td>
                  <td className="px-4 py-3">
                    <span className="rounded-full bg-green-100 px-2.5 py-0.5 text-sm font-bold text-green-700 dark:bg-green-500/20 dark:text-green-400">
                      {c.discountPercent}%
                    </span>
                  </td>
                  <td className="px-4 py-3">{c.uses}</td>
                  <td className="px-4 py-3">{formatARS(c.totalDiscount)}</td>
                  <td className="px-4 py-3">
                    <form action={toggleCouponAction.bind(null, c.id, !c.enabled)}>
                      <button
                        type="submit"
                        className={`rounded-full px-3 py-1 text-xs font-semibold ${
                          c.enabled && !expired
                            ? "bg-green-100 text-green-700 dark:bg-green-500/20 dark:text-green-400"
                            : "bg-gray-200 text-gray-600 dark:bg-white/10 dark:text-gray-300"
                        }`}
                      >
                        {expired ? "Vencido" : c.enabled ? "Activo" : "Inactivo"}
                      </button>
                    </form>
                    {expired && (
                      <p className="mt-1 text-[11px] text-amber-600 dark:text-amber-400">
                        venció {c.expiresAt!.toLocaleDateString("es-AR")}
                      </p>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex flex-col gap-2">
                      <CouponEditForm
                        id={c.id}
                        discountPercent={c.discountPercent}
                        expiresAt={c.expiresAt}
                      />
                      <form action={deleteCouponAction.bind(null, c.id)}>
                        <button
                          type="submit"
                          className="text-xs font-medium text-red-600 hover:underline dark:text-red-400"
                        >
                          Eliminar
                        </button>
                      </form>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
        {coupons.length === 0 && (
          <p className="px-4 py-6 text-center text-sm text-gray-500 dark:text-gray-400">
            Todavía no creaste ningún código.
          </p>
        )}
      </div>

      {/* Historial de uso */}
      <div className="overflow-hidden rounded-xl bg-white shadow-sm dark:bg-[#151833] dark:shadow-none">
        <div className="border-b border-gray-100 px-4 py-3 dark:border-gray-700">
          <h2 className="font-semibold text-[var(--color-navy)] dark:text-white">
            Historial de uso
          </h2>
          <p className="text-xs text-gray-500 dark:text-gray-400">
            Últimos pedidos que usaron un código de descuento.
          </p>
        </div>
        <table className="w-full text-left text-sm">
          <thead className="bg-gray-50 text-gray-500 dark:bg-white/5 dark:text-gray-400">
            <tr>
              <th className="px-4 py-3">Fecha</th>
              <th className="px-4 py-3">Cliente</th>
              <th className="px-4 py-3">Código</th>
              <th className="px-4 py-3">Descuento</th>
              <th className="px-4 py-3">Total</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 dark:divide-gray-700 dark:text-gray-200">
            {couponOrders.map((o) => (
              <tr key={o.id}>
                <td className="px-4 py-3 text-gray-500 dark:text-gray-400">
                  {o.createdAt.toLocaleDateString("es-AR")}
                </td>
                <td className="px-4 py-3">{o.customerName}</td>
                <td className="px-4 py-3 font-mono">{o.couponCode}</td>
                <td className="px-4 py-3 text-green-600 dark:text-green-400">
                  −{formatARS(o.discount)}
                </td>
                <td className="px-4 py-3">{formatARS(o.total)}</td>
              </tr>
            ))}
          </tbody>
        </table>
        {couponOrders.length === 0 && (
          <p className="px-4 py-6 text-center text-sm text-gray-500 dark:text-gray-400">
            Todavía nadie usó un código.
          </p>
        )}
      </div>
    </div>
  );
}
