import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await getSession();
  if (!session || session.role !== "admin")
    return NextResponse.json({ error: "Não autorizado" }, { status: 403 });

  const { id } = await params;
  const { name, code } = await req.json();
  const school = await prisma.school.update({ where: { id }, data: { name, code } });
  return NextResponse.json(school);
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await getSession();
  if (!session || session.role !== "admin")
    return NextResponse.json({ error: "Não autorizado" }, { status: 403 });

  const { id } = await params;
  await prisma.school.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}
