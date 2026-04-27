import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import Sidebar from "@/components/Sidebar";

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const session = await getSession();
  if (!session) redirect("/login");

  const userFromDb = await import("@/lib/prisma").then(({ prisma }) =>
    prisma.user.findUnique({ where: { id: session.userId }, select: { fullName: true, role: true } })
  );

  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar role={session.role} fullName={userFromDb?.fullName ?? session.username} />
      <main className="flex-1 overflow-y-auto lg:ml-0 pt-14 lg:pt-0">
        <div className="max-w-6xl mx-auto px-4 py-6 sm:px-6 lg:px-8">
          {children}
        </div>
      </main>
    </div>
  );
}
