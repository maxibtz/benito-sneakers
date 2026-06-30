import QRCode from "qrcode";
import { waLink, DEFAULT_WA_MESSAGE } from "@/lib/whatsapp";

export async function WhatsAppPanel({
  number,
  message,
}: {
  number: string;
  message: string;
}) {
  const link = waLink(number, message || DEFAULT_WA_MESSAGE);

  return (
    <div className="rounded-xl bg-white p-6 shadow-sm dark:bg-[#151833] dark:shadow-none">
      <div className="mb-4">
        <h2 className="text-lg font-semibold text-[var(--color-navy)] dark:text-white">
          WhatsApp · Código QR
        </h2>
        <p className="text-sm text-gray-500 dark:text-gray-400">
          El cliente escanea este QR <strong>con la cámara del celular</strong> (o toca el botón en
          la tienda) y se abre un chat con vos, con un mensaje ya escrito. Ideal para dudas y para
          pedir el código de seguimiento.
        </p>
        <p className="mt-2 rounded-lg border border-amber-300 bg-amber-50 px-3 py-2 text-xs text-amber-800 dark:border-amber-500/30 dark:bg-amber-500/10 dark:text-amber-300">
          ⚠️ Escaneá con la <strong>cámara del teléfono</strong>, NO con el escáner de “Vincular
          dispositivo” de WhatsApp (ese es solo para WhatsApp Web y va a rechazar este código).
        </p>
      </div>

      {!link ? (
        <div className="rounded-lg border border-amber-300 bg-amber-50 px-4 py-3 text-sm text-amber-800 dark:border-amber-500/30 dark:bg-amber-500/10 dark:text-amber-300">
          Cargá tu número de WhatsApp arriba (con código de país, ej: <strong>5493704000000</strong>)
          y guardá. El QR y los botones aparecen automáticamente.
        </div>
      ) : (
        <div className="flex flex-col items-start gap-4 sm:flex-row sm:items-center">
          <div
            className="rounded-xl bg-white p-3"
            dangerouslySetInnerHTML={{
              __html: await QRCode.toString(link, { type: "svg", margin: 1, width: 180 }),
            }}
          />
          <div className="flex flex-col gap-2 text-sm">
            <p className="text-gray-600 dark:text-gray-300">
              Escaneá para probar, o compartí este link:
            </p>
            <a
              href={link}
              target="_blank"
              rel="noopener noreferrer"
              className="break-all font-medium text-[var(--color-navy)] underline dark:text-[var(--color-lilac-light)]"
            >
              {link}
            </a>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              Tip: descargá el QR (clic derecho → guardar imagen) para imprimirlo o ponerlo en tus
              redes / local.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
