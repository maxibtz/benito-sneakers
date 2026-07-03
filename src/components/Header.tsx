import Link from "next/link";
import Image from "next/image";
import { CartButton } from "@/components/ui/CartButton";
import { getCustomerSession } from "@/lib/customer-auth";
import { logoutCustomerAction } from "@/actions/customer-auth";

export async function Header() {
  const session = await getCustomerSession();

  return (
    <header className="sticky top-0 z-40 border-b border-white/10 bg-[var(--color-store-bg)]/80 backdrop-blur-md">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-5 py-4 sm:px-8">
        <Link
          href="/"
          className="transition-opacity hover:opacity-80"
          aria-label="Benito Sneakers — inicio"
        >
          <Image
            src="/brand/logo-mark.png"
            alt="Benito Sneakers"
            width={441}
            height={200}
            priority
            className="h-10 w-auto sm:h-11"
          />
        </Link>

        <nav className="absolute left-1/2 hidden -translate-x-1/2 items-center gap-8 md:flex">
          <Link
            href="/"
            className="text-sm text-[var(--color-store-muted)] transition-colors hover:text-white"
          >
            Catálogo
          </Link>
          <a
            href="#contacto"
            className="text-sm text-[var(--color-store-muted)] transition-colors hover:text-white"
          >
            Contacto
          </a>
        </nav>

        <div className="flex items-center gap-3">
          {session ? (
            <div className="flex items-center gap-3">
              <Link
                href="/cuenta"
                className="hidden text-sm text-[var(--color-store-muted)] transition-colors hover:text-white sm:block"
              >
                Hola, {session.name.split(" ")[0]}
              </Link>
              <form action={logoutCustomerAction}>
                <button
                  type="submit"
                  className="text-sm text-[var(--color-store-muted)] transition-colors hover:text-white"
                >
                  Salir
                </button>
              </form>
            </div>
          ) : (
            <Link
              href="/ingresar"
              className="text-sm text-[var(--color-store-muted)] transition-colors hover:text-white"
            >
              Ingresar
            </Link>
          )}
          <CartButton />
        </div>
      </div>
    </header>
  );
}
