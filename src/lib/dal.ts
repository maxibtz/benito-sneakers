import { db } from "@/lib/db";

export async function getDashboardStats() {
  const since30 = new Date(Date.now() - 1000 * 60 * 60 * 24 * 30);
  const [totalProducts, totalOrders, pendingOrders, totalRevenue, customers, activeCustomers] =
    await Promise.all([
      db.product.count(),
      db.order.count(),
      db.order.count({ where: { status: { in: ["NUEVO", "EN_PREPARACION"] } } }),
      db.order.aggregate({
        _sum: { total: true },
        where: { status: { not: "CANCELADO" } },
      }),
      db.customer.count(),
      db.customer.count({ where: { lastLoginAt: { gte: since30 } } }),
    ]);

  const bestSellersRaw = await db.orderItem.groupBy({
    by: ["productId"],
    _sum: { quantity: true },
    orderBy: { _sum: { quantity: "desc" } },
    take: 5,
  });

  const bestSellers = await Promise.all(
    bestSellersRaw.map(async (row) => {
      const product = await db.product.findUnique({ where: { id: row.productId } });
      return { product, unitsSold: row._sum.quantity ?? 0 };
    })
  );

  // Ventas manuales (cargadas a mano): se suman a los ingresos.
  const manual = await db.manualSale.aggregate({ _sum: { total: true }, _count: true });
  const manualRevenue = manual._sum.total ?? 0;
  const manualCount = manual._count ?? 0;

  return {
    totalProducts,
    totalOrders,
    pendingOrders,
    totalRevenue: (totalRevenue._sum.total ?? 0) + manualRevenue,
    onlineRevenue: totalRevenue._sum.total ?? 0,
    manualRevenue,
    manualCount,
    customers,
    activeCustomers,
    bestSellers: bestSellers.filter((b) => b.product !== null),
  };
}

export type ManualSaleItem = { description: string; quantity: number; unitPrice: number };

export type ManualSaleRow = {
  id: string;
  soldAt: Date;
  customerName: string;
  channel: string;
  paymentMethod: string;
  items: ManualSaleItem[];
  total: number;
  cost: number;
  profit: number;
  note: string;
};

function parseSaleItems(raw: string): ManualSaleItem[] {
  try {
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed.map((it) => ({
      description: String(it?.description ?? ""),
      quantity: Number(it?.quantity) || 0,
      unitPrice: Number(it?.unitPrice) || 0,
    }));
  } catch {
    return [];
  }
}

export async function getManualSales(): Promise<ManualSaleRow[]> {
  const rows = await db.manualSale.findMany({ orderBy: { soldAt: "desc" } });
  return rows.map((r) => ({
    id: r.id,
    soldAt: r.soldAt,
    customerName: r.customerName,
    channel: r.channel,
    paymentMethod: r.paymentMethod,
    items: parseSaleItems(r.items),
    total: r.total,
    cost: r.cost,
    profit: r.total - r.cost,
    note: r.note,
  }));
}

export async function getManualSalesStats() {
  const agg = await db.manualSale.aggregate({
    _sum: { total: true, cost: true },
    _count: true,
  });
  const revenue = agg._sum.total ?? 0;
  const cost = agg._sum.cost ?? 0;
  return { count: agg._count ?? 0, revenue, cost, profit: revenue - cost };
}

