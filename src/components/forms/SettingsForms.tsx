"use client";

import { useActionState, useState } from "react";
import {
  updateContactAction,
  updatePromotionAction,
  updateAppearanceAction,
  updateMercadoPagoAction,
  updateHeroAction,
  updateShippingAction,
  updateEmailAction,
  type SettingsState,
} from "@/actions/settings";
import { AR_PROVINCES } from "@/lib/shipping";

const initial: SettingsState = {};

const inputClass =
  "rounded-lg border border-black/15 bg-white px-3 py-2 text-[var(--color-navy)] outline-none focus:border-[var(--color-navy)] dark:border-white/15 dark:bg-white/5 dark:text-white dark:focus:border-white";
const labelClass = "text-sm font-medium text-[var(--color-navy)] dark:text-gray-200";
const cardClass =
  "rounded-xl bg-white p-6 shadow-sm dark:bg-[#151833] dark:shadow-none";

export function ContactForm({
  defaults,
}: {
  defaults: {
    whatsapp: string;
    whatsappMessage: string;
    instagram: string;
    tiktok: string;
    transferAlias: string;
  };
}) {
  const [state, action, pending] = useActionState(updateContactAction, initial);

  return (
    <form action={action} className={`${cardClass} flex flex-col gap-4`}>
      <div>
        <h2 className="text-lg font-semibold text-[var(--color-navy)] dark:text-white">
          Datos de contacto
        </h2>
        <p className="text-sm text-gray-500 dark:text-gray-400">
          Se muestran en el footer de la tienda y en el checkout.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="flex flex-col gap-1">
          <label className={labelClass} htmlFor="whatsapp">
            WhatsApp (con código país, ej: 5493704000000)
          </label>
          <input id="whatsapp" name="whatsapp" defaultValue={defaults.whatsapp} className={inputClass} />
        </div>
        <div className="flex flex-col gap-1 sm:col-span-2">
          <label className={labelClass} htmlFor="whatsappMessage">
            Mensaje por defecto del botón de WhatsApp
          </label>
          <input
            id="whatsappMessage"
            name="whatsappMessage"
            defaultValue={defaults.whatsappMessage}
            placeholder="¡Hola Benito Sneakers! Tengo una consulta 👟"
            className={inputClass}
          />
        </div>
        <div className="flex flex-col gap-1">
          <label className={labelClass} htmlFor="instagram">
            Instagram (usuario, sin @)
          </label>
          <input id="instagram" name="instagram" defaultValue={defaults.instagram} className={inputClass} />
        </div>
        <div className="flex flex-col gap-1">
          <label className={labelClass} htmlFor="tiktok">
            TikTok (usuario, sin @)
          </label>
          <input id="tiktok" name="tiktok" defaultValue={defaults.tiktok} className={inputClass} />
        </div>
        <div className="flex flex-col gap-1">
          <label className={labelClass} htmlFor="transferAlias">
            Alias de transferencia
          </label>
          <input
            id="transferAlias"
            name="transferAlias"
            defaultValue={defaults.transferAlias}
            className={inputClass}
          />
        </div>
      </div>

      <div className="flex items-center gap-3">
        <button
          type="submit"
          disabled={pending}
          className="w-fit rounded-md bg-[var(--color-navy)] px-5 py-2 font-semibold text-white hover:bg-[var(--color-navy-light)] disabled:opacity-60"
        >
          {pending ? "Guardando..." : "Guardar contacto"}
        </button>
        {state.ok && <span className="text-sm text-green-600 dark:text-green-400">✓ Guardado</span>}
        {state.error && <span className="text-sm text-red-600 dark:text-red-400">{state.error}</span>}
      </div>
    </form>
  );
}

const PALETTES = [
  { name: "Noche", bg: "#0a0f24", accent: "#8b6dff" },
  { name: "Esmeralda", bg: "#07211b", accent: "#34d399" },
  { name: "Vino", bg: "#1f0a18", accent: "#fb7185" },
  { name: "Carbón", bg: "#0c0d12", accent: "#f59e0b" },
  { name: "Océano", bg: "#06182a", accent: "#38bdf8" },
];

