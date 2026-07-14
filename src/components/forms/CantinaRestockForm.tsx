"use client";

import { useActionState } from "react";
import { restockCantinaProductAction, type CantinaProductFormState } from "@/actions/cantina-products";

const initial: CantinaProductFormState = {};

export function CantinaRestockForm({
  productId,
  productName,
  unitsPerCase,
  currentStock,
}: {
  productId: string;
  productName: string;
  unitsPerCase: number;
  currentStock: number;
}) {
  const bound = restockCantinaProductAction.bind(null, productId);
  const [state, action, pending] = useActionState(bound, initial);

  return (
    <form
      action={action}
      className="flex flex-wrap items-end gap-3 rounded-xl border border-[var(--color-cantina-vivid)]/30 bg-[var(--color-cantina-light)] p-4 dark:bg-[var(--color-cantina-vivid)]/10"
    >
      <div className="flex-1">
        <p className="text-sm font-semibold text-[var(--color-navy)] dark:text-white">
          📦 Reponer stock — {productName}
        </p>
        <p className="text-xs text-gray-600 dark:text-gray-300">
          Stock actual: {currentStock} unidades · 1 cajón/paquete = {unitsPerCase} unidades
        </p>
      </div>
      <div className="flex items-end gap-2">
        <div>
          <label className="mb-1 block text-xs font-medium text-gray-600 dark:text-gray-300">
            Cajones/paquetes recibidos
          </label>
          <input
            name="cases"
            type="number"
            min={1}
            defaultValue={1}
            className="w-28 rounded-md border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 outline-none focus:border-[var(--color-cantina-vivid)] dark:border-gray-600 dark:bg-white/10 dark:text-white"
          />
        </div>
        <button
          type="submit"
          disabled={pending}
          className="rounded-md bg-[var(--color-cantina-vivid)] px-4 py-2 text-sm font-semibold text-white hover:brightness-95 disabled:opacity-60"
        >
          {pending ? "..." : "Sumar al stock"}
        </button>
      </div>
      {state.error && <p className="w-full text-xs text-red-600 dark:text-red-400">{state.error}</p>}
      {state.ok && <p className="w-full text-xs text-green-700 dark:text-green-400">✓ Stock actualizado</p>}
    </form>
  );
}
