# Guía de despliegue — Benito Sneakers (Railway + dominio de Porkbun)

Esta guía deja la tienda online 24/7 con tu dominio. Seguí los pasos en orden.

---

## Resumen de cómo quedó preparado

- **Base de datos:** SQLite. En producción vive en un **disco persistente** (Railway Volume) montado en `/data`, así no se borra al actualizar.
- **Imágenes:** las nuevas se guardan en el disco persistente; las que ya cargaste viajan dentro del repo. Un route handler (`/uploads/products/...`) las sirve.
- **Migración de datos:** al primer arranque se copia `prisma/bootstrap.db` (snapshot de tu base actual, **sin** las credenciales sensibles) como base inicial. Tus productos, secciones, cupones, hero, bloques del home y config aparecen tal cual.
- **Arranque:** `npm run start:prod` → copia base inicial (1ª vez) → aplica migraciones → asegura el admin → levanta Next.

---

## Paso 1 — Subir el código a GitHub

1. Creá un repositorio **PRIVADO** en https://github.com/new (privado porque incluye el snapshot de tu base).
2. En la terminal, dentro de `D:\claudio\benito-sneakers`:
   ```bash
   git remote add origin https://github.com/TU_USUARIO/benito-sneakers.git
   git branch -M main
   git push -u origin main
   ```
   (El commit inicial ya está hecho.)

## Paso 2 — Crear el proyecto en Railway

1. Entrá a https://railway.app y registrate con GitHub.
2. **New Project → Deploy from GitHub repo →** elegí `benito-sneakers`.
3. Railway detecta Next.js y empieza a construir. Esperá (el primer build tarda).

## Paso 3 — Agregar el disco persistente (Volume)

1. En el servicio, pestaña **Variables/Settings → Volumes → New Volume**.
2. **Mount path:** `/data`
3. Guardar. (Acá viven la base y las imágenes nuevas, para siempre.)

## Paso 4 — Cargar las variables de entorno

En **Settings → Variables**, agregá (ver `.env.example` como referencia):

| Variable | Valor |
|---|---|
| `DATA_DIR` | `/data` |
| `DATABASE_URL` | `file:/data/prod.db` |
| `AUTH_SECRET` | (una clave larga aleatoria — podés reusar la actual) |
| `ADMIN_EMAIL` | `benito.fsa4@gmail.com` |
| `ADMIN_PASSWORD` | (tu contraseña de admin) |
| `APP_URL` | `https://TU-DOMINIO` (lo ajustás tras el Paso 6) |
| `MERCADOPAGO_ACCESS_TOKEN` | (tus credenciales de **producción** de MP) |
| `MERCADOPAGO_PUBLIC_KEY` | (idem) |
| `SMTP_USER` | `benito.fsa4@gmail.com` |
| `SMTP_PASS` | (tu contraseña de aplicación de Gmail) |
| `MAIL_FROM_NAME` | `Benito Sneakers` |
| `NEXT_PUBLIC_WHATSAPP_NUMBER` | (tu número, ej: `5493704...`) |
| `NEXT_PUBLIC_TRANSFER_ALIAS` | `benito.zapas` |

> Railway define `PORT` automáticamente; no la toques.

Tras guardar, Railway re-despliega. Cuando termine, abrí la URL temporal (`*.up.railway.app`) y verificá que la tienda carga con tus productos.

## Paso 5 — Conectar el dominio de Porkbun

1. En Railway: **Settings → Networking → Custom Domain →** escribí tu dominio (ej. `benitosneakers.com` y también `www.benitosneakers.com`).
2. Railway te muestra los registros DNS a cargar. Suele ser un **CNAME**:
   - Host/Name: `@` (o `www`) → Target: `xxxxx.up.railway.app`
   - Para el dominio raíz, si Porkbun no permite CNAME en `@`, usá el **ALIAS/ANAME** que ofrece Porkbun, o configurá `www` como principal y redirigí el raíz.

## Paso 6 — Cargar el DNS en Porkbun

1. En Porkbun: **Details** del dominio → **DNS Records**.
2. Borrá los registros de "parking" que vengan por defecto.
3. Agregá los que te dio Railway (CNAME/ALIAS). Guardá.
4. Esperá la propagación (minutos a unas horas). Railway marca el dominio como **Active** con el candado HTTPS.
5. Volvé al Paso 4 y poné `APP_URL=https://tu-dominio-real`. Re-despliega.

## Paso 7 — Mercado Pago en producción

1. En el panel de MP, generá las credenciales de **producción** (no las de prueba).
2. Cargalas en Railway (`MERCADOPAGO_ACCESS_TOKEN`, `MERCADOPAGO_PUBLIC_KEY`).
3. Configurá el **webhook** apuntando a `https://tu-dominio/api/mp/webhook` para que los pagos se confirmen solos.

---

## Mantenimiento

- **Actualizar la tienda:** hacés cambios local → `git push` → Railway redepliega solo. Tus datos del disco persistente **no se tocan**.
- **El snapshot `bootstrap.db` solo se usa la PRIMERA vez.** Después manda la base real del disco.
- **Backups:** descargá periódicamente `/data/prod.db` desde Railway (o configurá un backup del volumen).
