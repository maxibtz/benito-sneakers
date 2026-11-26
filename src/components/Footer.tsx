import Link from "next/link";
import Image from "next/image";
import { getSiteSettings } from "@/lib/dal";
import { waLink } from "@/lib/whatsapp";
import { CONSUMER_COMPLAINTS_URL, REVOCATION_DAYS } from "@/lib/legal-constants";

const LEGAL_LINKS = [
  { href: "/legales/cambios-y-devoluciones", label: "Cambios y devoluciones" },
  { href: "/arrepentimiento", label: "Botón de arrepentimiento" },
  { href: "/legales/terminos", label: "Términos y condiciones" },
  { href: "/legales/privacidad", label: "Política de privacidad" },
];

export async function Footer() {
  const settings = await getSiteSettings();
  const whatsappHref = waLink(settings.whatsapp);

  const socials = [
    whatsappHref ? { label: "WhatsApp", href: whatsappHref } : null,
    settings.instagram
      ? { label: "Instagram", href: `https://instagram.com/${settings.instagram}` }
      : null,
    settings.tiktok ? { label: "TikTok", href: `https://tiktok.com/@${settings.tiktok}` } : null,
  ].filter(Boolean) as { label: string; href: string }[];

  return (
    <footer id="contacto" className="mt-auto border-t border-white/10">
      <div className="mx-auto max-w-6xl px-5 py-14 sm:px-8">
        {/* Res. 424/2020: acceso fácil, directo y visible desde la portada. */}
        <div className="mb-10 flex flex-col items-start justify-between gap-3 rounded-2xl border border-white/15 bg-white/5 px-5 py-4 sm:flex-row sm:items-center">
          <p className="text-sm text-white/80">
            ¿Te arrepentiste de tu compra? Tenés {REVOCATION_DAYS} días corridos desde que la
            recibís para devolverla sin costo.
          </p>
          <Link
            href="/arrepentimiento"
            className="shrink-0 rounded-full border border-white/40 px-5 py-2.5 text-sm font-semibold text-white transition hover:border-white hover:bg-white hover:text-[var(--color-store-bg)]"
          >
            Botón de arrepentimiento
          </Link>
        </div>

        <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-4">
          <div>
            <Image
              src="/brand/logo-mark.png"
              alt="Benito Sneakers — minorista y mayorista"
              width={441}
              height={200}
              className="h-14 w-auto"
            />
            <p className="mt-3 max-w-xs text-sm leading-relaxed text-[var(--color-store-muted)]">
              Zapatillas cómodas, perfumes árabes 100% originales y ropa. Envíos a todo el país.
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
              Ayuda y legales
            </p>
            <ul className="mt-3 flex flex-col gap-2 text-sm">
              {LEGAL_LINKS.map((l) => (
                <li key={l.href}>
                  <Link href={l.href} className="text-white/75 transition-colors hover:text-white">
                    {l.label}
                  </Link>
                </li>
              ))}
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

        <div className="mt-12 flex flex-col gap-4 border-t border-white/10 pt-6 sm:flex-row sm:items-end sm:justify-between">
          <div className="flex flex-col gap-2 text-xs text-[var(--color-store-muted)]">
            <a
              href={CONSUMER_COMPLAINTS_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="text-white/75 underline underline-offset-4 hover:text-white"
            >
              Defensa de las y los Consumidores. Para reclamos ingrese aquí
            </a>
            {(settings.legalName || settings.legalCuit) && (
              <p>
                {settings.legalName}
                {settings.legalName && settings.legalCuit ? " — " : ""}
                {settings.legalCuit ? `CUIT ${settings.legalCuit}` : ""}
              </p>
            )}
            <p>© {new Date().getFullYear()} Benito Sneakers. Todos los derechos reservados.</p>
          </div>
          {settings.dataFiscalUrl && settings.dataFiscalImg && (
            <a
              href={settings.dataFiscalUrl}
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Data Fiscal de ARCA"
              className="shrink-0"
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={settings.dataFiscalImg} alt="Data Fiscal" width={60} height={82} />
            </a>
          )}
        </div>
      </div>
    </footer>
  );
}
