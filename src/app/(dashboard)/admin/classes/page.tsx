"use client";
import { useEffect, useState } from "react";

interface Cls {
  id: string;
  name: string;
  grade: string;
  year: number;
  schoolId: string;
  school: { name: string };
  _count: { students: number };
}

interface School {
  id: string;
  name: string;
}

export default function ClassesPage() {
  const [classes, setClasses] = useState<Cls[]>([]);
  const [schools, setSchools] = useState<School[]>([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({ name: "", grade: "", year: new Date().getFullYear().toString(), schoolId: "" });
  const [editing, setEditing] = useState<Cls | null>(null);
  const [error, setError] = useState("");

  async function load() {
    setLoading(true);
    const [c, s] = await Promise.all([
      fetch("/api/classes").then((r) => r.json()),
      fetch("/api/schools").then((r) => r.json()),
    ]);
    setClasses(c);
    setSchools(s);
    if (!form.schoolId && s.length > 0) setForm((f) => ({ ...f, schoolId: s[0].id }));
    setLoading(false);
  }

  useEffect(() => { load(); }, []); // eslint-disable-line

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    const method = editing ? "PUT" : "POST";
    const url = editing ? `/api/classes/${editing.id}` : "/api/classes";
    const res = await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    const data = await res.json();
    if (!res.ok) { setError(data.error); return; }
    setForm({ name: "", grade: "", year: new Date().getFullYear().toString(), schoolId: schools[0]?.id ?? "" });
    setEditing(null);
    load();
  }

  async function handleDelete(id: string) {
    if (!confirm("Excluir turma?")) return;
    await fetch(`/api/classes/${id}`, { method: "DELETE" });
    load();
  }

  function startEdit(cls: Cls) {
    setEditing(cls);
    setForm({ name: cls.name, grade: cls.grade, year: cls.year.toString(), schoolId: cls.schoolId });
    setError("");
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">📚 Turmas</h1>

      <form onSubmit={handleSubmit} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 space-y-4">
        <h2 className="font-semibold text-gray-700">{editing ? "Editar turma" : "Nova turma"}</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Nome</label>
            <input type="text" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })}
              placeholder="7º Ano A" required
              className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:border-violet-500 focus:ring-2 focus:ring-violet-100 outline-none text-sm" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Série</label>
            <input type="text" value={form.grade} onChange={(e) => setForm({ ...form, grade: e.target.value })}
              placeholder="7" required
              className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:border-violet-500 focus:ring-2 focus:ring-violet-100 outline-none text-sm" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Ano</label>
            <input type="number" value={form.year} onChange={(e) => setForm({ ...form, year: e.target.value })}
              required
              className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:border-violet-500 focus:ring-2 focus:ring-violet-100 outline-none text-sm" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Escola</label>
            <select value={form.schoolId} onChange={(e) => setForm({ ...form, schoolId: e.target.value })}
              required className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:border-violet-500 focus:ring-2 focus:ring-violet-100 outline-none text-sm bg-white">
              {schools.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
            </select>
          </div>
        </div>
        {error && <p className="text-sm text-red-600 bg-red-50 px-3 py-2 rounded-lg">{error}</p>}
        <div className="flex gap-2">
          <button type="submit" className="px-5 py-2 bg-violet-600 hover:bg-violet-700 text-white text-sm font-semibold rounded-xl transition">
            {editing ? "Salvar" : "Criar turma"}
          </button>
          {editing && (
            <button type="button" onClick={() => setEditing(null)}
              className="px-5 py-2 border border-gray-200 text-gray-600 text-sm font-medium rounded-xl hover:bg-gray-50 transition">
              Cancelar
            </button>
          )}
        </div>
      </form>

      {loading ? (
        <div className="text-center py-8 text-gray-400">Carregando…</div>
      ) : (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          {classes.length === 0 ? (
            <p className="text-center text-gray-400 py-8 text-sm">Nenhuma turma cadastrada.</p>
          ) : (
            <div className="divide-y divide-gray-50">
              {classes.map((cls) => (
                <div key={cls.id} className="flex items-center gap-4 px-6 py-4 hover:bg-gray-50">
                  <div className="flex-1">
                    <p className="font-semibold text-gray-900">{cls.name}</p>
                    <p className="text-xs text-gray-400 mt-0.5">
                      {cls.school.name} · Série {cls.grade} · {cls.year} · {cls._count.students} alunos
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <button onClick={() => startEdit(cls)}
                      className="text-sm text-indigo-600 hover:text-indigo-800 bg-indigo-50 hover:bg-indigo-100 px-3 py-1.5 rounded-lg transition">
                      Editar
                    </button>
                    <button onClick={() => handleDelete(cls.id)}
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
