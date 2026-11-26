import Link from "next/link";
import type { Metadata } from "next";
import { LegalPage, LegalSection, HolderIdentity, ContactLines } from "@/components/legal/LegalPage";
import { getLegalInfo, AAIP_LEGEND } from "@/lib/legal";

export const metadata: Metadata = {
  title: "Política de privacidad — Benito Sneakers",
  description: "Qué datos personales usamos, para qué, con quién los compartimos y cómo ejercer tus derechos.",
};

export default async function PrivacyPage() {
  const info = await getLegalInfo();

  return (
    <LegalPage
      title="Política de privacidad"
      intro={
        <p>
          Acá explicamos qué datos personales usamos cuando visitás {info.domain} o comprás, para qué
          los usamos y cómo podés acceder a ellos, corregirlos o pedir que los borremos, de acuerdo
          con la Ley 25.326 de Protección de los Datos Personales.
        </p>
      }
    >
      <LegalSection title="1. Responsable de los datos">
        <HolderIdentity info={info} />
      </LegalSection>

      <LegalSection title="2. Qué datos usamos">
        <ul className="ml-5 list-disc space-y-2">
          <li>
            <strong className="text-white">Cuando comprás:</strong> nombre y apellido, email,
            teléfono, DNI, dirección de entrega y el detalle de tu pedido.
          </li>
          <li>
            <strong className="text-white">Si creás una cuenta:</strong> además, tu contraseña, que
            guardamos cifrada y nadie puede leer.
          </li>
          <li>
            <strong className="text-white">Si nos escribís o usás el Botón de arrepentimiento:</strong>{" "}
            los datos que nos envíes en esa comunicación.
          </li>
          <li>
            <strong className="text-white">Mientras navegás:</strong> las páginas y productos que
            ves, lo que agregás al carrito y tus compras, junto con datos técnicos de tu dispositivo y
            navegador (por ejemplo, la dirección IP). Ver la sección 6.
          </li>
        </ul>
      </LegalSection>

      <LegalSection title="3. Para qué los usamos">
        <ul className="ml-5 list-disc space-y-2">
          <li>Procesar tu pedido, cobrarlo, emitir el comprobante fiscal y enviarlo.</li>
          <li>Avisarte el estado de tu pedido por email o WhatsApp y responder tus consultas.</li>
          <li>Gestionar tu cuenta, si tenés una.</li>
          <li>Atender cambios, devoluciones, arrepentimientos y reclamos.</li>
          <li>Proteger el sitio contra el fraude y el uso abusivo.</li>
          <li>
            Medir el resultado de nuestra publicidad y mostrarte anuncios de Benito Sneakers en
            Facebook e Instagram.
          </li>
        </ul>
        <p>No vendemos ni alquilamos tus datos personales.</p>
      </LegalSection>

      <LegalSection title="4. Tu consentimiento">
        <p>
          Usamos tus datos con tu consentimiento, que prestás al completar tus datos para comprar o
          contactarnos, y en la medida necesaria para cumplir la compra y nuestras obligaciones
          legales. Darnos tus datos de contacto y entrega es necesario para poder venderte y
          enviarte el producto; sin ellos no podemos procesar el pedido.
        </p>
      </LegalSection>

      <LegalSection title="5. Con quién los compartimos">
        <p>Solo con quienes necesitamos para funcionar, y únicamente los datos que cada uno necesita:</p>
        <ul className="ml-5 list-disc space-y-2">
          <li>
            <strong className="text-white">Empresas de envío y logística:</strong> para cotizar y
            entregar tu pedido.
          </li>
          <li>
            <strong className="text-white">Proveedores tecnológicos:</strong> el servicio de
            alojamiento donde funciona el sitio y el servicio de correo con el que enviamos los
            emails.
          </li>
          <li>
            <strong className="text-white">Meta Platforms:</strong> para la medición y la
            publicidad descritas en la sección 6.
          </li>
          <li>
            <strong className="text-white">Autoridades:</strong> cuando una ley o una orden
            judicial lo exija.
          </li>
        </ul>
        <p>
          Algunos de estos proveedores guardan información en servidores fuera de la Argentina, por
          ejemplo en los Estados Unidos. Elegimos proveedores reconocidos que aplican medidas de
          seguridad y protección de datos. Al usar el sitio prestás tu consentimiento para esa
          transferencia internacional.
        </p>
      </LegalSection>

      <LegalSection title="6. Cookies, Píxel de Meta y tecnologías similares">
        <ul className="ml-5 list-disc space-y-2">
          <li>
            <strong className="text-white">Necesarias:</strong> recordamos tu carrito en tu
            navegador y, si iniciás sesión, usamos una cookie para mantenerla abierta. Sin ellas el
            carrito y la cuenta no funcionan.
          </li>
          <li>
            <strong className="text-white">Píxel de Meta:</strong> es una herramienta de Meta
            Platforms (Facebook e Instagram) que registra las páginas y productos que ves, lo que
            agregás al carrito y tus compras, con datos técnicos de tu dispositivo, y usa cookies de
            Meta. Con esa información medimos qué anuncios funcionan y Meta puede mostrarte anuncios
            de Benito Sneakers. Meta trata esa información según su propia política de privacidad.
          </li>
        </ul>
        <p>
          <strong className="text-white">Cómo limitarlo:</strong> podés bloquear o borrar las
          cookies de terceros desde la configuración de tu navegador, y administrar los anuncios que
          ves y la actividad que comparten los sitios con Meta desde la configuración de anuncios y
          privacidad de tu cuenta de Facebook o Instagram. Bloquear las cookies necesarias puede
          impedir que el carrito funcione.
        </p>
      </LegalSection>

      <LegalSection title="7. Cuánto tiempo los guardamos">
        <ul className="ml-5 list-disc space-y-2">
          <li>Los datos de tu cuenta, mientras la mantengas activa.</li>
          <li>
            Los datos de tus pedidos, durante el plazo que exigen las normas fiscales y
            comerciales.
          </li>
          <li>
            Las consultas y solicitudes, el tiempo necesario para resolverlas y conservar constancia
            de lo actuado.
          </li>
        </ul>
      </LegalSection>

      <LegalSection title="8. Cómo los protegemos">
        <p>
          El sitio funciona con conexión cifrada (HTTPS), las contraseñas se guardan cifradas y el
          acceso al panel de administración está restringido.
        </p>
      </LegalSection>

      <LegalSection title="9. Tus derechos">
        <p>Como titular de tus datos, podés pedirnos en cualquier momento:</p>
        <ul className="ml-5 list-disc space-y-2">
          <li>
            <strong className="text-white">Acceso:</strong> saber qué datos tuyos tenemos. Es
            gratuito si lo pedís con intervalos no menores a seis meses, salvo que acredites un
            interés legítimo para pedirlo antes. Te respondemos dentro de los 10 días corridos.
          </li>
          <li>
            <strong className="text-white">Rectificación y actualización:</strong> corregir datos
            equivocados o desactualizados.
          </li>
          <li>
            <strong className="text-white">Supresión:</strong> que borremos tus datos, salvo los
            que debamos conservar por una obligación legal.
          </li>
          <li>
            <strong className="text-white">Dejar de recibir publicidad:</strong> retirar tu
            consentimiento para fines publicitarios.
          </li>
        </ul>
        <p>
          Las rectificaciones, actualizaciones y supresiones se resuelven dentro de los 5 días
          hábiles. Para ejercer cualquiera de estos derechos, escribinos desde el email con el que
          compraste o adjuntando una copia de tu DNI, para que podamos verificar que sos vos:
        </p>
        <ul className="ml-5 list-disc space-y-1">
          <ContactLines info={info} />
        </ul>
      </LegalSection>

      <LegalSection title="10. Menores de edad">
        <p>
          El sitio está dirigido a personas mayores de 18 años. Si sos menor, pedile a un adulto
          responsable que haga la compra.
        </p>
      </LegalSection>

      <LegalSection title="11. Cambios en esta política">
        <p>
          Si cambiamos esta política, publicamos la nueva versión en esta página con su fecha de
          actualización. También podés consultar los{" "}
          <Link href="/legales/terminos" className="text-white underline underline-offset-4">
            Términos y condiciones
          </Link>
          .
        </p>
      </LegalSection>

      <LegalSection title="12. Órgano de control">
        <p className="rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm">{AAIP_LEGEND}</p>
      </LegalSection>
    </LegalPage>
  );
}
