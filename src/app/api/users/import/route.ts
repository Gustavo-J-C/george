import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import { parse } from "csv-parse/sync";

export async function POST(req: NextRequest) {
  const session = await getSession();
  if (!session || session.role === "student")
    return NextResponse.json({ error: "Não autorizado" }, { status: 403 });

  const formData = await req.formData();
  const file = formData.get("file") as File;
  const schoolId = formData.get("schoolId") as string;

  if (!file || !schoolId)
    return NextResponse.json({ error: "Arquivo e escola são obrigatórios" }, { status: 400 });

  const text = await file.text();
  let records: Array<{ username: string; fullName: string; role: string; classId?: string }>;

  try {
    records = parse(text, {
      columns: true,
      skip_empty_lines: true,
      trim: true,
    });
  } catch {
    return NextResponse.json({ error: "CSV inválido" }, { status: 400 });
  }

  let created = 0;
  let skipped = 0;
  const errors: string[] = [];

  for (const row of records) {
    if (!row.username || !row.fullName) {
      errors.push(`Linha ignorada: username ou fullName ausente`);
      skipped++;
      continue;
    }
    try {
      await prisma.user.upsert({
        where: { username: row.username.toLowerCase() },
        update: { fullName: row.fullName, role: row.role || "student" },
        create: {
          username: row.username.toLowerCase(),
          fullName: row.fullName,
          role: row.role || "student",
          schoolId,
          classId: row.classId || null,
        },
      });
      created++;
    } catch {
      errors.push(`Erro ao importar: ${row.username}`);
      skipped++;
    }
  }

  return NextResponse.json({ created, skipped, errors });
}
