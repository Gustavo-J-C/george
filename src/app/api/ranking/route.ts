import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";

export async function GET(req: NextRequest) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Não autorizado" }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const classId = searchParams.get("classId");
  const schoolId = searchParams.get("schoolId") ?? session.schoolId;

  const students = await prisma.user.findMany({
    where: {
      role: "student",
      schoolId,
      ...(classId ? { classId } : {}),
    },
    include: {
      studentClass: { select: { id: true, name: true } },
      auraEvents: { select: { delta: true } },
    },
  });

  const ranked = students
    .map((s) => ({
      id: s.id,
      fullName: s.fullName,
      username: s.username,
      classId: s.classId,
      className: s.studentClass?.name ?? "—",
      aura: s.auraEvents.reduce((sum, e) => sum + e.delta, 0),
    }))
    .sort((a, b) => b.aura - a.aura)
    .map((s, i) => ({ ...s, position: i + 1 }));

  return NextResponse.json(ranked);
}