export async function getProfitStats() {
  // Cruce automático: cada ítem vendido se cruza con el costo cargado en su producto.
  const [orders, products] = await Promise.all([
    db.order.findMany({
      where: { status: { not: "CANCELADO" } },
      select: {
        total: true,
        items: {
          select: {
            quantity: true,
            unitPrice: true,
            product: { select: { cost: true, costBreakdown: true } },
          },
        },
      },
    }),
    db.product.findMany({
      select: { cost: true, price: true, salePrice: true, variants: { select: { stock: true } } },
    }),
  ]);

  let netRevenue = 0;
  let cogs = 0;
  // Desglose de costos por concepto (de lo vendido)
  const costByComponent = new Map<string, number>();
  for (const order of orders) {
    netRevenue += order.total;
    for (const item of order.items) {
      cogs += (item.product.cost ?? 0) * item.quantity;
      // sumar cada componente del costo × cantidad vendida
      try {
        const parts = JSON.parse(item.product.costBreakdown || "[]");
        if (Array.isArray(parts)) {
          for (const p of parts) {
            const name = String(p?.name ?? "").trim() || "Sin nombre";
            const amount = (Number(p?.amount) || 0) * item.quantity;
            if (amount > 0) costByComponent.set(name, (costByComponent.get(name) ?? 0) + amount);
          }
        }
      } catch {
        // ignore
      }
    }
  }
  // Ventas manuales: se suman a la facturación y al costo de lo vendido.
  const manual = await db.manualSale.aggregate({ _sum: { total: true, cost: true } });
  netRevenue += manual._sum.total ?? 0;
  cogs += manual._sum.cost ?? 0;

  const profit = netRevenue - cogs;
  const marginPct = netRevenue > 0 ? Math.round((profit / netRevenue) * 100) : 0;
  const costBreakdown = Array.from(costByComponent.entries())
    .map(([name, total]) => ({ name, total }))
    .sort((a, b) => b.total - a.total);

  // Valor del inventario actual (a costo) y ganancia potencial si se vendiera todo.
  let inventoryCost = 0;
  let inventoryPotentialProfit = 0;
  for (const p of products) {
    const stock = p.variants.reduce((s, v) => s + v.stock, 0);
    const cost = p.cost ?? 0;
    const sellPrice = p.salePrice && p.salePrice < p.price ? p.salePrice : p.price;
    inventoryCost += cost * stock;
    if (cost > 0) inventoryPotentialProfit += (sellPrice - cost) * stock;
  }

  return {
    netRevenue,
    cogs,
    profit,
    marginPct,
    inventoryCost,
    inventoryPotentialProfit,
    costBreakdown,
  };
}

export async function getProducts() {
  return db.product.findMany({
    include: { variants: true, section: true },
    orderBy: { createdAt: "desc" },
  });
}

export async function getProduct(id: string) {
  return db.product.findUnique({ where: { id }, include: { variants: true, section: true } });
}

export type ProductWithStats = {
  id: string;
  brand: string;
  model: string;
  sku: string;
  sectionId: string | null;
  sectionName: string | null;
  category: string;
  active: boolean;
  price: number;
  salePrice: number | null;
  effectivePrice: number;
  cost: number;
  unitMargin: number | null;
  image: string | null;
  totalStock: number;
  unitsSold: number;
  revenue: number;
  cogs: number;
  profit: number;
  inventoryValue: number;
};

/** Productos cruzados con sus ventas reales (unidades, ingresos, costo y ganancia). */
export async function getProductsWithStats(): Promise<ProductWithStats[]> {
  const [products, items] = await Promise.all([
    db.product.findMany({
      include: { variants: true, section: true },
      orderBy: { createdAt: "desc" },
    }),
    db.orderItem.findMany({
      where: { order: { status: { not: "CANCELADO" } } },
      select: { productId: true, quantity: true, unitPrice: true },
    }),
  ]);

  const salesMap = new Map<string, { units: number; revenue: number }>();
  for (const it of items) {
    if (!it.productId) continue;
    const prev = salesMap.get(it.productId) ?? { units: 0, revenue: 0 };
    prev.units += it.quantity;
    prev.revenue += it.unitPrice * it.quantity;
    salesMap.set(it.productId, prev);
  }

  return products.map((p) => {
    const totalStock = p.variants.reduce((s, v) => s + v.stock, 0);
    const cost = p.cost ?? 0;
    const effectivePrice = p.salePrice && p.salePrice < p.price ? p.salePrice : p.price;
    const unitMargin = cost > 0 ? effectivePrice - cost : null;
    const sales = salesMap.get(p.id) ?? { units: 0, revenue: 0 };
    const cogs = cost * sales.units;
    return {
      id: p.id,
      brand: p.brand,
      model: p.model,
      sku: p.sku,
      sectionId: p.sectionId,
      sectionName: p.section?.name ?? null,
      category: p.category,
      active: p.active,
      price: p.price,
      salePrice: p.salePrice,
      effectivePrice,
      cost,
      unitMargin,
      image: p.images?.split(",").filter(Boolean)[0] ?? null,
      totalStock,
      unitsSold: sales.units,
      revenue: sales.revenue,
      cogs,
      profit: sales.revenue - cogs,
      inventoryValue: cost * totalStock,
    };
  });
}

