"use client";

import { useMemo, useState } from "react";
import type { ManualSaleRow } from "@/lib/dal";
import { deleteManualSaleAction } from "@/actions/manual-sales";

function formatARS(value: number) {
  return new Intl.NumberFormat("es-AR", { style: "currency", currency: "ARS" }).format(value);
}
function formatDate(d: Date) {
  return new Intl.DateTimeFormat("es-AR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  }).format(new Date(d));
}

const selectClass =
  "rounded-md border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 outline-none focus:border-[var(--color-navy)] dark:border-gray-600 dark:bg-white/5 dark:text-white";

export function ManualSalesHistory({ sales }: { sales: ManualSaleRow[] }) {
  const [query, setQuery] = useState("");
  const [channel, setChannel] = useState("all");
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");

  const channels = useMemo(
    () => [...new Set(sales.map((s) => s.channel).filter(Boolean))],
    [sales]
  );

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    const fromT = from ? new Date(from + "T00:00:00").getTime() : null;
    const toT = to ? new Date(to + "T23:59:59").getTime() : null;
    return sales.filter((s) => {
      if (channel !== "all" && s.channel !== channel) return false;
      const t = new Date(s.soldAt).getTime();
      if (fromT !== null && t < fromT) return false;
      if (toT !== null && t > toT) return false;
      if (q) {
        const hay = (
          s.customerName +
          " " +
          s.note +
          " " +
          s.items.map((it) => it.description).join(" ")
        ).toLowerCase();
        if (!hay.includes(q)) return false;
      }
      return true;
    });
  }, [sales, query, channel, from, to]);

  const totals = useMemo(
    () =>
      filtered.reduce(
        (acc, s) => {
          acc.count += 1;
          acc.revenue += s.total;
          acc.profit += s.profit;
          return acc;
        },
        { count: 0, revenue: 0, profit: 0 }
      ),
    [filtered]
  );

  const hasFilters = query || channel !== "all" || from || to;

  return (
    <div className="rounded-xl bg-white shadow-sm dark:bg-[#151833] dark:shadow-none">
      <div className="flex flex-col gap-3 border-b border-gray-100 p-6 pb-4 dark:border-gray-700">
        <h2 className="text-lg font-semibold text-[var(--color-navy)] dark:text-white">
          Historial de ventas manuales
        </h2>
        <div className="flex flex-wrap items-end gap-3">
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="🔎 Buscar cliente o mercadería…"
            className={`${selectClass} min-w-[200px] flex-1`}
          />
          <select value={channel} onChange={(e) => setChannel(e.target.value)} className={selectClass}>
            <option value="all">Todos los canales</option>
            {channels.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
          <div className="flex flex-col">
            <label className="mb-0.5 text-xs text-gray-500 dark:text-gray-400">Desde</label>
            <input type="date" value={from} onChange={(e) => setFrom(e.target.value)} className={selectClass} />
          </div>
          <div className="flex flex-col">
            <label className="mb-0.5 text-xs text-gray-500 dark:text-gray-400">Hasta</label>
            <input type="date" value={to} onChange={(e) => setTo(e.target.value)} className={selectClass} />
          </div>
          {hasFilters && (
            <button
              type="button"
              onClick={() => {
                setQuery("");
                setChannel("all");
                setFrom("");
                setTo("");
              }}
              className="rounded-md border border-gray-300 px-3 py-2 text-sm text-gray-600 hover:bg-gray-50 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-white/5"
            >
              Limpiar
            </button>
          )}
        </div>
        <div className="flex flex-wrap gap-x-6 gap-y-1 text-sm">
          <span className="text-gray-500 dark:text-gray-400">
            {totals.count} venta{totals.count === 1 ? "" : "s"}
          </span>
          <span className="text-gray-500 dark:text-gray-400">
            Facturado: <strong className="text-[var(--color-navy)] dark:text-white">{formatARS(totals.revenue)}</strong>
          </span>
          <span className="text-gray-500 dark:text-gray-400">
            Ganancia:{" "}
            <strong className={totals.profit >= 0 ? "text-green-600 dark:text-green-400" : "text-red-600 dark:text-red-400"}>
              {formatARS(totals.profit)}
            </strong>
          </span>
        </div>
      </div>

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
            {filtered.map((s) => (
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
                    .map(
                      (it) =>
                        `${it.quantity > 1 ? it.quantity + "× " : ""}${it.description}${it.size ? ` (T${it.size})` : ""}`
                    )
                    .filter(Boolean)
                    .join(", ") || "—"}
                  {s.note && <span className="block text-xs text-gray-400">{s.note}</span>}
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
                      onClick={(e) => {
                        if (!confirm("¿Eliminar esta venta? Si descontó stock, se devuelve."))
                          e.preventDefault();
                      }}
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
      {filtered.length === 0 && (
        <p className="px-4 py-6 text-center text-sm text-gray-500 dark:text-gray-400">
          {sales.length === 0
            ? "Todavía no cargaste ventas manuales. Usá el formulario de arriba."
            : "No hay ventas que coincidan con los filtros."}
        </p>
      )}
    </div>
  );
}
