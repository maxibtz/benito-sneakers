"use server";

import bcrypt from "bcryptjs";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { createSession, destroySession } from "@/lib/auth";
import { rateLimit, getClientIp, waitText } from "@/lib/rate-limit";

export type LoginState = { error?: string };

export async function loginAction(
  _prevState: LoginState,
  formData: FormData
): Promise<LoginState> {
  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  const password = String(formData.get("password") ?? "");

  if (!email || !password) {
    return { error: "Completá email y contraseña." };
  }

  // Máx 5 intentos cada 5 minutos por IP+email (anti fuerza bruta).
  const ip = await getClientIp();
  const rl = rateLimit(`admin-login:${ip}:${email}`, 5, 5 * 60 * 1000);
  if (!rl.ok) {
    return { error: `Demasiados intentos. Probá de nuevo en ${waitText(rl.retryAfterSec)}.` };
  }

  const admin = await db.admin.findUnique({ where: { email } });
  if (!admin) {
    return { error: "Credenciales inválidas." };
  }

  const valid = await bcrypt.compare(password, admin.passwordHash);
  if (!valid) {
    return { error: "Credenciales inválidas." };
  }

  await createSession(admin.id, admin.email);
  redirect("/admin");
}

export async function logoutAction() {
  await destroySession();
  redirect("/admin/login");
}
