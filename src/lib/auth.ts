import { SignJWT, jwtVerify } from "jose";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

const SESSION_COOKIE = "benito_session";
const secret = new TextEncoder().encode(
  process.env.AUTH_SECRET ?? "dev-only-insecure-secret-change-me"
);

export async function createSession(adminId: string, email: string) {
  const token = await new SignJWT({ adminId, email })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("7d")
    .sign(secret);

  const cookieStore = await cookies();
  cookieStore.set(SESSION_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 7,
  });
}

export async function destroySession() {
  const cookieStore = await cookies();
  cookieStore.delete(SESSION_COOKIE);
}

export async function getSession(): Promise<{ adminId: string; email: string } | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE)?.value;
  if (!token) return null;
  try {
    const { payload } = await jwtVerify(token, secret);
    return { adminId: payload.adminId as string, email: payload.email as string };
  } catch {
    return null;
  }
}

/**
 * Para usar al inicio de cada server action del admin: corta la ejecución
 * (redirige al login) si no hay una sesión de administrador válida.
 * Defensa en profundidad: no dependemos solo del middleware.
 */
export async function requireAdmin(): Promise<{ adminId: string; email: string }> {
  const session = await getSession();
  if (!session) redirect("/admin/login");
  return session;
}

export { SESSION_COOKIE, secret as authSecret };
