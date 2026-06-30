"use client";

import { useActionState } from "react";
import { updateOrderStatusAction, type OrderActionState } from "@/actions/orders";
import type { OrderStatus } from "@/generated/prisma/enums";

const initialState: OrderActionState = {};

export function OrderStatusButton({
  orderId,
  status,
  label,
  isCurrent,
}: {
  orderId: string;
  status: OrderStatus;
  label: string;
  isCurrent: boolean;
}) {
  const boundAction = updateOrderStatusAction.bind(null, orderId, status);
  const [state, formAction, isPending] = useActionState(boundAction, initialState);

  return (
    <form action={formAction}>
      <button
        type="submit"
        disabled={isCurrent || isPending}
        className={`rounded-full px-4 py-2 text-sm font-semibold transition disabled:cursor-not-allowed ${
          isCurrent
            ? "bg-[var(--color-navy)] text-white dark:bg-[var(--color-lilac)] dark:text-[var(--color-navy)]"
            : "bg-gray-100 text-gray-700 hover:bg-[var(--color-lilac-light)] dark:bg-white/10 dark:text-gray-200 dark:hover:bg-white/20"
        } ${isPending ? "opacity-60" : ""}`}
      >
        {label}
      </button>
      {state.error && (
        <p className="mt-1 max-w-xs text-xs text-red-600 dark:text-red-400">{state.error}</p>
      )}
    </form>
  );
}