export async function getActiveProductsForStore() {
  return db.product.findMany({
    where: { active: true },
    include: { variants: { orderBy: { size: "asc" } }, section: true },
    orderBy: { createdAt: "desc" },
  });
}

export async function getSections() {
  return db.section.findMany({ orderBy: { order: "asc" } });
}

export async function getActiveSections() {
  return db.section.findMany({ where: { active: true }, orderBy: { order: "asc" } });
}

export async function getSectionStats() {
  const [sections, productCounts, items] = await Promise.all([
    db.section.findMany({ orderBy: { order: "asc" } }),
    db.product.groupBy({ by: ["sectionId"], _count: { _all: true } }),
    db.orderItem.findMany({
      where: { order: { status: { not: "CANCELADO" } } },
      select: { quantity: true, unitPrice: true, product: { select: { sectionId: true } } },
    }),
  ]);

  const countMap = new Map(productCounts.map((p) => [p.sectionId ?? "", p._count._all]));
  const salesMap = new Map<string, { units: number; revenue: number }>();
  for (const it of items) {
    const key = it.product.sectionId ?? "";
    const prev = salesMap.get(key) ?? { units: 0, revenue: 0 };
    prev.units += it.quantity;
    prev.revenue += it.unitPrice * it.quantity;
    salesMap.set(key, prev);
  }

  return sections.map((s) => {
    const sales = salesMap.get(s.id) ?? { units: 0, revenue: 0 };
    return {
      id: s.id,
      name: s.name,
      active: s.active,
      products: countMap.get(s.id) ?? 0,
      units: sales.units,
      revenue: sales.revenue,
    };
  });
}

export async function getOrders() {
  return db.order.findMany({
    include: { items: { include: { product: true, variant: true } } },
    orderBy: { createdAt: "desc" },
  });
}

export async function getOrder(id: string) {
  return db.order.findUnique({
    where: { id },
    include: { items: { include: { product: true, variant: true } } },
  });
}

export async function getSiteSettings() {
  return db.siteSettings.upsert({
    where: { id: "default" },
    update: {},
    create: { id: "default" },
  });
}

// ---------- Home content (10 bloques editables) ----------

export type Benefit = { icon: string; title: string; desc: string };
export type PsItem = { problem: string; solution: string };
export type Testimonial = {
  name: string;
  role: string;
  text: string;
  rating: number;
  media?: string; // foto o video del cliente (unboxing, "llegó la mercadería")
  mediaType?: "image" | "video";
};
export type HomeCategory = { label: string; brand: string };
export type Differential = { icon: string; title: string; desc: string };
export type Faq = { q: string; a: string };

const DEFAULT_BENEFITS: Benefit[] = [
  { icon: "🚚", title: "Envíos a todo el país", desc: "Despachamos a cada rincón." },
  { icon: "✅", title: "Stock real verificado", desc: "Lo que ves es lo que hay." },
  { icon: "💳", title: "Pagos flexibles", desc: "Mercado Pago, transferencia y más." },
  { icon: "📍", title: "Seguí tu pedido", desc: "Estado en vivo, sin llamadas." },
];

const DEFAULT_PS: PsItem[] = [
  { problem: "Llegás tarde y el modelo que querías ya se agotó.", solution: "Stock real y actualizado: si lo ves, lo tenés." },
  { problem: "No sabés si las zapatillas son originales.", solution: "Trabajamos modelos seleccionados y verificados." },
  { problem: "Te da miedo pagar online.", solution: "Pago protegido con Mercado Pago y seguimiento del pedido." },
];

const DEFAULT_TESTIMONIALS: Testimonial[] = [
  { name: "Sofía G.", role: "Compró Nike Jordan Low", text: "Llegaron en 3 días y son tal cual la foto. Re recomendable.", rating: 5 },
  { name: "Mateo R.", role: "Compró Adidas Samba", text: "Atención de 10, me asesoraron con el talle. Quedé chocho.", rating: 5 },
  { name: "Valentina P.", role: "Cliente recurrente", text: "Es mi tercera compra. Siempre cumplen. Confianza total.", rating: 5 },
];

