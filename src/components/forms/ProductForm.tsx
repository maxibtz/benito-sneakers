"use client";

import { useActionState, useState } from "react";
import type { ProductFormState } from "@/actions/products";

type ProductFormProps = {
  action: (state: ProductFormState, formData: FormData) => Promise<ProductFormState>;
  sections: { id: string; name: string }[];
  defaultValues?: {
    brand: string;
    model: string;
    description: string;
    sectionId: string | null;
    sku: string;
    price: number;
    salePrice: number | null;
    costItems: { name: string; amount: number }[];
    active: boolean;
    variants: { size: string; stock: number }[];
  };
  submitLabel: string;
};

function formatARS(value: number) {
  return new Intl.NumberFormat("es-AR", { style: "currency", currency: "ARS" }).format(value);
}

export function ProductForm({ action, sections, defaultValues, submitLabel }: ProductFormProps) {
  const [state, formAction, isPending] = useActionState(action, {});

  const [price, setPrice] = useState<string>(defaultValues?.price?.toString() ?? "");
  const [salePrice, setSalePrice] = useState<string>(
    defaultValues?.salePrice != null ? String(defaultValues.salePrice) : ""
  );
  const [costItems, setCostItems] = useState<{ name: string; amount: string }[]>(
    defaultValues && defaultValues.costItems.length > 0
      ? defaultValues.costItems.map((it) => ({ name: it.name, amount: String(it.amount) }))
      : [{ name: "Compra", amount: "" }]
  );

  const priceN = Number(price) || 0;
  const saleN = Number(salePrice) || 0;
  const costN = costItems.reduce((sum, it) => sum + (Number(it.amount) || 0), 0);

  function updateCostItem(i: number, key: "name" | "amount", value: string) {
    setCostItems((prev) => {
      const next = prev.slice();
      next[i] = { ...next[i], [key]: value };
      return next;
    });
  }
  function addCostItem() {
    setCostItems((prev) => [...prev, { name: "", amount: "" }]);
  }
  function removeCostItem(i: number) {
    setCostItems((prev) => prev.filter((_, idx) => idx !== i));
  }
  // Precio al que realmente se vende: el promocional si es válido, si no el real.
  const effectivePrice = saleN > 0 && saleN < priceN ? saleN : priceN;
  const profit = costN > 0 && effectivePrice > 0 ? effectivePrice - costN : null;
  const marginPct =
    profit != null && effectivePrice > 0 ? Math.round((profit / effectivePrice) * 100) : null;
  const markupPct = profit != null && costN > 0 ? Math.round((profit / costN) * 100) : null;

  const variantsText = defaultValues?.variants
    .map((v) => `${v.size}, ${v.stock}`)
    .join("\n");

  // Si hubo error, el server nos devuelve lo cargado (state.values) para no perderlo.
  const ev = state.values;
  const dvBrand = ev?.brand ?? defaultValues?.brand;
  const dvModel = ev?.model ?? defaultValues?.model;
  const dvDescription = ev?.description ?? defaultValues?.description;
  const dvSku = ev?.sku ?? defaultValues?.sku;
  const dvSectionId = ev?.sectionId ?? defaultValues?.sectionId ?? "";
  const dvVariants = ev?.variants ?? variantsText;
  const dvActive = ev?.active ?? defaultValues?.active ?? true;

  return (
    <form action={formAction} className="flex max-w-2xl flex-col gap-5">
      {state.error && (
        <div className="rounded-lg border border-red-300 bg-red-50 px-4 py-3 text-sm font-medium text-red-700 dark:border-red-500/40 dark:bg-red-500/10 dark:text-red-300">
          ⚠️ {state.error}
        </div>
      )}
      <div className="grid grid-cols-2 gap-4">
        <Field label="Marca" name="brand" defaultValue={dvBrand} required />
        <Field label="Modelo" name="model" defaultValue={dvModel} required />
      </div>

      <Field
        label="Descripción"
        name="description"
        defaultValue={dvDescription}
        textarea
        required
      />

      <div className="grid grid-cols-2 gap-4">
        <div className="flex flex-col gap-1">
          <label htmlFor="sectionId" className="text-sm font-medium text-[var(--color-navy)] dark:text-gray-200">
            Sección
          </label>
          <select
            id="sectionId"
            name="sectionId"
            defaultValue={dvSectionId}
            className="rounded-md border border-gray-300 bg-white px-3 py-2 text-gray-900 outline-none focus:border-[var(--color-navy)] dark:border-gray-600 dark:bg-white/5 dark:text-white"
          >
            <option value="">— Sin sección —</option>
            {sections.map((s) => (
              <option key={s.id} value={s.id}>
                {s.name}
              </option>
            ))}
          </select>
          {sections.length === 0 && (
            <span className="text-xs text-amber-600 dark:text-amber-400">
              Creá secciones en el menú “Secciones”.
            </span>
          )}
        </div>
        <Field label="SKU" name="sku" defaultValue={dvSku} required />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <Field
          label="Precio real (ARS)"
          name="price"
          type="number"
          step="0.01"
          value={price}
          onChange={setPrice}
          required
        />
        <Field
          label="Precio promocional (ARS)"
          name="salePrice"
          type="number"
          step="0.01"
          value={salePrice}
          onChange={setSalePrice}
        />
      </div>
      <p className="-mt-2 text-xs text-gray-500 dark:text-gray-400">
        Si cargás un precio promocional menor al real, en la tienda se muestra el precio real
        tachado y el promocional destacado.
      </p>

      {/* Costos — lista desplegable */}
      <div className="rounded-lg border border-gray-200 bg-gray-50 p-4 dark:border-white/10 dark:bg-white/5">
        <input type="hidden" name="costBreakdown" value={JSON.stringify(
          costItems.map((it) => ({ name: it.name, amount: Number(it.amount) || 0 }))
        )} />
        <div className="mb-2 flex items-center justify-between">
          <div>
            <p className="text-sm font-semibold text-[var(--color-navy)] dark:text-gray-200">
              Costos
            </p>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              Sumá todos tus costos (compra, flete, pase, envío…). El total es el costo del producto.
            </p>
          </div>
          <div className="text-right">
            <p className="text-xs text-gray-500 dark:text-gray-400">Costo total</p>
            <p className="text-lg font-bold text-[var(--color-navy)] dark:text-white">
              {formatARS(costN)}
            </p>
          </div>
        </div>

        <div className="flex flex-col gap-2">
          {costItems.map((it, i) => (
            <div key={i} className="flex items-center gap-2">
              <input
                value={it.name}
                onChange={(e) => updateCostItem(i, "name", e.target.value)}
                placeholder="Concepto (ej: Flete)"
                className="flex-1 rounded-md border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 outline-none focus:border-[var(--color-navy)] dark:border-gray-600 dark:bg-white/5 dark:text-white"
              />
              <input
                value={it.amount}
                onChange={(e) => updateCostItem(i, "amount", e.target.value)}
                type="number"
                step="0.01"
                placeholder="$"
                className="w-32 rounded-md border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 outline-none focus:border-[var(--color-navy)] dark:border-gray-600 dark:bg-white/5 dark:text-white"
              />
              <button
                type="button"
                onClick={() => removeCostItem(i)}
                className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10"
                aria-label="Quitar costo"
              >
                ✕
              </button>
            </div>
          ))}
        </div>

        <button
          type="button"
          onClick={addCostItem}
          className="mt-3 w-fit rounded-md border border-dashed border-[var(--color-navy)] px-3 py-1.5 text-sm font-medium text-[var(--color-navy)] hover:bg-[var(--color-lilac-light)] dark:border-[var(--color-lilac)] dark:text-[var(--color-lilac-light)] dark:hover:bg-[var(--color-lilac)]/10"
        >
          + Agregar costo
        </button>
        <p className="mt-2 text-xs text-gray-500 dark:text-gray-400">
          Los costos son privados (solo para tus métricas de ganancia) y nunca se muestran en la
          tienda.
        </p>
      </div>

      {/* Margen en vivo */}
      <div className="rounded-lg border border-gray-200 bg-gray-50 p-4 dark:border-white/10 dark:bg-white/5">
        <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">
          Ganancia estimada por unidad
        </p>
        {profit == null ? (
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Cargá el costo y el precio para ver la ganancia.
          </p>
        ) : (
          <div className="flex flex-wrap items-end gap-x-6 gap-y-2">
            <div>
              <p
                className={`text-2xl font-bold ${
                  profit >= 0
                    ? "text-green-600 dark:text-green-400"
                    : "text-red-600 dark:text-red-400"
                }`}
              >
                {formatARS(profit)}
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                vendiendo a {formatARS(effectivePrice)}
                {saleN > 0 && saleN < priceN ? " (promo)" : ""}
              </p>
            </div>
            <div className="flex gap-2">
              {marginPct != null && (
                <span className="rounded-full bg-green-100 px-3 py-1 text-xs font-semibold text-green-700 dark:bg-green-500/20 dark:text-green-400">
                  Margen {marginPct}%
                </span>
              )}
              {markupPct != null && (
                <span className="rounded-full bg-[var(--color-lilac-light)] px-3 py-1 text-xs font-semibold text-[var(--color-navy)] dark:bg-[var(--color-lilac)]/20 dark:text-[var(--color-lilac-light)]">
                  Markup {markupPct}%
                </span>
              )}
            </div>
          </div>
        )}
      </div>

      <div className="flex flex-col gap-1">
        <label htmlFor="variants" className="text-sm font-medium text-[var(--color-navy)] dark:text-gray-200">
          Talles y stock (uno por línea: <code>talle, stock</code>)
        </label>
        <textarea
          id="variants"
          name="variants"
          rows={6}
          required
          defaultValue={dvVariants}
          placeholder={"38, 5\n39, 3\n40, 8"}
          className="rounded-md border border-gray-300 bg-white px-3 py-2 font-mono text-sm text-gray-900 outline-none focus:border-[var(--color-navy)] dark:border-gray-600 dark:bg-white/5 dark:text-white"
        />
      </div>

      <div className="flex flex-col gap-1">
        <label htmlFor="images" className="text-sm font-medium text-[var(--color-navy)] dark:text-gray-200">
          Imágenes {defaultValues ? "(se agregan a las existentes)" : ""}
        </label>
        <input
          id="images"
          name="images"
          type="file"
          accept="image/*"
          multiple
          className="rounded-md border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 dark:border-gray-600 dark:bg-white/5 dark:text-white"
        />
      </div>

      <label className="flex items-center gap-2 text-sm text-[var(--color-navy)] dark:text-gray-200">
        <input
          type="checkbox"
          name="active"
          defaultChecked={dvActive}
          className="h-4 w-4"
        />
        Producto visible en la tienda
      </label>

      {state.error && <p className="text-sm text-red-600 dark:text-red-400">{state.error}</p>}

      <button
        type="submit"
        disabled={isPending}
        className="w-fit rounded-md bg-[var(--color-navy)] px-5 py-2 font-semibold text-white hover:bg-[var(--color-navy-light)] disabled:opacity-60"
      >
        {isPending ? "Guardando..." : submitLabel}
      </button>
    </form>
  );
}

