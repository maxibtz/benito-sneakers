import "dotenv/config";
import { PrismaClient } from "../src/generated/prisma/client";
import { PrismaBetterSqlite3 } from "@prisma/adapter-better-sqlite3";
import bcrypt from "bcryptjs";

const adapter = new PrismaBetterSqlite3({
  url: process.env.DATABASE_URL ?? "file:./dev.db",
});
const db = new PrismaClient({ adapter });

async function main() {
  const email = process.env.ADMIN_EMAIL ?? "benito.fsa4@gmail.com";
  const password = process.env.ADMIN_PASSWORD ?? "M@ximoBenitez23";
  const passwordHash = await bcrypt.hash(password, 10);

  await db.admin.upsert({
    where: { email },
    update: {},
    create: { email, passwordHash },
  });

  console.log(`Admin listo: ${email}`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await db.$disconnect();
  });
