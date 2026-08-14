import { sendMail, emailLayout, button, getAppUrl } from "@/lib/mailer";

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

/** Aviso por mail — reutiliza el mismo Gmail que ya manda los mails a clientes. */
async function notifyByEmail(order: NewOrderInfo) {
  const to = process.env.NOTIFY_EMAIL_TO?.trim();
  if (!to) {
    console.log("[notify] NOTIFY_EMAIL_TO no configurado, se omite el aviso por mail.");
    return;
  }

  const itemsHtml = order.itemsSummary
    .split("\n")
    .filter(Boolean)
    .map((line) => `<p style="margin:2px 0;">${line}</p>`)
    .join("");

  const html = emailLayout(
    "🛒 Nuevo pedido",
    `
      <p style="margin:0 0 4px;"><strong>${order.customerName}</strong> — ${formatARS(order.total)}</p>
      <p style="margin:0 0 16px;color:#9aa1c4;">Tel: ${order.phone}</p>
      ${itemsHtml}
      <div style="margin-top:20px;">
        ${button(`${getAppUrl()}/admin/pedidos/${order.id}`, "Ver pedido")}
      </div>
    `
  );

  const sent = await sendMail({ to, subject: `🛒 Nuevo pedido — ${formatARS(order.total)}`, html });
  if (!sent) console.error("[notify] no se pudo enviar el mail de aviso de pedido", order.id);
}

/**
 * Aviso por WhatsApp vía CallMeBot (servicio gratuito no oficial, pensado
 * para mandarte avisos a tu propio número). Doc: https://www.callmebot.com/blog/free-api-whatsapp-messages/
 * Variables: CALLMEBOT_PHONE (con código de país, sin +) y CALLMEBOT_APIKEY.
 */
async function notifyByWhatsapp(order: NewOrderInfo) {
  const phone = process.env.CALLMEBOT_PHONE?.trim();
  const apikey = process.env.CALLMEBOT_APIKEY?.trim();
  if (!phone || !apikey) {
    console.log("[notify] CallMeBot no configurado, se omite el aviso por WhatsApp.");
    return;
  }

  const text = `🛒 Nuevo pedido\n${order.customerName} — ${formatARS(order.total)}\nTel: ${order.phone}\n\n${order.itemsSummary}`;
  const url = `https://api.callmebot.com/whatsapp.php?phone=${encodeURIComponent(phone)}&text=${encodeURIComponent(text)}&apikey=${encodeURIComponent(apikey)}`;

  try {
    const res = await fetch(url, { signal: AbortSignal.timeout(8000) });
    if (!res.ok) {
      console.error("[notify] CallMeBot respondió con error", res.status, await res.text().catch(() => ""));
    }
  } catch (err) {
    console.error("[notify] error enviando WhatsApp vía CallMeBot", err);
  }
}
