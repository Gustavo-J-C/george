import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import Link from "next/link";

export default async function DashboardPage() {
  const session = await getSession();
  if (!session) return null;

  const [totalStudents, totalClasses, totalSchools, recentEvents] = await Promise.all([
    prisma.user.count({ where: { role: "student", schoolId: session.schoolId } }),
    prisma.class.count({ where: { schoolId: session.schoolId } }),
    prisma.school.count(),
    prisma.auraEvent.findMany({
      take: 8,
      orderBy: { createdAt: "desc" },
      include: {
        student: { select: { fullName: true, studentClass: { select: { name: true } } } },
        teacher: { select: { fullName: true } },
      },
      where: { student: { schoolId: session.schoolId } },
    }),
  ]);

  const cards = [
    { label: "Alunos", value: totalStudents, icon: "👥", href: "/students", color: "bg-violet-50 border-violet-200" },
    { label: "Turmas", value: totalClasses, icon: "📚", href: "/admin/classes", color: "bg-indigo-50 border-indigo-200" },
    ...(session.role === "admin"
      ? [{ label: "Escolas", value: totalSchools, icon: "🏫", href: "/admin/schools", color: "bg-purple-50 border-purple-200" }]
      : []),
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-500 text-sm mt-1">Bem-vindo de volta! Veja o resumo da plataforma.</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {cards.map((card) => (
          <Link
            key={card.label}
            href={card.href}
            className={`border rounded-2xl p-5 ${card.color} hover:shadow-md transition group`}
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500 font-medium">{card.label}</p>
                <p className="text-3xl font-bold text-gray-900 mt-1">{card.value}</p>
              </div>
              <span className="text-3xl group-hover:scale-110 transition-transform">{card.icon}</span>
            </div>
          </Link>
        ))}
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
          <h2 className="text-base font-semibold text-gray-900">Últimas movimentações de Aura</h2>
          <Link href="/students" className="text-sm text-violet-600 hover:text-violet-700 font-medium">
            Ver alunos →
          </Link>
        </div>
        <div className="divide-y divide-gray-50">
          {recentEvents.length === 0 && (
            <p className="text-gray-400 text-sm px-6 py-8 text-center">Nenhuma movimentação ainda.</p>
          )}
          {recentEvents.map((event) => (
            <div key={event.id} className="px-6 py-3 flex items-center gap-4 hover:bg-gray-50">
              <span className={`text-lg ${event.delta > 0 ? "text-green-500" : "text-red-500"}`}>
                {event.delta > 0 ? "▲" : "▼"}
              </span>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 truncate">{event.student.fullName}</p>
                <p className="text-xs text-gray-400">{event.reason}</p>
              </div>
              <div className="text-right shrink-0">
                <span
                  className={`text-sm font-bold ${event.delta > 0 ? "text-green-600" : "text-red-600"}`}
                >
                  {event.delta > 0 ? "+" : ""}{event.delta}
                </span>
                <p className="text-xs text-gray-400">
                  {new Date(event.createdAt).toLocaleDateString("pt-BR")}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
