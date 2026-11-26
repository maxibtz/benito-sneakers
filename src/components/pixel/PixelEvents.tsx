"use client";

import { useEffect, useRef } from "react";
import { PIXEL_CURRENCY, trackPixel } from "@/lib/meta-pixel";
import { useCart } from "@/contexts/CartContext";

/** "Ver producto" — en la página de cada producto. */
export function TrackViewContent({
  productId,
  name,
  price,
}: {
  productId: string;
  name: string;
  price: number;
}) {
  useEffect(() => {
    trackPixel("ViewContent", {
      content_ids: [productId],
      content_type: "product",
      content_name: name,
      value: price,
      currency: PIXEL_CURRENCY,
    });
  }, [productId, name, price]);
  return null;
}

/** "Iniciar compra" — al entrar al checkout con productos en el carrito. */
export function TrackInitiateCheckout() {
  const { items, totalItems, totalPrice } = useCart();
  const sent = useRef(false);
  useEffect(() => {
    if (sent.current || items.length === 0) return;
    sent.current = true;
    trackPixel("InitiateCheckout", {
      content_ids: [...new Set(items.map((i) => i.productId))],
      content_type: "product",
      num_items: totalItems,
      value: totalPrice,
      currency: PIXEL_CURRENCY,
    });
  }, [items, totalItems, totalPrice]);
  return null;
}

/**
 * "Compra" — en la página de pedido confirmado. Se envía una sola vez por
 * pedido (aunque recarguen la página) y con el ID del pedido para que Meta
 * no la duplique.
 */
export function TrackPurchase({
  orderId,
  value,
  productIds,
  numItems,
}: {
  orderId: string;
  value: number;
  productIds: string[];
  numItems: number;
}) {
  useEffect(() => {
    const key = `benito-px-purchase-${orderId}`;
    try {
      if (localStorage.getItem(key)) return;
    } catch {}
    trackPixel(
      "Purchase",
      {
        content_ids: productIds,
        content_type: "product",
        num_items: numItems,
        value,
        currency: PIXEL_CURRENCY,
      },
      `purchase-${orderId}`
    );
    try {
      localStorage.setItem(key, "1");
    } catch {}
  }, [orderId, value, productIds, numItems]);
  return null;
}
