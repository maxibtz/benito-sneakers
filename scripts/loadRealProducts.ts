import "dotenv/config";
import { readdirSync, mkdirSync, copyFileSync } from "fs";
import path from "path";
import { PrismaClient } from "../src/generated/prisma/client";
import { PrismaBetterSqlite3 } from "@prisma/adapter-better-sqlite3";

const adapter = new PrismaBetterSqlite3({ url: process.env.DATABASE_URL });
const db = new PrismaClient({ adapter });

const SOURCE_ROOT = "D:\\BENITO\\zapas\\STOCK";
const UPLOAD_DIR = path.join(process.cwd(), "public", "uploads", "products");

type ProductDef = {
  sourceFolder: string;
  brand: string;
  model: string;
  category: string;
  description: string;
  sku: string;
  variants: { size: string; stock: number }[];
};

const PRODUCTS: ProductDef[] = [
  {
    sourceFolder: "ADIDAS SAMBA",
    brand: "Adidas",
    model: "Samba",
    category: "Zapatillas alternativas",
    description:
      "Las Adidas Samba no son una zapatilla más: son el clásico que nunca pasa de moda. Estilo retro, calidad premium y una comodidad que se siente desde el primer paso. Sumalas a tu outfit y destacate con un ícono atemporal que combina con todo.",
    sku: "01",
    variants: [
      { size: "38", stock: 2 },
      { size: "39", stock: 3 },
      { size: "40", stock: 2 },
      { size: "41", stock: 3 },
      { size: "42", stock: 1 },
      { size: "43", stock: 1 },
    ],
  },
  {
    sourceFolder: "JORDAN LOW AZUL CON BLANCO Y NEGRO",
    brand: "Nike",
    model: "Jordan Low Azul con Blanco y Negro",
    category: "Zapatillas alternativas",
    description:
      "Un combo imposible de ignorar: azul, blanco y negro en perfecta armonía sobre la silueta low de Jordan. Pisada cómoda, diseño urbano y un toque deportivo que combina con todo. Ideal para el que busca destacar sin esfuerzo.",
    sku: "02",
    variants: [
      { size: "37", stock: 1 },
      { size: "38", stock: 2 },
      { size: "39", stock: 2 },
      { size: "40", stock: 1 },
      { size: "41", stock: 1 },
    ],
  },
  {
    sourceFolder: "JORDAN LOW AZUL CON CREMA",
    brand: "Nike",
    model: "Jordan Low Azul con Crema",
    category: "Zapatillas alternativas",
    description:
      "Elegancia y calle en un mismo par: el azul se funde con tonos crema para un look sobrio pero con personalidad. Las Jordan Low que vas a querer usar todos los días, en cualquier ocasión.",
    sku: "03",
    variants: [
      { size: "36", stock: 1 },
      { size: "37", stock: 1 },
      { size: "38", stock: 2 },
      { size: "39", stock: 2 },
      { size: "40", stock: 1 },
      { size: "41", stock: 1 },
    ],
  },
  {
    sourceFolder: "JORDAN LOW ROJA CON BLANCO Y NEGRO",
    brand: "Nike",
    model: "Jordan Low Roja con Blanco y Negro",
    category: "Zapatillas alternativas",
    description:
      "Para los que no le tienen miedo al color: rojo intenso combinado con blanco y negro en la silueta low más codiciada. Un statement piece para tu calzado que se nota apenas entrás a una habitación.",
    sku: "04",
    variants: [
      { size: "38", stock: 2 },
      { size: "39", stock: 1 },
      { size: "40", stock: 2 },
      { size: "41", stock: 1 },
      { size: "42", stock: 1 },
    ],
  },
  {
    sourceFolder: "JORDAN LOW ROSA",
    brand: "Nike",
    model: "Jordan Low Rosa",
    category: "Zapatillas alternativas",
    description:
      "Un toque rosa que rompe la regla y marca tendencia. Las Jordan Low Rosa son para quienes buscan diferenciarse con actitud y estilo, sin resignar comodidad ni un solo día.",
    sku: "05",
    variants: [
      { size: "35", stock: 1 },
      { size: "36", stock: 2 },
      { size: "37", stock: 2 },
      { size: "38", stock: 1 },
      { size: "39", stock: 1 },
    ],
  },
  {
    sourceFolder: "NIKE SB CELESTE",
    brand: "Nike",
    model: "SB Celeste",
    category: "Zapatillas alternativas",
    description:
      "Pensadas para el skate y para la calle: las Nike SB Celeste combinan agarre, resistencia y un colorway fresco que no vas a encontrar en cualquier lado. Para los que viven en movimiento.",
    sku: "06",
    variants: [
      { size: "39", stock: 1 },
      { size: "40", stock: 2 },
      { size: "41", stock: 2 },
      { size: "42", stock: 1 },
      { size: "43", stock: 1 },
      { size: "44", stock: 1 },
    ],
  },
  {
    sourceFolder: "PUMA 180 VERDE",
    brand: "Puma",
    model: "180 Verde",
    category: "Zapatillas alternativas",
    description:
      "Diseño retro-futurista con un verde que se hace notar. Las Puma 180 traen de vuelta la estética 2000 con la comodidad que necesitás hoy. Un clásico recargado para los que se animan a salir de lo común.",
    sku: "07",
    variants: [
      { size: "38", stock: 1 },
      { size: "39", stock: 2 },
      { size: "40", stock: 2 },
      { size: "41", stock: 2 },
      { size: "42", stock: 1 },
    ],
  },
  {
    sourceFolder: "RETRO 4 VERDE",
    brand: "Nike",
    model: "Retro 4 Verde",
    category: "Zapatillas alternativas",
    description:
      "Un clásico del básquet reinventado en verde. Las Retro 4 son sinónimo de historia, calidad y un diseño que nunca falla, ya sea en la cancha o en el día a día.",
    sku: "08",
    variants: [
      { size: "39", stock: 1 },
      { size: "40", stock: 2 },
      { size: "41", stock: 2 },
      { size: "42", stock: 1 },
      { size: "43", stock: 1 },
    ],
  },
];