const FONTS = [
  { value: "moderna", label: "Moderna (Space Grotesk)" },
  { value: "clasica", label: "Clásica (Geist)" },
  { value: "mono", label: "Mono (técnica)" },
];

export function AppearanceForm({
  defaults,
}: {
  defaults: { storeBg: string; storeAccent: string; storeFont: string };
}) {
  const [state, action, pending] = useActionState(updateAppearanceAction, initial);
  const [bg, setBg] = useState(defaults.storeBg);
  const [accent, setAccent] = useState(defaults.storeAccent);

  return (
    <form action={action} className={`${cardClass} flex flex-col gap-5`}>
      <div>
        <h2 className="text-lg font-semibold text-[var(--color-navy)] dark:text-white">
          Apariencia de la tienda
        </h2>
        <p className="text-sm text-gray-500 dark:text-gray-400">
          Paleta de colores y tipografía de la tienda pública.
        </p>
      </div>

      {/* live preview */}
      <div
        className="flex items-center justify-between rounded-xl p-5"
        style={{ background: bg }}
      >
        <span className="text-sm font-medium text-white">Vista previa</span>
        <span
          className="rounded-full px-4 py-2 text-sm font-medium text-white"
          style={{ background: accent }}
        >
          Botón
        </span>
      </div>

      <div>
        <p className={labelClass}>Paletas rápidas</p>
        <div className="mt-2 flex flex-wrap gap-2">
          {PALETTES.map((p) => (
            <button
              key={p.name}
              type="button"
              onClick={() => {
                setBg(p.bg);
                setAccent(p.accent);
              }}
              className="flex items-center gap-2 rounded-full border border-black/15 px-3 py-1.5 text-xs font-medium text-[var(--color-navy)] hover:border-[var(--color-navy)] dark:border-white/15 dark:text-white"
            >
              <span className="h-4 w-4 rounded-full" style={{ background: p.bg }} />
              <span className="h-4 w-4 rounded-full" style={{ background: p.accent }} />
              {p.name}
            </button>
          ))}
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="flex flex-col gap-1">
          <label className={labelClass} htmlFor="storeBg">
            Color de fondo
          </label>
          <div className="flex items-center gap-2">
            <input
              type="color"
              value={bg}
              onChange={(e) => setBg(e.target.value)}
              className="h-10 w-12 rounded border border-black/15 dark:border-white/15"
            />
            <input
              name="storeBg"
              value={bg}
              onChange={(e) => setBg(e.target.value)}
              className={`${inputClass} flex-1`}
            />
          </div>
        </div>
        <div className="flex flex-col gap-1">
          <label className={labelClass} htmlFor="storeAccent">
            Color de acento
          </label>
          <div className="flex items-center gap-2">
            <input
              type="color"
              value={accent}
              onChange={(e) => setAccent(e.target.value)}
              className="h-10 w-12 rounded border border-black/15 dark:border-white/15"
            />
            <input
              name="storeAccent"
              value={accent}
              onChange={(e) => setAccent(e.target.value)}
              className={`${inputClass} flex-1`}
            />
          </div>
        </div>
      </div>

      <div className="flex flex-col gap-1">
        <label className={labelClass} htmlFor="storeFont">
          Tipografía
        </label>
        <select
          id="storeFont"
          name="storeFont"
          defaultValue={defaults.storeFont}
          className={inputClass}
        >
          {FONTS.map((f) => (
            <option key={f.value} value={f.value}>
              {f.label}
            </option>
          ))}
        </select>
      </div>

      <div className="flex items-center gap-3">
        <button
          type="submit"
          disabled={pending}
          className="w-fit rounded-md bg-[var(--color-navy)] px-5 py-2 font-semibold text-white hover:bg-[var(--color-navy-light)] disabled:opacity-60"
        >
          {pending ? "Guardando..." : "Guardar apariencia"}
        </button>
        {state.ok && <span className="text-sm text-green-600 dark:text-green-400">✓ Guardado</span>}
        {state.error && <span className="text-sm text-red-600 dark:text-red-400">{state.error}</span>}
      </div>
    </form>
  );
}

