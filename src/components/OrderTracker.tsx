"use client";

import { useEffect, useState } from "react";
import type { OrderStatus } from "@/generated/prisma/enums";

const STEPS: { status: OrderStatus; label: string; icon: string }[] = [
  { status: "NUEVO", label: "Pedido recibido", icon: "🛒" },
  { status: "EN_PREPARACION", label: "En preparación", icon: "📦" },
  { status: "ENVIADO", label: "Enviado", icon: "🚚" },
  { status: "ENTREGADO", label: "Entregado", icon: "🏠" },
];

const POLL_INTERVAL_MS = 8000;

export function OrderTracker({
  orderId,
  initialStatus,
}: {
  orderId: string;
  initialStatus: OrderStatus;
}) {
  const [status, setStatus] = useState<OrderStatus>(initialStatus);
  const [justUpdated, setJustUpdated] = useState(false);

  useEffect(() => {
    let cancelled = false;

    async function poll() {
      try {
        const res = await fetch(`/api/orders/${orderId}/status`, { cache: "no-store" });
        if (!res.ok || cancelled) return;
        const data = await res.json();
        if (!cancelled && data.status && data.status !== status) {
          setStatus(data.status);
          setJustUpdated(true);
          setTimeout(() => setJustUpdated(false), 2500);
        }
      } catch {
        // ignore transient network errors, will retry on next tick
      }
    }

    const interval = setInterval(poll, POLL_INTERVAL_MS);
    return () => {
      cancelled = true;
      clearInterval(interval);
    };
  }, [orderId, status]);

  if (status === "CANCELADO") {
    return (
      <div className="rounded-2xl border border-red-500/25 bg-red-500/10 p-6 text-center">
        <p className="text-lg font-medium text-red-300">Este pedido fue cancelado</p>
        <p className="mt-1 text-sm text-red-200/80">
          Si creés que es un error, escribinos por WhatsApp y lo resolvemos.
        </p>
      </div>
    );
  }

  const currentIndex = STEPS.findIndex((s) => s.status === status);

  return (
    <div className="rounded-2xl border border-white/10 bg-[var(--color-store-surface)] p-6">
      <div className="mb-4 flex items-center justify-between">
        <h2 className="font-medium text-white">Seguimiento en tiempo real</h2>
        <span
          className={`flex items-center gap-1 text-xs transition-opacity ${
            justUpdated ? "font-semibold text-green-400 opacity-100" : "text-[var(--color-store-muted)] opacity-70"
          }`}
        >
          <span className="relative flex h-2 w-2">
            <span className="absolute h-2 w-2 animate-ping rounded-full bg-green-400" />
            <span className="relative h-2 w-2 rounded-full bg-green-500" />
          </span>
          {justUpdated ? "¡Actualizado!" : "En vivo"}
        </span>
      </div>

      <ol className="flex flex-col gap-0">
        {STEPS.map((step, i) => {
          const done = i < currentIndex;
          const active = i === currentIndex;
          const isLast = i === STEPS.length - 1;

          return (
            <li key={step.status} className="flex gap-3">
              <div className="flex flex-col items-center">
                <span
                  className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-sm transition-all duration-300 ${
                    done || active
                      ? "bg-white text-[var(--color-store-bg)]"
                      : "bg-white/10 text-white/40"
                  } ${active ? "ring-4 ring-[var(--color-lilac)]/30" : ""}`}
                >
                  {step.icon}
                </span>
                {!isLast && (
                  <span
                    className={`my-1 h-8 w-0.5 transition-colors duration-300 ${
                      done ? "bg-white" : "bg-white/10"
                    }`}
                  />
                )}
              </div>
              <div className={isLast ? "" : "pb-6"}>
                <p
                  className={`text-sm font-medium transition-colors ${
                    done || active ? "text-white" : "text-white/40"
                  }`}
                >
                  {step.label}
                </p>
                {active && (
                  <p className="text-xs text-[var(--color-store-muted)]">
                    Estamos en este paso ahora mismo.
                  </p>
                )}
              </div>
            </li>
          );
        })}
      </ol>
    </div>
  );
}
