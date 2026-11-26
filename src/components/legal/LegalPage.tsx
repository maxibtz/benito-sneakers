import Link from "next/link";
import type { ReactNode } from "react";
import { LEGAL_UPDATED } from "@/lib/legal-constants";
import type { LegalInfo } from "@/lib/legal";

/** Contenedor común de las páginas legales: título, fecha y tipografía legible. */
export function LegalPage({
  title,
  intro,
  children,
}: {
  title: string;
  intro?: ReactNode;
  children: ReactNode;
}) {
  return (
    <div className="mx-auto max-w-3xl px-5 py-12 sm:px-8">
      <nav className="mb-6 text-xs text-[var(--color-store-muted)]">
        <Link href="/" className="transition-colors hover:text-white">
          Inicio
        </Link>{" "}
        / Legales
      </nav>
      <h1 className="font-display text-3xl font-medium tracking-tight text-white sm:text-4xl">
        {title}
      </h1>
      <p className="mt-2 text-xs text-[var(--color-store-muted)]">
        Última actualización: {LEGAL_UPDATED}
      </p>
      {intro && (
        <div className="mt-6 text-base leading-relaxed text-white/85">{intro}</div>
      )}
      <div className="legal-prose mt-8 flex flex-col gap-8 text-[15px] leading-relaxed text-white/80">
        {children}
      </div>
      <div className="mt-12 flex flex-wrap gap-x-5 gap-y-2 border-t border-white/10 pt-6 text-sm">
        <Link href="/legales/terminos" className="text-white/70 hover:text-white">
          Términos y condiciones
        </Link>
        <Link href="/legales/cambios-y-devoluciones" className="text-white/70 hover:text-white">
          Cambios y devoluciones
        </Link>
        <Link href="/legales/privacidad" className="text-white/70 hover:text-white">
          Política de privacidad
        </Link>
        <Link href="/arrepentimiento" className="text-white/70 hover:text-white">
          Botón de arrepentimiento
        </Link>
      </div>
    </div>
  );
}

/** Sección numerada dentro de una página legal. */
export function LegalSection({
  id,
  title,
  children,
}: {
  id?: string;
  title: string;
  children: ReactNode;
}) {
  return (
    <section id={id} className="scroll-mt-24">
      <h2 className="mb-3 text-lg font-semibold text-white">{title}</h2>
      <div className="flex flex-col gap-3">{children}</div>
    </section>
  );
}

/** Identificación del titular. Si el alta fiscal está en trámite, lo dice. */
export function HolderIdentity({ info }: { info: LegalInfo }) {
  return (
    <ul className="flex flex-col gap-1">
      <li>
        <strong className="text-white">Nombre comercial:</strong> {info.storeName}
      </li>
      <li>
        <strong className="text-white">Titular:</strong>{" "}
        {info.legalName || "datos de inscripción en trámite"}
      </li>
      <li>
        <strong className="text-white">CUIT:</strong> {info.cuit || "en trámite"}
      </li>
      {info.address && (
        <li>
          <strong className="text-white">Domicilio:</strong> {info.address}
        </li>
      )}
      <li>
        <strong className="text-white">Sitio web:</strong> {info.domain}
      </li>
      <ContactLines info={info} />
    </ul>
  );
}

/** Canales de contacto, reutilizados en todas las páginas legales. */
export function ContactLines({ info }: { info: LegalInfo }) {
  return (
    <>
      {info.email && (
        <li>
          <strong className="text-white">Email:</strong>{" "}
          <a href={`mailto:${info.email}`} className="underline underline-offset-4">
            {info.email}
          </a>
        </li>
      )}
      {info.whatsappLink && (
        <li>
          <strong className="text-white">WhatsApp:</strong>{" "}
          <a
            href={info.whatsappLink}
            target="_blank"
            rel="noopener noreferrer"
            className="underline underline-offset-4"
          >
            escribinos acá
          </a>
        </li>
      )}
    </>
  );
}
