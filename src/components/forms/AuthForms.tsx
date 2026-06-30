"use client";

import { useState } from "react";
import { useActionState } from "react";
import Link from "next/link";
import {
  loginCustomerAction,
  registerCustomerAction,
  verifyEmailAction,
  resendVerificationAction,
  requestPasswordResetAction,
  resetPasswordAction,
  type AuthState,
} from "@/actions/customer-auth";

const initial: AuthState = {};

function Field({
  label,
  name,
  type = "text",
  required,
  autoComplete,
}: {
  label: string;
  name: string;
  type?: string;
  required?: boolean;
  autoComplete?: string;
}) {
  return (
    <div className="flex flex-col gap-1">
      <label htmlFor={name} className="text-sm text-[var(--color-store-muted)]">
        {label}
      </label>
      <input
        id={name}
        name={name}
        type={type}
        required={required}
        autoComplete={autoComplete}
        className="rounded-xl border border-white/15 bg-white/5 px-3.5 py-2.5 text-white outline-none transition-colors focus:border-white"
      />
    </div>
  );
}

export function AuthForms({ next }: { next: string }) {
  const [mode, setMode] = useState<"login" | "register">("login");
  const [loginState, loginAction, loginPending] = useActionState(loginCustomerAction, initial);
  const [regState, regAction, regPending] = useActionState(registerCustomerAction, initial);

  return (
    <div className="mx-auto w-full max-w-md rounded-3xl border border-white/10 bg-[var(--color-store-surface)] p-7">
      <div className="mb-6 flex rounded-full border border-white/10 p-1">
        <button
          type="button"
          onClick={() => setMode("login")}
          className={`flex-1 rounded-full py-2 text-sm font-medium transition-colors ${
            mode === "login" ? "bg-white text-[var(--color-store-bg)]" : "text-[var(--color-store-muted)]"
          }`}
        >
          Ingresar
        </button>
        <button
          type="button"
          onClick={() => setMode("register")}
          className={`flex-1 rounded-full py-2 text-sm font-medium transition-colors ${
            mode === "register" ? "bg-white text-[var(--color-store-bg)]" : "text-[var(--color-store-muted)]"
          }`}
        >
          Crear cuenta
        </button>
      </div>

      {mode === "login" ? (
        <form action={loginAction} className="flex flex-col gap-4">
          <input type="hidden" name="next" value={next} />
          <Field label="Email" name="email" type="email" required autoComplete="email" />
          <Field
            label="Contraseña"
            name="password"
            type="password"
            required
            autoComplete="current-password"
          />
          {loginState.error && <p className="text-sm text-red-400">{loginState.error}</p>}
          <button
            type="submit"
            disabled={loginPending}
            className="mt-1 rounded-full bg-white px-5 py-3 text-sm font-medium text-[var(--color-store-bg)] transition hover:bg-white/85 disabled:opacity-60"
          >
            {loginPending ? "Ingresando..." : "Ingresar"}
          </button>
          <Link
            href="/recuperar"
            className="text-center text-xs text-[var(--color-store-muted)] hover:text-white"
          >
            ¿Olvidaste tu contraseña?
          </Link>
        </form>
      ) : (
        <form action={regAction} className="flex flex-col gap-4">
          <input type="hidden" name="next" value={next} />
          <Field label="Nombre completo" name="name" required autoComplete="name" />
          <Field label="Email" name="email" type="email" required autoComplete="email" />
          <Field label="Teléfono (opcional)" name="phone" autoComplete="tel" />
          <Field
            label="Contraseña"
            name="password"
            type="password"
            required
            autoComplete="new-password"
          />
          {regState.error && <p className="text-sm text-red-400">{regState.error}</p>}
          <button
            type="submit"
            disabled={regPending}
            className="mt-1 rounded-full bg-white px-5 py-3 text-sm font-medium text-[var(--color-store-bg)] transition hover:bg-white/85 disabled:opacity-60"
          >
            {regPending ? "Creando cuenta..." : "Crear cuenta"}
          </button>
        </form>
      )}

      <p className="mt-5 text-center text-xs text-[var(--color-store-muted)]">
        <Link href="/" className="hover:text-white">
          ← Volver a la tienda
        </Link>
      </p>
    </div>
  );
}

const cardClass =
  "mx-auto w-full max-w-md rounded-3xl border border-white/10 bg-[var(--color-store-surface)] p-7";

