import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  const school = await prisma.school.upsert({
    where: { code: "ESC001" },
    update: {},
    create: { name: "Escola Municipal João Paulo II", code: "ESC001" },
  });

  const class1 = await prisma.class.upsert({
    where: { id: "class-7a" },
    update: {},
    create: { id: "class-7a", name: "7º Ano A", grade: "7", year: 2024, schoolId: school.id },
  });

  const class2 = await prisma.class.upsert({
    where: { id: "class-8b" },
    update: {},
    create: { id: "class-8b", name: "8º Ano B", grade: "8", year: 2024, schoolId: school.id },
  });

  await prisma.user.upsert({
    where: { username: "admin" },
    update: {},
    create: { username: "admin", fullName: "Administrador", role: "admin", schoolId: school.id },
  });

  const prof = await prisma.user.upsert({
    where: { username: "prof.carlos" },
    update: {},
    create: {
      username: "prof.carlos",
      fullName: "Carlos Mendes",
      role: "professor",
      schoolId: school.id,
      teacherClasses: { connect: [{ id: class1.id }, { id: class2.id }] },
    },
  });

  const students1 = [
    { username: "ana.silva", fullName: "Ana Silva" },
    { username: "bruno.souza", fullName: "Bruno Souza" },
    { username: "carla.lima", fullName: "Carla Lima" },
    { username: "daniel.costa", fullName: "Daniel Costa" },
    { username: "eduarda.reis", fullName: "Eduarda Reis" },
    { username: "felipe.alves", fullName: "Felipe Alves" },
    { username: "gabriela.santos", fullName: "Gabriela Santos" },
    { username: "henrique.nunes", fullName: "Henrique Nunes" },
  ];

  for (const s of students1) {
    await prisma.user.upsert({
      where: { username: s.username },
      update: {},
      create: { ...s, role: "student", schoolId: school.id, classId: class1.id },
    });
  }

  const students2 = [
    { username: "isabela.ferreira", fullName: "Isabela Ferreira" },
    { username: "joao.martins", fullName: "João Martins" },
    { username: "karine.oliveira", fullName: "Karine Oliveira" },
    { username: "lucas.pereira", fullName: "Lucas Pereira" },
    { username: "marina.gomes", fullName: "Marina Gomes" },
    { username: "nicolas.rocha", fullName: "Nicolas Rocha" },
  ];

  for (const s of students2) {
    await prisma.user.upsert({
      where: { username: s.username },
      update: {},
      create: { ...s, role: "student", schoolId: school.id, classId: class2.id },
    });
  }

  const allStudents = await prisma.user.findMany({ where: { role: "student" } });
  const reasons = [
    "Participação excelente", "Trabalho em equipe", "Comportamento exemplar",
    "Entrega do dever", "Ajudou colega", "Resposta correta", "Pontualidade",
    "Perturbou a aula", "Desrespeito", "Não fez a lição",
  ];

  for (const student of allStudents) {
    const numEvents = Math.floor(Math.random() * 5) + 2;
    for (let i = 0; i < numEvents; i++) {
      await prisma.auraEvent.create({
        data: {
          studentId: student.id,
          teacherId: prof.id,
          delta: Math.random() > 0.25 ? Math.floor(Math.random() * 10) + 1 : -(Math.floor(Math.random() * 5) + 1),
          reason: reasons[Math.floor(Math.random() * reasons.length)],
        },
      });
    }
  }

  console.log("✅ Seed concluído!");
  console.log("Login admin:      admin");
  console.log("Login professor:  prof.carlos");
  console.log("Login aluno ex.:  ana.silva");
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
