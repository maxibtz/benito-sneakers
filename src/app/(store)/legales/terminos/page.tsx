import Link from "next/link";
import type { Metadata } from "next";
import { LegalPage, LegalSection, HolderIdentity } from "@/components/legal/LegalPage";
import { getLegalInfo, REVOCATION_DAYS, CONSUMER_COMPLAINTS_URL } from "@/lib/legal";

export const metadata: Metadata = {
  title: "Términos y condiciones — Benito Sneakers",
  description: "Condiciones de compra en benitosneakers.shop: precios, pagos, envíos y derechos del consumidor.",
};

export default async function TermsPage() {
  const info = await getLegalInfo();

  return (
    <LegalPage
      title="Términos y condiciones"
      intro={
        <p>
          Estas condiciones regulan las compras que hacés en {info.domain}. Al confirmar un pedido
          las aceptás. Están redactadas para cumplir con la Ley 24.240 de Defensa del Consumidor y
          con el Código Civil y Comercial de la Nación; ninguna cláusula limita los derechos que esas
          normas te reconocen.
        </p>
      }
    >
      <LegalSection title="1. Quién vende">
        <HolderIdentity info={info} />
      </LegalSection>

      <LegalSection title="2. Alcance">
        <p>
          Estas condiciones se aplican a las compras de consumidores finales hechas en este sitio.
          Las ventas mayoristas se rigen por las condiciones particulares que se acuerden en cada
          caso.
        </p>
      </LegalSection>

      <LegalSection title="3. Productos e imágenes">
        <p>
          Cada producto se publica con su descripción, talles disponibles y fotos. Las imágenes
          buscan mostrarlo con fidelidad, pero puede haber diferencias menores de color según la
          pantalla de cada dispositivo. Si tenés dudas sobre un talle o un producto, consultanos
          antes de comprar.
        </p>
        <p>
          Las marcas de terceros que aparecen en el sitio pertenecen a sus respectivos titulares y
          se mencionan solo para identificar los productos.
        </p>
      </LegalSection>

      <LegalSection title="4. Precios">
        <ul className="ml-5 list-disc space-y-2">
          <li>Todos los precios están expresados en pesos argentinos y son precios finales.</li>
          <li>
            Algunos productos, como los perfumes, tienen un precio de referencia en dólares que se
            convierte a pesos con la cotización del día. El precio que pagás es el que figura al
            confirmar tu pedido, y no cambia después aunque varíe la cotización.
          </li>
          <li>
            El costo de envío se informa antes de pagar y se suma al total del pedido. Los cupones y
            promociones tienen las condiciones y vigencia que se indican en cada caso.
          </li>
        </ul>
      </LegalSection>

      <LegalSection title="5. Cómo se hace una compra">
        <ul className="ml-5 list-disc space-y-2">
          <li>
            Elegís el producto y el talle, lo agregás al carrito y completás tus datos de contacto y
            de envío. No hace falta crear una cuenta.
          </li>
          <li>
            Al confirmar, ves la página de pedido confirmado con el número de pedido y un link para
            seguir su estado.
          </li>
          <li>
            El pedido queda firme cuando se acredita el pago. Si por un error de stock no podemos
            entregarlo, te avisamos y te reintegramos el total pagado.
          </li>
          <li>Emitimos el comprobante fiscal que corresponda a cada compra.</li>
        </ul>
      </LegalSection>

      <LegalSection title="6. Medios de pago">
        <ul className="ml-5 list-disc space-y-2">
          <li>
            <strong className="text-white">Transferencia bancaria:</strong> te mostramos el alias
            al confirmar el pedido. El pedido se prepara cuando recibimos el comprobante y se
            acredita la transferencia.
          </li>
          <li>
            <strong className="text-white">Efectivo:</strong> solo para retiro en persona,
            coordinado previamente.
          </li>
        </ul>
      </LegalSection>

      <LegalSection title="7. Envíos y retiro">
        <ul className="ml-5 list-disc space-y-2">
          <li>
            Enviamos a todo el país a través de empresas de transporte. El costo y el plazo
            estimado se informan antes de pagar; el plazo final depende del transportista.
          </li>
          <li>También podés retirar tu compra en Formosa, en el lugar y horario que coordinemos.</li>
          <li>
            Al recibir el paquete, revisalo. Si llegó dañado o con un producto distinto al que
            pediste, seguí la sección 3 de{" "}
            <Link
              href="/legales/cambios-y-devoluciones#errores-y-fallas"
              className="text-white underline underline-offset-4"
            >
              Cambios y devoluciones
            </Link>
            .
          </li>
        </ul>
      </LegalSection>

      <LegalSection title="8. Arrepentimiento, cambios y garantía">
        <p>
          Tenés {REVOCATION_DAYS} días corridos desde que recibís el producto para arrepentirte de
          la compra sin costo, a través del{" "}
          <Link href="/arrepentimiento" className="text-white underline underline-offset-4">
            Botón de arrepentimiento
          </Link>
          . Los cambios por talle, color o modelo, los errores en el envío y las fallas tienen sus
          propias reglas, explicadas en{" "}
          <Link href="/legales/cambios-y-devoluciones" className="text-white underline underline-offset-4">
            Cambios y devoluciones
          </Link>
          , que forma parte de estos términos.
        </p>
      </LegalSection>

      <LegalSection title="9. Cuenta de usuario">
        <p>
          Crear una cuenta es opcional y sirve para guardar tus datos y ver tus pedidos. Sos
          responsable de mantener tu contraseña en reserva. Podés pedir la baja de tu cuenta en
          cualquier momento, como se explica en la{" "}
          <Link href="/legales/privacidad" className="text-white underline underline-offset-4">
            Política de privacidad
          </Link>
          .
        </p>
      </LegalSection>

      <LegalSection title="10. Contenido del sitio">
        <p>
          Los textos, fotos propias, diseño y marca Benito Sneakers son de nuestra titularidad. No
          pueden copiarse ni usarse con fines comerciales sin autorización.
        </p>
      </LegalSection>

      <LegalSection title="11. Cambios en estas condiciones">
        <p>
          Podemos actualizar estos términos. Cada compra se rige por la versión vigente al momento
          de confirmarla; la fecha de la última actualización figura al principio de esta página.
        </p>
      </LegalSection>

      <LegalSection title="12. Consultas, reclamos y ley aplicable">
        <p>
          Si tenés un problema con tu compra, escribinos primero: queremos resolverlo rápido. También
          podés hacer un reclamo ante Defensa del Consumidor:{" "}
          <a
            href={CONSUMER_COMPLAINTS_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="text-white underline underline-offset-4"
          >
            Defensa de las y los Consumidores. Para reclamos ingrese aquí
          </a>
          .
        </p>
        <p>
          Estas condiciones se rigen por las leyes de la República Argentina. Ante cualquier
          controversia serán competentes los tribunales que correspondan según las normas de
          protección del consumidor, incluido el del domicilio del consumidor.
        </p>
      </LegalSection>
    </LegalPage>
  );
}
