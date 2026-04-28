"use client";
import { useEffect, useState, useCallback } from "react";
import AuraModal from "@/components/AuraModal";
import { SkeletonList } from "@/components/Skeleton";

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

function auraLevel(aura: number) {
  if (aura >= 50) return { badge: "bg-yellow-50 text-yellow-700 border-yellow-200", label: "Lendário" };
  if (aura >= 20) return { badge: "bg-green-50 text-green-700 border-green-200", label: "Destaque" };
  if (aura >= 0)  return { badge: "bg-blue-50 text-blue-700 border-blue-200",    label: "Regular" };
  return               { badge: "bg-red-50 text-red-700 border-red-200",          label: "Em risco" };
}

function Initials({ name }: { name: string }) {
  const parts = name.trim().split(" ");
  const letters = parts.length >= 2 ? parts[0][0] + parts[parts.length - 1][0] : parts[0].slice(0, 2);
  return (
    <div className="w-9 h-9 rounded-full bg-gradient-to-br from-violet-500 to-indigo-500 flex items-center justify-center text-white text-xs font-bold shrink-0 select-none">
      {letters.toUpperCase()}
    </div>
  );
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

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Alunos</h1>
          <p className="text-gray-500 text-sm mt-1">
            {loading ? "Carregando…" : `${students.length} aluno${students.length !== 1 ? "s" : ""} encontrado${students.length !== 1 ? "s" : ""}`}
          </p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <svg className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
            <circle cx="11" cy="11" r="8" /><path d="m21 21-4.35-4.35" />
          </svg>
          <input
            type="text"
            placeholder="Buscar por nome…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 focus:border-violet-500 focus:ring-2 focus:ring-violet-100 outline-none text-sm"
          />
        </div>
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

      {/* Content */}
      {loading ? (
        <SkeletonList rows={6} />
      ) : students.length === 0 ? (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm py-16 text-center">
          <p className="text-5xl mb-3">🔍</p>
          <p className="text-gray-800 font-semibold text-base">Nenhum aluno encontrado</p>
          <p className="text-gray-400 text-sm mt-1">Tente ajustar os filtros de busca</p>
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          {/* Desktop header */}
          <div className="hidden sm:grid grid-cols-[1fr_auto_auto_auto] px-6 py-3 bg-gray-50 border-b border-gray-100 text-xs font-semibold text-gray-500 uppercase tracking-wider">
            <span>Aluno</span>
            <span className="text-center w-24">Turma</span>
            <span className="text-center w-28">Aura</span>
            <span className="w-28" />
          </div>
          <div className="divide-y divide-gray-50">
            {students.map((student) => {
              const level = auraLevel(student.aura);
              return (
                <div key={student.id} className="flex sm:grid sm:grid-cols-[1fr_auto_auto_auto] items-center px-4 sm:px-6 py-3.5 hover:bg-gray-50 transition gap-3">
                  {/* Avatar + name */}
                  <div className="flex items-center gap-3 min-w-0 flex-1">
                    <Initials name={student.fullName} />
                    <div className="min-w-0">
                      <p className="font-semibold text-gray-900 text-sm truncate">{student.fullName}</p>
                      <div className="flex items-center gap-2 mt-0.5">
                        <p className="text-xs text-gray-400">@{student.username}</p>
                        {/* Class shown inline on mobile */}
                        {student.studentClass && (
                          <span className="sm:hidden text-xs bg-gray-100 text-gray-600 px-1.5 py-0.5 rounded-full">
                            {student.studentClass.name}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                  {/* Class — desktop only */}
                  <div className="hidden sm:flex justify-center w-24">
                    <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded-full">
                      {student.studentClass?.name ?? "—"}
                    </span>
                  </div>
                  {/* Aura badge */}
                  <div className="hidden sm:flex justify-center w-28">
                    <span className={`text-xs font-bold border px-2.5 py-1 rounded-full ${level.badge}`}>
                      {student.aura > 0 ? "+" : ""}{student.aura} ✨
                    </span>
                  </div>
                  {/* Mobile aura + button */}
                  <div className="flex sm:hidden items-center gap-2 shrink-0">
                    <span className={`text-xs font-bold border px-2 py-0.5 rounded-full ${level.badge}`}>
                      {student.aura > 0 ? "+" : ""}{student.aura}✨
                    </span>
                  </div>
                  {/* Action */}
                  <div className="w-28 flex justify-end shrink-0">
                    <button
                      onClick={() => setSelectedStudent(student)}
                      className="text-sm font-semibold text-violet-600 hover:text-violet-800 bg-violet-50 hover:bg-violet-100 px-3 py-1.5 rounded-lg transition active:scale-95"
                    >
                      Gerenciar
                    </button>
                  </div>
                </div>
              );
            })}
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
