"use client";

import { useActionState, useEffect, useRef, useState } from "react";
import { createManualSaleAction } from "@/actions/manual-sales";

function formatARS(value: number) {
  return new Intl.NumberFormat("es-AR", { style: "currency", currency: "ARS" }).format(value);
}

const CHANNELS = ["En persona", "WhatsApp", "Instagram", "Mayorista", "Otro"];
const PAYMENTS = ["Efectivo", "Transferencia", "Otro"];

const inputClass =
  "w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 outline-none focus:border-[var(--color-navy)] dark:border-gray-600 dark:bg-white/5 dark:text-white";
const labelClass = "mb-1 block text-xs font-medium text-gray-500 dark:text-gray-400";

type Row = { description: string; quantity: string; unitPrice: string };

export function ManualSaleForm() {
  const [state, action, pending] = useActionState(createManualSaleAction, {});
  const formRef = useRef<HTMLFormElement>(null);

  const today = new Date().toISOString().slice(0, 10);
  const [rows, setRows] = useState<Row[]>([{ description: "", quantity: "1", unitPrice: "" }]);
  const [cost, setCost] = useState("");

  const total = rows.reduce(
    (sum, r) => sum + (Number(r.unitPrice) || 0) * (Number(r.quantity) || 1),
    0
  );
  const costN = Number(cost) || 0;
  const profit = total - costN;

  // Al guardar bien, limpiamos el formulario.
  useEffect(() => {
    if (state.ok) {
      setRows([{ description: "", quantity: "1", unitPrice: "" }]);
      setCost("");
      formRef.current?.reset();
    }
  }, [state.ok]);

  function updateRow(i: number, key: keyof Row, value: string) {
    setRows((prev) => {
      const next = prev.slice();
      next[i] = { ...next[i], [key]: value };
      return next;
    });
  }
  function addRow() {
    setRows((prev) => [...prev, { description: "", quantity: "1", unitPrice: "" }]);
  }
  function removeRow(i: number) {
    setRows((prev) => (prev.length === 1 ? prev : prev.filter((_, idx) => idx !== i)));
  }

  return (
    <form ref={formRef} action={action} className="flex flex-col gap-5">
      <input
        type="hidden"
        name="items"
        value={JSON.stringify(
          rows.map((r) => ({
            description: r.description,
            quantity: Number(r.quantity) || 1,
            unitPrice: Number(r.unitPrice) || 0,
          }))
        )}
      />

      {state.ok && (
        <div className="rounded-lg border border-green-300 bg-green-50 px-4 py-3 text-sm font-medium text-green-700 dark:border-green-500/40 dark:bg-green-500/10 dark:text-green-300">
          ✓ Venta cargada. Ya se sumó a tus ingresos y ganancia.
        </div>
      )}
      {state.error && (
        <div className="rounded-lg border border-red-300 bg-red-50 px-4 py-3 text-sm font-medium text-red-700 dark:border-red-500/40 dark:bg-red-500/10 dark:text-red-300">
          ⚠️ {state.error}
        </div>
      )}

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div>
          <label className={labelClass}>Fecha de la venta</label>
          <input type="date" name="soldAt" defaultValue={today} className={inputClass} />
        </div>
        <div>
          <label className={labelClass}>Cliente (opcional)</label>
          <input name="customerName" placeholder="Nombre" className={inputClass} />
        </div>
        <div>
          <label className={labelClass}>Canal</label>
          <select name="channel" defaultValue="En persona" className={inputClass}>
            {CHANNELS.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className={labelClass}>Forma de pago</label>
          <select name="paymentMethod" defaultValue="Efectivo" className={inputClass}>
            {PAYMENTS.map((p) => (
              <option key={p} value={p}>
                {p}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Mercadería */}
      <div className="rounded-lg border border-gray-200 bg-gray-50 p-4 dark:border-white/10 dark:bg-white/5">
        <p className="mb-2 text-sm font-semibold text-[var(--color-navy)] dark:text-gray-200">
          Mercadería vendida
        </p>
        <div className="mb-1 hidden gap-2 text-xs font-medium text-gray-500 dark:text-gray-400 sm:grid sm:grid-cols-[1fr_5rem_8rem_2.25rem]">
          <span>Descripción</span>
          <span>Cantidad</span>
          <span>Precio unit.</span>
          <span />
        </div>
        <div className="flex flex-col gap-2">
          {rows.map((row, i) => (
            <div key={i} className="grid gap-2 sm:grid-cols-[1fr_5rem_8rem_2.25rem]">
              <input
                value={row.description}
                onChange={(e) => updateRow(i, "description", e.target.value)}
                placeholder="Ej: Nike Jordan Low rosa"
                className={inputClass}
              />
              <input
                value={row.quantity}
                onChange={(e) => updateRow(i, "quantity", e.target.value)}
                type="number"
                min={1}
                placeholder="1"
                className={inputClass}
              />
              <input
                value={row.unitPrice}
                onChange={(e) => updateRow(i, "unitPrice", e.target.value)}
                type="number"
                min={0}
                step="0.01"
                placeholder="$"
                className={inputClass}
              />
              <button
                type="button"
                onClick={() => removeRow(i)}
                disabled={rows.length === 1}
                className="flex items-center justify-center rounded-md text-red-500 hover:bg-red-50 disabled:opacity-30 dark:hover:bg-red-500/10"
                aria-label="Quitar ítem"
              >
                ✕
              </button>
            </div>
          ))}
        </div>
        <button
          type="button"
          onClick={addRow}
          className="mt-3 w-fit rounded-md border border-dashed border-[var(--color-navy)] px-3 py-1.5 text-sm font-medium text-[var(--color-navy)] hover:bg-[var(--color-lilac-light)] dark:border-[var(--color-lilac)] dark:text-[var(--color-lilac-light)] dark:hover:bg-[var(--color-lilac)]/10"
        >
          + Agregar ítem
        </button>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className={labelClass}>
            Costo total de la mercadería (opcional, para calcular ganancia)
          </label>
          <input
            name="cost"
            value={cost}
            onChange={(e) => setCost(e.target.value)}
            type="number"
            min={0}
            step="0.01"
            placeholder="$"
            className={inputClass}
          />
        </div>
        <div>
          <label className={labelClass}>Nota (opcional)</label>
          <input name="note" placeholder="Detalle interno" className={inputClass} />
        </div>
      </div>

      {/* Resumen en vivo */}
      <div className="flex flex-wrap items-center justify-between gap-4 rounded-lg border border-gray-200 bg-white p-4 dark:border-white/10 dark:bg-[#151833]">
        <div className="flex gap-6">
          <div>
            <p className="text-xs text-gray-500 dark:text-gray-400">Total venta</p>
            <p className="text-xl font-bold text-[var(--color-navy)] dark:text-white">
              {formatARS(total)}
            </p>
          </div>
          {costN > 0 && (
            <div>
              <p className="text-xs text-gray-500 dark:text-gray-400">Ganancia</p>
              <p
                className={`text-xl font-bold ${
                  profit >= 0
                    ? "text-green-600 dark:text-green-400"
                    : "text-red-600 dark:text-red-400"
                }`}
              >
                {formatARS(profit)}
              </p>
            </div>
          )}
        </div>
        <button
          type="submit"
          disabled={pending}
          className="rounded-md bg-[var(--color-navy)] px-5 py-2.5 font-semibold text-white hover:bg-[var(--color-navy-light)] disabled:opacity-60"
        >
          {pending ? "Guardando..." : "Cargar venta"}
        </button>
      </div>
    </form>
  );
}
