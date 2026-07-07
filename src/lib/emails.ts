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
