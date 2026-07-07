"use client";

import { useActionState, useEffect, useRef, useState } from "react";
import { createManualSaleAction } from "@/actions/manual-sales";
import type { SaleProduct } from "@/lib/dal";

function formatARS(value: number) {
  return new Intl.NumberFormat("es-AR", { style: "currency", currency: "ARS" }).format(value);
}

const CHANNELS = ["En persona", "WhatsApp", "Instagram", "Mayorista", "Otro"];
const PAYMENTS = ["Efectivo", "Transferencia", "Otro"];

const inputClass =
  "w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 outline-none focus:border-[var(--color-navy)] dark:border-gray-600 dark:bg-white/5 dark:text-white";
const labelClass = "mb-1 block text-xs font-medium text-gray-500 dark:text-gray-400";

type Row = {
  productId: string; // "" = escrito a mano
  variantId: string; // "" = sin talle (no descuenta stock)
  size: string;
  description: string;
  quantity: string;
  unitPrice: string;
};

const emptyRow: Row = {
  productId: "",
  variantId: "",
  size: "",
  description: "",
  quantity: "1",
  unitPrice: "",
};

export function ManualSaleForm({ products }: { products: SaleProduct[] }) {
  const [state, action, pending] = useActionState(createManualSaleAction, {});
  const formRef = useRef<HTMLFormElement>(null);

  const today = new Date().toISOString().slice(0, 10);
  const [rows, setRows] = useState<Row[]>([{ ...emptyRow }]);
  const [extraCost, setExtraCost] = useState("");

  const productById = new Map(products.map((p) => [p.id, p]));

  const total = rows.reduce(
    (sum, r) => sum + (Number(r.unitPrice) || 0) * (Number(r.quantity) || 1),
    0
  );
  // Costo automático de los ítems ligados al catálogo.
  const autoCost = rows.reduce((sum, r) => {
    const p = r.productId ? productById.get(r.productId) : undefined;
    return sum + (p ? p.cost * (Number(r.quantity) || 1) : 0);
  }, 0);
  const extraCostN = Number(extraCost) || 0;
  const totalCost = autoCost + extraCostN;
  const profit = total - totalCost;

  useEffect(() => {
    if (state.ok) {
      setRows([{ ...emptyRow }]);
      setExtraCost("");
      formRef.current?.reset();
    }
  }, [state.ok]);

  function updateRow(i: number, patch: Partial<Row>) {
    setRows((prev) => {
      const next = prev.slice();
      next[i] = { ...next[i], ...patch };
      return next;
    });
  }

  function onPickProduct(i: number, productId: string) {
    if (!productId) {
      updateRow(i, { productId: "", variantId: "", size: "" });
      return;
    }
    const p = productById.get(productId);
    if (!p) return;
    updateRow(i, {
      productId,
      variantId: "",
      size: "",
      description: p.label,
      unitPrice: String(p.price || ""),
    });
  }

  function onPickSize(i: number, variantId: string) {
    const row = rows[i];
    const p = row.productId ? productById.get(row.productId) : undefined;
    const v = p?.variants.find((x) => x.id === variantId);
    updateRow(i, { variantId, size: v?.size ?? "" });
  }

  function addRow() {
    setRows((prev) => [...prev, { ...emptyRow }]);
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
            productId: r.productId || undefined,
            variantId: r.variantId || undefined,
            size: r.size || undefined,
            description: r.description,
            quantity: Number(r.quantity) || 1,
            unitPrice: Number(r.unitPrice) || 0,
          }))
        )}
      />
      <input type="hidden" name="cost" value={String(totalCost)} />

      {state.ok && (
        <div className="rounded-lg border border-green-300 bg-green-50 px-4 py-3 text-sm font-medium text-green-700 dark:border-green-500/40 dark:bg-green-500/10 dark:text-green-300">
          ✓ Venta cargada. Ya se sumó a tus ingresos y ganancia
          {rows.some((r) => r.variantId) ? " (y se descontó el stock)" : ""}.
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
        <p className="mb-1 text-sm font-semibold text-[var(--color-navy)] dark:text-gray-200">
          Mercadería vendida
        </p>
        <p className="mb-3 text-xs text-gray-500 dark:text-gray-400">
          Elegí un producto del catálogo (trae precio y costo, y si elegís el talle descuenta
          stock) o escribí a mano cualquier ítem.
        </p>

        <div className="flex flex-col gap-3">
          {rows.map((row, i) => {
            const p = row.productId ? productById.get(row.productId) : undefined;
            return (
              <div
                key={i}
                className="rounded-lg border border-gray-200 bg-white p-3 dark:border-white/10 dark:bg-[#151833]"
              >
                <div className="grid gap-2 sm:grid-cols-2">
                  <div>
                    <label className={labelClass}>Producto</label>
                    <select
                      value={row.productId}
                      onChange={(e) => onPickProduct(i, e.target.value)}
                      className={inputClass}
                    >
                      <option value="">— Escribir a mano —</option>
                      {products.map((prod) => (
                        <option key={prod.id} value={prod.id}>
                          {prod.label}
                        </option>
                      ))}
                    </select>
                  </div>
                  {p && p.variants.length > 0 && (
                    <div>
                      <label className={labelClass}>Talle (descuenta stock)</label>
                      <select
                        value={row.variantId}
                        onChange={(e) => onPickSize(i, e.target.value)}
                        className={inputClass}
                      >
                        <option value="">Sin descontar stock</option>
                        {p.variants.map((v) => (
                          <option key={v.id} value={v.id}>
                            Talle {v.size} — stock {v.stock}
                          </option>
                        ))}
                      </select>
                    </div>
                  )}
                </div>

                <div className="mt-2 grid gap-2 sm:grid-cols-[1fr_5rem_8rem_2.25rem]">
                  <div>
                    <label className={`${labelClass} sm:hidden`}>Descripción</label>
                    <input
                      value={row.description}
                      onChange={(e) => updateRow(i, { description: e.target.value })}
                      placeholder="Descripción"
                      className={inputClass}
                    />
                  </div>
                  <div>
                    <label className={`${labelClass} sm:hidden`}>Cantidad</label>
                    <input
                      value={row.quantity}
                      onChange={(e) => updateRow(i, { quantity: e.target.value })}
                      type="number"
                      min={1}
                      placeholder="1"
                      className={inputClass}
                    />
                  </div>
                  <div>
                    <label className={`${labelClass} sm:hidden`}>Precio unit.</label>
                    <input
                      value={row.unitPrice}
                      onChange={(e) => updateRow(i, { unitPrice: e.target.value })}
                      type="number"
                      min={0}
                      step="0.01"
                      placeholder="$ precio"
                      className={inputClass}
                    />
                  </div>
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
              </div>
            );
          })}
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
          <label className={labelClass}>Costo extra / de ítems a mano (opcional)</label>
          <input
            value={extraCost}
            onChange={(e) => setExtraCost(e.target.value)}
            type="number"
            min={0}
            step="0.01"
            placeholder="$"
            className={inputClass}
          />
          {autoCost > 0 && (
            <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
              + {formatARS(autoCost)} de costo automático (productos del catálogo)
            </p>
          )}
        </div>
        <div>
          <label className={labelClass}>Nota (opcional)</label>
          <input name="note" placeholder="Detalle interno" className={inputClass} />
        </div>
      </div>

      {/* Resumen en vivo */}
      <div className="flex flex-wrap items-center justify-between gap-4 rounded-lg border border-gray-200 bg-white p-4 dark:border-white/10 dark:bg-[#151833]">
        <div className="flex flex-wrap gap-6">
          <div>
            <p className="text-xs text-gray-500 dark:text-gray-400">Total venta</p>
            <p className="text-xl font-bold text-[var(--color-navy)] dark:text-white">
              {formatARS(total)}
            </p>
          </div>
          {totalCost > 0 && (
            <>
              <div>
                <p className="text-xs text-gray-500 dark:text-gray-400">Costo</p>
                <p className="text-xl font-bold text-gray-600 dark:text-gray-300">
                  {formatARS(totalCost)}
                </p>
              </div>
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
            </>
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
