-- Textos de la home optimizados para conversión (skills cro + copywriting).
-- Reemplaza afirmaciones que no se pueden sostener (originalidad de zapatillas,
-- "AAA+", Mercado Pago, "mejor precio del mercado", escasez falsa).
UPDATE "SiteSettings" SET
  "heroBadge" = 'Zapatillas · Perfumes árabes · Ropa',
  "heroTitle" = 'Lo que no vas a ver en todos lados',
  "heroSubtitle" = 'Zapatillas cómodas para todo el día, perfumes árabes 100% originales y ropa, elegidos uno por uno. Te asesoramos por WhatsApp y te lo mandamos a todo el país.'
WHERE "id" = 'default';

UPDATE "HomeContent" SET
  "benefits" = '[{"icon":"🚚","title":"Envíos a todo el país","desc":"Ves el costo antes de pagar."},{"icon":"✅","title":"Stock real","desc":"Si está en la web, lo tenemos."},{"icon":"💸","title":"Transferencia sin recargo","desc":"Pagás el precio que ves, sin comisiones."},{"icon":"📍","title":"Seguí tu pedido","desc":"Estado en vivo, sin tener que preguntar."}]',
  "psTitle" = 'Sabemos lo que te preocupa',
  "psItems" = '[{"problem":"Llegás tarde y el modelo que querías ya se agotó.","solution":"El stock de la web es el real: si lo ves disponible, lo tenemos."},{"problem":"No sabés qué talle pedir sin probártelas.","solution":"Te asesoramos por WhatsApp según el modelo, y si no te queda tenés 15 días para cambiarlo."},{"problem":"Hay muchos perfumes árabes truchos dando vueltas.","solution":"Los nuestros son 100% originales y llegan con su caja y el sello intacto."},{"problem":"Te da miedo pagar y no recibir nada.","solution":"Te damos un número de pedido para seguirlo en vivo, y tenés 10 días para arrepentirte sin costo."}]',
  "differentialsTitle" = 'Por qué comprar en Benito',
  "differentials" = '[{"icon":"👟","title":"Elegidas una por una","desc":"Cada par lo elegimos por comodidad y diseño, para usar todo el día."},{"icon":"🧴","title":"Perfumes árabes originales","desc":"Fragancias originales, con su caja y el sello intacto."},{"icon":"🤝","title":"Atención personalizada","desc":"Te ayudamos a elegir talle, modelo o fragancia por WhatsApp."},{"icon":"🔄","title":"Cambios simples","desc":"15 días para cambiar el talle y 10 días para arrepentirte sin costo."}]',
  "faqs" = '[{"q":"¿Hacen envíos a todo el país?","a":"Sí. Enviamos a todo el país y ves el costo y el plazo estimado antes de pagar. Si estás en Formosa, también podés retirar."},{"q":"¿Cómo sé mi talle?","a":"Escribinos por WhatsApp con el modelo que te gusta y te decimos qué talle pedir. Si no te queda, tenés 15 días para cambiarlo."},{"q":"¿Cómo pago?","a":"Por transferencia bancaria, sin recargo: al confirmar el pedido te mostramos el alias y nos mandás el comprobante por WhatsApp. Si retirás en persona, también podés pagar en efectivo."},{"q":"¿Los perfumes son originales?","a":"Sí. Todos nuestros perfumes árabes son originales y llegan con su caja y el sello intacto."},{"q":"¿Puedo cambiar o devolver mi compra?","a":"Sí. Tenés 15 días para cambiar el talle o el modelo, y 10 días para arrepentirte sin costo. Está todo explicado en Cambios y devoluciones."},{"q":"¿Puedo seguir mi pedido?","a":"Sí. Al comprar te damos un link para ver el estado de tu pedido en todo momento."}]',
  "finalCtaTitle" = '¿Ya elegiste el tuyo?',
  "finalCtaText" = 'Si tenés dudas con el talle o la fragancia, escribinos por WhatsApp y te ayudamos a elegir.',
  "finalCtaButton" = 'Ver catálogo',
  "finalCtaLink" = '#catalogo'
WHERE "id" = 'default';

-- Error de tipeo en el nombre del producto.
UPDATE "Product" SET "model" = 'Suede XL' WHERE "brand" = 'Puma' AND "model" IN ('Saude XL', 'Saude XI');
