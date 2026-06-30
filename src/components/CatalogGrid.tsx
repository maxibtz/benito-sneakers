"use client";

import { useMemo, useState } from "react";
import { ProductCard } from "@/components/ProductCard";

export type CatalogItem = {
  id: string;
  brand: string;
  model: string;
  price: number;
  salePrice: number | null;
  image: string | null;
  totalStock: number;
  section: string | null;
};

export function CatalogGrid({ products }: { products: CatalogItem[] }) {
  const [query, setQuery] = useState("");
  const [brand, setBrand] = useState<string>("todas");
  const [section, setSection] = useState<string>("todas");

  const sections = useMemo(() => {
    const set = new Set(products.map((p) => p.section).filter(Boolean) as string[]);
    return ["todas", ...Array.from(set)];
  }, [products]);

  const brands = useMemo(() => {
    const set = new Set(products.map((p) => p.brand));
    return ["todas", ...Array.from(set).sort()];
  }, [products]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return products.filter((p) => {
      const matchesSection = section === "todas" || p.section === section;
      const matchesBrand = brand === "todas" || p.brand === brand;
      const matchesQuery =
        !q ||
        p.model.toLowerCase().includes(q) ||
        p.brand.toLowerCase().includes(q);
      return matchesSection && matchesBrand && matchesQuery;
    });
  }, [products, query, brand, section]);

  return (
    <div>
      <div className="mb-8 flex flex-col gap-4">
        {/* Secciones (filtro principal) */}
        {sections.length > 2 && (
          <div className="flex flex-wrap gap-2">
            {sections.map((s) => (
              <button
                key={s}
                type="button"
                onClick={() => setSection(s)}
                className={`rounded-full px-5 py-2 text-sm font-medium capitalize transition-all ${
                  section === s
                    ? "bg-[var(--color-lilac-vivid)] text-white"
                    : "bg-white/5 text-white/70 hover:bg-white/10 hover:text-white"
                }`}
              >
                {s === "todas" ? "Todas las secciones" : s}
              </button>
            ))}
          </div>
        )}

        <div className="relative">
          <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-[var(--color-store-muted)]">
            🔍
          </span>
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Buscar por modelo o marca…"
            className="w-full rounded-full border border-white/15 bg-white/5 py-3 pl-11 pr-4 text-white outline-none transition-colors placeholder:text-[var(--color-store-muted)] focus:border-white"
          />
        </div>

        <div className="flex flex-wrap gap-2">
          {brands.map((b) => (
            <button
              key={b}
              type="button"
              onClick={() => setBrand(b)}
              className={`rounded-full border px-4 py-1.5 text-sm capitalize transition-all ${
                brand === b
                  ? "border-white bg-white text-[var(--color-store-bg)]"
                  : "border-white/20 text-white/70 hover:border-white hover:text-white"
              }`}
            >
              {b}
            </button>
          ))}
        </div>
      </div>

      {filtered.length === 0 ? (
        <p className="py-16 text-center text-[var(--color-store-muted)]">
          No encontramos modelos con ese filtro. Probá otra búsqueda.
        </p>
      ) : (
        <div className="grid grid-cols-2 gap-x-2 gap-y-6 sm:grid-cols-3 lg:grid-cols-4">
          {filtered.map((p) => (
            <ProductCard
              key={p.id}
              id={p.id}
              brand={p.brand}
              model={p.model}
              price={p.price}
              salePrice={p.salePrice}
              image={p.image}
              totalStock={p.totalStock}
            />
          ))}
        </div>
      )}
    </div>
  );
}
