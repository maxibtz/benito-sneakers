"use client";

import { useMemo, useState } from "react";
import type { CantinaSaleForDashboard, CantinaProductRow } from "@/lib/cantina-dal";
import { BarChart, DonutChart } from "@/components/charts/Charts";

function formatARS(value: number) {
  return new Intl.NumberFormat("es-AR", { style: "currency", currency: "ARS" }).format(value);
}

type Period = "hoy" | "semana" | "mes" | "custom";

function startOfDay(d: Date) {
  const x = new Date(d);
  x.setHours(0, 0, 0, 0);
  return x;
}
function startOfWeek(d: Date) {
  const x = startOfDay(d);
  const day = (x.getDay() + 6) % 7; // lunes = 0
  x.setDate(x.getDate() - day);
  return x;
}
function startOfMonth(d: Date) {
  const x = startOfDay(d);
  x.setDate(1);
  return x;
}

const PAYMENT_LABELS: Record<string, string> = {
  EFECTIVO: "Efectivo",
  TRANSFERENCIA: "Transferencia",
  TARJETA: "Tarjeta",
};

export function CantinaDashboard({
  sales,
  lowStock,
  products,
}: {
  sales: CantinaSaleForDashboard[];
  lowStock: { id: string; name: string; categoryName: string | null; stock: number; minStock: number; unit: string }[];
  products: CantinaProductRow[];
}) {
  const [period, setPeriod] = useState<Period>("hoy");
  const [customFrom, setCustomFrom] = useState("");
  const [customTo, setCustomTo] = useState("");

  const { from, to } = useMemo(() => {
    const now = new Date();
    if (period === "hoy") return { from: startOfDay(now), to: now };
    if (period === "semana") return { from: startOfWeek(now), to: now };
    if (period === "mes") return { from: startOfMonth(now), to: now };
    return {
      from: customFrom ? new Date(customFrom + "T00:00:00") : startOfMonth(now),
      to: customTo ? new Date(customTo + "T23:59:59") : now,
    };
  }, [period, customFrom, customTo]);

  const filtered = useMemo(
    () => sales.filter((s) => s.soldAt >= from && s.soldAt <= to),
    [sales, from, to]
  );

  const stats = useMemo(() => {
    let grossProfit = 0;
    const byProductQty = new Map<string, { name: string; qty: number; revenue: number }>();
    const byPayment = new Map<string, { count: number; total: number }>();
    const byCategory = new Map<string, number>();
    const bySupplier = new Map<string, { revenue: number; cost: number }>();
    const soldProductIds = new Set<string>();

    for (const sale of filtered) {
      const pay = byPayment.get(sale.paymentMethod) ?? { count: 0, total: 0 };
      pay.count += 1;
      pay.total += sale.total;
      byPayment.set(sale.paymentMethod, pay);

      for (const item of sale.items) {
        soldProductIds.add(item.productId);
        grossProfit += (item.unitPrice - item.cost) * item.quantity;

        const p = byProductQty.get(item.productId) ?? { name: item.productName, qty: 0, revenue: 0 };
        p.qty += item.quantity;
        p.revenue += item.unitPrice * item.quantity;
        byProductQty.set(item.productId, p);

        const catKey = item.categoryName ?? "Sin categoría";
        byCategory.set(catKey, (byCategory.get(catKey) ?? 0) + item.unitPrice * item.quantity);

        const supKey = item.supplierName ?? "Sin proveedor";
        const sup = bySupplier.get(supKey) ?? { revenue: 0, cost: 0 };
        sup.revenue += item.unitPrice * item.quantity;
        sup.cost += item.cost * item.quantity;
        bySupplier.set(supKey, sup);
      }
    }

    const topByQty = [...byProductQty.entries()]
      .sort((a, b) => b[1].qty - a[1].qty)
      .slice(0, 5)
      .map(([id, v]) => ({ id, ...v }));
    const topByRevenue = [...byProductQty.entries()]
      .sort((a, b) => b[1].revenue - a[1].revenue)
      .slice(0, 5)
      .map(([id, v]) => ({ id, ...v }));

    const supplierMargins = [...bySupplier.entries()]
      .map(([name, v]) => ({
        name,
        revenue: v.revenue,
        cost: v.cost,
        margin: v.revenue - v.cost,
        marginPct: v.revenue > 0 ? Math.round(((v.revenue - v.cost) / v.revenue) * 100) : 0,
      }))
      .sort((a, b) => b.revenue - a.revenue);

    const revenue = filtered.reduce((s, sale) => s + sale.total, 0);
    const avgTicket = filtered.length > 0 ? revenue / filtered.length : 0;

    // Ventas por día (para el gráfico), dentro del rango elegido.
    const days: { label: string; value: number }[] = [];
    const dayCount = Math.max(1, Math.min(31, Math.ceil((to.getTime() - from.getTime()) / 86400000) + 1));
    for (let i = 0; i < dayCount; i++) {
      const d = new Date(from);
      d.setDate(from.getDate() + i);
      const key = d.toISOString().slice(0, 10);
      const value = filtered
        .filter((s) => s.soldAt.toISOString().slice(0, 10) === key)
        .reduce((sum, s) => sum + s.total, 0);
      days.push({ label: d.toLocaleDateString("es-AR", { day: "2-digit", month: "2-digit" }), value });
    }

    const noRotation = products
      .filter((p) => p.active && !soldProductIds.has(p.id))
      .map((p) => p.name);

    return {
      revenue,
      grossProfit,
      avgTicket,
      ticketCount: filtered.length,
      topByQty,
      topByRevenue,
      byPayment: [...byPayment.entries()].map(([method, v]) => ({ method, ...v })),
      byCategory: [...byCategory.entries()].sort((a, b) => b[1] - a[1]),
      supplierMargins,
      noRotation,
      salesByDay: days.length <= 31 ? days : [],
    };
  }, [filtered, from, to, products]);

  const marginByProduct = useMemo(
    () => products.filter((p) => p.active).sort((a, b) => a.marginPct - b.marginPct),
    [products]
  );

  const selectCls =
    "rounded-md border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 outline-none focus:border-[var(--color-cantina-vivid)] dark:border-gray-600 dark:bg-white/5 dark:text-white";

  const paymentColors: Record<string, string> = {
    EFECTIVO: "#34d399",
    TRANSFERENCIA: "#60a5fa",
    TARJETA: "#ff9f43",
  };
  const categoryPalette = ["#ff9f43", "#8b6dff", "#34d399", "#60a5fa", "#f472b6", "#facc15"];

  return (
    <div className="flex flex-col gap-6">
      {/* Filtro de período */}
      <div className="flex flex-wrap items-end gap-3 rounded-xl bg-white p-3 shadow-sm dark:bg-[#151833] dark:shadow-none">
        {(["hoy", "semana", "mes", "custom"] as Period[]).map((p) => (
          <button
            key={p}
            type="button"
            onClick={() => setPeriod(p)}
            className={`rounded-full px-4 py-2 text-sm font-semibold transition ${
              period === p
                ? "bg-[var(--color-cantina-vivid)] text-white"
                : "bg-gray-100 text-gray-600 dark:bg-white/10 dark:text-gray-300"
            }`}
          >
            {p === "hoy" ? "Hoy" : p === "semana" ? "Esta semana" : p === "mes" ? "Este mes" : "Rango personalizado"}
          </button>
        ))}
        {period === "custom" && (
          <>
            <div className="flex flex-col">
              <label className="mb-0.5 text-xs text-gray-500 dark:text-gray-400">Desde</label>
              <input type="date" value={customFrom} onChange={(e) => setCustomFrom(e.target.value)} className={selectCls} />
            </div>
            <div className="flex flex-col">
              <label className="mb-0.5 text-xs text-gray-500 dark:text-gray-400">Hasta</label>
              <input type="date" value={customTo} onChange={(e) => setCustomTo(e.target.value)} className={selectCls} />
            </div>
          </>
        )}
      </div>

      {/* Alerta de stock bajo */}
      {lowStock.length > 0 && (
        <div className="rounded-xl border border-amber-300 bg-amber-50 p-4 dark:border-amber-500/40 dark:bg-amber-500/10">
          <p className="mb-2 text-sm font-semibold text-amber-800 dark:text-amber-300">
            ⚠️ {lowStock.length} producto{lowStock.length === 1 ? "" : "s"} necesita{lowStock.length === 1 ? "" : "n"} reposición
          </p>
          <div className="flex flex-wrap gap-2">
            {lowStock.map((p) => (
              <span
                key={p.id}
                className="rounded-full bg-white px-3 py-1 text-xs font-medium text-amber-800 dark:bg-white/10 dark:text-amber-200"
              >
                {p.name}: {p.stock} {p.unit}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Stats principales */}
      <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
        <Stat label="Facturado" value={formatARS(stats.revenue)} />
        <Stat label="Ganancia bruta" value={formatARS(stats.grossProfit)} good={stats.grossProfit >= 0} />
        <Stat label="Ticket promedio" value={formatARS(stats.avgTicket)} />
        <Stat label="Tickets" value={String(stats.ticketCount)} />
      </div>

      {/* Ventas por día */}
      {stats.salesByDay.length > 0 && (
        <div className="rounded-xl bg-white p-6 shadow-sm dark:bg-[#151833] dark:shadow-none">
          <h2 className="mb-4 text-lg font-semibold text-[var(--color-navy)] dark:text-white">
            Ventas en el período
          </h2>
          <BarChart data={stats.salesByDay} />
        </div>
      )}

      <div className="grid gap-6 md:grid-cols-2">
        {/* Medio de pago */}
        <div className="rounded-xl bg-white p-6 shadow-sm dark:bg-[#151833] dark:shadow-none">
          <h2 className="mb-4 text-lg font-semibold text-[var(--color-navy)] dark:text-white">
            Ventas por medio de pago
          </h2>
          {stats.byPayment.length > 0 ? (
            <DonutChart
              centerValue={formatARS(stats.revenue)}
              centerLabel="total"
              segments={stats.byPayment.map((p) => ({
                label: PAYMENT_LABELS[p.method] ?? p.method,
                value: p.total,
                color: paymentColors[p.method] ?? "#cbd5e1",
              }))}
            />
          ) : (
            <p className="text-sm text-gray-500 dark:text-gray-400">Sin ventas en el período.</p>
          )}
        </div>

        {/* Categoría */}
        <div className="rounded-xl bg-white p-6 shadow-sm dark:bg-[#151833] dark:shadow-none">
          <h2 className="mb-4 text-lg font-semibold text-[var(--color-navy)] dark:text-white">
            Ventas por categoría
          </h2>
          {stats.byCategory.length > 0 ? (
            <DonutChart
              centerValue={formatARS(stats.revenue)}
              centerLabel="total"
              segments={stats.byCategory.map(([name, value], i) => ({
                label: name,
                value,
                color: categoryPalette[i % categoryPalette.length],
              }))}
            />
          ) : (
            <p className="text-sm text-gray-500 dark:text-gray-400">Sin ventas en el período.</p>
          )}
        </div>
      </div>

      {/* Más vendidos */}
      <div className="grid gap-6 md:grid-cols-2">
        <div className="rounded-xl bg-white p-6 shadow-sm dark:bg-[#151833] dark:shadow-none">
          <h2 className="mb-4 text-lg font-semibold text-[var(--color-navy)] dark:text-white">
            Más vendidos (unidades)
          </h2>
          <RankList items={stats.topByQty.map((p) => ({ label: p.name, value: `${p.qty} un.` }))} />
        </div>
        <div className="rounded-xl bg-white p-6 shadow-sm dark:bg-[#151833] dark:shadow-none">
          <h2 className="mb-4 text-lg font-semibold text-[var(--color-navy)] dark:text-white">
            Más vendidos (facturación)
          </h2>
          <RankList items={stats.topByRevenue.map((p) => ({ label: p.name, value: formatARS(p.revenue) }))} />
        </div>
      </div>

      {/* Márgenes por proveedor */}
      {stats.supplierMargins.length > 0 && (
        <div className="rounded-xl bg-white p-6 shadow-sm dark:bg-[#151833] dark:shadow-none">
          <h2 className="mb-4 text-lg font-semibold text-[var(--color-navy)] dark:text-white">
            Margen por proveedor (período)
          </h2>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[480px] text-left text-sm">
              <thead className="text-gray-500 dark:text-gray-400">
                <tr>
                  <th className="pb-2">Proveedor</th>
                  <th className="pb-2">Facturado</th>
                  <th className="pb-2">Costo</th>
                  <th className="pb-2">Margen</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-gray-700 dark:text-gray-200">
                {stats.supplierMargins.map((s) => (
                  <tr key={s.name}>
                    <td className="py-2 font-medium text-[var(--color-navy)] dark:text-white">{s.name}</td>
                    <td className="py-2">{formatARS(s.revenue)}</td>
                    <td className="py-2 text-gray-500 dark:text-gray-400">{formatARS(s.cost)}</td>
                    <td className={`py-2 font-semibold ${s.margin >= 0 ? "text-green-600 dark:text-green-400" : "text-red-600 dark:text-red-400"}`}>
                      {formatARS(s.margin)} <span className="text-xs font-normal">({s.marginPct}%)</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Margen por producto (precio y costo actuales) */}
      {marginByProduct.length > 0 && (
        <div className="rounded-xl bg-white p-6 shadow-sm dark:bg-[#151833] dark:shadow-none">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-lg font-semibold text-[var(--color-navy)] dark:text-white">
              Margen de ganancia por producto
            </h2>
            <span className="text-xs text-gray-400">(precio venta − costo) / precio venta</span>
          </div>
          <div className="max-h-80 overflow-y-auto">
            <table className="w-full min-w-[420px] text-left text-sm">
              <thead className="sticky top-0 bg-white text-gray-500 dark:bg-[#151833] dark:text-gray-400">
                <tr>
                  <th className="pb-2">Producto</th>
                  <th className="pb-2">Precio</th>
                  <th className="pb-2">Costo</th>
                  <th className="pb-2">Margen</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-gray-700 dark:text-gray-200">
                {marginByProduct.map((p) => (
                  <tr key={p.id}>
                    <td className="py-2 font-medium text-[var(--color-navy)] dark:text-white">{p.name}</td>
                    <td className="py-2">{formatARS(p.price)}</td>
                    <td className="py-2 text-gray-500 dark:text-gray-400">{formatARS(p.cost)}</td>
                    <td className={`py-2 font-semibold ${p.marginAmount >= 0 ? "text-green-600 dark:text-green-400" : "text-red-600 dark:text-red-400"}`}>
                      {formatARS(p.marginAmount)} <span className="text-xs font-normal">({p.marginPct}%)</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Rotación de stock */}
      {stats.noRotation.length > 0 && (
        <div className="rounded-xl bg-white p-6 shadow-sm dark:bg-[#151833] dark:shadow-none">
          <h2 className="mb-1 text-lg font-semibold text-[var(--color-navy)] dark:text-white">
            Sin rotación en el período
          </h2>
          <p className="mb-4 text-xs text-gray-400">
            Productos activos que no tuvieron ninguna venta en el rango elegido.
          </p>
          <div className="flex flex-wrap gap-2">
            {stats.noRotation.map((name) => (
              <span
                key={name}
                className="rounded-full bg-gray-100 px-3 py-1 text-xs font-medium text-gray-600 dark:bg-white/10 dark:text-gray-300"
              >
                {name}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function Stat({ label, value, good }: { label: string; value: string; good?: boolean }) {
  return (
    <div className="rounded-xl bg-white p-5 shadow-sm dark:bg-[#151833] dark:shadow-none">
      <p className="text-sm text-gray-500 dark:text-gray-400">{label}</p>
      <p
        className={`mt-1 text-2xl font-bold ${
          good === undefined
            ? "text-[var(--color-navy)] dark:text-white"
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

function RankList({ items }: { items: { label: string; value: string }[] }) {
  if (items.length === 0) {
    return <p className="text-sm text-gray-500 dark:text-gray-400">Sin ventas en el período.</p>;
  }
  return (
    <ul className="flex flex-col divide-y divide-gray-100 dark:divide-gray-700">
      {items.map((it) => (
        <li key={it.label} className="flex items-center justify-between py-2.5">
          <span className="text-sm text-[var(--color-navy)] dark:text-white">{it.label}</span>
          <span className="rounded-full bg-[var(--color-cantina-light)] px-3 py-1 text-xs font-semibold text-[var(--color-navy)] dark:bg-[var(--color-cantina-vivid)]/15 dark:text-[var(--color-cantina-light)]">
            {it.value}
          </span>
        </li>
      ))}
    </ul>
  );
}
