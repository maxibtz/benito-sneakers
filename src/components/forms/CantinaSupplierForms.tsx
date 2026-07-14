"use client";

import { useActionState } from "react";
import {
  createCantinaSupplierAction,
  updateCantinaSupplierAction,
  deleteCantinaSupplierAction,
  type CantinaSupplierFormState,
} from "@/actions/cantina-suppliers";

const initial: CantinaSupplierFormState = {};

const inputClass =
  "rounded-lg border border-black/15 bg-white px-3 py-2 text-sm text-[var(--color-navy)] outline-none focus:border-[var(--color-cantina-vivid)] dark:border-white/15 dark:bg-white/5 dark:text-white dark:focus:border-white";

export function NewSupplierForm() {
  const [state, action, pending] = useActionState(createCantinaSupplierAction, initial);
  return (
    <form
      action={action}
      className="flex flex-col gap-3 rounded-xl bg-white p-6 shadow-sm dark:bg-[#151833] dark:shadow-none"
    >
      <h2 className="text-lg font-semibold text-[var(--color-navy)] dark:text-white">
        Nuevo proveedor
      </h2>
      <div className="grid gap-3 sm:grid-cols-3">
        <input name="name" placeholder="Nombre *" className={inputClass} />
        <input name="contact" placeholder="Contacto / teléfono" className={inputClass} />
        <input name="notes" placeholder="Notas" className={inputClass} />
      </div>
      <button
        type="submit"
        disabled={pending}
        className="w-fit rounded-md bg-[var(--color-cantina-vivid)] px-5 py-2 text-sm font-semibold text-white hover:brightness-95 disabled:opacity-60"
      >
        {pending ? "..." : "Crear proveedor"}
      </button>
      {state.error && <p className="text-sm text-red-600 dark:text-red-400">{state.error}</p>}
      {state.ok && <p className="text-sm text-green-600 dark:text-green-400">✓ Proveedor creado</p>}
    </form>
  );
}

export function SupplierEditForm({
  id,
  name,
  contact,
  notes,
}: {
  id: string;
  name: string;
  contact: string;
  notes: string;
}) {
  const bound = updateCantinaSupplierAction.bind(null, id);
  const [state, action, pending] = useActionState(bound, initial);
  return (
    <form action={action} className="grid gap-2 sm:grid-cols-[1fr_1fr_1fr_auto] sm:items-center">
      <input name="name" defaultValue={name} className={inputClass} />
      <input name="contact" defaultValue={contact} placeholder="Contacto" className={inputClass} />
      <input name="notes" defaultValue={notes} placeholder="Notas" className={inputClass} />
      <div className="flex items-center gap-2">
        <button
          type="submit"
          disabled={pending}
          className="rounded-md border border-[var(--color-cantina-vivid)] px-3 py-1.5 text-xs font-medium text-[var(--color-cantina-vivid)] hover:bg-[var(--color-cantina-light)] disabled:opacity-60 dark:hover:bg-[var(--color-cantina-vivid)]/10"
        >
          {pending ? "..." : "Guardar"}
        </button>
        {state.ok && <span className="text-xs text-green-600 dark:text-green-400">✓</span>}
      </div>
      {state.error && (
        <p className="text-xs text-red-600 dark:text-red-400 sm:col-span-4">{state.error}</p>
      )}
    </form>
  );
}

/** Botón de borrar con confirmación (client, porque usa onClick). */
export function SupplierDeleteButton({ id, name }: { id: string; name: string }) {
  return (
    <form action={deleteCantinaSupplierAction.bind(null, id)}>
      <button
        type="submit"
        onClick={(e) => {
          if (!confirm(`¿Eliminar el proveedor "${name}"? Sus productos quedan sin proveedor.`))
            e.preventDefault();
        }}
        className="font-medium text-red-600 hover:underline dark:text-red-400"
      >
        Eliminar
      </button>
    </form>
  );
}
