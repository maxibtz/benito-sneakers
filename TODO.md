# Pendientes — Benito Sneakers

_Última actualización: 2026-06-30_

## ✅ Ya hecho
- Tienda + panel **ONLINE** en Railway (SQLite en disco persistente `/data`).
- **Dominio** `benitosneakers.shop` conectado (Porkbun → Railway).
- Datos cargados en producción: **Mercado Pago**, **Gmail**, `APP_URL`.
- Migración de todos los datos previos (productos, secciones, cupones, hero, home, envíos).
- **Imágenes en editar producto**: ver, reordenar (1ª = principal) y borrar.
- **Productos**: buscador + filtros (sección/estado/orden) + **mini-dashboard** interconectado (stock, inventario, ventas, ganancia, margen).
- Seguridad: middleware de admin, `requireAdmin` en acciones, validación de uploads, **rate limiting** en logins/registro/reset/cupones.
- Home de 10 bloques editable, galería de producto con zoom, WhatsApp QR, envíos por provincia + retiro Formosa.

---

## 🔴 Mañana — PRIMERO: verificar que todo ande EN PRODUCCIÓN
La tienda está online, pero hay que probar de punta a punta con el dominio real:

- [ ] **Dominio en verde 🟢** con candado HTTPS. Probar `https://benitosneakers.shop` y `https://benitosneakers.shop/admin`.
- [ ] **Mercado Pago real**: hacer una compra de prueba con monto chico y confirmar que cobra y que el pedido queda "pagado" solo.
  - [ ] Configurar el **webhook** en el panel de MP → `https://benitosneakers.shop/api/mp/webhook` (ahora sí funciona porque hay dominio).
- [ ] **Emails**: hacer un pedido y cargarle un código de seguimiento → confirmar que llega el mail. Probar también recuperar contraseña y verificación de cuenta.
- [ ] **Imágenes persistentes**: subir una imagen a un producto, esperar un redeploy y confirmar que NO se borra (prueba del disco `/data`).

## 🔴 Mañana — importante para no quedar offline
- [ ] **Cargar una tarjeta en Railway** antes de que termine la prueba de 30 días (si no, la tienda se apaga). ~5 USD/mes.
- [ ] Pensar **backup** de la base: bajar `/data/prod.db` de Railway cada tanto.

---

## 🟡 Mejoras de funcionamiento
- [ ] **Email de confirmación automático** al cliente al hacer el pedido (hoy el de seguimiento es manual).
- [ ] **Checkouts abandonados**: cancelar solos los pedidos pendientes (MP no pagado) tras X tiempo y devolver el stock.
- [ ] **Envíos en vivo (Correo Argentino / PAQ.AR)**: registrarme, pedir credenciales API e integrar cotización por peso+medidas+CP. Mientras tanto, **ajustar la tabla de tarifas por provincia** (hoy hay valores de ejemplo).

---

## 🟢 Contenido / marca (cargar lo real)
- [ ] **Testimonios reales**, **categorías**, **UGC (fotos de clientes)** y **FAQ** propias en Admin › Contenido home.
- [ ] Subir el **logo real** (`D:\BENITO\LOGO DEF.jpeg`) al header/favicon.
- [ ] Revisar **stock real por talle** de cada modelo.
- [ ] Elegir **producto destacado / banner** del Hero.
- [ ] Cargar el **número de WhatsApp real** en Ajustes (activa QR y botones), si no está.
- [ ] Decidir si se suma la línea **"vans knu"**.

---

## 🎨 Diseño / pulido
- [ ] Revisar **mobile** de toda la tienda (home, galería, checkout, panel).
- [ ] Pasada de accesibilidad (contraste, lectores de pantalla).
