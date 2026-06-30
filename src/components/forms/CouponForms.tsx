"use client";

import { useActionState } from "react";
import {
  createCouponAction,
  updateCouponAction,
  type CouponFormState,
} from "@/actions/coupons";

const initial: CouponFormState = {};

const inputClass =
  "rounded-lg border border-black/15 bg-white px-3 py-2 text-sm text-[var(--color-navy)] outline-none focus:border-[var(--color-navy)] dark:border-white/15 dark:bg-white/5 dark:text-white dark:focus:border-white";
const labelClass = "text-xs font-medium text-gray-600 dark:text-gray-300";

function toLocalInput(date: Date | null): string {
  if (!date) return "";
  const off = date.getTimezoneOffset();
  return new Date(date.getTime() - off * 60000).toISOString().slice(0, 16);
}

export function NewCouponForm() {
  const [state, action, pending] = useActionState(createCouponAction, initial);

  return (
    <form
      action={action}
      className="flex flex-col gap-4 rounded-xl bg-white p-6 shadow-sm dark:bg-[#151833] dark:shadow-none"
    >
      <h2 className="text-lg font-semibold text-[var(--color-navy)] dark:text-white">
        Crear código de descuento
      </h2>
      <div className="grid items-end gap-3 sm:grid-cols-[1fr_auto_1fr_auto]">
        <div className="flex flex-col gap-1">
          <label className={labelClass} htmlFor="code">
            Código
          </label>
          <input id="code" name="code" placeholder="VERANO20" className={`${inputClass} uppercase`} />
        </div>
        <div className="flex w-28 flex-col gap-1">
          <label className={labelClass} htmlFor="discountPercent">
            Descuento %
          </label>
          <input
            id="discountPercent"
            name="discountPercent"
            type="number"
            min={1}
            max={100}
            placeholder="20"
            className={inputClass}
          />
        </div>
        <div className="flex flex-col gap-1">
          <label className={labelClass} htmlFor="expiresAt">
            Vence (opcional)
          </label>
          <input id="expiresAt" name="expiresAt" type="datetime-local" className={inputClass} />
        </div>
        <button
          type="submit"
          disabled={pending}
          className="h-fit rounded-md bg-[var(--color-navy)] px-5 py-2 text-sm font-semibold text-white hover:bg-[var(--color-navy-light)] disabled:opacity-60"
        >
          {pending ? "..." : "Crear"}
        </button>
      </div>
      {state.error && <p className="text-sm text-red-600 dark:text-red-400">{state.error}</p>}
      {state.ok && <p className="text-sm text-green-600 dark:text-green-400">✓ Cupón creado</p>}
    </form>
  );
}

export function CouponEditForm({
  id,
  discountPercent,
  expiresAt,
}: {
  id: string;
  discountPercent: number;
  expiresAt: Date | null;
}) {
  const bound = updateCouponAction.bind(null, id);
  const [state, action, pending] = useActionState(bound, initial);

  return (
    <form action={action} className="flex flex-wrap items-end gap-2">
      <div className="flex w-24 flex-col gap-1">
        <label className={labelClass}>Descuento %</label>
        <input
          name="discountPercent"
          type="number"
          min={1}
          max={100}
          defaultValue={discountPercent}
          className={inputClass}
        />
      </div>
      <div className="flex flex-col gap-1">
        <label className={labelClass}>Vence</label>
        <input
          name="expiresAt"
          type="datetime-local"
          defaultValue={toLocalInput(expiresAt)}
          className={inputClass}
        />
      </div>
      <button
        type="submit"
        disabled={pending}
        className="rounded-md border border-[var(--color-navy)] px-3 py-2 text-xs font-medium text-[var(--color-navy)] hover:bg-[var(--color-lilac-light)] disabled:opacity-60 dark:border-[var(--color-lilac)] dark:text-[var(--color-lilac-light)] dark:hover:bg-[var(--color-lilac)]/10"
      >
        {pending ? "..." : "Guardar"}
      </button>
      {state.ok && <span className="text-xs text-green-600 dark:text-green-400">✓</span>}
      {state.error && <span className="text-xs text-red-600 dark:text-red-400">{state.error}</span>}
    </form>
  );
}
