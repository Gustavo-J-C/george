import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";

export async function GET(req: NextRequest) {
  const session = await getSession();
  if (!session || session.role === "student")
    return NextResponse.json({ error: "Não autorizado" }, { status: 403 });

  const { searchParams } = new URL(req.url);
  const role = searchParams.get("role");
  const schoolId = searchParams.get("schoolId");

  const users = await prisma.user.findMany({
    where: {
      ...(role ? { role } : {}),
      ...(schoolId ? { schoolId } : {}),
    },
    include: {
      school: { select: { name: true } },
      studentClass: { select: { name: true } },
    },
    orderBy: { fullName: "asc" },
  });
  return NextResponse.json(users);
}

export async function POST(req: NextRequest) {
  const session = await getSession();
  if (!session || session.role === "student")
    return NextResponse.json({ error: "Não autorizado" }, { status: 403 });

  const { username, fullName, role, schoolId, classId } = await req.json();
  if (!username || !fullName || !role || !schoolId)
    return NextResponse.json({ error: "Campos obrigatórios faltando" }, { status: 400 });

  try {
    const user = await prisma.user.create({
      data: { username: username.trim().toLowerCase(), fullName, role, schoolId, classId: classId || null },
    });
    return NextResponse.json(user, { status: 201 });
  } catch {
    return NextResponse.json({ error: "Username já existe" }, { status: 409 });
  }
}
