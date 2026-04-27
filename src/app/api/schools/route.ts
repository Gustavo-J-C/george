import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";

export async function GET() {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Não autorizado" }, { status: 401 });

  const schools = await prisma.school.findMany({
    include: { _count: { select: { classes: true, users: true } } },
    orderBy: { name: "asc" },
  });
  return NextResponse.json(schools);
}

export async function POST(req: NextRequest) {
  const session = await getSession();
  if (!session || session.role !== "admin")
    return NextResponse.json({ error: "Não autorizado" }, { status: 403 });

  const { name, code } = await req.json();
  if (!name || !code)
    return NextResponse.json({ error: "Nome e código são obrigatórios" }, { status: 400 });

  try {
    const school = await prisma.school.create({ data: { name, code } });
    return NextResponse.json(school, { status: 201 });
  } catch {
    return NextResponse.json({ error: "Código já existe" }, { status: 409 });
  }
}
