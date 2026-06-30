"use client";

import { useActionState } from "react";
import { loginAction, type LoginState } from "@/actions/auth";

const initialState: LoginState = {};

export function LoginForm() {
  const [state, formAction, isPending] = useActionState(loginAction, initialState);

  return (
    <form action={formAction} className="flex flex-col gap-4">
      <div className="flex flex-col gap-1">
        <label htmlFor="email" className="text-sm text-[var(--color-skyblue)]">
          Email
        </label>
        <input
          id="email"
          name="email"
          type="email"
          required
          autoComplete="username"
          className="rounded-md border border-[var(--color-navy-light)] bg-white/5 px-3 py-2 text-white outline-none focus:border-[var(--color-lilac)]"
        />
      </div>
      <div className="flex flex-col gap-1">
        <label htmlFor="password" className="text-sm text-[var(--color-skyblue)]">
          Contraseña
        </label>
        <input
          id="password"
          name="password"
          type="password"
          required
          autoComplete="current-password"
          className="rounded-md border border-[var(--color-navy-light)] bg-white/5 px-3 py-2 text-white outline-none focus:border-[var(--color-lilac)]"
        />
      </div>
      {state.error && <p className="text-sm text-red-400">{state.error}</p>}
      <button
        type="submit"
        disabled={isPending}
        className="mt-2 rounded-md bg-[var(--color-lilac)] px-4 py-2 font-semibold text-[var(--color-navy)] transition hover:bg-[var(--color-lilac-light)] disabled:opacity-60"
      >
        {isPending ? "Ingresando..." : "Ingresar"}
      </button>
    </form>
  );
}
