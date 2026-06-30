import Link from "next/link";
import { getSiteSettings } from "@/lib/dal";

export async function Footer() {
  const settings = await getSiteSettings();

  const socials = [
    settings.whatsapp ? { label: "WhatsApp", href: `https://wa.me/${settings.whatsapp}` } : null,
    settings.instagram
      ? { label: "Instagram", href: `https://instagram.com/${settings.instagram}` }
      : null,
    settings.tiktok ? { label: "TikTok", href: `https://tiktok.com/@${settings.tiktok}` } : null,
  ].filter(Boolean) as { label: string; href: string }[];

  return (
    <footer id="contacto" className="mt-auto border-t border-white/10">
      <div className="mx-auto max-w-6xl px-5 py-14 sm:px-8">
        <div className="grid gap-10 sm:grid-cols-3">
          <div>
            <p className="font-display text-lg font-medium lowercase tracking-tight text-white">
              benito sneakers
            </p>
            <p className="mt-3 max-w-xs text-sm leading-relaxed text-[var(--color-store-muted)]">
              Zapatillas alternativas. Modelos únicos, pares contados, envíos a todo el país.
            </p>
            {settings.transferAlias ? (
              <p className="mt-4 text-xs text-[var(--color-store-muted)]">
                Transferencias: <span className="text-white/80">{settings.transferAlias}</span>
              </p>
            ) : null}
          </div>

          <div>
            <p className="text-xs uppercase tracking-[0.18em] text-[var(--color-store-muted)]">
              Tienda
            </p>
            <ul className="mt-3 flex flex-col gap-2 text-sm">
              <li>
                <Link href="/" className="text-white/75 transition-colors hover:text-white">
                  Catálogo
                </Link>
              </li>
              <li>
                <Link href="/carrito" className="text-white/75 transition-colors hover:text-white">
                  Mi carrito
                </Link>
              </li>
              <li>
                <Link href="/cuenta" className="text-white/75 transition-colors hover:text-white">
                  Mi cuenta
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <p className="text-xs uppercase tracking-[0.18em] text-[var(--color-store-muted)]">
              Seguinos
            </p>
            {socials.length > 0 ? (
              <ul className="mt-3 flex flex-col gap-2 text-sm">
                {socials.map((s) => (
                  <li key={s.label}>
                    <a
                      href={s.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-white/75 transition-colors hover:text-[var(--color-lilac)]"
                    >
                      {s.label}
                    </a>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="mt-3 max-w-xs text-sm text-[var(--color-store-muted)]">
                Cargá tus redes desde el panel de administración.
              </p>
            )}
          </div>
        </div>

        <div className="mt-12 border-t border-white/10 pt-6">
          <p className="text-xs text-[var(--color-store-muted)]">
            © {new Date().getFullYear()} Benito Sneakers. Todos los derechos reservados.
          </p>
        </div>
      </div>
    </footer>
  );
}