export function HeroForm({
  defaults,
  products,
}: {
  defaults: {
    heroProductId: string;
    heroImage: string;
    heroTitle: string;
    heroSubtitle: string;
    heroBadge: string;
    heroCtaText: string;
    heroCtaLink: string;
  };
  products: { id: string; label: string; image: string | null }[];
}) {
  const [state, action, pending] = useActionState(updateHeroAction, initial);
  const [selectedId, setSelectedId] = useState(defaults.heroProductId);

  const selectedImg =
    products.find((p) => p.id === selectedId)?.image ?? null;
  const previewImg = defaults.heroImage || selectedImg;

  return (
    <form action={action} className={`${cardClass} flex flex-col gap-4`}>
      <div>
        <h2 className="text-lg font-semibold text-[var(--color-navy)] dark:text-white">
          Portada (primer vistazo)
        </h2>
        <p className="text-sm text-gray-500 dark:text-gray-400">
          Elegí qué producto se destaca en la pantalla de inicio, o subí un banner propio.
        </p>
      </div>

      {previewImg && (
        <div className="flex items-center gap-4 rounded-xl border border-black/10 bg-gray-50 p-3 dark:border-white/10 dark:bg-white/5">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={previewImg}
            alt="Vista previa de portada"
            className="h-20 w-20 rounded-lg object-cover"
          />
          <div className="text-sm text-gray-600 dark:text-gray-300">
            <p className="font-medium">Vista previa actual</p>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              {defaults.heroImage ? "Banner propio cargado" : "Imagen del producto destacado"}
            </p>
          </div>
        </div>
      )}

      <div className="flex flex-col gap-1">
        <label className={labelClass} htmlFor="heroProductId">
          Producto destacado
        </label>
        <select
          id="heroProductId"
          name="heroProductId"
          value={selectedId}
          onChange={(e) => setSelectedId(e.target.value)}
          className={inputClass}
        >
          <option value="">— El más nuevo (automático) —</option>
          {products.map((p) => (
            <option key={p.id} value={p.id}>
              {p.label}
            </option>
          ))}
        </select>
      </div>

      <div className="flex flex-col gap-1">
        <label className={labelClass} htmlFor="heroBadge">
          Etiqueta superior (texto chico arriba del título)
        </label>
        <input
          id="heroBadge"
          name="heroBadge"
          defaultValue={defaults.heroBadge}
          placeholder="Zapatillas alternativas"
          className={inputClass}
        />
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="flex flex-col gap-1">
          <label className={labelClass} htmlFor="heroTitle">
            Título de portada (opcional)
          </label>
          <input
            id="heroTitle"
            name="heroTitle"
            defaultValue={defaults.heroTitle}
            placeholder="Tu próximo par, flotando hacia vos."
            className={inputClass}
          />
        </div>
        <div className="flex flex-col gap-1">
          <label className={labelClass} htmlFor="heroSubtitle">
            Subtítulo (opcional)
          </label>
          <input
            id="heroSubtitle"
            name="heroSubtitle"
            defaultValue={defaults.heroSubtitle}
            placeholder="Modelos únicos y pares contados."
            className={inputClass}
          />
        </div>
        <div className="flex flex-col gap-1">
          <label className={labelClass} htmlFor="heroCtaText">
            Texto del botón principal
          </label>
          <input
            id="heroCtaText"
            name="heroCtaText"
            defaultValue={defaults.heroCtaText}
            placeholder="Ver catálogo"
            className={inputClass}
          />
        </div>
        <div className="flex flex-col gap-1">
          <label className={labelClass} htmlFor="heroCtaLink">
            Link del botón principal
          </label>
          <input
            id="heroCtaLink"
            name="heroCtaLink"
            defaultValue={defaults.heroCtaLink}
            placeholder="#catalogo"
            className={inputClass}
          />
        </div>
      </div>

      <div className="flex flex-col gap-1">
        <label className={labelClass} htmlFor="heroImage">
          Banner propio (opcional — si lo subís, reemplaza la foto del producto)
        </label>
        <input
          id="heroImage"
          name="heroImage"
          type="file"
          accept="image/*"
          className={inputClass}
        />
        {defaults.heroImage && (
          <label className="mt-1 flex items-center gap-2 text-sm text-gray-600 dark:text-gray-300">
            <input type="checkbox" name="removeBanner" className="h-4 w-4" />
            Quitar el banner propio y volver a la foto del producto
          </label>
        )}
      </div>

      <div className="flex items-center gap-3">
        <button
          type="submit"
          disabled={pending}
          className="w-fit rounded-md bg-[var(--color-navy)] px-5 py-2 font-semibold text-white hover:bg-[var(--color-navy-light)] disabled:opacity-60"
        >
          {pending ? "Guardando..." : "Guardar portada"}
        </button>
        {state.ok && <span className="text-sm text-green-600 dark:text-green-400">✓ Guardado</span>}
        {state.error && <span className="text-sm text-red-600 dark:text-red-400">{state.error}</span>}
      </div>
    </form>
  );
}

