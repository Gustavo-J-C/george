import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { signToken } from "@/lib/auth";

export async function POST(req: NextRequest) {
  const { username } = await req.json();
  if (!username?.trim())
    return NextResponse.json({ error: "Username obrigatório" }, { status: 400 });

  const user = await prisma.user.findUnique({
    where: { username: username.trim().toLowerCase() },
    include: { school: true },
  });

  if (!user)
    return NextResponse.json({ error: "Usuário não encontrado" }, { status: 401 });

  const token = await signToken({
    userId: user.id,
    username: user.username,
    role: user.role,
    schoolId: user.schoolId,
  });

  const res = NextResponse.json({ ok: true, redirectTo: "/home", user: { id: user.id, fullName: user.fullName, role: user.role } });
  res.cookies.set("aura_token", token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 60 * 60 * 24 * 7,
    path: "/",
  });
  return res;
}
