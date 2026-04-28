import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import Link from "next/link";

export default async function DashboardPage() {
  const session = await getSession();
  if (!session) return null;

  const [totalStudents, totalClasses, totalSchools, recentEvents, currentUser] = await Promise.all([
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
    prisma.user.findUnique({ where: { id: session.userId }, select: { fullName: true } }),
  ]);

  const firstName = currentUser?.fullName?.split(" ")[0] ?? "Professor";

  const cards = [
    { label: "Alunos", value: totalStudents, icon: "👥", href: "/students", color: "bg-violet-50 border-violet-200", iconBg: "bg-violet-100" },
    { label: "Turmas", value: totalClasses, icon: "📚", href: "/admin/classes", color: "bg-indigo-50 border-indigo-200", iconBg: "bg-indigo-100" },
    ...(session.role === "admin"
      ? [{ label: "Escolas", value: totalSchools, icon: "🏫", href: "/admin/schools", color: "bg-purple-50 border-purple-200", iconBg: "bg-purple-100" }]
      : []),
  ];

  function formatDate(date: Date) {
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 1) return "agora";
    if (mins < 60) return `${mins}m atrás`;
    const hrs = Math.floor(mins / 60);
    if (hrs < 24) return `${hrs}h atrás`;
    return date.toLocaleDateString("pt-BR", { day: "2-digit", month: "short" });
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">
          Olá, {firstName}! 👋
        </h1>
        <p className="text-gray-500 text-sm mt-1">Veja o resumo de hoje da plataforma.</p>
      </div>

      {/* Stat cards */}
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
                <p className="text-3xl font-black text-gray-900 mt-1">{card.value}</p>
              </div>
              <div className={`w-12 h-12 ${card.iconBg} rounded-2xl flex items-center justify-center text-2xl group-hover:scale-110 transition-transform`}>
                {card.icon}
              </div>
            </div>
          </Link>
        ))}
      </div>

      {/* Recent aura events */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
          <h2 className="text-base font-semibold text-gray-900">Últimas movimentações de Aura</h2>
          <Link href="/students" className="text-sm text-violet-600 hover:text-violet-700 font-medium transition">
            Ver alunos →
          </Link>
        </div>
        <div className="divide-y divide-gray-50">
          {recentEvents.length === 0 ? (
            <div className="px-6 py-12 text-center">
              <p className="text-3xl mb-2">✨</p>
              <p className="text-gray-500 font-medium text-sm">Nenhuma movimentação ainda</p>
              <p className="text-gray-400 text-xs mt-1">Acesse <Link href="/students" className="text-violet-500 underline">Alunos</Link> para atribuir Aura</p>
            </div>
          ) : recentEvents.map((event) => {
            const initials = (() => {
              const p = event.student.fullName.trim().split(" ");
              return p.length >= 2 ? (p[0][0] + p[p.length - 1][0]).toUpperCase() : p[0].slice(0, 2).toUpperCase();
            })();
            return (
              <div key={event.id} className="px-4 sm:px-6 py-3 flex items-center gap-3 hover:bg-gray-50 transition">
                {/* Avatar */}
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold shrink-0 select-none
                  ${event.delta > 0 ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}`}>
                  {initials}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <p className="text-sm font-semibold text-gray-900 truncate">{event.student.fullName}</p>
                    {event.student.studentClass && (
                      <span className="text-xs bg-gray-100 text-gray-500 px-1.5 py-0.5 rounded-full shrink-0">
                        {event.student.studentClass.name}
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-gray-400 truncate mt-0.5">{event.reason}</p>
                </div>
                <div className="text-right shrink-0">
                  <span className={`text-sm font-bold block ${event.delta > 0 ? "text-green-600" : "text-red-600"}`}>
                    {event.delta > 0 ? "+" : ""}{event.delta} ✨
                  </span>
                  <p className="text-xs text-gray-400 mt-0.5">
                    {formatDate(new Date(event.createdAt))}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
