import { sendMail, emailLayout, button, getAppUrl } from "@/lib/mailer";

export async function sendVerificationEmail(to: string, name: string, code: string) {
  const html = emailLayout(
    "Confirmá tu correo",
    `<p>¡Hola ${name}! Gracias por crear tu cuenta en Benito Sneakers.</p>
     <p>Tu código de verificación es:</p>
     <p style="font-size:30px;font-weight:bold;letter-spacing:6px;color:#8b6dff;margin:12px 0;">${code}</p>
     <p style="color:#8b8fa3;font-size:13px;">Ingresalo en tu cuenta para confirmar tu correo. Si no fuiste vos, ignorá este mensaje.</p>`
  );
  return sendMail({ to, subject: "Tu código de verificación — Benito Sneakers", html });
}

export async function sendPasswordResetEmail(to: string, name: string, token: string) {
  const link = `${getAppUrl()}/restablecer?token=${token}`;
  const html = emailLayout(
    "Recuperá tu contraseña",
    `<p>Hola ${name},</p>
     <p>Recibimos un pedido para restablecer la contraseña de tu cuenta. Tocá el botón para crear una nueva:</p>
     <p>${button(link, "Crear nueva contraseña")}</p>
     <p style="color:#8b8fa3;font-size:13px;">Este link vence en 1 hora. Si no lo pediste, ignorá este mensaje y tu contraseña queda igual.</p>`
  );
  return sendMail({ to, subject: "Recuperá tu contraseña — Benito Sneakers", html });
}

export async function sendPaymentReceivedEmail(
  to: string,
  name: string,
  orderId: string,
  total: number
) {
  const link = `${getAppUrl()}/pedido-confirmado/${orderId}`;
  const totalFmt = new Intl.NumberFormat("es-AR", {
    style: "currency",
    currency: "ARS",
  }).format(total);
  const html = emailLayout(
    "¡Recibimos tu pago! ✅",
    `<p>Hola ${name}, te confirmamos que <strong>recibimos el pago</strong> de tu pedido <strong>#${orderId.slice(-8)}</strong> por <strong>${totalFmt}</strong>.</p>
     <p>Ya estamos preparando tu paquete. En cuanto lo despachemos, <strong>nos vamos a poner en contacto para pasarte el número de guía</strong> y que puedas seguirlo hasta tu puerta.</p>
     <p>Mientras tanto, podés ver el estado de tu compra acá:</p>
     <p>${button(link, "Ver mi pedido")}</p>
     <p style="color:#8b8fa3;font-size:13px;">¿Dudas? Respondé este correo o escribinos por WhatsApp. Gracias por confiar en Benito Sneakers 💜</p>`
  );
  return sendMail({ to, subject: "Recibimos tu pago ✅ — Benito Sneakers", html });
}

export async function sendTrackingEmail(
  to: string,
  name: string,
  orderId: string,
  trackingCode: string
) {
  const link = `${getAppUrl()}/pedido-confirmado/${orderId}`;
  const html = emailLayout(
    "¡Tu pedido va en camino! 📦",
    `<p>Hola ${name}, ya despachamos tu pedido <strong>#${orderId.slice(-8)}</strong>.</p>
     <p>Tu código de seguimiento del correo es:</p>
     <p style="font-size:22px;font-weight:bold;color:#8b6dff;margin:12px 0;">${trackingCode}</p>
     <p>Podés seguir el estado de tu compra acá:</p>
     <p>${button(link, "Ver mi pedido")}</p>`
  );
  return sendMail({ to, subject: "Tu pedido fue despachado — Benito Sneakers", html });
}

/**
 * Confirmación al cliente apenas hace el pedido. Si paga por transferencia,
 * incluye alias, total y cómo mandar el comprobante. También recuerda el
 * derecho de arrepentimiento (CCyC art. 1111).
 */
export async function sendOrderConfirmationEmail(opts: {
  to: string;
  name: string;
  orderId: string;
  total: number;
  paymentMethod: string;
  items: { label: string; quantity: number; unitPrice: number }[];
  transferAlias: string;
  whatsappLink: string | null;
}) {
  const esc = (v: string) =>
    v.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
  const fmt = (v: number) =>
    new Intl.NumberFormat("es-AR", { style: "currency", currency: "ARS" }).format(v);
  const link = `${getAppUrl()}/pedido-confirmado/${opts.orderId}`;
  const shortId = opts.orderId.slice(-8);

  const itemsHtml = opts.items
    .map(
      (i) =>
        `<tr><td style="padding:6px 0;">${esc(i.label)} × ${i.quantity}</td><td style="padding:6px 0;text-align:right;">${fmt(i.unitPrice * i.quantity)}</td></tr>`
    )
    .join("");

  const paymentHtml =
    opts.paymentMethod === "TRANSFERENCIA"
      ? `<div style="background:rgba(139,109,255,0.12);border:1px solid rgba(139,109,255,0.4);border-radius:12px;padding:16px;margin:16px 0;">
           <p style="margin:0 0 8px;"><strong>Para completar tu compra, transferí ${fmt(opts.total)}</strong></p>
           ${opts.transferAlias ? `<p style="margin:0 0 8px;">Alias: <strong style="color:#ffffff;">${esc(opts.transferAlias)}</strong></p>` : ""}
           <p style="margin:0;">Después mandanos el comprobante por WhatsApp con tu número de pedido <strong>#${shortId}</strong>.${
             opts.whatsappLink ? ` <a href="${opts.whatsappLink}" style="color:#8b6dff;">Abrir WhatsApp</a>` : ""
           }</p>
         </div>`
      : `<p>Te vamos a contactar para coordinar el retiro y el pago.</p>`;

  const html = emailLayout(
    "¡Recibimos tu pedido! 🛍️",
    `<p>Hola ${esc(opts.name)}, gracias por tu compra. Tu número de pedido es <strong>#${shortId}</strong>.</p>
     <table style="width:100%;border-collapse:collapse;font-size:14px;margin:12px 0;">${itemsHtml}
       <tr><td style="padding:8px 0;border-top:1px solid rgba(255,255,255,0.15);"><strong>Total</strong></td><td style="padding:8px 0;border-top:1px solid rgba(255,255,255,0.15);text-align:right;"><strong>${fmt(opts.total)}</strong></td></tr>
     </table>
     ${paymentHtml}
     <p>Podés ver el estado de tu pedido cuando quieras:</p>
     <p>${button(link, "Ver mi pedido")}</p>
     <p style="color:#8b8fa3;font-size:13px;">Tenés 10 días corridos desde que recibís tu compra para arrepentirte sin costo, y 15 días para cambiar el talle o el modelo. Detalles en <a href="${getAppUrl()}/legales/cambios-y-devoluciones" style="color:#8b6dff;">Cambios y devoluciones</a>.</p>`
  );
  return sendMail({ to: opts.to, subject: `Recibimos tu pedido #${shortId} — Benito Sneakers`, html });
}
