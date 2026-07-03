"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { requireAdmin } from "@/lib/auth";
import { getCustomerSession } from "@/lib/customer-auth";
import { notifyNewOrder } from "@/lib/notify";
import { evaluateCoupon } from "@/lib/coupon";
import { getShippingConfig } from "@/lib/dal";
import { computeShipping, canPickup, type ShippingMethod } from "@/lib/shipping";
import { sendTrackingEmail } from "@/lib/emails";
import { rateLimit, waitText } from "@/lib/rate-limit";
import type { OrderStatus, PaymentMethod } from "@/generated/prisma/enums";

export type TrackingState = { ok?: boolean; error?: string; sent?: boolean };

export async function setTrackingAction(
  orderId: string,
  _prev: TrackingState,
  formData: FormData
): Promise<TrackingState> {
  await requireAdmin();
  const trackingCode = String(formData.get("trackingCode") ?? "").trim();
  if (!trackingCode) return { error: "Ingresá el código de seguimiento." };

  const order = await db.order.findUnique({ where: { id: orderId } });
  if (!order) return { error: "Pedido no encontrado." };

  let sent = false;
  if (order.email) {
    sent = await sendTrackingEmail(order.email, order.customerName, order.id, trackingCode);
  }

  await db.order.update({
    where: { id: orderId },
    data: { trackingCode, trackingSentAt: sent ? new Date() : order.trackingSentAt },
  });

  revalidatePath(`/admin/pedidos/${orderId}`);
  return {
    ok: true,
    sent,
    error: sent
      ? undefined
      : "Se guardó el código, pero el email no se envió (revisá la configuración de Email en Ajustes).",
  };
}

export type OrderActionState = { error?: string };

export async function updateOrderStatusAction(
  id: string,
  status: OrderStatus,
  _prevState: OrderActionState,
  _formData: FormData
): Promise<OrderActionState> {
  await requireAdmin();
  try {
    await db.$transaction(async (tx) => {
      const order = await tx.order.findUnique({ where: { id }, include: { items: true } });
      if (!order) throw new Error("Pedido no encontrado.");
      if (order.status === status) return;

      const becomingCancelled = status === "CANCELADO" && order.status !== "CANCELADO";
      const leavingCancelled = order.status === "CANCELADO" && status !== "CANCELADO";

      if (becomingCancelled) {
        for (const item of order.items) {
          await tx.variant.update({
            where: { id: item.variantId },
            data: { stock: { increment: item.quantity } },
          });
        }
      }

      if (leavingCancelled) {
        for (const item of order.items) {
          const variant = await tx.variant.findUnique({ where: { id: item.variantId } });
          if (!variant || variant.stock < item.quantity) {
            throw new Error(
              "No se puede reactivar: ya no hay stock suficiente de ese talle. Liberá stock de otro producto o dejá el pedido cancelado."
            );
          }
        }
        for (const item of order.items) {
          await tx.variant.update({
            where: { id: item.variantId },
            data: { stock: { decrement: item.quantity } },
          });
        }
      }

      await tx.order.update({ where: { id }, data: { status } });
    });
  } catch (err) {
    return { error: err instanceof Error ? err.message : "No se pudo actualizar el pedido." };
  }

  revalidatePath("/admin/pedidos");
  revalidatePath(`/admin/pedidos/${id}`);
  return {};
}

export async function deleteOrderAction(id: string) {
  await requireAdmin();
  await db.$transaction(async (tx) => {
    const order = await tx.order.findUnique({ where: { id }, include: { items: true } });
    if (!order) return;

    if (order.status !== "CANCELADO") {
      for (const item of order.items) {
        await tx.variant.update({
          where: { id: item.variantId },
          data: { stock: { increment: item.quantity } },
        });
      }
    }

    await tx.order.delete({ where: { id } });
  });

  revalidatePath("/admin/pedidos");
  redirect("/admin/pedidos");
}

export type CreateOrderInput = {
  customerId?: string | null;
  customerName: string;
  email: string;
  phone: string;
  street: string;
  streetNumber: string;
  floorApt?: string;
  city: string;
  province: string;
  postalCode: string;
  dni: string;
  paymentMethod: PaymentMethod;
  shippingMethod?: ShippingMethod;
  couponCode?: string;
  items: { productId: string; variantId: string; quantity: number; unitPrice: number }[];
};

