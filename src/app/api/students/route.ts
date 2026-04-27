import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";

export async function GET(req: NextRequest) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Não autorizado" }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const classId = searchParams.get("classId");
  const schoolId = searchParams.get("schoolId") ?? session.schoolId;
  const search = searchParams.get("search");

  const students = await prisma.user.findMany({
    where: {
      role: "student",
      schoolId,
      ...(classId ? { classId } : {}),
      ...(search ? { fullName: { contains: search } } : {}),
    },
    include: {
      studentClass: { select: { id: true, name: true } },
      auraEvents: { select: { delta: true } },
    },
    orderBy: { fullName: "asc" },
  });

  const studentsWithAura = students.map((s) => ({
    ...s,
    aura: s.auraEvents.reduce((sum, e) => sum + e.delta, 0),
    auraEvents: undefined,
  }));

  return NextResponse.json(studentsWithAura);
}
