import Link from "next/link";
import Image from "next/image";
import { logoutAction } from "@/actions/auth";
import { ThemeScript } from "@/components/theme/ThemeScript";
import { ThemeToggle } from "@/components/theme/ThemeToggle";
import { AdminMobileNav, type NavGroup } from "@/components/admin/AdminMobileNav";
import { ADMIN_THEME_KEY } from "@/lib/theme";

const NAV_GROUPS: NavGroup[] = [
  {
    label: "Zapatillas",
    items: [
      { href: "/admin", label: "Dashboard" },
      { href: "/admin/productos", label: "Productos" },
      { href: "/admin/secciones", label: "Secciones" },
      { href: "/admin/pedidos", label: "Pedidos" },
      { href: "/admin/ventas", label: "Ventas manuales" },
      { href: "/admin/clientes", label: "Clientes" },
      { href: "/admin/cupones", label: "Cupones" },
      { href: "/admin/contenido", label: "Contenido home" },
      { href: "/admin/ajustes", label: "Ajustes" },
    ],
  },
  {
    label: "Cantina",
    icon: "🍔",
    accent: "cantina",
    items: [
      { href: "/admin/cantina", label: "Dashboard" },
      { href: "/admin/cantina/productos", label: "Productos" },
      { href: "/admin/cantina/proveedores", label: "Proveedores" },
      { href: "/admin/cantina/vender", label: "Cargar venta" },
      { href: "/admin/cantina/ventas", label: "Historial de ventas" },
    ],
  },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <ThemeScript storageKey={ADMIN_THEME_KEY} />

      {/* Barra superior — solo celular */}
      <header className="relative flex items-center justify-between bg-[var(--color-navy)] px-4 py-3 text-white dark:bg-[#0a0f33] lg:hidden">
        <Link href="/admin">
          <Image
            src="/brand/logo-mark.png"
            alt="Benito Sneakers"
            width={441}
            height={200}
            priority
            className="h-9 w-auto"
          />
        </Link>
        <AdminMobileNav groups={NAV_GROUPS} />
      </header>

      <div className="flex min-h-screen bg-[#f4f3fb] dark:bg-[#0b0d1a]">
        {/* Sidebar — solo pantalla grande */}
        <aside className="hidden w-64 flex-col bg-[var(--color-navy)] text-white dark:bg-[#0a0f33] lg:flex">
          <div className="px-6 py-6">
            <Image
              src="/brand/logo-mark.png"
              alt="Benito Sneakers"
              width={441}
              height={200}
              priority
              className="h-14 w-auto"
            />
            <p className="mt-2 text-xs text-[var(--color-skyblue)]">Panel de administración</p>
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
          <nav className="flex flex-1 flex-col gap-1 overflow-y-auto px-3">
            {NAV_GROUPS.map((group) => (
              <div key={group.label} className="mb-2">
                <p className="px-3 pb-1 pt-3 text-[10px] font-semibold uppercase tracking-widest text-white/40">
                  {group.icon ? `${group.icon} ` : ""}
                  {group.label}
                </p>
                {group.items.map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`block rounded-md px-3 py-2 text-sm font-medium text-white/90 transition ${
                      group.accent === "cantina"
                        ? "hover:bg-[var(--color-cantina-vivid)]/20 hover:text-[var(--color-cantina-light)]"
                        : "hover:bg-[var(--color-navy-light)]"
                    }`}
                  >
                    {item.label}
                  </Link>
                ))}
              </div>
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
        <main className="min-w-0 flex-1 p-4 sm:p-6 lg:p-8">{children}</main>
      </div>
    </>
  );
}
