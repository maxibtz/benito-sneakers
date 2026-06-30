# Pendientes — Benito Sneakers

_Última actualización: 2026-06-28_

## ✅ Ya hecho (para tener contexto)
- Tienda night-blue con ilusión óptica, buscador y filtros por marca.
- Productos con **precio real + promocional** (tachado) y **costo + margen** (dashboard de rentabilidad).
- **Cupones** funcionales (descuento validado en server) + popup promocional editable.
- **Mercado Pago Checkout Pro** integrado y funcionando con credenciales de **PRUEBA** (TEST). Auto-sync de estado de pago + botón "Actualizar pago" en el admin.
- **Login de clientes** + métricas (registrados/activos) + dashboard con gráficos (cupón, recompra, ventas).
- **Galería de producto** con miniaturas, flechas y zoom a pantalla completa.
- **Home de 10 bloques** 100% editable desde Admin › Contenido home (beneficios, problema/solución, testimonios, categorías, diferenciales, UGC, FAQ, CTA). Hero editable en Ajustes.
- **WhatsApp click-to-chat + QR** en el panel; botón flotante, botón en FAQ y "pedir seguimiento" en la confirmación.
- **Envíos por tabla de provincia** + envío gratis desde $X + **retiro gratis solo Formosa**; costo recalculado en server y sumado al total/MP.
- Alerta de sonido al terminar cada respuesta (hook `tada.wav`).

---

## 🔴 Próxima sesión — prioritario

### Mercado Pago → producción
- [ ] Cargar mi **número de WhatsApp real** en Admin › Ajustes › Datos de contacto (activa QR y botones).
- [ ] Cuando vaya a cobrar de verdad: cambiar de credenciales **TEST** a **PRODUCCIÓN** (APP_USR) en Ajustes › Mercado Pago.
- [ ] **Regenerar el Access Token de prueba** (lo compartí por chat) desde el panel de MP por las dudas.
- [ ] Configurar **webhook con dominio real** (variable `APP_URL`): en localhost el webhook no entra; hoy se cubre con sync al volver del pago + auto-sync en el admin.

### Envíos → cotización en vivo (Correo Argentino)
- [ ] Registrarme en **MiCorreo / PAQ.AR** y pedir credenciales de API a un ejecutivo comercial.
- [ ] Integrar el **endpoint de cotización** (peso + medidas + CP) para reemplazar la tabla por provincia. La estructura ya está lista.
- [ ] Mientras tanto: **ajustar la tabla de tarifas por provincia** (hoy hay valores de EJEMPLO) con precios reales.

---

## 🟡 Mejoras de funcionamiento
- [ ] **Checkouts abandonados retienen stock**: automatizar que los pedidos pendientes (sobre todo MP no pagados) se cancelen solos tras X tiempo y devuelvan el stock.
- [ ] **Notificaciones automáticas**: definir servicio para avisar "pedido despachado / pagado" por email (SMTP) y/o WhatsApp Business API (hoy es manual / click-to-chat).
- [ ] **Email de confirmación** automático al cliente al hacer el pedido.

---

## 🟢 Contenido / marca (cargar lo real, hoy hay ejemplos)
- [ ] Cargar **testimonios reales**, **categorías**, **UGC (fotos de clientes)** y **FAQ propias** en Admin › Contenido home.
- [ ] (Opcional) Sumar **foto al testimonio** (hoy usa iniciales).
- [ ] Elegir **producto destacado o banner propio** del Hero en Ajustes.
- [ ] Subir el **logo real** (`D:\BENITO\LOGO DEF.jpeg`) al header/favicon.
- [ ] Revisar **stock real por talle** de los 8 modelos (hoy son inventados).
- [ ] Decidir si se suma la línea **"vans knu"** (carpeta que no cargamos).

---

## 🎨 Diseño / pulido
- [ ] Revisar **mobile** de toda la tienda: home de 10 bloques, galería, checkout, panel.
- [ ] Pasada de accesibilidad (contraste, lectores de pantalla).

---

## 🚀 Antes de salir a producción
- [ ] Comprar **dominio**.
- [ ] **Hosting** (Vercel es lo más simple para Next.js) y desplegar.
- [ ] Migrar de **SQLite → Postgres** (SQLite es solo desarrollo local).
- [ ] Cambiar **`AUTH_SECRET`** y la **contraseña de admin** a algo definitivo.
- [ ] Setear `APP_URL` con el dominio final (para back_urls y webhook de MP).
