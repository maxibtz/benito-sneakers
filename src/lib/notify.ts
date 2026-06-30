import nodemailer from "nodemailer";

type NewOrderInfo = {
  id: string;
  customerName: string;
  phone: string;
  total: number;
  itemsSummary: string;
};

function formatARS(value: number) {
  return new Intl.NumberFormat("es-AR", { style: "currency", currency: "ARS" }).format(value);
}

export async function notifyNewOrder(order: NewOrderInfo) {
  await Promise.allSettled([notifyByEmail(order), notifyByWhatsapp(order)]);
}

async function notifyByEmail(order: NewOrderInfo) {
  const to = process.env.NOTIFY_EMAIL_TO;
  const smtpHost = process.env.SMTP_HOST;
  if (!to || !smtpHost) {
    console.log("[notify] Email no configurado, se omite el envío.", order.id);
    return;
  }

  const transporter = nodemailer.createTransport({
    host: smtpHost,
    port: Number(process.env.SMTP_PORT ?? 587),
    secure: process.env.SMTP_SECURE === "true",
    auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS },
  });

  await transporter.sendMail({
    from: process.env.SMTP_FROM ?? process.env.SMTP_USER,
    to,
    subject: `Nuevo pedido de ${order.customerName} — ${formatARS(order.total)}`,
    text: `Pedido #${order.id}\nCliente: ${order.customerName}\nTeléfono: ${order.phone}\nTotal: ${formatARS(
      order.total
    )}\n\n${order.itemsSummary}`,
  });
}

async function notifyByWhatsapp(order: NewOrderInfo) {
  const webhookUrl = process.env.WHATSAPP_WEBHOOK_URL;
  const to = process.env.NOTIFY_WHATSAPP_TO;
  if (!webhookUrl || !to) {
    console.log("[notify] WhatsApp no configurado, se omite el envío.", order.id);
    return;
  }

  const message = `🛒 Nuevo pedido de ${order.customerName}\nTel: ${order.phone}\nTotal: ${formatARS(
    order.total
  )}\n${order.itemsSummary}`;

  try {
    await fetch(webhookUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ to, message }),
    });
  } catch (err) {
    console.error("[notify] Error enviando WhatsApp", err);
  }
}