export function ShippingForm({
  defaults,
}: {
  defaults: {
    shipPackageWeight: number;
    shipPackageL: number;
    shipPackageW: number;
    shipPackageH: number;
    shipOriginCp: string;
    shipFreeThreshold: number;
    shipDefaultRate: number;
    rates: Record<string, number>;
    pickupEnabled: boolean;
    pickupProvince: string;
    pickupNote: string;
  };
}) {
  const [state, action, pending] = useActionState(updateShippingAction, initial);

  return (
    <form action={action} className={`${cardClass} flex flex-col gap-5`}>
      <div>
        <h2 className="text-lg font-semibold text-[var(--color-navy)] dark:text-white">
          Envíos
        </h2>
        <p className="text-sm text-gray-500 dark:text-gray-400">
          Tarifa por provincia (se muestra al cliente en el checkout). Más adelante se puede pasar a
          cotización en vivo con Correo Argentino.
        </p>
      </div>

      {/* Caja y origen */}
      <div>
        <p className={`${labelClass} mb-2`}>Caja de despacho (para la futura cotización en vivo)</p>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-5">
          <Labeled label="Peso (kg)">
            <input name="shipPackageWeight" type="number" step="0.1" defaultValue={defaults.shipPackageWeight} className={inputClass} />
          </Labeled>
          <Labeled label="Largo (cm)">
            <input name="shipPackageL" type="number" defaultValue={defaults.shipPackageL} className={inputClass} />
          </Labeled>
          <Labeled label="Ancho (cm)">
            <input name="shipPackageW" type="number" defaultValue={defaults.shipPackageW} className={inputClass} />
          </Labeled>
          <Labeled label="Alto (cm)">
            <input name="shipPackageH" type="number" defaultValue={defaults.shipPackageH} className={inputClass} />
          </Labeled>
          <Labeled label="CP origen">
            <input name="shipOriginCp" defaultValue={defaults.shipOriginCp} className={inputClass} />
          </Labeled>
        </div>
      </div>

      {/* Reglas generales */}
      <div className="grid gap-3 sm:grid-cols-2">
        <Labeled label="Envío gratis desde (ARS, 0 = desactivado)">
          <input name="shipFreeThreshold" type="number" defaultValue={defaults.shipFreeThreshold} className={inputClass} />
        </Labeled>
        <Labeled label="Tarifa por defecto (provincias sin valor)">
          <input name="shipDefaultRate" type="number" defaultValue={defaults.shipDefaultRate} className={inputClass} />
        </Labeled>
      </div>

      {/* Retiro */}
      <div className="rounded-lg border border-black/10 p-4 dark:border-white/10">
        <label className="flex items-center gap-2 text-sm font-medium text-[var(--color-navy)] dark:text-gray-200">
          <input type="checkbox" name="pickupEnabled" defaultChecked={defaults.pickupEnabled} className="h-4 w-4" />
          Permitir retiro en persona (gratis)
        </label>
        <div className="mt-3 grid gap-3 sm:grid-cols-2">
          <Labeled label="Solo para clientes de esta provincia">
            <select name="pickupProvince" defaultValue={defaults.pickupProvince} className={inputClass}>
              {AR_PROVINCES.map((p) => (
                <option key={p} value={p}>{p}</option>
              ))}
            </select>
          </Labeled>
          <Labeled label="Nota de retiro (dirección/horarios)">
            <input name="pickupNote" defaultValue={defaults.pickupNote} placeholder="Coordinamos por WhatsApp" className={inputClass} />
          </Labeled>
        </div>
      </div>

      {/* Tarifas por provincia */}
      <div>
        <p className={`${labelClass} mb-2`}>Tarifa por provincia (ARS) — dejá en blanco para usar la tarifa por defecto</p>
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
          {AR_PROVINCES.map((p) => (
            <div key={p} className="flex items-center gap-2">
              <label className="w-32 shrink-0 truncate text-xs text-gray-600 dark:text-gray-300" title={p}>
                {p}
              </label>
              <input
                name={`rate__${p}`}
                type="number"
                defaultValue={defaults.rates[p] ?? ""}
                placeholder="—"
                className={`${inputClass} flex-1`}
              />
            </div>
          ))}
        </div>
      </div>

      <div className="flex items-center gap-3">
        <button
          type="submit"
          disabled={pending}
          className="w-fit rounded-md bg-[var(--color-navy)] px-5 py-2 font-semibold text-white hover:bg-[var(--color-navy-light)] disabled:opacity-60"
        >
          {pending ? "Guardando..." : "Guardar envíos"}
        </button>
        {state.ok && <span className="text-sm text-green-600 dark:text-green-400">✓ Guardado</span>}
        {state.error && <span className="text-sm text-red-600 dark:text-red-400">{state.error}</span>}
      </div>
    </form>
  );
}

