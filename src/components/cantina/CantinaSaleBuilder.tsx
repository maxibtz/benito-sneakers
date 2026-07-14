"use client";

import { useMemo, useState } from "react";
import { createCantinaSaleAction } from "@/actions/cantina-sales";

function formatARS(value: number) {
  return new Intl.NumberFormat("es-AR", { style: "currency", currency: "ARS" }).format(value);
}

type SaleProduct = {
  id: string;
  name: string;
  price: number;
  stock: number;
  unit: string;
  categoryId: string | null;
  categoryName: string | null;
};

type PaymentMethod = "EFECTIVO" | "TRANSFERENCIA" | "TARJETA";

const PAYMENT_OPTIONS: { value: PaymentMethod; label: string; emoji: string }[] = [
  { value: "EFECTIVO", label: "Efectivo", emoji: "💵" },
  { value: "TRANSFERENCIA", label: "Transferencia", emoji: "📲" },
  { value: "TARJETA", label: "Tarjeta", emoji: "💳" },
];

export function CantinaSaleBuilder({
  products,
  categories,
}: {
  products: SaleProduct[];
  categories: { id: string; name: string }[];
}) {
  const [localProducts, setLocalProducts] = useState(products);
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("all");
  const [cart, setCart] = useState<Record<string, number>>({});
  const [payment, setPayment] = useState<PaymentMethod>("EFECTIVO");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [cartOpen, setCartOpen] = useState(false);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return localProducts.filter((p) => {
      if (q && !p.name.toLowerCase().includes(q)) return false;
      if (category !== "all" && p.categoryId !== category) return false;
      return true;
    });
  }, [localProducts, query, category]);

  const productById = useMemo(() => new Map(localProducts.map((p) => [p.id, p])), [localProducts]);

  const cartLines = Object.entries(cart)
    .map(([productId, qty]) => ({ product: productById.get(productId), qty }))
    .filter((l) => l.product && l.qty > 0) as { product: SaleProduct; qty: number }[];

  const totalItems = cartLines.reduce((s, l) => s + l.qty, 0);
  const total = cartLines.reduce((s, l) => s + l.product.price * l.qty, 0);

  function addOne(product: SaleProduct) {
    setError(null);
    setSuccess(null);
    setCart((prev) => {
      const current = prev[product.id] ?? 0;
      if (current >= product.stock) return prev; // sin stock suficiente
      return { ...prev, [product.id]: current + 1 };
    });
  }

  function changeQty(productId: string, delta: number) {
    setCart((prev) => {
      const product = productById.get(productId);
      const next = Math.max(0, (prev[productId] ?? 0) + delta);
      const clamped = product ? Math.min(next, product.stock) : next;
      const copy = { ...prev };
      if (clamped <= 0) delete copy[productId];
      else copy[productId] = clamped;
      return copy;
    });
  }

  async function handleCharge() {
    if (cartLines.length === 0) return;
    setSubmitting(true);
    setError(null);
    try {
      await createCantinaSaleAction({
        paymentMethod: payment,
        items: cartLines.map((l) => ({ productId: l.product.id, quantity: l.qty })),
      });
      // Reflejamos el descuento de stock localmente (sin recargar la página).
      setLocalProducts((prev) =>
        prev.map((p) => {
          const sold = cart[p.id] ?? 0;
          return sold > 0 ? { ...p, stock: Math.max(0, p.stock - sold) } : p;
        })
      );
      setSuccess(`✓ Venta cargada: ${formatARS(total)}`);
      setCart({});
      setCartOpen(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : "No pudimos cargar la venta. Probá de nuevo.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="flex flex-col gap-4 pb-28">
      {success && (
        <div className="rounded-lg border border-green-300 bg-green-50 px-4 py-3 text-sm font-medium text-green-700 dark:border-green-500/40 dark:bg-green-500/10 dark:text-green-300">
          {success}
        </div>
      )}
      {error && (
        <div className="rounded-lg border border-red-300 bg-red-50 px-4 py-3 text-sm font-medium text-red-700 dark:border-red-500/40 dark:bg-red-500/10 dark:text-red-300">
          ⚠️ {error}
        </div>
      )}

      {/* Buscador */}
      <input
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="🔎 Buscar producto…"
        className="rounded-xl border border-gray-300 bg-white px-4 py-3 text-base text-gray-900 outline-none focus:border-[var(--color-cantina-vivid)] dark:border-gray-600 dark:bg-white/5 dark:text-white"
      />

      {/* Chips de categoría */}
      <div className="flex gap-2 overflow-x-auto pb-1">
        <button
          type="button"
          onClick={() => setCategory("all")}
          className={`shrink-0 rounded-full px-4 py-2 text-sm font-semibold transition ${
            category === "all"
              ? "bg-[var(--color-cantina-vivid)] text-white"
              : "bg-white text-gray-600 shadow-sm dark:bg-[#151833] dark:text-gray-300"
          }`}
        >
          Todas
        </button>
        {categories.map((c) => (
          <button
            key={c.id}
            type="button"
            onClick={() => setCategory(c.id)}
            className={`shrink-0 rounded-full px-4 py-2 text-sm font-semibold transition ${
              category === c.id
                ? "bg-[var(--color-cantina-vivid)] text-white"
                : "bg-white text-gray-600 shadow-sm dark:bg-[#151833] dark:text-gray-300"
            }`}
          >
            {c.name}
          </button>
        ))}
      </div>

      {/* Grilla de productos: un toque = agrega 1 unidad */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
        {filtered.map((p) => {
          const qty = cart[p.id] ?? 0;
          const noStock = p.stock <= 0;
          const maxedOut = qty >= p.stock;
          return (
            <button
              key={p.id}
              type="button"
              onClick={() => addOne(p)}
              disabled={noStock || maxedOut}
              className={`relative flex flex-col items-start gap-1 rounded-xl border p-3 text-left shadow-sm transition active:scale-95 disabled:cursor-not-allowed disabled:opacity-50 ${
                qty > 0
                  ? "border-[var(--color-cantina-vivid)] bg-[var(--color-cantina-light)] dark:bg-[var(--color-cantina-vivid)]/15"
                  : "border-transparent bg-white dark:bg-[#151833]"
              }`}
            >
              {qty > 0 && (
                <span className="absolute -right-2 -top-2 flex h-6 w-6 items-center justify-center rounded-full bg-[var(--color-cantina-vivid)] text-xs font-bold text-white">
                  {qty}
                </span>
              )}
              <span className="text-sm font-semibold text-[var(--color-navy)] dark:text-white">
                {p.name}
              </span>
              <span className="text-base font-bold text-[var(--color-cantina-vivid)]">
                {formatARS(p.price)}
              </span>
              <span className={`text-xs ${noStock ? "font-semibold text-red-500" : "text-gray-400"}`}>
                {noStock ? "Sin stock" : `Stock: ${p.stock} ${p.unit}`}
              </span>
            </button>
          );
        })}
        {filtered.length === 0 && (
          <p className="col-span-full py-8 text-center text-sm text-gray-500 dark:text-gray-400">
            No hay productos que coincidan.
          </p>
        )}
      </div>

      {/* Barra de cobro, fija abajo */}
      <div className="fixed inset-x-0 bottom-0 z-30 border-t border-gray-200 bg-white p-3 shadow-[0_-4px_16px_rgba(0,0,0,0.08)] dark:border-gray-700 dark:bg-[#151833] lg:left-64">
        {cartOpen && cartLines.length > 0 && (
          <div className="mb-3 max-h-56 overflow-y-auto rounded-lg border border-gray-100 dark:border-gray-700">
            {cartLines.map((l) => (
              <div
                key={l.product.id}
                className="flex items-center justify-between gap-2 border-b border-gray-100 px-3 py-2 last:border-0 dark:border-gray-700"
              >
                <span className="flex-1 text-sm text-[var(--color-navy)] dark:text-white">
                  {l.product.name}
                </span>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => changeQty(l.product.id, -1)}
                    className="flex h-7 w-7 items-center justify-center rounded-full bg-gray-100 text-gray-700 dark:bg-white/10 dark:text-white"
                  >
                    −
                  </button>
                  <span className="w-6 text-center text-sm font-semibold">{l.qty}</span>
                  <button
                    type="button"
                    onClick={() => changeQty(l.product.id, 1)}
                    disabled={l.qty >= l.product.stock}
                    className="flex h-7 w-7 items-center justify-center rounded-full bg-gray-100 text-gray-700 disabled:opacity-40 dark:bg-white/10 dark:text-white"
                  >
                    +
                  </button>
                </div>
                <span className="w-20 text-right text-sm font-semibold text-[var(--color-navy)] dark:text-white">
                  {formatARS(l.product.price * l.qty)}
                </span>
              </div>
            ))}
          </div>
        )}

        <div className="mb-2 flex gap-2">
          {PAYMENT_OPTIONS.map((opt) => (
            <button
              key={opt.value}
              type="button"
              onClick={() => setPayment(opt.value)}
              className={`flex-1 rounded-lg px-2 py-2 text-xs font-semibold transition ${
                payment === opt.value
                  ? "bg-[var(--color-cantina-vivid)] text-white"
                  : "bg-gray-100 text-gray-600 dark:bg-white/10 dark:text-gray-300"
              }`}
            >
              {opt.emoji} {opt.label}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setCartOpen((o) => !o)}
            disabled={cartLines.length === 0}
            className="flex flex-col items-start rounded-lg px-3 py-2 text-left disabled:opacity-50"
          >
            <span className="text-xs text-gray-500 dark:text-gray-400">
              {totalItems} ítem{totalItems === 1 ? "" : "s"} {cartLines.length > 0 ? (cartOpen ? "▲" : "▼") : ""}
            </span>
            <span className="text-lg font-bold text-[var(--color-navy)] dark:text-white">
              {formatARS(total)}
            </span>
          </button>
          <button
            type="button"
            onClick={handleCharge}
            disabled={cartLines.length === 0 || submitting}
            className="flex-1 rounded-lg bg-[var(--color-cantina-vivid)] py-3 text-base font-bold text-white hover:brightness-95 disabled:opacity-50"
          >
            {submitting ? "Cobrando..." : `Cobrar ${formatARS(total)}`}
          </button>
        </div>
      </div>
    </div>
  );
}
