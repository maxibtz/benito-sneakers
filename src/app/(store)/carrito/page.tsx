"use client";

import Link from "next/link";
import Image from "next/image";
import { useCart } from "@/contexts/CartContext";

function formatARS(value: number) {
  return new Intl.NumberFormat("es-AR", { style: "currency", currency: "ARS" }).format(value);
}

export default function CartPage() {
  const { items, updateQuantity, removeItem, totalPrice } = useCart();

  if (items.length === 0) {
    return (
      <div className="flex flex-col items-center gap-5 px-6 py-24 text-center">
        <p className="text-lg text-white">Tu carrito está vacío</p>
        <Link
          href="/"
          className="rounded-full bg-white px-6 py-3 text-sm font-medium text-[var(--color-store-bg)] transition hover:bg-white/85"
        >
          Ver catálogo
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto flex max-w-3xl flex-col gap-6 px-5 py-12 sm:px-8">
      <h1 className="font-display text-3xl font-medium tracking-tight text-white">Tu carrito</h1>

      <ul className="flex flex-col divide-y divide-white/10 rounded-2xl border border-white/10 bg-[var(--color-store-surface)]">
        {items.map((item) => (
          <li key={item.variantId} className="flex items-center gap-4 p-4">
            <div className="relative h-16 w-16 shrink-0">
              {item.image ? (
                <Image
                  src={item.image}
                  alt={item.model}
                  fill
                  className="shoe-blend object-cover"
                />
              ) : null}
            </div>
            <div className="flex-1">
              <p className="font-medium text-white">
                {item.brand} {item.model}
              </p>
              <p className="text-sm text-[var(--color-store-muted)]">Talle {item.size}</p>
              <p className="text-sm text-white/85">{formatARS(item.price)}</p>
            </div>
            <div className="flex items-center rounded-full border border-white/20">
              <button
                onClick={() => updateQuantity(item.variantId, item.quantity - 1)}
                className="px-3 py-1 text-lg text-white transition-colors hover:bg-white/10 active:scale-95"
              >
                −
              </button>
              <span className="px-3 text-white">{item.quantity}</span>
              <button
                onClick={() => updateQuantity(item.variantId, item.quantity + 1)}
                className="px-3 py-1 text-lg text-white transition-colors hover:bg-white/10 active:scale-95"
              >
                +
              </button>
            </div>
            <button
              onClick={() => removeItem(item.variantId)}
              className="text-sm text-[var(--color-store-muted)] transition-colors hover:text-white"
            >
              Quitar
            </button>
          </li>
        ))}
      </ul>

      <div className="flex items-center justify-between rounded-2xl border border-white/10 bg-[var(--color-store-surface)] p-5">
        <span className="text-[var(--color-store-muted)]">Total</span>
        <span className="text-xl font-medium text-white">{formatARS(totalPrice)}</span>
      </div>

      <Link
        href="/checkout"
        className="rounded-full bg-white px-5 py-4 text-center text-sm font-medium text-[var(--color-store-bg)] transition-all duration-200 hover:bg-white/85 active:scale-[0.98]"
      >
        Finalizar compra
      </Link>
    </div>
  );
}
