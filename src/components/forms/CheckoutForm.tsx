"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useCart } from "@/contexts/CartContext";
import { createOrderAction } from "@/actions/orders";
import { createMpPreferenceAction } from "@/actions/mercadopago";
import { validateCouponAction } from "@/actions/coupon";
import {
  AR_PROVINCES,
  computeShipping,
  canPickup,
  type ShippingConfig,
  type ShippingMethod,
} from "@/lib/shipping";

function formatARS(value: number) {
  return new Intl.NumberFormat("es-AR", { style: "currency", currency: "ARS" }).format(value);
}

const PAYMENT_OPTIONS = [
  { value: "MERCADOPAGO", label: "Mercado Pago (online)" },
  { value: "TRANSFERENCIA", label: "Transferencia bancaria" },
  { value: "EFECTIVO", label: "Efectivo" },
  { value: "LINK_TARJETA", label: "Link de pago con tarjeta" },
  { value: "PAGO_FACIL_RAPIPAGO", label: "Pago Fácil / Rapipago" },
] as const;

type CheckoutFormProps = {
  customerId: string;
  defaultName?: string;
  defaultEmail?: string;
  defaultPhone?: string;
  transferAlias?: string;
  shipping: ShippingConfig;
};

export function CheckoutForm({
  customerId,
  defaultName = "",
  defaultEmail = "",
  defaultPhone = "",
  transferAlias = "",
  shipping,
}: CheckoutFormProps) {
  const { items, totalPrice, clearCart } = useCart();
  const router = useRouter();
  const [paymentMethod, setPaymentMethod] =
    useState<(typeof PAYMENT_OPTIONS)[number]["value"]>("MERCADOPAGO");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [province, setProvince] = useState("");
  const [shippingMethod, setShippingMethod] = useState<ShippingMethod>("delivery");

  const [couponInput, setCouponInput] = useState("");
  const [coupon, setCoupon] = useState<{ code: string; discountPercent: number } | null>(null);
  const [couponMsg, setCouponMsg] = useState<string | null>(null);
  const [checkingCoupon, setCheckingCoupon] = useState(false);

  const discount = coupon ? Math.round(totalPrice * (coupon.discountPercent / 100)) : 0;
  const afterDiscount = Math.max(0, totalPrice - discount);

  const pickupAllowed = canPickup(shipping, province);
  const effectiveMethod: ShippingMethod = pickupAllowed ? shippingMethod : "delivery";
  const shippingCost = computeShipping(shipping, province, afterDiscount, effectiveMethod);
  const freeByThreshold =
    effectiveMethod === "delivery" &&
    shipping.freeThreshold > 0 &&
    afterDiscount >= shipping.freeThreshold;
  const finalTotal = afterDiscount + shippingCost;

  async function applyCoupon() {
    setCouponMsg(null);
    if (!couponInput.trim()) return;
    setCheckingCoupon(true);
    try {
      const res = await validateCouponAction(couponInput);
      if (res.ok) {
        setCoupon({ code: res.code, discountPercent: res.discountPercent });
        setCouponMsg(`✓ Cupón ${res.code} aplicado: ${res.discountPercent}% off`);
      } else {
        setCoupon(null);
        setCouponMsg(res.error);
      }
    } finally {
      setCheckingCoupon(false);
    }
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);

    if (!province) {
      setError("Elegí tu provincia para calcular el envío.");
      return;
    }
    setSubmitting(true);

    const formData = new FormData(e.currentTarget);
    try {
      const order = await createOrderAction({
        customerId,
        customerName: String(formData.get("customerName")),
        email: String(formData.get("email")),
        phone: String(formData.get("phone")),
        street: String(formData.get("street")),
        streetNumber: String(formData.get("streetNumber")),
        floorApt: String(formData.get("floorApt") || ""),
        city: String(formData.get("city")),
        province,
        postalCode: String(formData.get("postalCode")),
        dni: String(formData.get("dni")),
        paymentMethod,
        shippingMethod: effectiveMethod,
        couponCode: coupon?.code,
        items: items.map((i) => ({
          productId: i.productId,
          variantId: i.variantId,
          quantity: i.quantity,
          unitPrice: i.price,
        })),
      });

      // Si paga con Mercado Pago, generamos el link y lo mandamos a pagar.
      if (paymentMethod === "MERCADOPAGO") {
        const pref = await createMpPreferenceAction(order.id);
        if (pref.ok) {
          clearCart();
          window.location.href = pref.initPoint;
          return;
        }
        // Si MP no está configurado, no perdemos el pedido: lo confirmamos igual.
        setError(
          `${pref.error} Tu pedido quedó registrado (#${order.id.slice(-6)}); te contactamos para coordinar el pago.`
        );
        clearCart();
        router.push(`/pedido-confirmado/${order.id}`);
        return;
      }

      clearCart();
      router.push(`/pedido-confirmado/${order.id}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "No pudimos procesar el pedido.");
    } finally {
      setSubmitting(false);
    }
  }

  if (items.length === 0) {
    return <p className="text-sm text-[var(--color-store-muted)]">Tu carrito está vacío.</p>;
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-5">
      <div className="grid grid-cols-2 gap-4">
        <Input label="Nombre completo" name="customerName" required defaultValue={defaultName} />
        <Input label="Teléfono / WhatsApp" name="phone" required defaultValue={defaultPhone} />
      </div>

      <Input label="Email" name="email" type="email" required defaultValue={defaultEmail} />

      <div className="grid grid-cols-3 gap-4">
        <Input label="Calle" name="street" required />
        <Input label="Número" name="streetNumber" required />
        <Input label="Piso/Depto (opcional)" name="floorApt" />
      </div>

      <div className="grid grid-cols-3 gap-4">
        <Input label="Ciudad" name="city" required />
        <div className="flex flex-col gap-1">
          <label htmlFor="province" className="text-sm text-[var(--color-store-muted)]">
            Provincia
          </label>
          <select
            id="province"
            name="province"
            required
            value={province}
            onChange={(e) => setProvince(e.target.value)}
            className="rounded-xl border border-white/15 bg-white/5 px-3.5 py-2.5 text-white outline-none transition-colors focus:border-white"
          >
            <option value="" className="text-black">Elegí…</option>
            {AR_PROVINCES.map((p) => (
              <option key={p} value={p} className="text-black">
                {p}
              </option>
            ))}
          </select>
        </div>
        <Input label="Código postal" name="postalCode" required />
      </div>

      <Input label="DNI" name="dni" required />

      {/* Método de envío */}
      <div>
        <p className="mb-2.5 text-xs uppercase tracking-[0.15em] text-[var(--color-store-muted)]">
          Envío
        </p>
        {!province ? (
          <p className="rounded-xl border border-white/10 bg-white/[0.03] px-4 py-3 text-sm text-[var(--color-store-muted)]">
            Elegí tu provincia para ver el costo de envío.
          </p>
        ) : (
          <div className="flex flex-col gap-2">
            <label className="flex cursor-pointer items-center justify-between gap-2.5 rounded-xl border border-white/12 px-4 py-3 text-sm text-white/85 transition-colors has-[:checked]:border-white has-[:checked]:bg-white/5">
              <span className="flex items-center gap-2.5">
                <input
                  type="radio"
                  name="shippingMethod"
                  checked={effectiveMethod === "delivery"}
                  onChange={() => setShippingMethod("delivery")}
                  className="accent-[var(--color-lilac-vivid)]"
                />
                Envío a domicilio ({province})
              </span>
              <span className="font-medium text-white">
                {freeByThreshold ? "Gratis" : formatARS(computeShipping(shipping, province, afterDiscount, "delivery"))}
              </span>
            </label>
            {pickupAllowed && (
              <label className="flex cursor-pointer items-center justify-between gap-2.5 rounded-xl border border-white/12 px-4 py-3 text-sm text-white/85 transition-colors has-[:checked]:border-white has-[:checked]:bg-white/5">
                <span className="flex items-center gap-2.5">
                  <input
                    type="radio"
                    name="shippingMethod"
                    checked={effectiveMethod === "pickup"}
                    onChange={() => setShippingMethod("pickup")}
                    className="accent-[var(--color-lilac-vivid)]"
                  />
                  Retiro en persona
                </span>
                <span className="font-medium text-green-400">Gratis</span>
              </label>
            )}
            {effectiveMethod === "pickup" && shipping.pickupNote && (
              <p className="rounded-xl border border-white/10 bg-white/[0.03] px-4 py-2.5 text-xs text-[var(--color-store-muted)]">
                {shipping.pickupNote}
              </p>
            )}
            {effectiveMethod === "delivery" && shipping.freeThreshold > 0 && !freeByThreshold && (
              <p className="text-xs text-[var(--color-store-muted)]">
                ¡Envío gratis en compras desde {formatARS(shipping.freeThreshold)}!
              </p>
            )}
          </div>
        )}
      </div>

      <div>
        <p className="mb-2.5 text-xs uppercase tracking-[0.15em] text-[var(--color-store-muted)]">
          Método de pago
        </p>
        <div className="flex flex-col gap-2">
          {PAYMENT_OPTIONS.map((opt) => (
            <label
              key={opt.value}
              className="flex cursor-pointer items-center gap-2.5 rounded-xl border border-white/12 px-4 py-3 text-sm text-white/85 transition-colors has-[:checked]:border-white has-[:checked]:bg-white/5"
            >
              <input
                type="radio"
                name="paymentMethod"
                value={opt.value}
                checked={paymentMethod === opt.value}
                onChange={() => setPaymentMethod(opt.value)}
                className="accent-[var(--color-lilac-vivid)]"
              />
              {opt.label}
            </label>
          ))}
        </div>
        {paymentMethod === "TRANSFERENCIA" && transferAlias && (
          <p className="mt-3 rounded-xl border border-white/10 bg-white/[0.03] px-4 py-3 text-sm text-[var(--color-store-muted)]">
            Alias para transferir: <strong className="text-white">{transferAlias}</strong>. Te
            vamos a contactar para confirmar el pago.
          </p>
        )}
        {paymentMethod === "MERCADOPAGO" && (
          <p className="mt-3 rounded-xl border border-white/10 bg-white/[0.03] px-4 py-3 text-sm text-[var(--color-store-muted)]">
            Al confirmar te llevamos a Mercado Pago para pagar de forma segura (tarjeta, dinero en
            cuenta o cuotas). Volvés solo a la tienda al terminar.
          </p>
        )}
      </div>

      {/* Coupon */}
      <div>
        <p className="mb-2.5 text-xs uppercase tracking-[0.15em] text-[var(--color-store-muted)]">
          ¿Tenés un cupón?
        </p>
        <div className="flex gap-2">
          <input
            value={couponInput}
            onChange={(e) => setCouponInput(e.target.value)}
            placeholder="Código de cupón"
            className="flex-1 rounded-xl border border-white/15 bg-white/5 px-3.5 py-2.5 uppercase text-white outline-none transition-colors focus:border-white"
          />
          <button
            type="button"
            onClick={applyCoupon}
            disabled={checkingCoupon}
            className="rounded-xl border border-white/25 px-4 text-sm font-medium text-white transition hover:border-white disabled:opacity-60"
          >
            {checkingCoupon ? "..." : "Aplicar"}
          </button>
        </div>
        {couponMsg && (
          <p
            className={`mt-2 text-sm ${
              coupon ? "text-green-400" : "text-red-400"
            }`}
          >
            {couponMsg}
          </p>
        )}
      </div>

      {error && <p className="text-sm text-red-400">{error}</p>}

      <div className="flex flex-col gap-2 rounded-2xl border border-white/10 bg-white/[0.03] p-5">
        <div className="flex items-center justify-between text-sm text-[var(--color-store-muted)]">
          <span>Subtotal</span>
          <span>{formatARS(totalPrice)}</span>
        </div>
        {coupon && (
          <div className="flex items-center justify-between text-sm text-green-400">
            <span>Descuento ({coupon.code} · {coupon.discountPercent}%)</span>
            <span>−{formatARS(discount)}</span>
          </div>
        )}
        <div className="flex items-center justify-between text-sm text-[var(--color-store-muted)]">
          <span>
            {effectiveMethod === "pickup" ? "Retiro en persona" : "Envío"}
            {province ? ` (${province})` : ""}
          </span>
          <span>
            {!province
              ? "—"
              : shippingCost === 0
                ? "Gratis"
                : formatARS(shippingCost)}
          </span>
        </div>
        <div className="mt-1 flex items-center justify-between border-t border-white/10 pt-3">
          <span className="text-[var(--color-store-muted)]">Total a pagar</span>
          <span className="text-xl font-medium text-white">{formatARS(finalTotal)}</span>
        </div>
      </div>

      <button
        type="submit"
        disabled={submitting}
        className="rounded-full bg-white px-5 py-4 text-sm font-medium text-[var(--color-store-bg)] transition-all duration-200 hover:bg-white/85 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-60"
      >
        {submitting
          ? "Procesando..."
          : paymentMethod === "MERCADOPAGO"
            ? "Pagar con Mercado Pago"
            : "Confirmar pedido"}
      </button>
    </form>
  );
}

function Input({
  label,
  name,
  required,
  type = "text",
  defaultValue,
}: {
  label: string;
  name: string;
  required?: boolean;
  type?: string;
  defaultValue?: string;
}) {
  return (
    <div className="flex flex-col gap-1">
      <label htmlFor={name} className="text-sm text-[var(--color-store-muted)]">
        {label}
      </label>
      <input
        id={name}
        name={name}
        type={type}
        required={required}
        defaultValue={defaultValue}
        className="rounded-xl border border-white/15 bg-white/5 px-3.5 py-2.5 text-white outline-none transition-colors focus:border-white"
      />
    </div>
  );
}
