"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useCart } from "@/contexts/CartContext";

type Variant = { id: string; size: string; stock: number };

type AddToCartFormProps = {
  productId: string;
  brand: string;
  model: string;
  price: number;
  image: string | null;
  variants: Variant[];
};

export function AddToCartForm({ productId, brand, model, price, image, variants }: AddToCartFormProps) {
  const { addItem } = useCart();
  const router = useRouter();
  const availableVariants = variants.filter((v) => v.stock > 0);
  const [variantId, setVariantId] = useState(availableVariants[0]?.id ?? "");
  const [quantity, setQuantity] = useState(1);
  const [added, setAdded] = useState(false);

  const selected = variants.find((v) => v.id === variantId);

  function handleAdd() {
    if (!selected) return;
    addItem({
      productId,
      variantId: selected.id,
      size: selected.size,
      brand,
      model,
      price,
      image,
      quantity,
      maxStock: selected.stock,
    });
    setAdded(true);
    setTimeout(() => setAdded(false), 2000);
  }

  if (availableVariants.length === 0) {
    return (
      <p className="rounded-2xl border border-white/10 bg-white/[0.03] px-4 py-3 text-sm text-[var(--color-store-muted)]">
        No quedan talles disponibles de este modelo por ahora.
      </p>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      <div>
        <p className="mb-2.5 text-xs uppercase tracking-[0.15em] text-[var(--color-store-muted)]">
          Elegí tu talle
        </p>
        <div className="flex flex-wrap gap-2">
          {variants.map((v) => (
            <button
              key={v.id}
              type="button"
              disabled={v.stock === 0}
              onClick={() => setVariantId(v.id)}
              className={`flex h-11 min-w-11 items-center justify-center rounded-full border px-3 text-sm font-medium transition-all duration-150 ${
                v.stock === 0
                  ? "cursor-not-allowed border-white/10 text-white/20 line-through"
                  : variantId === v.id
                    ? "border-white bg-white text-[var(--color-store-bg)]"
                    : "border-white/20 text-white/80 hover:border-white active:scale-95"
              }`}
            >
              {v.size}
            </button>
          ))}
        </div>
        {selected && selected.stock <= 5 && (
          <p className="mt-2.5 text-sm font-medium text-[var(--color-lilac)]">
            Solo quedan {selected.stock} pares en talle {selected.size}.
          </p>
        )}
      </div>

      <div className="flex items-center gap-3">
        <p className="text-xs uppercase tracking-[0.15em] text-[var(--color-store-muted)]">
          Cantidad
        </p>
        <div className="flex items-center rounded-full border border-white/20">
          <button
            type="button"
            onClick={() => setQuantity((q) => Math.max(1, q - 1))}
            className="px-3.5 py-1.5 text-lg text-white transition-colors hover:bg-white/10 active:scale-95"
          >
            −
          </button>
          <span className="px-3 text-white">{quantity}</span>
          <button
            type="button"
            onClick={() => setQuantity((q) => Math.min(selected?.stock ?? 1, q + 1))}
            className="px-3.5 py-1.5 text-lg text-white transition-colors hover:bg-white/10 active:scale-95"
          >
            +
          </button>
        </div>
      </div>

      <button
        type="button"
        onClick={() => {
          handleAdd();
          router.push("/carrito");
        }}
        className="rounded-full bg-white px-5 py-4 text-sm font-medium text-[var(--color-store-bg)] transition-all duration-200 hover:bg-white/85 active:scale-[0.98]"
      >
        Comprar ahora
      </button>
      <button
        type="button"
        onClick={handleAdd}
        className={`rounded-full border px-5 py-3.5 text-sm font-medium transition-all duration-200 active:scale-[0.98] ${
          added
            ? "border-[var(--color-lilac-vivid)] bg-[var(--color-lilac-vivid)] text-white"
            : "border-white/25 text-white hover:border-white"
        }`}
      >
        {added ? "¡Agregado! ✓" : "Agregar al carrito"}
      </button>
    </div>
  );
}
