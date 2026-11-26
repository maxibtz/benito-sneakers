"use client";

import { useActionState } from "react";
import { submitRevocationAction, type RevocationState } from "@/actions/revocation";

const initial: RevocationState = {};

const inputClass =
  "w-full rounded-xl border border-white/15 bg-white/5 px-4 py-3 text-white outline-none transition focus:border-white/50";
const labelClass = "text-sm text-[var(--color-store-muted)]";

export function RevocationForm() {
  const [state, action, pending] = useActionState(submitRevocationAction, initial);

  if (state.ok && state.code) {
    return (
      <div className="rounded-2xl border border-green-500/40 bg-green-500/10 p-6 text-white/90">
        <p className="text-lg font-semibold text-white">Recibimos tu solicitud de arrepentimiento</p>
        <p className="mt-3 text-sm">Tu código de identificación es:</p>
        <p className="mt-2 select-all font-mono text-2xl font-bold tracking-wider text-white">
          {state.code}
        </p>
        <p className="mt-4 text-sm">
          Guardalo: lo vas a necesitar para cualquier consulta sobre este trámite.{" "}
          {state.emailSent
            ? "También te lo enviamos por email."
            : "No pudimos enviártelo por email, así que anotalo o sacale una captura."}{" "}
          En breve te contactamos para coordinar la devolución, que no tiene costo para vos, y el
          reintegro.
        </p>
      </div>
    );
  }

  return (
    <form action={action} className="flex flex-col gap-4">
      <div className="grid gap-4 sm:grid-cols-2">
        <label className="flex flex-col gap-1">
          <span className={labelClass}>Nombre y apellido *</span>
          <input name="name" required autoComplete="name" className={inputClass} />
        </label>
        <label className="flex flex-col gap-1">
          <span className={labelClass}>DNI</span>
          <input name="dni" inputMode="numeric" className={inputClass} />
        </label>
        <label className="flex flex-col gap-1">
          <span className={labelClass}>Email *</span>
          <input name="email" type="email" required autoComplete="email" className={inputClass} />
        </label>
        <label className="flex flex-col gap-1">
          <span className={labelClass}>Teléfono / WhatsApp *</span>
          <input name="phone" type="tel" required autoComplete="tel" className={inputClass} />
        </label>
        <label className="flex flex-col gap-1 sm:col-span-2">
          <span className={labelClass}>Número de pedido (si lo tenés, ej: #a1b2c3d4)</span>
          <input name="orderRef" className={inputClass} />
        </label>
        <label className="flex flex-col gap-1 sm:col-span-2">
          <span className={labelClass}>Comentarios (opcional, no hace falta explicar el motivo)</span>
          <textarea name="details" rows={3} className={inputClass} />
        </label>
      </div>
      {state.error && (
        <p className="rounded-xl border border-red-500/40 bg-red-500/10 px-4 py-3 text-sm text-red-200">
          {state.error}
        </p>
      )}
      <button
        type="submit"
        disabled={pending}
        className="btn-press rounded-full bg-white px-6 py-4 text-sm font-semibold text-[var(--color-store-bg)] transition hover:bg-white/90 disabled:opacity-60"
      >
        {pending ? "Enviando..." : "Enviar solicitud de arrepentimiento"}
      </button>
      <p className="text-xs text-[var(--color-store-muted)]">
        Usamos estos datos solo para gestionar tu solicitud. Más información en la{" "}
        <a href="/legales/privacidad" className="underline underline-offset-4">
          Política de privacidad
        </a>
        .
      </p>
    </form>
  );
}
