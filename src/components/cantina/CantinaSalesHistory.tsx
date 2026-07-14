"use client";

import { useMemo, useState } from "react";
import type { CantinaSaleRow } from "@/lib/cantina-dal";
import { deleteCantinaSaleAction } from "@/actions/cantina-sales";

function formatARS(value: number) {
  return new Intl.NumberFormat("es-AR", { style: "currency", currency: "ARS" }).format(value);
}
function formatDateTime(d: Date) {
  return new Intl.DateTimeFormat("es-AR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(d));
}

const PAYMENT_LABELS: Record<string, string> = {
  EFECTIVO: "💵 Efectivo",
  TRANSFERENCIA: "📲 Transferencia",
  TARJETA: "💳 Tarjeta",
};

const selectClass =
  "rounded-md border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 outline-none focus:border-[var(--color-cantina-vivid)] dark:border-gray-600 dark:bg-white/5 dark:text-white";

export function CantinaSalesHistory({ sales }: { sales: CantinaSaleRow[] }) {
  const [payment, setPayment] = useState("all");
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");

  const filtered = useMemo(() => {
    const fromT = from ? new Date(from + "T00:00:00").getTime() : null;
    const toT = to ? new Date(to + "T23:59:59").getTime() : null;
    return sales.filter((s) => {
      if (payment !== "all" && s.paymentMethod !== payment) return false;
      const t = new Date(s.soldAt).getTime();
      if (fromT !== null && t < fromT) return false;
      if (toT !== null && t > toT) return false;
      return true;
    });
  }, [sales, payment, from, to]);

  const totals = useMemo(
    () =>
      filtered.reduce(
        (acc, s) => {
          acc.count += 1;
          acc.revenue += s.total;
          return acc;
        },
        { count: 0, revenue: 0 }
      ),
    [filtered]
  );

  const hasFilters = payment !== "all" || from || to;

  return (
    <div className="rounded-xl bg-white shadow-sm dark:bg-[#151833] dark:shadow-none">
      <div className="flex flex-col gap-3 border-b border-gray-100 p-6 pb-4 dark:border-gray-700">
        <h2 className="text-lg font-semibold text-[var(--color-navy)] dark:text-white">
          Historial de ventas
        </h2>
        <div className="flex flex-wrap items-end gap-3">
          <select value={payment} onChange={(e) => setPayment(e.target.value)} className={selectClass}>
            <option value="all">Todos los medios de pago</option>
            <option value="EFECTIVO">💵 Efectivo</option>
            <option value="TRANSFERENCIA">📲 Transferencia</option>
            <option value="TARJETA">💳 Tarjeta</option>
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
                setPayment("all");
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
            {totals.count} ticket{totals.count === 1 ? "" : "s"}
          </span>
          <span className="text-gray-500 dark:text-gray-400">
            Facturado:{" "}
            <strong className="text-[var(--color-navy)] dark:text-white">
              {formatARS(totals.revenue)}
            </strong>
          </span>
          <span className="text-gray-500 dark:text-gray-400">
            Ticket promedio:{" "}
            <strong className="text-[var(--color-navy)] dark:text-white">
              {formatARS(totals.count > 0 ? totals.revenue / totals.count : 0)}
            </strong>
          </span>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full min-w-[640px] text-left text-sm">
          <thead className="bg-gray-50 text-gray-500 dark:bg-white/5 dark:text-gray-400">
            <tr>
              <th className="px-4 py-3">Fecha</th>
              <th className="px-4 py-3">Ítems</th>
              <th className="px-4 py-3">Medio de pago</th>
              <th className="px-4 py-3">Total</th>
              <th className="px-4 py-3"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 dark:divide-gray-700 dark:text-gray-200">
            {filtered.map((s) => (
              <tr key={s.id}>
                <td className="whitespace-nowrap px-4 py-3">{formatDateTime(s.soldAt)}</td>
                <td className="px-4 py-3 text-gray-600 dark:text-gray-300">
                  {s.items.map((it) => `${it.quantity}× ${it.productName}`).join(", ")}
                </td>
                <td className="px-4 py-3">{PAYMENT_LABELS[s.paymentMethod] ?? s.paymentMethod}</td>
                <td className="px-4 py-3 font-medium">{formatARS(s.total)}</td>
                <td className="px-4 py-3">
                  <form action={deleteCantinaSaleAction.bind(null, s.id)}>
                    <button
                      type="submit"
                      onClick={(e) => {
                        if (!confirm("¿Eliminar esta venta? El stock vendido se devuelve.")) e.preventDefault();
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
          {sales.length === 0 ? "Todavía no hay ventas cargadas." : "No hay ventas que coincidan con los filtros."}
        </p>
      )}
    </div>
  );
}
