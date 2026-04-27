import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";

export async function POST(req: NextRequest) {
  const session = await getSession();
  if (!session || session.role === "student")
    return NextResponse.json({ error: "Não autorizado" }, { status: 403 });

  const { studentId, delta, reason } = await req.json();
  if (!studentId || delta === undefined || !reason)
    return NextResponse.json({ error: "Campos obrigatórios faltando" }, { status: 400 });

  if (delta === 0)
    return NextResponse.json({ error: "Delta não pode ser zero" }, { status: 400 });

  const event = await prisma.auraEvent.create({
    data: {
      studentId,
      teacherId: session.userId,
      delta: Number(delta),
      reason,
    },
    include: { teacher: { select: { fullName: true } } },
  });

  const auraSum = await prisma.auraEvent.aggregate({
    where: { studentId },
    _sum: { delta: true },
  });

  return NextResponse.json({ event, totalAura: auraSum._sum.delta ?? 0 });
}

export async function GET(req: NextRequest) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Não autorizado" }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const studentId = searchParams.get("studentId");
  if (!studentId)
    return NextResponse.json({ error: "studentId obrigatório" }, { status: 400 });

  const events = await prisma.auraEvent.findMany({
    where: { studentId },
    include: { teacher: { select: { fullName: true } } },
    orderBy: { createdAt: "desc" },
    take: 50,
  });

  const total = events.reduce((sum, e) => sum + e.delta, 0);
  return NextResponse.json({ events, total });
}
