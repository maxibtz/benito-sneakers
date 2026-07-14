"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { logoutAction } from "@/actions/auth";
import { ThemeToggle } from "@/components/theme/ThemeToggle";
import { ADMIN_THEME_KEY } from "@/lib/theme";

type NavItem = { href: string; label: string };
export type NavGroup = { label: string; icon?: string; accent?: "cantina"; items: NavItem[] };

/** Menú del panel para celular: botón hamburguesa + panel desplegable, agrupado por sección. */
export function AdminMobileNav({ groups }: { groups: NavGroup[] }) {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-label={open ? "Cerrar menú" : "Abrir menú"}
        aria-expanded={open}
        className="flex h-10 w-10 items-center justify-center rounded-md border border-white/20 text-xl text-white"
      >
        {open ? "✕" : "☰"}
      </button>

      {open && (
        <div className="absolute left-0 right-0 top-full z-50 max-h-[calc(100vh-3.25rem)] overflow-y-auto border-t border-white/10 bg-[var(--color-navy)] pb-4 shadow-xl dark:bg-[#0a0f33]">
          <a
            href="/"
            target="_blank"
            rel="noopener noreferrer"
            className="mx-3 mt-3 flex items-center justify-center gap-2 rounded-md bg-[var(--color-lilac)] px-3 py-2.5 text-sm font-semibold text-[var(--color-navy)]"
          >
            🛍️ Ver tienda
          </a>
          {groups.map((group) => (
            <nav key={group.label} className="mt-1 flex flex-col px-3">
              <p className="px-3 pb-1 pt-3 text-[10px] font-semibold uppercase tracking-widest text-white/40">
                {group.icon ? `${group.icon} ` : ""}
                {group.label}
              </p>
              {group.items.map((item) => {
                const active = pathname === item.href;
                const activeCls =
                  group.accent === "cantina"
                    ? "bg-[var(--color-cantina-vivid)]/25 text-[var(--color-cantina-light)]"
                    : "bg-[var(--color-navy-light)] text-white";
                const hoverCls =
                  group.accent === "cantina"
                    ? "hover:bg-[var(--color-cantina-vivid)]/15"
                    : "hover:bg-[var(--color-navy-light)]";
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setOpen(false)}
                    className={`rounded-md px-3 py-2.5 text-sm font-medium transition ${
                      active ? activeCls : `text-white/85 ${hoverCls}`
                    }`}
                  >
                    {item.label}
                  </Link>
                );
              })}
            </nav>
          ))}
          <div className="mt-2 flex items-center justify-between gap-2 px-6 py-2">
            <span className="text-xs text-white/60">Modo claro / oscuro</span>
            <ThemeToggle storageKey={ADMIN_THEME_KEY} />
          </div>
          <form action={logoutAction} className="px-3">
            <button
              type="submit"
              className="w-full rounded-md border border-white/20 px-3 py-2.5 text-sm text-white/80"
            >
              Cerrar sesión
            </button>
          </form>
        </div>
      )}
    </>
  );
}
