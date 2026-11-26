import Link from "next/link";
import type { Metadata } from "next";
import { RevocationForm } from "@/components/legal/RevocationForm";
import { REVOCATION_DAYS } from "@/lib/legal";

export const metadata: Metadata = {
  title: "Botón de arrepentimiento — Benito Sneakers",
  description: `Revocá tu compra dentro de los ${REVOCATION_DAYS} días corridos de recibida, sin costo y sin registrarte.`,
};

export default function RevocationPage() {
  return (
    <div className="mx-auto max-w-2xl px-5 py-12 sm:px-8">
      <h1 className="font-display text-3xl font-medium tracking-tight text-white sm:text-4xl">
        Botón de arrepentimiento
      </h1>
      <div className="mt-5 flex flex-col gap-3 text-[15px] leading-relaxed text-white/80">
        <p>
          Tenés <strong className="text-white">{REVOCATION_DAYS} días corridos</strong> desde que
          recibiste tu compra para arrepentirte, sin explicar el motivo y sin costo: el envío de la
          devolución corre por nuestra cuenta y te reintegramos el total pagado.
        </p>
        <p>
          Completá el formulario. No necesitás una cuenta. Al enviarlo vas a ver tu código de
          identificación del trámite.
        </p>
        <p className="text-sm text-[var(--color-store-muted)]">
          Los perfumes se pueden devolver solo cerrados y con el sello intacto. Si lo que querés es
          cambiar el talle o el modelo, o si el producto llegó con una falla, mirá{" "}
          <Link href="/legales/cambios-y-devoluciones" className="text-white underline underline-offset-4">
            Cambios y devoluciones
          </Link>
          .
        </p>
      </div>
      <div className="mt-8">
        <RevocationForm />
      </div>
    </div>
  );
}
