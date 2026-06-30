"use server";

import bcrypt from "bcryptjs";
import crypto from "crypto";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { db } from "@/lib/db";
import {
  createCustomerSession,
  destroyCustomerSession,
  getCustomerSession,
} from "@/lib/customer-auth";
import { sendVerificationEmail, sendPasswordResetEmail } from "@/lib/emails";
import { rateLimit, getClientIp, waitText } from "@/lib/rate-limit";

export type AuthState = { error?: string; ok?: boolean };

function genCode(): string {
  return String(Math.floor(100000 + Math.random() * 900000));
}

const registerSchema = z.object({
  name: z.string().min(2, "Ingresá tu nombre."),
  email: z.string().email("Email inválido."),
  phone: z.string().optional(),
  password: z.string().min(6, "La contraseña debe tener al menos 6 caracteres."),
});

function safeNext(raw: FormDataEntryValue | null): string {
  const value = String(raw ?? "");
  return value.startsWith("/") && !value.startsWith("//") ? value : "/";
}

export async function registerCustomerAction(
  _prev: AuthState,
  formData: FormData
): Promise<AuthState> {
  const parsed = registerSchema.safeParse({
    name: formData.get("name"),
    email: formData.get("email"),
    phone: formData.get("phone") || undefined,
    password: formData.get("password"),
  });
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Datos inválidos." };
  }

  // Máx 5 cuentas nuevas cada 15 min por IP (anti spam).
  const regIp = await getClientIp();
  const regRl = rateLimit(`register:${regIp}`, 5, 15 * 60 * 1000);
  if (!regRl.ok) {
    return { error: `Demasiados intentos. Probá de nuevo en ${waitText(regRl.retryAfterSec)}.` };
  }

  const email = parsed.data.email.trim().toLowerCase();
  const existing = await db.customer.findUnique({ where: { email } });
  if (existing) {
    return { error: "Ya existe una cuenta con ese email. Probá ingresar." };
  }

  const passwordHash = await bcrypt.hash(parsed.data.password, 10);
  const code = genCode();
  const customer = await db.customer.create({
    data: {
      name: parsed.data.name.trim(),
      email,
      phone: parsed.data.phone?.trim() || null,
      passwordHash,
      lastLoginAt: new Date(),
      verifyCode: code,
      emailVerified: false,
    },
  });

  // Verificación suave: no bloquea la compra. Enviamos el código (best-effort).
  try {
    await sendVerificationEmail(customer.email, customer.name, code);
  } catch {
    // si el mail no está configurado o falla, igual creamos la cuenta
  }

  await createCustomerSession({
    customerId: customer.id,
    email: customer.email,
    name: customer.name,
  });

  redirect(safeNext(formData.get("next")));
}

export async function verifyEmailAction(
  _prev: AuthState,
  formData: FormData
): Promise<AuthState> {
  const session = await getCustomerSession();
  if (!session) return { error: "Tenés que iniciar sesión." };

  // Anti fuerza bruta del código de 6 dígitos: máx 6 intentos cada 10 min.
  const vrl = rateLimit(`verify:${session.customerId}`, 6, 10 * 60 * 1000);
  if (!vrl.ok) {
    return { error: `Demasiados intentos. Probá de nuevo en ${waitText(vrl.retryAfterSec)}.` };
  }

  const code = String(formData.get("code") ?? "").trim();
  const customer = await db.customer.findUnique({ where: { id: session.customerId } });
  if (!customer) return { error: "Cuenta no encontrada." };
  if (customer.emailVerified) return { ok: true };
  if (!code || code !== customer.verifyCode) {
    return { error: "El código no coincide. Revisá el mail o reenvialo." };
  }

  await db.customer.update({
    where: { id: customer.id },
    data: { emailVerified: true, verifyCode: null },
  });
  revalidatePath("/cuenta");
  return { ok: true };
}

export async function resendVerificationAction(): Promise<void> {
  const session = await getCustomerSession();
  if (!session) return;
  const code = genCode();
  const customer = await db.customer.update({
    where: { id: session.customerId },
    data: { verifyCode: code },
  });
  try {
    await sendVerificationEmail(customer.email, customer.name, code);
  } catch {
    // ignore
  }
  revalidatePath("/cuenta");
}

export async function loginCustomerAction(
  _prev: AuthState,
  formData: FormData
): Promise<AuthState> {
  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  const password = String(formData.get("password") ?? "");
  if (!email || !password) {
    return { error: "Completá email y contraseña." };
  }

  // Máx 8 intentos cada 5 min por IP+email.
  const ip = await getClientIp();
  const rl = rateLimit(`login:${ip}:${email}`, 8, 5 * 60 * 1000);
  if (!rl.ok) {
    return { error: `Demasiados intentos. Probá de nuevo en ${waitText(rl.retryAfterSec)}.` };
  }

  const customer = await db.customer.findUnique({ where: { email } });
  if (!customer || !(await bcrypt.compare(password, customer.passwordHash))) {
    return { error: "Email o contraseña incorrectos." };
  }

  await db.customer.update({
    where: { id: customer.id },
    data: { lastLoginAt: new Date() },
  });

  await createCustomerSession({
    customerId: customer.id,
    email: customer.email,
    name: customer.name,
  });

  redirect(safeNext(formData.get("next")));
}

export async function requestPasswordResetAction(
  _prev: AuthState,
  formData: FormData
): Promise<AuthState> {
  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  if (!email) return { error: "Ingresá tu email." };

  // Máx 3 pedidos de reset cada 15 min por IP+email.
  const ip = await getClientIp();
  const rl = rateLimit(`reset:${ip}:${email}`, 3, 15 * 60 * 1000);
  if (!rl.ok) {
    return { error: `Demasiados intentos. Probá de nuevo en ${waitText(rl.retryAfterSec)}.` };
  }

  const customer = await db.customer.findUnique({ where: { email } });
  // Por seguridad respondemos igual exista o no la cuenta.
  if (customer) {
    const token = crypto.randomBytes(32).toString("hex");
    const expires = new Date(Date.now() + 60 * 60 * 1000); // 1 hora
    await db.customer.update({
      where: { id: customer.id },
      data: { resetToken: token, resetExpires: expires },
    });
    try {
      await sendPasswordResetEmail(customer.email, customer.name, token);
    } catch {
      // ignore
    }
  }
  return { ok: true };
}

export async function resetPasswordAction(
  _prev: AuthState,
  formData: FormData
): Promise<AuthState> {
  const token = String(formData.get("token") ?? "").trim();
  const password = String(formData.get("password") ?? "");
  const password2 = String(formData.get("password2") ?? "");

  if (password.length < 6) return { error: "La contraseña debe tener al menos 6 caracteres." };
  if (password !== password2) return { error: "Las contraseñas no coinciden." };
  if (!token) return { error: "Link inválido." };

  const customer = await db.customer.findFirst({
    where: { resetToken: token, resetExpires: { gt: new Date() } },
  });
  if (!customer) return { error: "El link venció o no es válido. Pedí uno nuevo." };

  const passwordHash = await bcrypt.hash(password, 10);
  await db.customer.update({
    where: { id: customer.id },
    data: { passwordHash, resetToken: null, resetExpires: null },
  });
  return { ok: true };
}

export async function logoutCustomerAction() {
  await destroyCustomerSession();
  redirect("/");
}
