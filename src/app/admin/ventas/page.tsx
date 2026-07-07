import { getManualSales, getManualSalesStats } from "@/lib/dal";
import { ManualSaleForm } from "@/components/forms/ManualSaleForm";
import { deleteManualSaleAction } from "@/actions/manual-sales";

function formatARS(value: number) {
  return new Intl.NumberFormat("es-AR", { style: "currency", currency: "ARS" }).format(value);
}

function formatDate(d: Date) {
  return new Intl.DateTimeFormat("es-AR", { day: "2-digit", month: "2-digit", year: "numeric" }).format(
    new Date(d)
  );
}

export default async function VentasManualesPage() {
  const [sales, stats] = await Promise.all([getManualSales(), getManualSalesStats()]);

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-bold text-[var(--color-navy)] dark:text-white">
          Ventas manuales
        </h1>
        <p className="text-sm text-gray-500 dark:text-gray-400">
          Cargá las ventas que hacés por fuera de la tienda (en persona, WhatsApp, mayorista). Se
          suman a los ingresos y la ganancia del dashboard.
        </p>
      </div>

      {/* Resumen */}
      <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
        <Stat label="Ventas cargadas" value={String(stats.count)} />
        <Stat label="Facturado (manual)" value={formatARS(stats.revenue)} />
        <Stat label="Costo (manual)" value={formatARS(stats.cost)} muted />
        <Stat label="Ganancia (manual)" value={formatARS(stats.profit)} good={stats.profit >= 0} />
      </div>

      {/* Formulario de carga */}
      <div className="rounded-xl bg-white p-6 shadow-sm dark:bg-[#151833] dark:shadow-none">
        <h2 className="mb-4 text-lg font-semibold text-[var(--color-navy)] dark:text-white">
          Cargar una venta
        </h2>
        <ManualSaleForm />
      </div>

      {/* Historial */}
      <div className="rounded-xl bg-white shadow-sm dark:bg-[#151833] dark:shadow-none">
        <h2 className="border-b border-gray-100 p-6 pb-4 text-lg font-semibold text-[var(--color-navy)] dark:border-gray-700 dark:text-white">
          Historial de ventas manuales
        </h2>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[720px] text-left text-sm">
            <thead className="bg-gray-50 text-gray-500 dark:bg-white/5 dark:text-gray-400">
              <tr>
                <th className="px-4 py-3">Fecha</th>
                <th className="px-4 py-3">Cliente</th>
                <th className="px-4 py-3">Canal</th>
                <th className="px-4 py-3">Mercadería</th>
                <th className="px-4 py-3">Pago</th>
                <th className="px-4 py-3">Total</th>
                <th className="px-4 py-3">Ganancia</th>
                <th className="px-4 py-3"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-gray-700 dark:text-gray-200">
              {sales.map((s) => (
                <tr key={s.id}>
                  <td className="whitespace-nowrap px-4 py-3">{formatDate(s.soldAt)}</td>
                  <td className="px-4 py-3">{s.customerName || "—"}</td>
                  <td className="px-4 py-3">
                    {s.channel && (
                      <span className="rounded-full bg-[var(--color-lilac-light)] px-2 py-0.5 text-xs font-semibold text-[var(--color-navy)] dark:bg-[var(--color-lilac)]/20 dark:text-[var(--color-lilac-light)]">
                        {s.channel}
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-gray-600 dark:text-gray-300">
                    {s.items
                      .map((it) => `${it.quantity > 1 ? it.quantity + "× " : ""}${it.description}`)
                      .filter(Boolean)
                      .join(", ") || "—"}
                    {s.note && (
                      <span className="block text-xs text-gray-400">{s.note}</span>
                    )}
                  </td>
                  <td className="px-4 py-3">{s.paymentMethod || "—"}</td>
                  <td className="px-4 py-3 font-medium">{formatARS(s.total)}</td>
                  <td className="px-4 py-3">
                    {s.cost > 0 ? (
                      <span
                        className={
                          s.profit >= 0
                            ? "text-green-600 dark:text-green-400"
                            : "text-red-600 dark:text-red-400"
                        }
                      >
                        {formatARS(s.profit)}
                      </span>
                    ) : (
                      <span className="text-xs text-gray-400">sin costo</span>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <form action={deleteManualSaleAction.bind(null, s.id)}>
                      <button
                        type="submit"
                        className="text-sm font-medium text-red-600 hover:underline dark:text-red-400"
                      >
                        Eliminar
                      </button>
                    </form>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {sales.length === 0 && (
          <p className="px-4 py-6 text-center text-sm text-gray-500 dark:text-gray-400">
            Todavía no cargaste ventas manuales. Usá el formulario de arriba.
          </p>
        )}
      </div>
    </div>
  );
}

function Stat({
  label,
  value,
  muted,
  good,
}: {
  label: string;
  value: string;
  muted?: boolean;
  good?: boolean;
}) {
  return (
    <div className="rounded-xl bg-white p-5 shadow-sm dark:bg-[#151833] dark:shadow-none">
      <p className="text-sm text-gray-500 dark:text-gray-400">{label}</p>
      <p
        className={`mt-1 text-2xl font-bold ${
          good === undefined
            ? muted
              ? "text-gray-600 dark:text-gray-300"
              : "text-[var(--color-navy)] dark:text-white"
            : good
              ? "text-green-600 dark:text-green-400"
              : "text-red-600 dark:text-red-400"
        }`}
      >
        {value}
      </p>
    </div>
  );
}
