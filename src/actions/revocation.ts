"use server";

import { randomInt } from "crypto";
import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import { requireAdmin } from "@/lib/auth";
import { getClientIp, rateLimit, waitText } from "@/lib/rate-limit";
import { sendMail, emailLayout, getAppUrl } from "@/lib/mailer";
import { escapeHtml, getLegalInfo, REVOCATION_DAYS } from "@/lib/legal";

export type RevocationState = {
  ok?: boolean;
  code?: string;
  emailSent?: boolean;
  error?: string;
};

const CODE_ALPHABET = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789"; // sin 0/O ni 1/I

function newCode(): string {
  const d = new Date();
  const ymd = `${d.getFullYear()}${String(d.getMonth() + 1).padStart(2, "0")}${String(d.getDate()).padStart(2, "0")}`;
  let suffix = "";
  for (let i = 0; i < 5; i++) suffix += CODE_ALPHABET[randomInt(CODE_ALPHABET.length)];
  return `ARR-${ymd}-${suffix}`;
}

function field(formData: FormData, name: string, max: number): string {
  return String(formData.get(name) ?? "").trim().slice(0, max);
}

/**
 * Botón de arrepentimiento (Res. 424/2020 SCI): sin registro previo. Devuelve
 * el código de identificación en el momento (mismo medio) y además lo envía
 * por email. Nunca tira errores: los devuelve como dato.
 */
export async function submitRevocationAction(
  _prev: RevocationState,
  formData: FormData
): Promise<RevocationState> {
  try {
    const ip = await getClientIp();
    const rl = rateLimit(`revocation:${ip}`, 5, 60 * 60 * 1000);
    if (!rl.ok) return { error: `Demasiadas solicitudes seguidas. Probá de nuevo en ${waitText(rl.retryAfterSec)}.` };

    const name = field(formData, "name", 120);
    const email = field(formData, "email", 160).toLowerCase();
    const phone = field(formData, "phone", 40);
    const dni = field(formData, "dni", 20);
    const orderRef = field(formData, "orderRef", 40).replace(/^#/, "");
    const details = field(formData, "details", 1000);

    if (name.length < 2) return { error: "Escribí tu nombre y apellido." };
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email)) return { error: "Revisá el email: parece incompleto." };
    if (phone.replace(/\D/g, "").length < 8) return { error: "Revisá el teléfono: poné código de área y número." };

    // Si el número de pedido coincide con uno del sistema y con el mismo email,
    // lo vinculamos para encontrarlo rápido desde el panel.
    let orderId: string | null = null;
    if (orderRef.length >= 6) {
      const order = await db.order.findFirst({
        where: { id: { endsWith: orderRef.toLowerCase() } },
        select: { id: true, email: true },
      });
      if (order && order.email.trim().toLowerCase() === email) orderId = order.id;
    }

    let code = newCode();
    for (let i = 0; i < 5; i++) {
      const exists = await db.revocationRequest.findUnique({ where: { code } });
      if (!exists) break;
      code = newCode();
    }

    await db.revocationRequest.create({
      data: { code, name, email, phone, dni, orderRef, orderId, details },
    });

    const info = await getLegalInfo();
    const safe = {
      name: escapeHtml(name),
      email: escapeHtml(email),
      phone: escapeHtml(phone),
      dni: escapeHtml(dni || "—"),
      orderRef: escapeHtml(orderRef || "—"),
      details: escapeHtml(details || "—").replace(/\n/g, "<br/>"),
    };

    const customerHtml = emailLayout(
      "Recibimos tu solicitud de arrepentimiento",
      `<p>Hola ${safe.name}, registramos tu solicitud para revocar tu compra.</p>
       <p>Tu código de identificación es:</p>
       <p style="font-size:24px;font-weight:bold;letter-spacing:2px;color:#8b6dff;margin:12px 0;">${code}</p>
       <p>Pedido indicado: <strong>${safe.orderRef}</strong></p>
       <p>En breve te contactamos para coordinar la devolución, que no tiene costo para vos, y el reintegro del dinero.
       Recordá que tenés ${REVOCATION_DAYS} días corridos desde que recibiste el producto para ejercer este derecho.</p>
       <p style="color:#8b8fa3;font-size:13px;">Detalle de la política: <a href="${getAppUrl()}/legales/cambios-y-devoluciones" style="color:#8b6dff;">Cambios y devoluciones</a></p>`
    );
    const emailSent = await sendMail({
      to: email,
      subject: `Código de arrepentimiento ${code} — Benito Sneakers`,
      html: customerHtml,
    });

    const adminTo = process.env.NOTIFY_EMAIL_TO?.trim() || info.email;
    if (adminTo) {
      const adminHtml = emailLayout(
        `Nuevo arrepentimiento ${code}`,
        `<p><strong>Nombre:</strong> ${safe.name}<br/>
         <strong>Email:</strong> ${safe.email}<br/>
         <strong>Teléfono:</strong> ${safe.phone}<br/>
         <strong>DNI:</strong> ${safe.dni}<br/>
         <strong>Pedido:</strong> ${safe.orderRef}${orderId ? " (encontrado en el sistema)" : ""}</p>
         <p><strong>Comentarios:</strong><br/>${safe.details}</p>
         <p>Gestionalo desde <a href="${getAppUrl()}/admin/arrepentimientos" style="color:#8b6dff;">Admin › Arrepentimientos</a>.</p>`
      );
      await sendMail({ to: adminTo, subject: `Nuevo arrepentimiento ${code}`, html: adminHtml });
    }

    revalidatePath("/admin/arrepentimientos");
    return { ok: true, code, emailSent };
  } catch (err) {
    console.error("[revocation] error:", err);
    return { error: "No pudimos registrar la solicitud. Probá de nuevo o escribinos por WhatsApp." };
  }
}

const STATUSES = ["PENDIENTE", "EN_CURSO", "RESUELTO", "RECHAZADO"] as const;

export async function updateRevocationAction(formData: FormData): Promise<void> {
  await requireAdmin();
  const id = String(formData.get("id") ?? "");
  const status = String(formData.get("status") ?? "");
  const adminNote = String(formData.get("adminNote") ?? "").trim().slice(0, 1000);
  if (!id || !STATUSES.includes(status as (typeof STATUSES)[number])) return;
  await db.revocationRequest.update({ where: { id }, data: { status, adminNote } });
  revalidatePath("/admin/arrepentimientos");
}
