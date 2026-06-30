"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

type PromoModalProps = {
  title: string;
  message: string;
  couponCode: string;
  ctaText: string;
  ctaLink: string;
  endsAt: string | null;
};

function useCountdown(endsAt: string | null) {
  const [remaining, setRemaining] = useState<number | null>(null);

  useEffect(() => {
    if (!endsAt) return;
    const target = new Date(endsAt).getTime();
    const tick = () => setRemaining(Math.max(0, target - Date.now()));
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [endsAt]);

  return remaining;
}

function pad(n: number) {
  return String(n).padStart(2, "0");
}

export function PromoModal({
  title,
  message,
  couponCode,
  ctaText,
  ctaLink,
  endsAt,
}: PromoModalProps) {
  const [open, setOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const remaining = useCountdown(endsAt);

  // unique key per promo content so editing it re-shows the popup
  const dismissKey = `benito-promo:${title}:${endsAt ?? ""}`;
  const expired = endsAt ? new Date(endsAt).getTime() <= Date.now() : false;

  useEffect(() => {
    if (expired) return;
    let dismissed = false;
    try {
      dismissed = sessionStorage.getItem(dismissKey) === "1";
    } catch {}
    if (!dismissed) {
      const t = setTimeout(() => setOpen(true), 700);
      return () => clearTimeout(t);
    }
  }, [dismissKey, expired]);

  function close() {
    setOpen(false);
    try {
      sessionStorage.setItem(dismissKey, "1");
    } catch {}
  }

  function copyCoupon() {
    if (!couponCode) return;
    navigator.clipboard?.writeText(couponCode).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    });
  }

  if (!open || expired) return null;

  const days = remaining != null ? Math.floor(remaining / 86400000) : 0;
  const hours = remaining != null ? Math.floor((remaining % 86400000) / 3600000) : 0;
  const mins = remaining != null ? Math.floor((remaining % 3600000) / 60000) : 0;
  const secs = remaining != null ? Math.floor((remaining % 60000) / 1000) : 0;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      aria-label={title}
    >
      <button
        type="button"
        aria-label="Cerrar"
        onClick={close}
        className="absolute inset-0 bg-black/70 backdrop-blur-sm"
      />
      <div className="animate-fade-up relative w-full max-w-md overflow-hidden rounded-3xl border border-white/15 bg-[var(--color-store-surface)] p-8 text-center shadow-2xl">
        <div
          aria-hidden
          className="pointer-events-none absolute -top-20 left-1/2 h-48 w-48 -translate-x-1/2 rounded-full bg-[var(--color-lilac-vivid)] opacity-30 blur-3xl"
        />
        <button
          type="button"
          onClick={close}
          aria-label="Cerrar"
          className="absolute right-4 top-4 text-white/50 transition-colors hover:text-white"
        >
          ✕
        </button>

        <div className="relative">
          <h2 className="font-display text-2xl font-medium tracking-tight text-white">{title}</h2>
          {message && (
            <p className="mt-3 text-sm leading-relaxed text-[var(--color-store-muted)]">{message}</p>
          )}

          {endsAt && remaining != null && (
            <div className="mt-5 flex items-center justify-center gap-2">
              {[
                { v: days, l: "días" },
                { v: hours, l: "hs" },
                { v: mins, l: "min" },
                { v: secs, l: "seg" },
              ].map((u) => (
                <div
                  key={u.l}
                  className="min-w-14 rounded-xl border border-white/10 bg-white/5 px-2 py-2"
                >
                  <p className="font-display text-xl font-medium text-white">{pad(u.v)}</p>
                  <p className="text-[10px] uppercase tracking-wide text-[var(--color-store-muted)]">
                    {u.l}
                  </p>
                </div>
              ))}
            </div>
          )}

          {couponCode && (
            <button
              type="button"
              onClick={copyCoupon}
              className="mt-5 w-full rounded-xl border border-dashed border-white/30 bg-white/5 px-4 py-3 transition-colors hover:bg-white/10"
            >
              <span className="text-xs uppercase tracking-wide text-[var(--color-store-muted)]">
                {copied ? "¡Copiado!" : "Tu código (tocá para copiar)"}
              </span>
              <p className="font-display text-lg font-medium tracking-widest text-[var(--color-lilac)]">
                {couponCode}
              </p>
            </button>
          )}

          {ctaText && (
            <Link
              href={ctaLink || "/"}
              onClick={close}
              className="mt-5 block rounded-full bg-white px-5 py-3 text-sm font-medium text-[var(--color-store-bg)] transition hover:bg-white/85"
            >
              {ctaText}
            </Link>
          )}

          <button
            type="button"
            onClick={close}
            className="mt-3 text-xs text-[var(--color-store-muted)] transition-colors hover:text-white"
          >
            No, gracias
          </button>
        </div>
      </div>
    </div>
  );
}
