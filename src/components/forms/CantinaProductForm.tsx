"use client";

import { useActionState } from "react";
import {
  createCantinaProductAction,
  updateCantinaProductAction,
  type CantinaProductFormState,
} from "@/actions/cantina-products";

const initial: CantinaProductFormState = {};

const inputClass =
  "w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 outline-none focus:border-[var(--color-cantina-vivid)] dark:border-gray-600 dark:bg-white/5 dark:text-white";
const labelClass = "mb-1 block text-xs font-medium text-gray-500 dark:text-gray-400";

const UNIT_PRESETS = ["unidad", "pack", "litro", "kg", "botella", "lata"];

export type CantinaProductFormProduct = {
  id: string;
  name: string;
  categoryId: string | null;
  supplierId: string | null;
  cost: number;
  price: number;
  stock: number;
  minStock: number;
  unit: string;
  active: boolean;
};

export function CantinaProductForm({
  categories,
  suppliers,
  product,
}: {
  categories: { id: string; name: string }[];
  suppliers: { id: string; name: string }[];
  product?: CantinaProductFormProduct;
}) {
  const boundAction = product
    ? updateCantinaProductAction.bind(null, product.id)
    : createCantinaProductAction;
  const [state, action, pending] = useActionState(boundAction, initial);

  return (
    <form
      action={action}
      className="flex flex-col gap-5 rounded-xl bg-white p-6 shadow-sm dark:bg-[#151833] dark:shadow-none"
    >
      {state.error && (
        <div className="rounded-lg border border-red-300 bg-red-50 px-4 py-3 text-sm font-medium text-red-700 dark:border-red-500/40 dark:bg-red-500/10 dark:text-red-300">
          ⚠️ {state.error}
        </div>
      )}

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className={labelClass}>Nombre *</label>
          <input
            name="name"
            defaultValue={product?.name}
            placeholder="Ej: Coca-Cola 500ml"
            className={inputClass}
          />
        </div>
        <div>
          <label className={labelClass}>Categoría</label>
          <select name="categoryId" defaultValue={product?.categoryId ?? ""} className={inputClass}>
            <option value="">Sin categoría</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className={labelClass}>Proveedor</label>
          <select name="supplierId" defaultValue={product?.supplierId ?? ""} className={inputClass}>
            <option value="">Sin proveedor</option>
            {suppliers.map((s) => (
              <option key={s.id} value={s.id}>
                {s.name}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className={labelClass}>Unidad de medida</label>
          <input
            name="unit"
            defaultValue={product?.unit ?? "unidad"}
            list="cantina-units"
            className={inputClass}
          />
          <datalist id="cantina-units">
            {UNIT_PRESETS.map((u) => (
              <option key={u} value={u} />
            ))}
          </datalist>
        </div>
        <div>
          <label className={labelClass}>Costo de adquisición</label>
          <input
            name="cost"
            type="number"
            min={0}
            step="0.01"
            defaultValue={product?.cost}
            placeholder="$"
            className={inputClass}
          />
        </div>
        <div>
          <label className={labelClass}>Precio de venta *</label>
          <input
            name="price"
            type="number"
            min={0}
            step="0.01"
            defaultValue={product?.price}
            placeholder="$"
            className={inputClass}
          />
        </div>
        <div>
          <label className={labelClass}>Stock actual</label>
          <input
            name="stock"
            type="number"
            min={0}
            defaultValue={product?.stock ?? 0}
            className={inputClass}
          />
        </div>
        <div>
          <label className={labelClass}>Stock mínimo (alerta de reposición)</label>
          <input
            name="minStock"
            type="number"
            min={0}
            defaultValue={product?.minStock ?? 0}
            className={inputClass}
          />
        </div>
      </div>

      <label className="flex w-fit items-center gap-2 text-sm text-gray-700 dark:text-gray-300">
        <input
          type="checkbox"
          name="active"
          defaultChecked={product?.active ?? true}
          className="h-4 w-4 accent-[var(--color-cantina-vivid)]"
        />
        Producto activo (visible para vender)
      </label>

      <button
        type="submit"
        disabled={pending}
        className="w-fit rounded-md bg-[var(--color-cantina-vivid)] px-6 py-2.5 font-semibold text-white hover:brightness-95 disabled:opacity-60"
      >
        {pending ? "Guardando..." : product ? "Guardar cambios" : "Crear producto"}
      </button>
    </form>
  );
}