function Labeled({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-1">
      <label className="text-xs text-gray-600 dark:text-gray-300">{label}</label>
      {children}
    </div>
  );
}

export function EmailForm({
  defaults,
  connected,
  source,
}: {
  defaults: { smtpUser: string; mailFromName: string };
  connected: boolean;
  source: "env" | "panel" | null;
}) {
  const [state, action, pending] = useActionState(updateEmailAction, initial);

  return (
    <form action={action} className={`${cardClass} flex flex-col gap-4`}>
      <div className="flex items-start justify-between gap-4">
        <div>
          <h2 className="text-lg font-semibold text-[var(--color-navy)] dark:text-white">
            Email (Gmail)
          </h2>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Para enviar verificación de cuenta, recuperación de contraseña y el código de
            seguimiento. Usá una <strong>contraseña de aplicación</strong> de Gmail (no tu
            contraseña normal).
          </p>
        </div>
        <span
          className={`shrink-0 rounded-full px-3 py-1 text-xs font-semibold ${
            connected
              ? "bg-green-100 text-green-700 dark:bg-green-500/20 dark:text-green-400"
              : "bg-gray-200 text-gray-600 dark:bg-white/10 dark:text-gray-300"
          }`}
        >
          {connected ? "● Conectado" : "○ Sin conectar"}
        </span>
      </div>

      {connected && source === "env" && (
        <p className="rounded-lg border border-green-200 bg-green-50 px-3 py-2 text-xs text-green-700 dark:border-green-500/30 dark:bg-green-500/10 dark:text-green-400">
          Configurado por variables de entorno (.env).
        </p>
      )}

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="flex flex-col gap-1">
          <label className={labelClass} htmlFor="smtpUser">
            Tu Gmail
          </label>
          <input
            id="smtpUser"
            name="smtpUser"
            defaultValue={defaults.smtpUser}
            placeholder="benito.fsa4@gmail.com"
            className={inputClass}
          />
        </div>
        <div className="flex flex-col gap-1">
          <label className={labelClass} htmlFor="mailFromName">
            Nombre del remitente
          </label>
          <input
            id="mailFromName"
            name="mailFromName"
            defaultValue={defaults.mailFromName}
            placeholder="Benito Sneakers"
            className={inputClass}
          />
        </div>
      </div>

      <div className="flex flex-col gap-1">
        <label className={labelClass} htmlFor="smtpPass">
          Contraseña de aplicación (16 letras)
        </label>
        <input
          id="smtpPass"
          name="smtpPass"
          type="password"
          placeholder={connected ? "•••••••••••••••• (ya cargada, dejá vacío para no cambiar)" : "abcd efgh ijkl mnop"}
          className={inputClass}
        />
        <p className="text-xs text-gray-500 dark:text-gray-400">
          La sacás en myaccount.google.com/apppasswords (requiere verificación en 2 pasos). Si dejás
          vacío, se mantiene la actual.
        </p>
      </div>

      <div className="flex items-center gap-3">
        <button
          type="submit"
          disabled={pending}
          className="w-fit rounded-md bg-[var(--color-navy)] px-5 py-2 font-semibold text-white hover:bg-[var(--color-navy-light)] disabled:opacity-60"
        >
          {pending ? "Guardando..." : "Guardar email"}
        </button>
        {state.ok && <span className="text-sm text-green-600 dark:text-green-400">✓ Guardado</span>}
        {state.error && <span className="text-sm text-red-600 dark:text-red-400">{state.error}</span>}
      </div>
    </form>
  );
}

