"use client";

import { useActionState } from "react";
import {
  createCantinaCategoryAction,
  deleteCantinaCategoryAction,
  type CantinaCategoryFormState,
} from "@/actions/cantina-categories";

const initial: CantinaCategoryFormState = {};

const inputClass =
  "rounded-lg border border-black/15 bg-white px-3 py-2 text-sm text-[var(--color-navy)] outline-none focus:border-[var(--color-cantina-vivid)] dark:border-white/15 dark:bg-white/5 dark:text-white";

export function CantinaCategoryManager({
  categories,
}: {
  categories: { id: string; name: string }[];
}) {
  const [state, action, pending] = useActionState(createCantinaCategoryAction, initial);

  return (
    <div className="rounded-xl bg-white p-4 shadow-sm dark:bg-[#151833] dark:shadow-none">
      <p className="mb-3 text-sm font-semibold text-[var(--color-navy)] dark:text-white">
        Categorías
      </p>
      <form action={action} className="mb-3 flex flex-wrap items-center gap-2">
        <input name="name" placeholder="Ej: Gaseosas" className={`${inputClass} flex-1 min-w-[160px]`} />
        <button
          type="submit"
          disabled={pending}
          className="rounded-md bg-[var(--color-cantina-vivid)] px-4 py-2 text-sm font-semibold text-white hover:brightness-95 disabled:opacity-60"
        >
          {pending ? "..." : "+ Agregar"}
        </button>
      </form>
      {state.error && <p className="mb-2 text-xs text-red-600 dark:text-red-400">{state.error}</p>}

      <div className="flex flex-wrap gap-2">
        {categories.map((c) => (
          <span
            key={c.id}
            className="flex items-center gap-1.5 rounded-full bg-[var(--color-cantina-light)] px-3 py-1 text-xs font-medium text-[var(--color-navy)] dark:bg-[var(--color-cantina-vivid)]/15 dark:text-[var(--color-cantina-light)]"
          >
            {c.name}
            <form action={deleteCantinaCategoryAction.bind(null, c.id)}>
              <button
                type="submit"
                onClick={(e) => {
                  if (!confirm(`¿Eliminar la categoría "${c.name}"? Sus productos quedan sin categoría.`))
                    e.preventDefault();
                }}
                className="text-[var(--color-navy)]/50 hover:text-red-600 dark:text-white/50 dark:hover:text-red-400"
                aria-label={`Eliminar ${c.name}`}
              >
                ✕
              </button>
            </form>
          </span>
        ))}
        {categories.length === 0 && (
          <p className="text-xs text-gray-500 dark:text-gray-400">
            Todavía no creaste categorías. Agregá la primera arriba.
          </p>
        )}
      </div>
    </div>
  );
}
