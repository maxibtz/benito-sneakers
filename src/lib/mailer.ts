import nodemailer from "nodemailer";
import { getSiteSettings } from "@/lib/dal";

export function getAppUrl(): string {
  return (process.env.APP_URL || "http://localhost:3000").replace(/\/$/, "");
}

type MailConfig = { user: string; pass: string; fromName: string } | null;

/**
 * Las credenciales pueden venir del .env (SMTP_USER/SMTP_PASS) o del panel
 * (Ajustes › Email). El .env tiene prioridad.
 */
export async function getMailConfig(): Promise<MailConfig> {
  const envUser = process.env.SMTP_USER?.trim();
  const envPass = process.env.SMTP_PASS?.trim();
  if (envUser && envPass) {
    return { user: envUser, pass: envPass, fromName: process.env.MAIL_FROM_NAME || "Benito Sneakers" };
  }
  const s = await getSiteSettings();
  if (s.smtpUser?.trim() && s.smtpPass?.trim()) {
    return { user: s.smtpUser.trim(), pass: s.smtpPass.trim(), fromName: s.mailFromName || "Benito Sneakers" };
  }
  return null;
}

export async function isMailConfigured(): Promise<boolean> {
  return (await getMailConfig()) !== null;
}

/** Envía un mail. Devuelve true si se envió, false si no está configurado o falló. */
export async function sendMail(opts: {
  to: string;
  subject: string;
  html: string;
}): Promise<boolean> {
  const config = await getMailConfig();
  if (!config) {
    console.warn("[mailer] sin configurar — no se envió:", opts.subject);
    return false;
  }
  try {
    const transport = nodemailer.createTransport({
      service: "gmail",
      auth: { user: config.user, pass: config.pass },
    });
    await transport.sendMail({
      from: `"${config.fromName}" <${config.user}>`,
      to: opts.to,
      subject: opts.subject,
      html: opts.html,
    });
    return true;
  } catch (err) {
    console.error("[mailer] error al enviar:", err);
    return false;
  }
}

/** Envoltorio HTML simple y prolijo para todos los mails. */
export function emailLayout(title: string, bodyHtml: string): string {
  return `
  <div style="background:#0a0f24;padding:32px 0;font-family:Arial,Helvetica,sans-serif;">
    <div style="max-width:480px;margin:0 auto;background:#11162e;border-radius:16px;overflow:hidden;border:1px solid rgba(255,255,255,0.08);">
      <div style="padding:24px 28px;border-bottom:1px solid rgba(255,255,255,0.08);">
        <span style="color:#8b6dff;font-size:20px;font-weight:bold;">Benito Sneakers</span>
      </div>
      <div style="padding:28px;color:#e6e8f0;font-size:15px;line-height:1.6;">
        <h1 style="margin:0 0 16px;font-size:20px;color:#ffffff;">${title}</h1>
        ${bodyHtml}
      </div>
      <div style="padding:18px 28px;border-top:1px solid rgba(255,255,255,0.08);color:#8b8fa3;font-size:12px;">
        Benito Sneakers — Zapatillas alternativas
      </div>
    </div>
  </div>`;
}

export function button(href: string, label: string): string {
  return `<a href="${href}" style="display:inline-block;background:#ffffff;color:#0a0f24;text-decoration:none;font-weight:bold;padding:12px 24px;border-radius:999px;margin:8px 0;">${label}</a>`;
}
