"use client";
import { useEffect, useState } from "react";

interface School {
  id: string;
  name: string;
  code: string;
  _count: { classes: number; users: number };
}

export default function SchoolsPage() {
  const [schools, setSchools] = useState<School[]>([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({ name: "", code: "" });
  const [editing, setEditing] = useState<School | null>(null);
  const [error, setError] = useState("");

  async function load() {
    setLoading(true);
    const res = await fetch("/api/schools");
    const data = await res.json();
    setSchools(data);
    setLoading(false);
  }

  useEffect(() => { load(); }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    const method = editing ? "PUT" : "POST";
    const url = editing ? `/api/schools/${editing.id}` : "/api/schools";
    const res = await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    const data = await res.json();
    if (!res.ok) { setError(data.error); return; }
    setForm({ name: "", code: "" });
    setEditing(null);
    load();
  }

  async function handleDelete(id: string) {
    if (!confirm("Excluir escola? Todas as turmas e usuários serão removidos.")) return;
    await fetch(`/api/schools/${id}`, { method: "DELETE" });
    load();
  }

  function startEdit(school: School) {
    setEditing(school);
    setForm({ name: school.name, code: school.code });
    setError("");
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">🏫 Escolas</h1>

      <form onSubmit={handleSubmit} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 space-y-4">
        <h2 className="font-semibold text-gray-700">{editing ? "Editar escola" : "Nova escola"}</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Nome</label>
            <input
              type="text"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              placeholder="Nome da escola"
              required
              className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:border-violet-500 focus:ring-2 focus:ring-violet-100 outline-none text-sm"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Código</label>
            <input
              type="text"
              value={form.code}
              onChange={(e) => setForm({ ...form, code: e.target.value.toUpperCase() })}
              placeholder="ex: ESC001"
              required
              className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:border-violet-500 focus:ring-2 focus:ring-violet-100 outline-none text-sm font-mono"
            />
          </div>
        </div>
        {error && <p className="text-sm text-red-600 bg-red-50 px-3 py-2 rounded-lg">{error}</p>}
        <div className="flex gap-2">
          <button type="submit" className="px-5 py-2 bg-violet-600 hover:bg-violet-700 text-white text-sm font-semibold rounded-xl transition">
            {editing ? "Salvar" : "Criar escola"}
          </button>
          {editing && (
            <button type="button" onClick={() => { setEditing(null); setForm({ name: "", code: "" }); }}
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
          {schools.length === 0 ? (
            <p className="text-center text-gray-400 py-8 text-sm">Nenhuma escola cadastrada.</p>
          ) : (
            <div className="divide-y divide-gray-50">
              {schools.map((school) => (
                <div key={school.id} className="flex items-center gap-4 px-6 py-4 hover:bg-gray-50">
                  <div className="flex-1">
                    <p className="font-semibold text-gray-900">{school.name}</p>
                    <p className="text-xs text-gray-400 font-mono mt-0.5">{school.code} · {school._count.classes} turmas · {school._count.users} usuários</p>
                  </div>
                  <div className="flex gap-2">
                    <button onClick={() => startEdit(school)}
                      className="text-sm text-indigo-600 hover:text-indigo-800 bg-indigo-50 hover:bg-indigo-100 px-3 py-1.5 rounded-lg transition">
                      Editar
                    </button>
                    <button onClick={() => handleDelete(school.id)}
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
