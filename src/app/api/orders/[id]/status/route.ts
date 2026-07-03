import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { rateLimit, getClientIp } from "@/lib/rate-limit";

export async function GET(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  // Anti-enumeración de pedidos: máx 30 consultas por minuto por IP.
  const ip = await getClientIp();
  const rl = rateLimit(`order-status:${ip}`, 30, 60 * 1000);
  if (!rl.ok) {
    return NextResponse.json({ error: "Demasiadas consultas" }, { status: 429 });
  }

  const { id } = await params;
  const order = await db.order.findUnique({
    where: { id },
    select: { status: true, updatedAt: true },
  });

  if (!order) {
    return NextResponse.json({ error: "No encontrado" }, { status: 404 });
  }

  return NextResponse.json({ status: order.status, updatedAt: order.updatedAt });
}
