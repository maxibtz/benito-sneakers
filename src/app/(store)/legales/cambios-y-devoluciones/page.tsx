import Link from "next/link";
import type { Metadata } from "next";
import { LegalPage, LegalSection, ContactLines } from "@/components/legal/LegalPage";
import { getLegalInfo, REVOCATION_DAYS, EXCHANGE_DAYS } from "@/lib/legal";

export const metadata: Metadata = {
  title: "Cambios y devoluciones — Benito Sneakers",
  description:
    "Arrepentimiento, cambios de talle o modelo y errores o fallas: plazos, costos y cómo iniciar cada trámite.",
};

export default async function ExchangesPage() {
  const info = await getLegalInfo();

  return (
    <LegalPage
      title="Cambios y devoluciones"
      intro={
        <p>
          Hay tres situaciones distintas y cada una tiene sus propias reglas. Ubicá la tuya en la
          tabla y después leé su sección. Los plazos se cuentan en <strong>días corridos</strong>{" "}
          desde el día en que recibís el producto.
        </p>
      }
    >
      {/* Resumen en celular: una tarjeta por situación. */}
      <div className="flex flex-col gap-3 sm:hidden">
        {[
          {
            href: "#arrepentimiento",
            title: "1. Te arrepentiste (por cualquier motivo)",
            plazo: `${REVOCATION_DAYS} días`,
            envio: "A nuestro cargo",
            recibis: "Reintegro total del dinero",
          },
          {
            href: "#cambios",
            title: "2. Querés otro talle, color o modelo",
            plazo: `${EXCHANGE_DAYS} días`,
            envio: "A tu cargo (ida y vuelta)",
            recibis: "Otro producto",
          },
          {
            href: "#errores-y-fallas",
            title: "3. Nos equivocamos o el producto tiene una falla",
            plazo: "Garantía legal",
            envio: "A nuestro cargo (ida y vuelta)",
            recibis: "El producto correcto, reparación o reintegro",
          },
        ].map((row) => (
          <a
            key={row.href}
            href={row.href}
            className="rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm"
          >
            <p className="font-semibold text-white underline underline-offset-4">{row.title}</p>
            <p className="mt-2">
              <span className="text-[var(--color-store-muted)]">Plazo:</span> {row.plazo}
            </p>
            <p>
              <span className="text-[var(--color-store-muted)]">Envío de la devolución:</span>{" "}
              {row.envio}
            </p>
            <p>
              <span className="text-[var(--color-store-muted)]">Qué recibís:</span> {row.recibis}
            </p>
          </a>
        ))}
      </div>

      {/* Resumen en pantallas grandes: una fila por situación, sin superposiciones. */}
      <div className="hidden overflow-x-auto rounded-xl border border-white/10 sm:block">
        <table className="w-full min-w-[560px] text-left text-sm">
          <thead className="bg-white/5 text-white">
            <tr>
              <th className="px-4 py-3 font-semibold">Situación</th>
              <th className="px-4 py-3 font-semibold">Plazo</th>
              <th className="px-4 py-3 font-semibold">Envío de la devolución</th>
              <th className="px-4 py-3 font-semibold">Qué recibís</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/10">
            <tr>
              <td className="px-4 py-3">
                <a href="#arrepentimiento" className="text-white underline underline-offset-4">
                  1. Te arrepentiste
                </a>{" "}
                (por cualquier motivo)
              </td>
              <td className="px-4 py-3">{REVOCATION_DAYS} días</td>
              <td className="px-4 py-3">A nuestro cargo</td>
              <td className="px-4 py-3">Reintegro total del dinero</td>
            </tr>
            <tr>
              <td className="px-4 py-3">
                <a href="#cambios" className="text-white underline underline-offset-4">
                  2. Querés otro talle, color o modelo
                </a>
              </td>
              <td className="px-4 py-3">{EXCHANGE_DAYS} días</td>
              <td className="px-4 py-3">A tu cargo (ida y vuelta)</td>
              <td className="px-4 py-3">Otro producto</td>
            </tr>
            <tr>
              <td className="px-4 py-3">
                <a href="#errores-y-fallas" className="text-white underline underline-offset-4">
                  3. Nos equivocamos o el producto tiene una falla
                </a>
              </td>
              <td className="px-4 py-3">Garantía legal</td>
              <td className="px-4 py-3">A nuestro cargo (ida y vuelta)</td>
              <td className="px-4 py-3">El producto correcto, reparación o reintegro</td>
            </tr>
          </tbody>
        </table>
      </div>

      <p className="rounded-xl border border-[var(--color-lilac-vivid)]/40 bg-[var(--color-lilac-vivid)]/10 px-4 py-3 text-white/90">
        <strong className="text-white">Importante:</strong> si estás dentro de los primeros{" "}
        {REVOCATION_DAYS} días, siempre podés elegir el arrepentimiento (sección 1), aunque el motivo
        sea que elegiste mal el talle. En ese caso la devolución no tiene costo para vos y te
        reintegramos el dinero; después, si querés, hacés una compra nueva.
      </p>

      <LegalSection id="arrepentimiento" title="1. Arrepentimiento: devolución por cualquier motivo">
        <p>
          Por tratarse de una compra a distancia, tenés derecho a revocar la compra dentro de los{" "}
          <strong>{REVOCATION_DAYS} días corridos</strong> contados desde que recibís el producto,
          sin tener que explicar el motivo (Ley 24.240, art. 34, y Código Civil y Comercial, arts.
          1110 a 1116). Es un derecho irrenunciable.
        </p>
        <ul className="ml-5 list-disc space-y-2">
          <li>
            <strong className="text-white">Cómo pedirlo:</strong> usá el{" "}
            <Link href="/arrepentimiento" className="text-white underline underline-offset-4">
              Botón de arrepentimiento
            </Link>
            . No necesitás una cuenta. Al enviarlo te mostramos en pantalla un código de
            identificación de tu solicitud y también te lo mandamos por email.
          </li>
          <li>
            <strong className="text-white">Sin costo para vos:</strong> el envío de la devolución
            corre por nuestra cuenta. Te indicamos cómo despacharlo o coordinamos el retiro.
          </li>
          <li>
            <strong className="text-white">Estado del producto:</strong> te pedimos que lo devuelvas
            con su caja y los accesorios que recibiste.
          </li>
          <li>
            <strong className="text-white">Reintegro:</strong> te devolvemos el total que pagaste,
            incluido el envío original, por el mismo medio de pago, dentro de los 10 días hábiles de
            recibido el producto. Si pagaste con Mercado Pago, el reintegro se hace por Mercado Pago;
            si pagaste por transferencia, a la cuenta que nos indiques a tu nombre.
          </li>
          <li>
            <strong className="text-white">Excepción, perfumes abiertos:</strong> los perfumes y
            fragancias se pueden devolver solo si están <strong>cerrados y con el sello o precinto
            intacto</strong>. Una vez abiertos, por razones de higiene y porque no pueden volver a
            ofrecerse como nuevos, quedan alcanzados por la excepción del art. 1116, inc. a), del
            Código Civil y Comercial. Esto no afecta la garantía por fallas (sección 3).
          </li>
        </ul>
      </LegalSection>

      <LegalSection id="cambios" title="2. Cambios por talle, color o modelo">
        <p>
          Si querés cambiar el producto por otro talle, color o modelo, tenés{" "}
          <strong>{EXCHANGE_DAYS} días corridos</strong> desde que lo recibís. Esta es una política
          propia de Benito Sneakers y se suma a tu derecho de arrepentimiento: no lo reemplaza.
        </p>
        <ul className="ml-5 list-disc space-y-2">
          <li>
            <strong className="text-white">Condiciones:</strong> el producto tiene que estar sin
            uso (solo probado), con sus etiquetas y en su caja original en buen estado.
          </li>
          <li>
            <strong className="text-white">Envío:</strong> como el cambio es por elección tuya, el
            envío de ida y el de vuelta corren por tu cuenta.
          </li>
          <li>
            <strong className="text-white">Stock y diferencia de precio:</strong> el cambio está
            sujeto a disponibilidad. Tu compra se valora al precio que pagaste: si el producto nuevo
            cuesta más, abonás la diferencia; si cuesta menos, te reintegramos la diferencia.
          </li>
          <li>
            <strong className="text-white">Perfumes:</strong> solo se cambian cerrados y con el
            sello o precinto intacto.
          </li>
          <li>
            <strong className="text-white">Recordá:</strong> durante los primeros{" "}
            {REVOCATION_DAYS} días podés optar por el arrepentimiento (sección 1), que no tiene costo
            de envío para vos.
          </li>
        </ul>
      </LegalSection>

      <LegalSection id="errores-y-fallas" title="3. Errores nuestros y productos con fallas">
        <p>
          Si te enviamos un producto distinto al que pediste (por ejemplo, otro color, talle o
          modelo), si llegó dañado o si presenta una falla de fabricación, nos hacemos cargo de todos
          los envíos de ida y vuelta.
        </p>
        <ul className="ml-5 list-disc space-y-2">
          <li>
            <strong className="text-white">Qué recibís:</strong> el producto correcto o uno igual
            sin falla; si no hay stock, la reparación o el reintegro total, a tu elección.
          </li>
          <li>
            <strong className="text-white">Cuándo avisar:</strong> para resolverlo rápido, avisanos
            apenas lo detectes, idealmente dentro de los {EXCHANGE_DAYS} días de recibido. Las
            fallas de fabricación están cubiertas además por la garantía legal del art. 11 de la Ley
            24.240, durante el plazo que esa ley establece.
          </li>
          <li>
            <strong className="text-white">Perfumes:</strong> la garantía por fallas incluye a los
            perfumes aunque estén abiertos (por ejemplo, un atomizador que no funciona, un envase que
            pierde o llega roto).
          </li>
          <li>
            <strong className="text-white">Qué necesitamos:</strong> tu número de pedido y fotos del
            producto, de la falla y de la etiqueta del envío.
          </li>
        </ul>
      </LegalSection>

      <LegalSection title="4. Cómo iniciar cualquiera de estos trámites">
        <ul className="ml-5 list-disc space-y-2">
          <li>
            Arrepentimiento: desde el{" "}
            <Link href="/arrepentimiento" className="text-white underline underline-offset-4">
              Botón de arrepentimiento
            </Link>
            .
          </li>
          <li>Cambios, errores o fallas: escribinos con tu número de pedido.</li>
        </ul>
        <ul className="ml-5 list-disc space-y-1">
          <ContactLines info={info} />
        </ul>
        <p>
          Antes de despachar un producto, esperá nuestra respuesta con las indicaciones de envío,
          así no pagás de más ni se demora el trámite.
        </p>
      </LegalSection>
    </LegalPage>
  );
}