export async function createOrderAction(input: CreateOrderInput) {
  // El cliente debe estar logueado; tomamos su id de la sesión (no del cliente).
  const session = await getCustomerSession();
  if (!session) {
    throw new Error("Tenés que iniciar sesión para comprar.");
  }
  const customerId = session.customerId;

  // Anti-abuso: máx 5 pedidos cada 10 minutos por cuenta.
  const rl = rateLimit(`order:${customerId}`, 5, 10 * 60 * 1000);
  if (!rl.ok) {
    throw new Error(`Demasiados pedidos seguidos. Probá de nuevo en ${waitText(rl.retryAfterSec)}.`);
  }

  if (!Array.isArray(input.items) || input.items.length === 0 || input.items.length > 50) {
    throw new Error("El carrito es inválido.");
  }

  // SEGURIDAD: los precios se leen SIEMPRE de la base de datos.
  // Nunca confiamos en el unitPrice que manda el navegador.
  const variantIds = input.items.map((i) => i.variantId);
  const variants = await db.variant.findMany({
    where: { id: { in: variantIds } },
    include: { product: true },
  });
  const variantById = new Map(variants.map((v) => [v.id, v]));

  const items = input.items.map((raw) => {
    const variant = variantById.get(raw.variantId);
    if (!variant || variant.productId !== raw.productId || !variant.product.active) {
      throw new Error("Hay un producto inválido en el carrito. Actualizá la página.");
    }
    const quantity = Math.floor(Number(raw.quantity));
    if (!Number.isFinite(quantity) || quantity < 1 || quantity > 99) {
      throw new Error("Cantidad inválida en el carrito.");
    }
    const p = variant.product;
    const unitPrice = p.salePrice && p.salePrice < p.price ? p.salePrice : p.price;
    return { productId: p.id, variantId: variant.id, quantity, unitPrice };
  });

  const subtotal = items.reduce((sum, item) => sum + item.unitPrice * item.quantity, 0);

  // Re-validate coupon on the server — never trust the client for the discount.
  const coupon = input.couponCode ? await evaluateCoupon(input.couponCode) : null;
  const discount = coupon ? Math.round(subtotal * (coupon.discountPercent / 100)) : 0;
  const afterDiscount = Math.max(0, subtotal - discount);

  // Recalcular el envío en el servidor — nunca confiar en el cliente.
  const shippingConfig = await getShippingConfig();
  const shippingMethod: ShippingMethod =
    input.shippingMethod === "pickup" && canPickup(shippingConfig, input.province)
      ? "pickup"
      : "delivery";
  const shippingCost = computeShipping(
    shippingConfig,
    input.province,
    afterDiscount,
    shippingMethod
  );
  const total = afterDiscount + shippingCost;

  const order = await db.$transaction(async (tx) => {
    for (const item of items) {
      const variant = await tx.variant.findUnique({ where: { id: item.variantId } });
      if (!variant || variant.stock < item.quantity) {
        throw new Error(`Sin stock suficiente para el talle seleccionado.`);
      }
    }

    const created = await tx.order.create({
      data: {
        customerId,
        customerName: input.customerName,
        email: input.email,
        phone: input.phone,
        street: input.street,
        streetNumber: input.streetNumber,
        floorApt: input.floorApt,
        city: input.city,
        province: input.province,
        postalCode: input.postalCode,
        dni: input.dni,
        total,
        discount,
        shippingCost,
        shippingMethod,
        couponCode: coupon ? coupon.code : null,
        paymentMethod: input.paymentMethod,
        items: {
          create: items.map((item) => ({
            productId: item.productId,
            variantId: item.variantId,
            quantity: item.quantity,
            unitPrice: item.unitPrice,
          })),
        },
      },
      include: { items: { include: { product: true } } },
    });

    for (const item of items) {
      await tx.variant.update({
        where: { id: item.variantId },
        data: { stock: { decrement: item.quantity } },
      });
    }

    return created;
  });

  const itemsSummary = order.items
    .map((item) => `- ${item.product.brand} ${item.product.model} x${item.quantity}`)
    .join("\n");

  await notifyNewOrder({
    id: order.id,
    customerName: order.customerName,
    phone: order.phone,
    total: order.total,
    itemsSummary,
  });

  revalidatePath("/admin/pedidos");
  return order;
}
