import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await getSession();
  if (!session || session.role === "student")
    return NextResponse.json({ error: "Não autorizado" }, { status: 403 });

  const { id } = await params;
  const { name, grade, year } = await req.json();
  const cls = await prisma.class.update({ where: { id }, data: { name, grade, year: Number(year) } });
  return NextResponse.json(cls);
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await getSession();
  if (!session || session.role !== "admin")
    return NextResponse.json({ error: "Não autorizado" }, { status: 403 });

  const { id } = await params;
  await prisma.class.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}
