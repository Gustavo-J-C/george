"use client";
import { useEffect, useState, useCallback } from "react";
import AuraModal from "@/components/AuraModal";

interface Student {
  id: string;
  fullName: string;
  username: string;
  aura: number;
  studentClass: { id: string; name: string } | null;
}

interface Class {
  id: string;
  name: string;
}

export default function StudentsPage() {
  const [students, setStudents] = useState<Student[]>([]);
  const [classes, setClasses] = useState<Class[]>([]);
  const [classId, setClassId] = useState("");
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);

  const fetchStudents = useCallback(async () => {
    setLoading(true);
    const params = new URLSearchParams();
    if (classId) params.set("classId", classId);
    if (search) params.set("search", search);
    const res = await fetch(`/api/students?${params}`);
    const data = await res.json();
    setStudents(data);
    setLoading(false);
  }, [classId, search]);

  useEffect(() => {
    fetch("/api/classes").then((r) => r.json()).then(setClasses);
  }, []);

  useEffect(() => {
    const t = setTimeout(fetchStudents, 300);
    return () => clearTimeout(t);
  }, [fetchStudents]);

  function auraColor(aura: number) {
    if (aura >= 50) return "text-yellow-500";
    if (aura >= 20) return "text-green-500";
    if (aura >= 0) return "text-blue-500";
    return "text-red-500";
  }

  function auraBadge(aura: number) {
    if (aura >= 50) return "bg-yellow-50 text-yellow-700 border-yellow-200";
    if (aura >= 20) return "bg-green-50 text-green-700 border-green-200";
    if (aura >= 0) return "bg-blue-50 text-blue-700 border-blue-200";
    return "bg-red-50 text-red-700 border-red-200";
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Alunos</h1>
          <p className="text-gray-500 text-sm mt-1">{students.length} aluno(s) encontrado(s)</p>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row gap-3">
        <input
          type="text"
          placeholder="Buscar por nome…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="flex-1 px-4 py-2.5 rounded-xl border border-gray-200 focus:border-violet-500 focus:ring-2 focus:ring-violet-100 outline-none text-sm"
        />
        <select
          value={classId}
          onChange={(e) => setClassId(e.target.value)}
          className="px-4 py-2.5 rounded-xl border border-gray-200 focus:border-violet-500 focus:ring-2 focus:ring-violet-100 outline-none text-sm bg-white min-w-[160px]"
        >
          <option value="">Todas as turmas</option>
          {classes.map((c) => (
            <option key={c.id} value={c.id}>{c.name}</option>
          ))}
        </select>
      </div>

      {loading ? (
        <div className="text-center py-12 text-gray-400">Carregando…</div>
      ) : students.length === 0 ? (
        <div className="text-center py-12 text-gray-400">Nenhum aluno encontrado.</div>
      ) : (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="hidden sm:grid grid-cols-[1fr_auto_auto_auto] px-6 py-3 bg-gray-50 border-b border-gray-100 text-xs font-semibold text-gray-500 uppercase tracking-wider">
            <span>Aluno</span>
            <span className="text-center w-24">Turma</span>
            <span className="text-center w-24">Aura</span>
            <span className="w-28" />
          </div>
          <div className="divide-y divide-gray-50">
            {students.map((student) => (
              <div key={student.id} className="grid grid-cols-1 sm:grid-cols-[1fr_auto_auto_auto] items-center px-6 py-4 hover:bg-gray-50 gap-2">
                <div>
                  <p className="font-medium text-gray-900">{student.fullName}</p>
                  <p className="text-xs text-gray-400">@{student.username}</p>
                </div>
                <div className="text-center w-24">
                  <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded-full">
                    {student.studentClass?.name ?? "—"}
                  </span>
                </div>
                <div className="text-center w-24">
                  <span className={`text-sm font-bold border px-2.5 py-1 rounded-full ${auraBadge(student.aura)}`}>
                    {student.aura > 0 ? "+" : ""}{student.aura} ✨
                  </span>
                </div>
                <div className="w-28 flex justify-end">
                  <button
                    onClick={() => setSelectedStudent(student)}
                    className="text-sm font-medium text-violet-600 hover:text-violet-800 bg-violet-50 hover:bg-violet-100 px-3 py-1.5 rounded-lg transition"
                  >
                    Gerenciar
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {selectedStudent && (
        <AuraModal
          student={selectedStudent}
          onClose={() => setSelectedStudent(null)}
          onUpdate={fetchStudents}
        />
      )}
    </div>
  );
}
