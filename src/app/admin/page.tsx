import Link from "next/link";
import { getDashboardStats, getAnalytics, getProfitStats, getSectionStats } from "@/lib/dal";
import { BarChart, DonutChart } from "@/components/charts/Charts";

function formatARS(value: number) {
  return new Intl.NumberFormat("es-AR", { style: "currency", currency: "ARS" }).format(value);
}

export default async function AdminDashboardPage() {
  const [stats, analytics, profit, sectionStats] = await Promise.all([
    getDashboardStats(),
    getAnalytics(),
    getProfitStats(),
    getSectionStats(),
  ]);
  const { couponUsage, repurchase } = analytics;
  const repurchaseRate =
    repurchase.buyers > 0 ? Math.round((repurchase.repeatBuyers / repurchase.buyers) * 100) : 0;

  const cards = [
    { label: "Productos activos", value: stats.totalProducts },
    { label: "Pedidos totales", value: stats.totalOrders },
    { label: "Pedidos pendientes", value: stats.pendingOrders },
    { label: "Ingresos (no cancelados)", value: formatARS(stats.totalRevenue) },
    { label: "Clientes registrados", value: stats.customers },
    { label: "Clientes activos (30d)", value: stats.activeCustomers },
  ];

  return (
    <div className="flex flex-col gap-8">
      <div>
        <h1 className="text-2xl font-bold text-[var(--color-navy)] dark:text-white">Dashboard</h1>
        <p className="text-sm text-gray-500 dark:text-gray-400">Resumen general de la tienda</p>
      </div>

      <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
        {cards.map((card) => (
          <div
            key={card.label}
            className="rounded-xl bg-white p-5 shadow-sm dark:bg-[#151833] dark:shadow-none"
          >
            <p className="text-sm text-gray-500 dark:text-gray-400">{card.label}</p>
            <p className="mt-1 text-2xl font-bold text-[var(--color-navy)] dark:text-white">
              {card.value}
            </p>
          </div>
        ))}
      </div>

      {/* Rentabilidad — cruce automático ventas × costos */}
      <div className="rounded-xl bg-white p-6 shadow-sm dark:bg-[#151833] dark:shadow-none">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-[var(--color-navy)] dark:text-white">
            Rentabilidad
          </h2>
          <span className="text-xs text-gray-400">cruce automático de ventas y costos cargados</span>
        </div>
        <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
          <ProfitCard label="Facturación neta" value={formatARS(profit.netRevenue)} />
          <ProfitCard label="Costo de lo vendido" value={formatARS(profit.cogs)} muted />
          <ProfitCard
            label="Ganancia neta"
            value={formatARS(profit.profit)}
            highlight={profit.profit >= 0 ? "good" : "bad"}
            badge={`${profit.marginPct}% margen`}
          />
          <ProfitCard label="Inventario a costo" value={formatARS(profit.inventoryCost)} muted />
        </div>
        <p className="mt-3 text-xs text-gray-500 dark:text-gray-400">
          Ganancia potencial si vendés todo el stock actual:{" "}
          <strong className="text-[var(--color-navy)] dark:text-white">
            {formatARS(profit.inventoryPotentialProfit)}
          </strong>
        </p>

        {profit.costBreakdown.length > 0 && (
          <div className="mt-5 border-t border-gray-100 pt-4 dark:border-gray-700">
            <p className="mb-2 text-sm font-semibold text-[var(--color-navy)] dark:text-white">
              Desglose de costos (de lo vendido)
            </p>
            <div className="flex flex-col gap-2">
              {profit.costBreakdown.map((c) => {
                const pct = profit.cogs > 0 ? Math.round((c.total / profit.cogs) * 100) : 0;
                return (
                  <div key={c.name} className="flex items-center gap-3">
                    <span className="w-28 shrink-0 truncate text-sm text-gray-600 dark:text-gray-300" title={c.name}>
                      {c.name}
                    </span>
                    <div className="h-2.5 flex-1 overflow-hidden rounded-full bg-gray-100 dark:bg-white/10">
                      <div
                        className="h-full rounded-full bg-[var(--color-navy)] dark:bg-[var(--color-lilac)]"
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                    <span className="w-28 shrink-0 text-right text-sm font-medium text-[var(--color-navy)] dark:text-white">
                      {formatARS(c.total)}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* Charts */}
      <div className="rounded-xl bg-white p-6 shadow-sm dark:bg-[#151833] dark:shadow-none">
        <h2 className="mb-4 text-lg font-semibold text-[var(--color-navy)] dark:text-white">
          Ventas — últimos 14 días
        </h2>
        <BarChart data={analytics.salesByDay} />
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <div className="rounded-xl bg-white p-6 shadow-sm dark:bg-[#151833] dark:shadow-none">
          <h2 className="mb-4 text-lg font-semibold text-[var(--color-navy)] dark:text-white">
            Uso de cupón
          </h2>
          <DonutChart
            centerValue={String(couponUsage.withCoupon)}
            centerLabel="pedidos con cupón"
            segments={[
              { label: "Con cupón", value: couponUsage.withCoupon, color: "#8b6dff" },
              { label: "Sin cupón", value: couponUsage.withoutCoupon, color: "#cbd5e1" },
            ]}
          />
        </div>

        <div className="rounded-xl bg-white p-6 shadow-sm dark:bg-[#151833] dark:shadow-none">
          <h2 className="mb-4 text-lg font-semibold text-[var(--color-navy)] dark:text-white">
            Recompra de clientes
          </h2>
          <DonutChart
            centerValue={`${repurchaseRate}%`}
            centerLabel="tasa de recompra"
            segments={[
              { label: "Recompradores (2+)", value: repurchase.repeatBuyers, color: "#34d399" },
              { label: "1 sola compra", value: repurchase.oneTime, color: "#cbd5e1" },
            ]}
          />
        </div>
      </div>

      {sectionStats.length > 0 && (
        <div className="rounded-xl bg-white p-6 shadow-sm dark:bg-[#151833] dark:shadow-none">
          <h2 className="mb-4 text-lg font-semibold text-[var(--color-navy)] dark:text-white">
            Ventas por sección
          </h2>
          <table className="w-full text-left text-sm">
            <thead className="text-gray-500 dark:text-gray-400">
              <tr>
                <th className="pb-2">Sección</th>
                <th className="pb-2">Productos</th>
                <th className="pb-2">Unidades vendidas</th>
                <th className="pb-2">Ingresos</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-gray-700 dark:text-gray-200">
              {sectionStats.map((s) => (
                <tr key={s.id}>
                  <td className="py-2 font-medium text-[var(--color-navy)] dark:text-white">
                    {s.name}
                    {!s.active && (
                      <span className="ml-2 rounded-full bg-gray-200 px-2 py-0.5 text-[10px] text-gray-600 dark:bg-white/10 dark:text-gray-300">
                        oculta
                      </span>
                    )}
                  </td>
                  <td className="py-2">{s.products}</td>
                  <td className="py-2">{s.units}</td>
                  <td className="py-2">{formatARS(s.revenue)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <div className="rounded-xl bg-white p-6 shadow-sm dark:bg-[#151833] dark:shadow-none">
        <h2 className="mb-4 text-lg font-semibold text-[var(--color-navy)] dark:text-white">
          Productos más vendidos
        </h2>
        {stats.bestSellers.length === 0 ? (
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Todavía no hay ventas registradas.
          </p>
        ) : (
          <ul className="flex flex-col divide-y divide-gray-100 dark:divide-gray-700">
            {stats.bestSellers.map(({ product, unitsSold }) => (
              <li key={product!.id} className="flex items-center justify-between py-3">
                <div>
                  <p className="font-medium text-[var(--color-navy)] dark:text-white">
                    {product!.brand} {product!.model}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">SKU: {product!.sku}</p>
                </div>
                <span className="rounded-full bg-[var(--color-lilac-light)] px-3 py-1 text-sm font-semibold text-[var(--color-navy)] dark:bg-[var(--color-lilac)]/20 dark:text-[var(--color-lilac-light)]">
                  {unitsSold} vendidos
                </span>
              </li>
            ))}
          </ul>
        )}
      </div>

      <div className="flex flex-wrap gap-3">
        <Link
          href="/admin/productos/nuevo"
          className="rounded-md bg-[var(--color-navy)] px-4 py-2 text-sm font-semibold text-white hover:bg-[var(--color-navy-light)]"
        >
          + Cargar producto
        </Link>
        <Link
          href="/admin/pedidos"
          className="rounded-md border border-[var(--color-navy)] px-4 py-2 text-sm font-semibold text-[var(--color-navy)] hover:bg-[var(--color-lilac-light)] dark:border-[var(--color-lilac)] dark:text-[var(--color-lilac-light)] dark:hover:bg-[var(--color-lilac)]/10"
        >
          Ver pedidos
        </Link>
      </div>
    </div>
  );
}

function ProfitCard({
  label,
  value,
  muted,
  highlight,
  badge,
}: {
  label: string;
  value: string;
  muted?: boolean;
  highlight?: "good" | "bad";
  badge?: string;
}) {
  const valueColor =
    highlight === "good"
      ? "text-green-600 dark:text-green-400"
      : highlight === "bad"
        ? "text-red-600 dark:text-red-400"
        : muted
          ? "text-gray-600 dark:text-gray-300"
          : "text-[var(--color-navy)] dark:text-white";
  return (
    <div className="rounded-lg border border-gray-100 bg-gray-50 p-4 dark:border-white/10 dark:bg-white/5">
      <p className="text-xs text-gray-500 dark:text-gray-400">{label}</p>
      <p className={`mt-1 text-xl font-bold ${valueColor}`}>{value}</p>
      {badge && (
        <span className="mt-1 inline-block rounded-full bg-green-100 px-2 py-0.5 text-xs font-semibold text-green-700 dark:bg-green-500/20 dark:text-green-400">
          {badge}
        </span>
      )}
    </div>
  );
}
