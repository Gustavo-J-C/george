import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";

export async function GET(req: NextRequest) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Não autorizado" }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const schoolId = searchParams.get("schoolId");

  const classes = await prisma.class.findMany({
    where: schoolId ? { schoolId } : undefined,
    include: {
      school: { select: { name: true } },
      _count: { select: { students: true } },
    },
    orderBy: [{ grade: "asc" }, { name: "asc" }],
  });
  return NextResponse.json(classes);
}

export async function POST(req: NextRequest) {
  const session = await getSession();
  if (!session || session.role === "student")
    return NextResponse.json({ error: "Não autorizado" }, { status: 403 });

  const { name, grade, year, schoolId } = await req.json();
  if (!name || !grade || !year || !schoolId)
    return NextResponse.json({ error: "Campos obrigatórios faltando" }, { status: 400 });

  const cls = await prisma.class.create({ data: { name, grade, year: Number(year), schoolId } });
  return NextResponse.json(cls, { status: 201 });
}
