"use client";

import { useActionState } from "react";
import {
  createSectionAction,
  renameSectionAction,
  type SectionFormState,
} from "@/actions/sections";

const initial: SectionFormState = {};

const inputClass =
  "rounded-lg border border-black/15 bg-white px-3 py-2 text-sm text-[var(--color-navy)] outline-none focus:border-[var(--color-navy)] dark:border-white/15 dark:bg-white/5 dark:text-white dark:focus:border-white";

export function NewSectionForm() {
  const [state, action, pending] = useActionState(createSectionAction, initial);
  return (
    <form
      action={action}
      className="flex flex-col gap-3 rounded-xl bg-white p-6 shadow-sm dark:bg-[#151833] dark:shadow-none"
    >
      <h2 className="text-lg font-semibold text-[var(--color-navy)] dark:text-white">
        Crear sección
      </h2>
      <div className="flex flex-wrap items-end gap-2">
        <input name="name" placeholder="Ej: Gorras" className={`${inputClass} flex-1`} />
        <button
          type="submit"
          disabled={pending}
          className="rounded-md bg-[var(--color-navy)] px-5 py-2 text-sm font-semibold text-white hover:bg-[var(--color-navy-light)] disabled:opacity-60"
        >
          {pending ? "..." : "Crear"}
        </button>
      </div>
      {state.error && <p className="text-sm text-red-600 dark:text-red-400">{state.error}</p>}
      {state.ok && <p className="text-sm text-green-600 dark:text-green-400">✓ Sección creada</p>}
    </form>
  );
}

export function SectionRenameForm({ id, name }: { id: string; name: string }) {
  const bound = renameSectionAction.bind(null, id);
  const [state, action, pending] = useActionState(bound, initial);
  return (
    <form action={action} className="flex items-center gap-2">
      <input name="name" defaultValue={name} className={`${inputClass} w-40`} />
      <button
        type="submit"
        disabled={pending}
        className="rounded-md border border-[var(--color-navy)] px-3 py-1.5 text-xs font-medium text-[var(--color-navy)] hover:bg-[var(--color-lilac-light)] disabled:opacity-60 dark:border-[var(--color-lilac)] dark:text-[var(--color-lilac-light)] dark:hover:bg-[var(--color-lilac)]/10"
      >
        {pending ? "..." : "Renombrar"}
      </button>
      {state.ok && <span className="text-xs text-green-600 dark:text-green-400">✓</span>}
      {state.error && <span className="text-xs text-red-600 dark:text-red-400">{state.error}</span>}
    </form>
  );
}
