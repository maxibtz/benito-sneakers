"use client";

import Link from "next/link";
import { useCart } from "@/contexts/CartContext";

export function CartButton() {
  const { totalItems } = useCart();

  return (
    <Link
      href="/carrito"
      className="relative flex items-center gap-2 rounded-full bg-white px-4 py-2 text-sm font-medium text-[var(--color-store-bg)] transition-all duration-200 hover:bg-white/85 active:scale-95"
    >
      <span aria-hidden>🛒</span> Carrito
      {totalItems > 0 && (
        <span
          key={totalItems}
          className="absolute -right-1.5 -top-1.5 flex h-5 w-5 animate-[pop_0.25s_ease-out] items-center justify-center rounded-full bg-[var(--color-lilac-vivid)] text-xs font-bold text-white"
        >
          {totalItems}
        </span>
      )}
    </Link>
  );
}
