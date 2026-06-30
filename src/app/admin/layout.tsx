import Link from "next/link";
import { logoutAction } from "@/actions/auth";
import { ThemeScript } from "@/components/theme/ThemeScript";
import { ThemeToggle } from "@/components/theme/ThemeToggle";
import { ADMIN_THEME_KEY } from "@/lib/theme";

const NAV_ITEMS = [
  { href: "/admin", label: "Dashboard" },
  { href: "/admin/productos", label: "Productos" },
  { href: "/admin/secciones", label: "Secciones" },
  { href: "/admin/pedidos", label: "Pedidos" },
  { href: "/admin/clientes", label: "Clientes" },
  { href: "/admin/cupones", label: "Cupones" },
  { href: "/admin/contenido", label: "Contenido home" },
  { href: "/admin/ajustes", label: "Ajustes" },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <ThemeScript storageKey={ADMIN_THEME_KEY} />
      <div className="flex min-h-screen bg-[#f4f3fb] dark:bg-[#0b0d1a]">
        <aside className="flex w-64 flex-col bg-[var(--color-navy)] text-white dark:bg-[#0a0f33]">
          <div className="flex items-start justify-between gap-2 px-6 py-6">
            <div>
              <h1 className="text-xl font-bold text-[var(--color-lilac)]">Benito Sneakers</h1>
              <p className="text-xs text-[var(--color-skyblue)]">Panel de administración</p>
            </div>
          </div>
          <div className="px-3 pb-3">
            <a
              href="/"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-2 rounded-md bg-[var(--color-lilac)] px-3 py-2 text-sm font-semibold text-[var(--color-navy)] transition hover:brightness-95"
            >
              🛍️ Ver tienda
            </a>
          </div>
          <nav className="flex flex-1 flex-col gap-1 px-3">
            {NAV_ITEMS.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="rounded-md px-3 py-2 text-sm font-medium text-white/90 transition hover:bg-[var(--color-navy-light)]"
              >
                {item.label}
              </Link>
            ))}
          </nav>
          <div className="flex items-center justify-between gap-2 px-6 py-3">
            <span className="text-xs text-white/60">Modo claro / oscuro</span>
            <ThemeToggle storageKey={ADMIN_THEME_KEY} />
          </div>
          <form action={logoutAction} className="px-3 pb-6">
            <button
              type="submit"
              className="w-full rounded-md border border-white/20 px-3 py-2 text-sm text-white/80 transition hover:bg-[var(--color-navy-light)]"
            >
              Cerrar sesión
            </button>
          </form>
        </aside>
        <main className="flex-1 p-8">{children}</main>
      </div>
    </>
  );
}
