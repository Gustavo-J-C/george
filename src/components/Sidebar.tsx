"use client";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";

const navItems = [
  { href: "/home", icon: "🏠", label: "Dashboard" },
  { href: "/students", icon: "👥", label: "Alunos" },
  { href: "/ranking", icon: "🏆", label: "Ranking" },
];

const adminItems = [
  { href: "/admin", icon: "⚙️", label: "Painel Admin" },
  { href: "/admin/schools", icon: "🏫", label: "Escolas" },
  { href: "/admin/classes", icon: "📚", label: "Turmas" },
  { href: "/admin/users", icon: "👤", label: "Usuários" },
];

interface SidebarProps {
  role: string;
  fullName: string;
}

export default function Sidebar({ role, fullName }: SidebarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const [open, setOpen] = useState(false);

  async function logout() {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/login");
  }

  const isActive = (href: string) =>
    href === "/home" ? pathname === "/home" : pathname.startsWith(href);

  return (
    <>
      {/* Mobile header */}
      <div className="lg:hidden fixed top-0 inset-x-0 h-14 bg-violet-900 flex items-center justify-between px-4 z-40 shadow-md">
        <div className="flex items-center gap-2">
          <span className="text-xl">✨</span>
          <span className="text-white font-bold">Aura</span>
        </div>
        <button onClick={() => setOpen(!open)} className="text-white p-1.5 rounded-lg hover:bg-white/10 transition" aria-label="Menu">
          {open ? (
            <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
          ) : (
            <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" /></svg>
          )}
        </button>
      </div>

      {/* Overlay */}
      {open && (
        <div className="lg:hidden fixed inset-0 bg-black/40 z-30" onClick={() => setOpen(false)} />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed top-0 left-0 h-full w-64 bg-gradient-to-b from-violet-950 to-indigo-950 flex flex-col z-40 shadow-2xl transition-transform duration-200
          ${open ? "translate-x-0" : "-translate-x-full"}
          lg:translate-x-0 lg:static lg:shadow-none`}
      >
        <div className="px-6 py-6 border-b border-white/10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center">
              <span className="text-xl">✨</span>
            </div>
            <div>
              <p className="text-white font-bold text-lg leading-none">Aura</p>
              <p className="text-purple-300 text-xs mt-0.5 capitalize">{role}</p>
            </div>
          </div>
        </div>

        <nav className="flex-1 px-4 py-4 space-y-1 overflow-y-auto">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => setOpen(false)}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition
                ${isActive(item.href)
                  ? "bg-white/15 text-white shadow-inner"
                  : "text-purple-200 hover:bg-white/8 hover:text-white"}`}
            >
              <span className="text-base">{item.icon}</span>
              {item.label}
            </Link>
          ))}

          {(role === "admin" || role === "professor") && (
            <>
              <div className="pt-4 pb-1 px-3">
                <p className="text-purple-400 text-xs font-semibold uppercase tracking-wider">Admin</p>
              </div>
              {adminItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setOpen(false)}
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition
                    ${isActive(item.href)
                      ? "bg-white/15 text-white"
                      : "text-purple-200 hover:bg-white/8 hover:text-white"}`}
                >
                  <span className="text-base">{item.icon}</span>
                  {item.label}
                </Link>
              ))}
            </>
          )}
        </nav>

        <div className="px-4 py-4 border-t border-white/10">
          <div className="flex items-center gap-3 px-3 py-2 mb-2">
            <div className="w-8 h-8 rounded-full bg-violet-400 flex items-center justify-center text-xs font-bold text-white select-none shrink-0">
              {(() => { const p = fullName.trim().split(" "); return p.length >= 2 ? (p[0][0] + p[p.length - 1][0]).toUpperCase() : p[0].slice(0, 2).toUpperCase(); })()}
            </div>
            <p className="text-sm text-white font-medium truncate">{fullName}</p>
          </div>
          <button
            onClick={logout}
            className="w-full text-left px-3 py-2 text-sm text-purple-300 hover:text-white hover:bg-white/8 rounded-xl transition"
          >
            <span className="flex items-center gap-2">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" /></svg>
              Sair
            </span>
          </button>
        </div>
      </aside>
    </>
  );
}