function Field({
  label,
  name,
  defaultValue,
  value,
  onChange,
  type = "text",
  step,
  required,
  textarea,
}: {
  label: string;
  name: string;
  defaultValue?: string | number;
  value?: string;
  onChange?: (value: string) => void;
  type?: string;
  step?: string;
  required?: boolean;
  textarea?: boolean;
}) {
  const controlled = onChange !== undefined;
  return (
    <div className="flex flex-col gap-1">
      <label htmlFor={name} className="text-sm font-medium text-[var(--color-navy)] dark:text-gray-200">
        {label}
      </label>
      {textarea ? (
        <textarea
          id={name}
          name={name}
          defaultValue={defaultValue as string}
          required={required}
          rows={3}
          className="rounded-md border border-gray-300 bg-white px-3 py-2 text-gray-900 outline-none focus:border-[var(--color-navy)] dark:border-gray-600 dark:bg-white/5 dark:text-white"
        />
      ) : (
        <input
          id={name}
          name={name}
          type={type}
          step={step}
          {...(controlled
            ? { value, onChange: (e) => onChange!(e.target.value) }
            : { defaultValue })}
          required={required}
          className="rounded-md border border-gray-300 bg-white px-3 py-2 text-gray-900 outline-none focus:border-[var(--color-navy)] dark:border-gray-600 dark:bg-white/5 dark:text-white"
        />
      )}
    </div>
  );
}
