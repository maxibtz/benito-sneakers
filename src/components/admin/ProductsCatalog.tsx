"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import type { ProductWithStats } from "@/lib/dal";
import { deleteProductAction, toggleProductActiveAction } from "@/actions/products";

function formatARS(value: number) {
  return new Intl.NumberFormat("es-AR", { style: "currency", currency: "ARS" }).format(value);
}

type SortKey = "recent" | "sold" | "profit" | "lowstock";

export function ProductsCatalog({
  products,
  sections,
}: {
  products: ProductWithStats[];
  sections: { id: string; name: string }[];
}) {
  const [query, setQuery] = useState("");
  const [section, setSection] = useState<string>("all");
  const [status, setStatus] = useState<"all" | "active" | "hidden">("all");
  const [sort, setSort] = useState<SortKey>("recent");

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    let list = products.filter((p) => {
      if (q) {
        const hay = `${p.brand} ${p.model} ${p.sku}`.toLowerCase();
        if (!hay.includes(q)) return false;
      }
      if (section === "none" && p.sectionId) return false;
      if (section !== "all" && section !== "none" && p.sectionId !== section) return false;
      if (status === "active" && !p.active) return false;
      if (status === "hidden" && p.active) return false;
      return true;
    });
    list = list.slice();
    if (sort === "sold") list.sort((a, b) => b.unitsSold - a.unitsSold);
    else if (sort === "profit") list.sort((a, b) => b.profit - a.profit);
    else if (sort === "lowstock") list.sort((a, b) => a.totalStock - b.totalStock);
    return list;
  }, [products, query, section, status, sort]);

  // Totales del listado FILTRADO (se actualizan con los filtros).
  const totals = useMemo(() => {
    return filtered.reduce(
      (acc, p) => {
        acc.count += 1;
        acc.stock += p.totalStock;
        acc.inventory += p.inventoryValue;
        acc.units += p.unitsSold;
        acc.revenue += p.revenue;
        acc.profit += p.profit;
        return acc;
      },
      { count: 0, stock: 0, inventory: 0, units: 0, revenue: 0, profit: 0 }
    );
  }, [filtered]);

  const selectCls =
    "rounded-md border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 outline-none focus:border-[var(--color-navy)] dark:border-gray-600 dark:bg-white/5 dark:text-white";

  return (
    <div className="flex flex-col gap-4">
      {/* Filtros */}
      <div className="flex flex-wrap items-center gap-3 rounded-xl bg-white p-3 shadow-sm dark:bg-[#151833] dark:shadow-none">
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="🔎 Buscar por marca, modelo o SKU…"
          className={`${selectCls} min-w-[220px] flex-1`}
        />
        <select value={section} onChange={(e) => setSection(e.target.value)} className={selectCls}>
          <option value="all">Todas las secciones</option>
          {sections.map((s) => (
            <option key={s.id} value={s.id}>
              {s.name}
            </option>
          ))}
          <option value="none">Sin sección</option>
        </select>
        <select
          value={status}
          onChange={(e) => setStatus(e.target.value as "all" | "active" | "hidden")}
          className={selectCls}
        >
          <option value="all">Todos</option>
          <option value="active">Activos</option>
          <option value="hidden">Ocultos</option>
        </select>
        <select value={sort} onChange={(e) => setSort(e.target.value as SortKey)} className={selectCls}>
          <option value="recent">Más recientes</option>
          <option value="sold">Más vendidos</option>
          <option value="profit">Más rentables</option>
          <option value="lowstock">Menos stock</option>
        </select>
      </div>

      {/* Tabla */}
      <div className="overflow-x-auto rounded-xl bg-white shadow-sm dark:bg-[#151833] dark:shadow-none">
        <table className="w-full text-left text-sm">
          <thead className="bg-gray-50 text-gray-500 dark:bg-white/5 dark:text-gray-400">
            <tr>
              <th className="px-4 py-3">Producto</th>
              <th className="px-4 py-3">Precio</th>
              <th className="px-4 py-3">Stock</th>
              <th className="px-4 py-3">Vendidos</th>
              <th className="px-4 py-3">Ingresos</th>
              <th className="px-4 py-3">Ganancia</th>
              <th className="px-4 py-3">Estado</th>
              <th className="px-4 py-3">Acciones</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 dark:divide-gray-700 dark:text-gray-200">
            {filtered.map((p) => (
              <tr key={p.id}>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-3">
                    {p.image ? (
                      <Image
                        src={p.image}
                        alt={p.model}
                        width={44}
                        height={44}
                        className="h-11 w-11 rounded-md object-cover"
                      />
                    ) : (
                      <div className="h-11 w-11 rounded-md bg-gray-100 dark:bg-white/10" />
                    )}
                    <div>
                      <p className="font-medium text-[var(--color-navy)] dark:text-white">
                        {p.brand} {p.model}
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        {p.sku}
                        {p.sectionName && (
                          <span className="ml-2 rounded-full bg-[var(--color-lilac-light)] px-2 py-0.5 text-[10px] font-semibold text-[var(--color-navy)] dark:bg-[var(--color-lilac)]/20 dark:text-[var(--color-lilac-light)]">
                            {p.sectionName}
                          </span>
                        )}
                      </p>
                    </div>
                  </div>
                </td>
                <td className="px-4 py-3">
                  {p.salePrice ? (
                    <span className="flex flex-col">
                      <span className="text-xs text-gray-400 line-through">{formatARS(p.price)}</span>
                      <span className="font-semibold text-green-600 dark:text-green-400">
                        {formatARS(p.salePrice)}
                      </span>
                    </span>
                  ) : (
                    formatARS(p.price)
                  )}
                  {p.cost > 0 && (
                    <span className="block text-[11px] text-gray-400">costo {formatARS(p.cost)}</span>
                  )}
                </td>
                <td className={`px-4 py-3 ${p.totalStock === 0 ? "text-red-500" : ""}`}>
                  {p.totalStock}
                </td>
                <td className="px-4 py-3 font-medium">{p.unitsSold}</td>
                <td className="px-4 py-3">{formatARS(p.revenue)}</td>
                <td className="px-4 py-3">
                  <span
                    className={`font-semibold ${
                      p.profit >= 0
                        ? "text-green-600 dark:text-green-400"
                        : "text-red-600 dark:text-red-400"
                    }`}
                  >
                    {formatARS(p.profit)}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <form action={toggleProductActiveAction.bind(null, p.id, !p.active)}>
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
                      href={`/admin/productos/${p.id}`}
                      className="text-sm font-medium text-[var(--color-navy)] hover:underline dark:text-[var(--color-lilac-light)]"
                    >
                      Editar
                    </Link>
                    <form action={deleteProductAction.bind(null, p.id)}>
                      <button
                        type="submit"
                        onClick={(e) => {
                          if (!confirm(`¿Eliminar ${p.brand} ${p.model}? Esta acción no se puede deshacer.`))
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

      {/* Mini-dashboard del listado filtrado */}
      <div>
        <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">
          Resumen de lo filtrado ({totals.count} producto{totals.count === 1 ? "" : "s"})
        </p>
        <div className="grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-6">
          <Stat label="Stock total" value={String(totals.stock)} />
          <Stat label="Valor inventario" value={formatARS(totals.inventory)} hint="a costo" />
          <Stat label="Unidades vendidas" value={String(totals.units)} />
          <Stat label="Ingresos" value={formatARS(totals.revenue)} />
          <Stat
            label="Ganancia"
            value={formatARS(totals.profit)}
            positive={totals.profit >= 0}
          />
          <Stat
            label="Margen"
            value={`${totals.revenue > 0 ? Math.round((totals.profit / totals.revenue) * 100) : 0}%`}
          />
        </div>
      </div>
    </div>
  );
}

function Stat({
  label,
  value,
  hint,
  positive,
}: {
  label: string;
  value: string;
  hint?: string;
  positive?: boolean;
}) {
  return (
    <div className="rounded-xl bg-white p-3 shadow-sm dark:bg-[#151833] dark:shadow-none">
      <p className="text-xs text-gray-500 dark:text-gray-400">{label}</p>
      <p
        className={`text-lg font-bold ${
          positive === undefined
            ? "text-[var(--color-navy)] dark:text-white"
            : positive
              ? "text-green-600 dark:text-green-400"
              : "text-red-600 dark:text-red-400"
        }`}
      >
        {value}
      </p>
      {hint && <p className="text-[10px] text-gray-400">{hint}</p>}
    </div>
  );
}