const DEFAULT_DIFFERENTIALS: Differential[] = [
  { icon: "⭐", title: "Modelos alternativos", desc: "Pares que no encontrás en cualquier lado." },
  { icon: "🤝", title: "Atención personalizada", desc: "Te ayudamos a elegir por WhatsApp." },
  { icon: "🔒", title: "Compra protegida", desc: "Pagás seguro y seguís tu pedido en vivo." },
];

const DEFAULT_FAQS: Faq[] = [
  { q: "¿Hacen envíos a todo el país?", a: "Sí, despachamos a todo el país por correo y a coordinar." },
  { q: "¿Cómo sé mi talle?", a: "Escribinos por WhatsApp y te asesoramos según el modelo." },
  { q: "¿Qué medios de pago aceptan?", a: "Mercado Pago, transferencia, efectivo y más." },
  { q: "¿Puedo seguir mi pedido?", a: "Sí, al comprar te damos un link para ver el estado en vivo." },
];

function parseJson<T>(raw: string, fallback: T): T {
  try {
    const v = JSON.parse(raw);
    if (Array.isArray(v) && v.length === 0) return fallback;
    return v as T;
  } catch {
    return fallback;
  }
}

export async function getHomeContent() {
  const c = await db.homeContent.upsert({
    where: { id: "default" },
    update: {},
    create: { id: "default" },
  });

  return {
    raw: c,
    toggles: {
      benefits: c.showBenefits,
      featured: c.showFeatured,
      problemSol: c.showProblemSol,
      testimonials: c.showTestimonials,
      categories: c.showCategories,
      differentials: c.showDifferentials,
      ugc: c.showUgc,
      faq: c.showFaq,
      finalCta: c.showFinalCta,
    },
    benefitsTitle: c.benefitsTitle || "Por qué comprarnos",
    benefits: parseJson<Benefit[]>(c.benefits, DEFAULT_BENEFITS),
    featuredTitle: c.featuredTitle || "Nuestros modelos",
    featuredSubtitle: c.featuredSubtitle,
    psTitle: c.psTitle || "Sabemos lo que te preocupa",
    psSubtitle: c.psSubtitle,
    psItems: parseJson<PsItem[]>(c.psItems, DEFAULT_PS),
    testimonialsTitle: c.testimonialsTitle || "Lo que dicen nuestros clientes",
    testimonialsSubtitle: c.testimonialsSubtitle,
    testimonials: parseJson<Testimonial[]>(c.testimonials, DEFAULT_TESTIMONIALS),
    categoriesTitle: c.categoriesTitle || "Categorías principales",
    categoriesSubtitle: c.categoriesSubtitle,
    categories: parseJson<HomeCategory[]>(c.categories, []),
    differentialsTitle: c.differentialsTitle || "Por qué somos tu mejor opción",
    differentialsSubtitle: c.differentialsSubtitle,
    differentials: parseJson<Differential[]>(c.differentials, DEFAULT_DIFFERENTIALS),
    ugcTitle: c.ugcTitle || "Nuestros clientes",
    ugcSubtitle: c.ugcSubtitle,
    ugcImages: c.ugcImages ? c.ugcImages.split(",").filter(Boolean) : [],
    faqTitle: c.faqTitle || "Preguntas frecuentes",
    faqSubtitle: c.faqSubtitle,
    faqs: parseJson<Faq[]>(c.faqs, DEFAULT_FAQS),
    finalCtaTitle: c.finalCtaTitle || "¿Listo para tu próximo par?",
    finalCtaText: c.finalCtaText || "Encontrá el tuyo antes de que se agote.",
    finalCtaButton: c.finalCtaButton || "Ver catálogo",
    finalCtaLink: c.finalCtaLink || "#catalogo",
  };
}

export type HomeContentData = Awaited<ReturnType<typeof getHomeContent>>;