export function MercadoPagoForm({
  defaults,
  connected,
  source,
}: {
  defaults: { mpPublicKey: string };
  connected: boolean;
  source: "env" | "panel" | null;
}) {
  const [state, action, pending] = useActionState(updateMercadoPagoAction, initial);

  return (
    <form action={action} className={`${cardClass} flex flex-col gap-4`}>
      <div className="flex items-start justify-between gap-4">
        <div>
          <h2 className="text-lg font-semibold text-[var(--color-navy)] dark:text-white">
            Mercado Pago
          </h2>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Cobrá online con Checkout Pro. El cliente paga con tarjeta, dinero en cuenta o cuotas.
          </p>
        </div>
        <span
          className={`shrink-0 rounded-full px-3 py-1 text-xs font-semibold ${
            connected
              ? "bg-green-100 text-green-700 dark:bg-green-500/20 dark:text-green-400"
              : "bg-gray-200 text-gray-600 dark:bg-white/10 dark:text-gray-300"
          }`}
        >
          {connected ? "● Conectado" : "○ Sin conectar"}
        </span>
      </div>

      {connected && source === "env" && (
        <p className="rounded-lg border border-green-200 bg-green-50 px-3 py-2 text-xs text-green-700 dark:border-green-500/30 dark:bg-green-500/10 dark:text-green-400">
          Las credenciales están cargadas por variable de entorno (.env). Lo que cargues acá tiene
          prioridad solo si dejás vacío el .env.
        </p>
      )}

      <div className="flex flex-col gap-1">
        <label className={labelClass} htmlFor="mpAccessToken">
          Access Token (privado — empieza con APP_USR- o TEST-)
        </label>
        <input
          id="mpAccessToken"
          name="mpAccessToken"
          type="password"
          placeholder={connected ? "•••••••••• (ya cargado, dejalo vacío para no cambiarlo)" : "APP_USR-..."}
          className={inputClass}
        />
        <p className="text-xs text-gray-500 dark:text-gray-400">
          Conseguilo en developers.mercadopago.com → Tus integraciones → Credenciales. Si dejás
          este campo vacío, se mantiene el token actual.
        </p>
      </div>

      <div className="flex flex-col gap-1">
        <label className={labelClass} htmlFor="mpPublicKey">
          Public Key
        </label>
        <input
          id="mpPublicKey"
          name="mpPublicKey"
          defaultValue={defaults.mpPublicKey}
          placeholder="APP_USR-..."
          className={inputClass}
        />
      </div>

      <div className="flex items-center gap-3">
        <button
          type="submit"
          disabled={pending}
          className="w-fit rounded-md bg-[var(--color-navy)] px-5 py-2 font-semibold text-white hover:bg-[var(--color-navy-light)] disabled:opacity-60"
        >
          {pending ? "Guardando..." : "Guardar Mercado Pago"}
        </button>
        {state.ok && <span className="text-sm text-green-600 dark:text-green-400">✓ Guardado</span>}
        {state.error && <span className="text-sm text-red-600 dark:text-red-400">{state.error}</span>}
      </div>
    </form>
  );
}

