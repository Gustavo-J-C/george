import Link from "next/link";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";

export default async function AdminPage() {
  const session = await getSession();
  if (!session || session.role === "student") redirect("/home");

  const [schools, classes, users] = await Promise.all([
    prisma.school.count(),
    prisma.class.count(),
    prisma.user.count({ where: { NOT: { role: "student" } } }),
  ]);

  const cards = [
    {
      href: "/admin/schools",
      icon: "🏫",
      label: "Escolas",
      count: schools,
      desc: "Gerenciar escolas cadastradas",
      color: "hover:border-violet-300 hover:bg-violet-50",
    },
    {
      href: "/admin/classes",
      icon: "📚",
      label: "Turmas",
      count: classes,
      desc: "Gerenciar turmas por escola",
      color: "hover:border-indigo-300 hover:bg-indigo-50",
    },
    {
      href: "/admin/users",
      icon: "👤",
      label: "Usuários",
      count: users,
      desc: "Professores, admins e alunos",
      color: "hover:border-purple-300 hover:bg-purple-50",
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Painel Admin</h1>
        <p className="text-gray-500 text-sm mt-1">Gerencie escolas, turmas e usuários da plataforma.</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {cards.map((card) => (
          <Link
            key={card.href}
            href={card.href}
            className={`group border border-gray-200 bg-white rounded-2xl p-6 transition shadow-sm hover:shadow-md ${card.color}`}
          >
            <div className="text-3xl mb-3">{card.icon}</div>
            <div className="flex items-end justify-between">
              <div>
                <p className="font-semibold text-gray-900">{card.label}</p>
                <p className="text-sm text-gray-500 mt-0.5">{card.desc}</p>
              </div>
              <span className="text-2xl font-bold text-gray-700">{card.count}</span>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