export async function getShippingConfig() {
  const s = await getSiteSettings();
  let rates: Record<string, number> = {};
  try {
    const parsed = JSON.parse(s.shipRates);
    if (parsed && typeof parsed === "object") rates = parsed;
  } catch {
    rates = {};
  }
  return {
    rates,
    defaultRate: s.shipDefaultRate,
    freeThreshold: s.shipFreeThreshold,
    pickupEnabled: s.pickupEnabled,
    pickupProvince: s.pickupProvince,
    pickupNote: s.pickupNote,
    packageWeight: s.shipPackageWeight,
    packageL: s.shipPackageL,
    packageW: s.shipPackageW,
    packageH: s.shipPackageH,
    originCp: s.shipOriginCp,
  };
}

export async function getPromotion() {
  return db.promotion.upsert({
    where: { id: "default" },
    update: {},
    create: { id: "default" },
  });
}

export async function getAnalytics() {
  const since = new Date();
  since.setHours(0, 0, 0, 0);
  since.setDate(since.getDate() - 13);

  const [paidOrders, couponedCount, totalNonCancelled, byCustomer] = await Promise.all([
    db.order.findMany({
      where: { status: { not: "CANCELADO" }, createdAt: { gte: since } },
      select: { createdAt: true, total: true },
    }),
    db.order.count({ where: { status: { not: "CANCELADO" }, couponCode: { not: null } } }),
    db.order.count({ where: { status: { not: "CANCELADO" } } }),
    db.order.groupBy({
      by: ["customerId"],
      where: { customerId: { not: null }, status: { not: "CANCELADO" } },
      _count: { _all: true },
    }),
  ]);

  // sales by day (last 14 days)
  const days: { label: string; value: number }[] = [];
  for (let i = 0; i < 14; i++) {
    const d = new Date(since);
    d.setDate(since.getDate() + i);
    const key = d.toISOString().slice(0, 10);
    const total = paidOrders
      .filter((o) => o.createdAt.toISOString().slice(0, 10) === key)
      .reduce((s, o) => s + o.total, 0);
    days.push({ label: d.toLocaleDateString("es-AR", { day: "2-digit", month: "2-digit" }), value: total });
  }

  const buyers = byCustomer.length;
  const repeatBuyers = byCustomer.filter((c) => c._count._all >= 2).length;

  return {
    salesByDay: days,
    couponUsage: {
      withCoupon: couponedCount,
      withoutCoupon: Math.max(0, totalNonCancelled - couponedCount),
    },
    repurchase: { buyers, repeatBuyers, oneTime: Math.max(0, buyers - repeatBuyers) },
  };
}

export async function getCouponsWithUsage() {
  const coupons = await db.coupon.findMany({ orderBy: { createdAt: "desc" } });

  // Uso por código (pedidos no cancelados que usaron ese cupón)
  const usage = await db.order.groupBy({
    by: ["couponCode"],
    where: { couponCode: { not: null }, status: { not: "CANCELADO" } },
    _count: { _all: true },
    _sum: { discount: true },
  });
  const usageMap = new Map(
    usage.map((u) => [
      (u.couponCode ?? "").toLowerCase(),
      { count: u._count._all, discount: u._sum.discount ?? 0 },
    ])
  );

  return coupons.map((c) => {
    const u = usageMap.get(c.code.toLowerCase());
    return {
      ...c,
      uses: u?.count ?? 0,
      totalDiscount: u?.discount ?? 0,
    };
  });
}

export async function getCouponCustomers() {
  const orders = await db.order.findMany({
    where: { couponCode: { not: null }, status: { not: "CANCELADO" } },
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      customerName: true,
      email: true,
      couponCode: true,
      discount: true,
      total: true,
      createdAt: true,
    },
    take: 50,
  });
  return orders;
}

export async function getCustomerStats() {
  const since = new Date(Date.now() - 1000 * 60 * 60 * 24 * 30);
  const [registered, active, recent] = await Promise.all([
    db.customer.count(),
    db.customer.count({ where: { lastLoginAt: { gte: since } } }),
    db.customer.findMany({
      orderBy: { createdAt: "desc" },
      take: 50,
      include: { _count: { select: { orders: true } } },
    }),
  ]);
  return { registered, active, recent };
}
