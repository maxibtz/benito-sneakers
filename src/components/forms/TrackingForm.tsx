"use client";

import { useActionState } from "react";
import { setTrackingAction, type TrackingState } from "@/actions/orders";

const initial: TrackingState = {};

export function TrackingForm({
  orderId,
  currentCode,
  sentAt,
}: {
  orderId: string;
  currentCode: string | null;
  sentAt: Date | null;
}) {
  const bound = setTrackingAction.bind(null, orderId);
  const [state, action, pending] = useActionState(bound, initial);

  return (
    <div className="rounded-xl bg-white p-6 shadow-sm dark:bg-[#151833] dark:shadow-none">
      <h2 className="mb-1 font-semibold text-[var(--color-navy)] dark:text-white">
        Código de seguimiento
      </h2>
      <p className="mb-3 text-sm text-gray-500 dark:text-gray-400">
        Cargá el código del correo. Al guardar, se le envía automáticamente por email al cliente.
      </p>
      <form action={action} className="flex flex-wrap items-end gap-2">
        <input
          name="trackingCode"
          defaultValue={currentCode ?? ""}
          placeholder="Ej: AR123456789"
          className="flex-1 rounded-md border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 outline-none focus:border-[var(--color-navy)] dark:border-gray-600 dark:bg-white/5 dark:text-white"
        />
        <button
          type="submit"
          disabled={pending}
          className="rounded-md bg-[var(--color-navy)] px-4 py-2 text-sm font-semibold text-white hover:bg-[var(--color-navy-light)] disabled:opacity-60"
        >
          {pending ? "Enviando..." : "Guardar y avisar por email"}
        </button>
      </form>
      {state.ok && state.sent && (
        <p className="mt-2 text-sm text-green-600 dark:text-green-400">✓ Guardado y email enviado</p>
      )}
      {state.error && <p className="mt-2 text-sm text-amber-600 dark:text-amber-400">{state.error}</p>}
      {!state.ok && sentAt && (
        <p className="mt-2 text-xs text-gray-500 dark:text-gray-400">
          Último aviso enviado: {sentAt.toLocaleString("es-AR")}
        </p>
      )}
    </div>
  );
}
