/**
 * Clave de firma de sesiones (admin + clientes), compartida por auth,
 * customer-auth y el middleware.
 *
 * En producción es OBLIGATORIA: si falta, la app no arranca (mejor caerse
 * que firmar sesiones con una clave conocida públicamente).
 */
const raw = process.env.AUTH_SECRET;

if (!raw && process.env.NODE_ENV === "production") {
  throw new Error(
    "AUTH_SECRET no está configurada. Cargala como variable de entorno antes de desplegar."
  );
}

export const authSecretBytes = new TextEncoder().encode(
  raw ?? "dev-only-insecure-secret-change-me"
);