export function PromotionForm({
  defaults,
}: {
  defaults: {
    enabled: boolean;
    title: string;
    message: string;
    couponCode: string;
    ctaText: string;
    ctaLink: string;
    endsAtLocal: string;
  };
}) {
  const [state, action, pending] = useActionState(updatePromotionAction, initial);

  return (
    <form action={action} className={`${cardClass} flex flex-col gap-4`}>
      <div>
        <h2 className="text-lg font-semibold text-[var(--color-navy)] dark:text-white">
          Popup promocional
        </h2>
        <p className="text-sm text-gray-500 dark:text-gray-400">
          Ventana emergente que ve el cliente al entrar a la tienda.
        </p>
      </div>

      <label className="flex items-center gap-2 text-sm text-[var(--color-navy)] dark:text-gray-200">
        <input type="checkbox" name="enabled" defaultChecked={defaults.enabled} className="h-4 w-4" />
        Mostrar el popup en la tienda
      </label>

      <div className="flex flex-col gap-1">
        <label className={labelClass} htmlFor="title">
          Título (gancho principal)
        </label>
        <input id="title" name="title" defaultValue={defaults.title} className={inputClass} />
      </div>

      <div className="flex flex-col gap-1">
        <label className={labelClass} htmlFor="message">
          Mensaje
        </label>
        <textarea
          id="message"
          name="message"
          rows={3}
          defaultValue={defaults.message}
          className={inputClass}
        />
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="flex flex-col gap-1">
          <label className={labelClass} htmlFor="couponCode">
            Código de cupón a mostrar (opcional)
          </label>
          <input id="couponCode" name="couponCode" defaultValue={defaults.couponCode} className={inputClass} />
          <p className="text-xs text-gray-500 dark:text-gray-400">
            Creá y administrá los códigos (y su % de descuento) en la sección <strong>Cupones</strong>.
          </p>
        </div>
        <div className="flex flex-col gap-1">
          <label className={labelClass} htmlFor="endsAt">
            Termina el (cuenta regresiva, opcional)
          </label>
          <input
            id="endsAt"
            name="endsAt"
            type="datetime-local"
            defaultValue={defaults.endsAtLocal}
            className={inputClass}
          />
        </div>
        <div className="flex flex-col gap-1">
          <label className={labelClass} htmlFor="ctaText">
            Texto del botón (CTA)
          </label>
          <input id="ctaText" name="ctaText" defaultValue={defaults.ctaText} className={inputClass} />
        </div>
        <div className="flex flex-col gap-1">
          <label className={labelClass} htmlFor="ctaLink">
            Link del botón (ej: / o /producto/...)
          </label>
          <input id="ctaLink" name="ctaLink" defaultValue={defaults.ctaLink} className={inputClass} />
        </div>
      </div>

      <div className="flex items-center gap-3">
        <button
          type="submit"
          disabled={pending}
          className="w-fit rounded-md bg-[var(--color-navy)] px-5 py-2 font-semibold text-white hover:bg-[var(--color-navy-light)] disabled:opacity-60"
        >
          {pending ? "Guardando..." : "Guardar promoción"}
        </button>
        {state.ok && <span className="text-sm text-green-600 dark:text-green-400">✓ Guardado</span>}
        {state.error && <span className="text-sm text-red-600 dark:text-red-400">{state.error}</span>}
      </div>
    </form>
  );
}