const PRICE = 45000;

function naturalImageOrder(files: string[]): string[] {
  return files
    .filter((f) => /\.(jpe?g|png|webp)$/i.test(f))
    .sort((a, b) => {
      const numA = parseInt(a.match(/(\d+)(?=\.\w+$)/)?.[1] ?? "0", 10);
      const numB = parseInt(b.match(/(\d+)(?=\.\w+$)/)?.[1] ?? "0", 10);
      return numA - numB;
    });
}

async function main() {
  mkdirSync(UPLOAD_DIR, { recursive: true });

  for (const def of PRODUCTS) {
    const sourceDir = path.join(SOURCE_ROOT, def.sourceFolder, "para pagina");
    const files = naturalImageOrder(readdirSync(sourceDir));

    const savedPaths: string[] = [];
    for (let i = 0; i < files.length; i++) {
      const ext = path.extname(files[i]);
      const destName = `${def.sku}-${i + 1}${ext}`;
      copyFileSync(path.join(sourceDir, files[i]), path.join(UPLOAD_DIR, destName));
      savedPaths.push(`/uploads/products/${destName}`);
    }

    await db.product.upsert({
      where: { sku: def.sku },
      update: {},
      create: {
        brand: def.brand,
        model: def.model,
        description: def.description,
        category: def.category,
        sku: def.sku,
        price: PRICE,
        images: savedPaths.join(","),
        active: true,
        variants: { create: def.variants },
      },
    });

    console.log(`Cargado: ${def.brand} ${def.model} (SKU ${def.sku}) — ${savedPaths.length} fotos`);
  }

  await db.$disconnect();
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
