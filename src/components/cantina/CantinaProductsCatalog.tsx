"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import type { CantinaProductRow } from "@/lib/cantina-dal";
import { deleteCantinaProductAction, toggleCantinaProductActiveAction } from "@/actions/cantina-products";

function formatARS(value: number) {
  return new Intl.NumberFormat("es-AR", { style: "currency", currency: "ARS" }).format(value);
}

export function CantinaProductsCatalog({
  products,
  categories,
  suppliers,
}: {
  products: CantinaProductRow[];
  categories: { id: string; name: string }[];
  suppliers: { id: string; name: string }[];
}) {
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("all");
  const [supplier, setSupplier] = useState("all");
  const [stockFilter, setStockFilter] = useState<"all" | "low" | "normal">("all");

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return products.filter((p) => {
      if (q && !p.name.toLowerCase().includes(q)) return false;
      if (category === "none" && p.categoryId) return false;
      if (category !== "all" && category !== "none" && p.categoryId !== category) return false;
      if (supplier === "none" && p.supplierId) return false;
      if (supplier !== "all" && supplier !== "none" && p.supplierId !== supplier) return false;
      if (stockFilter === "low" && !p.lowStock) return false;
      if (stockFilter === "normal" && p.lowStock) return false;
      return true;
    });
  }, [products, query, category, supplier, stockFilter]);

  const selectCls =
    "rounded-md border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 outline-none focus:border-[var(--color-cantina-vivid)] dark:border-gray-600 dark:bg-white/5 dark:text-white";

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap items-center gap-3 rounded-xl bg-white p-3 shadow-sm dark:bg-[#151833] dark:shadow-none">
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="🔎 Buscar producto…"
          className={`${selectCls} min-w-[200px] flex-1`}
        />
        <select value={category} onChange={(e) => setCategory(e.target.value)} className={selectCls}>
          <option value="all">Todas las categorías</option>
          {categories.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name}
            </option>
          ))}
          <option value="none">Sin categoría</option>
        </select>
        <select value={supplier} onChange={(e) => setSupplier(e.target.value)} className={selectCls}>
          <option value="all">Todos los proveedores</option>
          {suppliers.map((s) => (
            <option key={s.id} value={s.id}>
              {s.name}
            </option>
          ))}
          <option value="none">Sin proveedor</option>
        </select>
        <select
          value={stockFilter}
          onChange={(e) => setStockFilter(e.target.value as "all" | "low" | "normal")}
          className={selectCls}
        >
          <option value="all">Todo el stock</option>
          <option value="low">⚠️ Stock bajo</option>
          <option value="normal">Stock normal</option>
        </select>
      </div>

      <div className="overflow-x-auto rounded-xl bg-white shadow-sm dark:bg-[#151833] dark:shadow-none">
        <table className="w-full min-w-[720px] text-left text-sm">
          <thead className="bg-gray-50 text-gray-500 dark:bg-white/5 dark:text-gray-400">
            <tr>
              <th className="px-4 py-3">Producto</th>
              <th className="px-4 py-3">Categoría / Proveedor</th>
              <th className="px-4 py-3">Precio</th>
              <th className="px-4 py-3">Margen</th>
              <th className="px-4 py-3">Stock</th>
              <th className="px-4 py-3">Estado</th>
              <th className="px-4 py-3">Acciones</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 dark:divide-gray-700 dark:text-gray-200">
            {filtered.map((p) => (
              <tr key={p.id}>
                <td className="px-4 py-3">
                  <p className="font-medium text-[var(--color-navy)] dark:text-white">{p.name}</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">{p.unit}</p>
                </td>
                <td className="px-4 py-3 text-xs text-gray-500 dark:text-gray-400">
                  {p.categoryName && (
                    <span className="mr-1 rounded-full bg-[var(--color-cantina-light)] px-2 py-0.5 font-semibold text-[var(--color-navy)] dark:bg-[var(--color-cantina-vivid)]/15 dark:text-[var(--color-cantina-light)]">
                      {p.categoryName}
                    </span>
                  )}
                  {p.supplierName && <span className="block">{p.supplierName}</span>}
                </td>
                <td className="px-4 py-3">
                  {formatARS(p.price)}
                  {p.cost > 0 && (
                    <span className="block text-[11px] text-gray-400">costo {formatARS(p.cost)}</span>
                  )}
                </td>
                <td className="px-4 py-3">
                  <span
                    className={`font-semibold ${
                      p.marginAmount >= 0
                        ? "text-green-600 dark:text-green-400"
                        : "text-red-600 dark:text-red-400"
                    }`}
                  >
                    {formatARS(p.marginAmount)}
                  </span>
                  <span className="block text-[11px] text-gray-400">{p.marginPct}%</span>
                </td>
                <td className={`px-4 py-3 ${p.lowStock ? "font-semibold text-red-500" : ""}`}>
                  {p.stock}
                  {p.lowStock && <span className="ml-1" title="Necesita reposición">⚠️</span>}
                </td>
                <td className="px-4 py-3">
                  <form action={toggleCantinaProductActiveAction.bind(null, p.id, !p.active)}>
                    <button
                      type="submit"
                      className={`rounded-full px-3 py-1 text-xs font-semibold ${
                        p.active
                          ? "bg-green-100 text-green-700 dark:bg-green-500/20 dark:text-green-400"
                          : "bg-gray-200 text-gray-600 dark:bg-white/10 dark:text-gray-300"
                      }`}
                    >
                      {p.active ? "Activo" : "Oculto"}
                    </button>
                  </form>
                </td>
                <td className="px-4 py-3">
                  <div className="flex gap-2">
                    <Link
                      href={`/admin/cantina/productos/${p.id}`}
                      className="text-sm font-medium text-[var(--color-cantina-vivid)] hover:underline"
                    >
                      Editar
                    </Link>
                    <form action={deleteCantinaProductAction.bind(null, p.id)}>
                      <button
                        type="submit"
                        onClick={(e) => {
                          if (!confirm(`¿Eliminar "${p.name}"? Esta acción no se puede deshacer.`))
                            e.preventDefault();
                        }}
                        className="text-sm font-medium text-red-600 hover:underline dark:text-red-400"
                      >
                        Eliminar
                      </button>
                    </form>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {filtered.length === 0 && (
          <p className="px-4 py-6 text-center text-sm text-gray-500 dark:text-gray-400">
            No hay productos que coincidan con los filtros.
          </p>
        )}
      </div>
    </div>
  );
}
