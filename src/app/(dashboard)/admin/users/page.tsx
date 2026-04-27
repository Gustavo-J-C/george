"use client";
import { useEffect, useRef, useState } from "react";

interface User {
  id: string;
  username: string;
  fullName: string;
  role: string;
  school: { name: string };
  studentClass: { name: string } | null;
}

interface School { id: string; name: string; }
interface Cls { id: string; name: string; }

const ROLES = ["admin", "professor", "student"];

export default function UsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [schools, setSchools] = useState<School[]>([]);
  const [classes, setClasses] = useState<Cls[]>([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<"manual" | "csv">("manual");
  const [form, setForm] = useState({ username: "", fullName: "", role: "student", schoolId: "", classId: "" });
  const [editing, setEditing] = useState<User | null>(null);
  const [error, setError] = useState("");
  const [csvFile, setCsvFile] = useState<File | null>(null);
  const [csvSchoolId, setCsvSchoolId] = useState("");
  const [csvResult, setCsvResult] = useState<{ created: number; skipped: number; errors: string[] } | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  async function load() {
    setLoading(true);
    const [u, s, c] = await Promise.all([
      fetch("/api/users").then((r) => r.json()),
      fetch("/api/schools").then((r) => r.json()),
      fetch("/api/classes").then((r) => r.json()),
    ]);
    setUsers(u);
    setSchools(s);
    setClasses(c);
    if (!form.schoolId && s.length > 0) setForm((f) => ({ ...f, schoolId: s[0].id }));
    if (!csvSchoolId && s.length > 0) setCsvSchoolId(s[0].id);
    setLoading(false);
  }

  useEffect(() => { load(); }, []); // eslint-disable-line

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    const method = editing ? "PUT" : "POST";
    const url = editing ? `/api/users/${editing.id}` : "/api/users";
    const res = await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    const data = await res.json();
    if (!res.ok) { setError(data.error); return; }
    setForm({ username: "", fullName: "", role: "student", schoolId: schools[0]?.id ?? "", classId: "" });
    setEditing(null);
    load();
  }

  async function handleDelete(id: string) {
    if (!confirm("Excluir usuário?")) return;
    await fetch(`/api/users/${id}`, { method: "DELETE" });
    load();
  }

  async function handleCsvImport(e: React.FormEvent) {
    e.preventDefault();
    if (!csvFile) return;
    setCsvResult(null);
    const fd = new FormData();
    fd.append("file", csvFile);
    fd.append("schoolId", csvSchoolId);
    const res = await fetch("/api/users/import", { method: "POST", body: fd });
    const data = await res.json();
    setCsvResult(data);
    if (res.ok) load();
  }

  function startEdit(user: User) {
    setEditing(user);
    setForm({ username: user.username, fullName: user.fullName, role: user.role, schoolId: schools.find(s => s.name === user.school.name)?.id ?? schools[0]?.id ?? "", classId: "" });
    setTab("manual");
  }

  const roleColor: Record<string, string> = {
    admin: "bg-violet-100 text-violet-700",
    professor: "bg-indigo-100 text-indigo-700",
    student: "bg-gray-100 text-gray-600",
  };

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">👤 Usuários</h1>

      {/* Form tabs */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="flex border-b border-gray-100">
          {["manual", "csv"].map((t) => (
            <button key={t} onClick={() => setTab(t as typeof tab)}
              className={`flex-1 py-3 text-sm font-medium transition border-b-2 ${tab === t ? "border-violet-600 text-violet-600" : "border-transparent text-gray-500 hover:text-gray-700"}`}>
              {t === "manual" ? "Cadastro manual" : "Importar CSV"}
            </button>
          ))}
        </div>

        <div className="p-6">
          {tab === "manual" && (
            <form onSubmit={handleSubmit} className="space-y-4">
              <h2 className="font-semibold text-gray-700 text-sm">{editing ? "Editar usuário" : "Novo usuário"}</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Username</label>
                  <input type="text" value={form.username} onChange={(e) => setForm({ ...form, username: e.target.value })}
                    placeholder="prof.joao" required disabled={!!editing}
                    className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:border-violet-500 focus:ring-2 focus:ring-violet-100 outline-none text-sm disabled:bg-gray-50" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Nome completo</label>
                  <input type="text" value={form.fullName} onChange={(e) => setForm({ ...form, fullName: e.target.value })}
                    placeholder="João da Silva" required
                    className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:border-violet-500 focus:ring-2 focus:ring-violet-100 outline-none text-sm" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Perfil</label>
                  <select value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:border-violet-500 focus:ring-2 focus:ring-violet-100 outline-none text-sm bg-white capitalize">
                    {ROLES.map((r) => <option key={r} value={r} className="capitalize">{r}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Escola</label>
                  <select value={form.schoolId} onChange={(e) => setForm({ ...form, schoolId: e.target.value })}
                    required className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:border-violet-500 focus:ring-2 focus:ring-violet-100 outline-none text-sm bg-white">
                    {schools.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
                  </select>
                </div>
                {form.role === "student" && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Turma</label>
                    <select value={form.classId} onChange={(e) => setForm({ ...form, classId: e.target.value })}
                      className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:border-violet-500 focus:ring-2 focus:ring-violet-100 outline-none text-sm bg-white">
                      <option value="">Sem turma</option>
                      {classes.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
                    </select>
                  </div>
                )}
              </div>
              {error && <p className="text-sm text-red-600 bg-red-50 px-3 py-2 rounded-lg">{error}</p>}
              <div className="flex gap-2">
                <button type="submit" className="px-5 py-2 bg-violet-600 hover:bg-violet-700 text-white text-sm font-semibold rounded-xl transition">
                  {editing ? "Salvar" : "Criar usuário"}
                </button>
                {editing && (
                  <button type="button" onClick={() => setEditing(null)}
                    className="px-5 py-2 border border-gray-200 text-gray-600 text-sm font-medium rounded-xl hover:bg-gray-50 transition">
                    Cancelar
                  </button>
                )}
              </div>
            </form>
          )}

          {tab === "csv" && (
            <form onSubmit={handleCsvImport} className="space-y-4">
              <p className="text-sm text-gray-600">
                Arquivo CSV com colunas: <code className="bg-gray-100 px-1 py-0.5 rounded text-xs">username, fullName, role, classId</code>
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Arquivo CSV</label>
                  <input ref={fileRef} type="file" accept=".csv" onChange={(e) => setCsvFile(e.target.files?.[0] ?? null)}
                    required className="w-full text-sm text-gray-600 file:mr-3 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-violet-50 file:text-violet-700 hover:file:bg-violet-100" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Escola</label>
                  <select value={csvSchoolId} onChange={(e) => setCsvSchoolId(e.target.value)}
                    required className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:border-violet-500 focus:ring-2 focus:ring-violet-100 outline-none text-sm bg-white">
                    {schools.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
                  </select>
                </div>
              </div>
              <button type="submit" className="px-5 py-2 bg-violet-600 hover:bg-violet-700 text-white text-sm font-semibold rounded-xl transition">
                Importar
              </button>
              {csvResult && (
                <div className={`text-sm px-4 py-3 rounded-xl ${csvResult.errors.length > 0 ? "bg-yellow-50 text-yellow-700" : "bg-green-50 text-green-700"}`}>
                  {csvResult.created} criados · {csvResult.skipped} ignorados
                  {csvResult.errors.length > 0 && <ul className="mt-1 list-disc pl-4">{csvResult.errors.map((e, i) => <li key={i}>{e}</li>)}</ul>}
                </div>
              )}
            </form>
          )}
        </div>
      </div>

      {loading ? (
        <div className="text-center py-8 text-gray-400">Carregando…</div>
      ) : (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          {users.length === 0 ? (
            <p className="text-center text-gray-400 py-8 text-sm">Nenhum usuário encontrado.</p>
          ) : (
            <div className="divide-y divide-gray-50">
              {users.map((user) => (
                <div key={user.id} className="flex items-center gap-4 px-6 py-4 hover:bg-gray-50">
                  <div className="w-9 h-9 rounded-full bg-violet-100 flex items-center justify-center shrink-0">
                    <span className="text-sm font-bold text-violet-600">{user.fullName.charAt(0)}</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="font-medium text-gray-900 truncate">{user.fullName}</p>
                      <span className={`text-xs px-2 py-0.5 rounded-full font-medium capitalize shrink-0 ${roleColor[user.role] ?? "bg-gray-100 text-gray-600"}`}>
                        {user.role}
                      </span>
                    </div>
                    <p className="text-xs text-gray-400">@{user.username} · {user.school.name}{user.studentClass ? ` · ${user.studentClass.name}` : ""}</p>
                  </div>
                  <div className="flex gap-2 shrink-0">
                    <button onClick={() => startEdit(user)}
                      className="text-sm text-indigo-600 hover:text-indigo-800 bg-indigo-50 hover:bg-indigo-100 px-3 py-1.5 rounded-lg transition">
                      Editar
                    </button>
                    <button onClick={() => handleDelete(user.id)}
                      className="text-sm text-red-600 hover:text-red-800 bg-red-50 hover:bg-red-100 px-3 py-1.5 rounded-lg transition">
                      Excluir
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