export function VerifyEmailForm() {
  const [state, action, pending] = useActionState(verifyEmailAction, initial);

  if (state.ok) {
    return (
      <div className="rounded-2xl border border-green-500/30 bg-green-500/10 p-4 text-sm text-green-300">
        ✓ ¡Correo verificado! Gracias.
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-amber-500/30 bg-amber-500/10 p-5">
      <p className="text-sm text-amber-200">
        Te enviamos un código a tu correo para verificarlo. Ingresalo acá (no es obligatorio para
        comprar, pero nos ayuda a contactarte).
      </p>
      <form action={action} className="mt-3 flex flex-wrap items-center gap-2">
        <input
          name="code"
          inputMode="numeric"
          placeholder="Código de 6 dígitos"
          className="flex-1 rounded-xl border border-white/15 bg-white/5 px-3.5 py-2.5 text-white outline-none focus:border-white"
        />
        <button
          type="submit"
          disabled={pending}
          className="rounded-full bg-white px-5 py-2.5 text-sm font-medium text-[var(--color-store-bg)] hover:bg-white/85 disabled:opacity-60"
        >
          {pending ? "..." : "Verificar"}
        </button>
      </form>
      {state.error && <p className="mt-2 text-sm text-red-400">{state.error}</p>}
      <form action={resendVerificationAction} className="mt-2">
        <button type="submit" className="text-xs text-amber-200/80 underline hover:text-white">
          Reenviar código
        </button>
      </form>
    </div>
  );
}

export function RequestResetForm() {
  const [state, action, pending] = useActionState(requestPasswordResetAction, initial);

  return (
    <div className={cardClass}>
      <h1 className="mb-2 text-xl font-medium text-white">Recuperar contraseña</h1>
      {state.ok ? (
        <p className="text-sm text-[var(--color-store-muted)]">
          Si existe una cuenta con ese correo, te enviamos un link para restablecer la contraseña.
          Revisá tu casilla (y el spam).
        </p>
      ) : (
        <form action={action} className="flex flex-col gap-4">
          <p className="text-sm text-[var(--color-store-muted)]">
            Ingresá tu email y te mandamos un link para crear una nueva contraseña.
          </p>
          <Field label="Email" name="email" type="email" required autoComplete="email" />
          {state.error && <p className="text-sm text-red-400">{state.error}</p>}
          <button
            type="submit"
            disabled={pending}
            className="rounded-full bg-white px-5 py-3 text-sm font-medium text-[var(--color-store-bg)] hover:bg-white/85 disabled:opacity-60"
          >
            {pending ? "Enviando..." : "Enviar link"}
          </button>
        </form>
      )}
      <p className="mt-5 text-center text-xs text-[var(--color-store-muted)]">
        <Link href="/ingresar" className="hover:text-white">
          ← Volver a ingresar
        </Link>
      </p>
    </div>
  );
}

export function ResetPasswordForm({ token }: { token: string }) {
  const [state, action, pending] = useActionState(resetPasswordAction, initial);

  return (
    <div className={cardClass}>
      <h1 className="mb-2 text-xl font-medium text-white">Nueva contraseña</h1>
      {state.ok ? (
        <div className="flex flex-col gap-4">
          <p className="text-sm text-green-300">
            ✓ Tu contraseña se cambió. Ya podés ingresar con la nueva.
          </p>
          <Link
            href="/ingresar"
            className="rounded-full bg-white px-5 py-3 text-center text-sm font-medium text-[var(--color-store-bg)] hover:bg-white/85"
          >
            Ir a ingresar
          </Link>
        </div>
      ) : (
        <form action={action} className="flex flex-col gap-4">
          <input type="hidden" name="token" value={token} />
          <Field label="Nueva contraseña" name="password" type="password" required autoComplete="new-password" />
          <Field label="Repetir contraseña" name="password2" type="password" required autoComplete="new-password" />
          {state.error && <p className="text-sm text-red-400">{state.error}</p>}
          <button
            type="submit"
            disabled={pending}
            className="rounded-full bg-white px-5 py-3 text-sm font-medium text-[var(--color-store-bg)] hover:bg-white/85 disabled:opacity-60"
          >
            {pending ? "Guardando..." : "Cambiar contraseña"}
          </button>
        </form>
      )}
    </div>
  );
}
