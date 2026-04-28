"use client";
import { useEffect, useState } from "react";

interface RankedStudent {
  id: string;
  position: number;
  fullName: string;
  username: string;
  className: string;
  aura: number;
}

interface Class {
  id: string;
  name: string;
}

function medal(pos: number) {
  if (pos === 1) return "🥇";
  if (pos === 2) return "🥈";
  if (pos === 3) return "🥉";
  return null;
}

function Initials({ name, size = "sm" }: { name: string; size?: "sm" | "lg" }) {
  const parts = name.trim().split(" ");
  const letters = parts.length >= 2 ? parts[0][0] + parts[parts.length - 1][0] : parts[0].slice(0, 2);
  const cls = size === "lg"
    ? "w-12 h-12 text-sm"
    : "w-9 h-9 text-xs";
  return (
    <div className={`${cls} rounded-full bg-white/30 flex items-center justify-center font-bold shrink-0 select-none`}>
      {letters.toUpperCase()}
    </div>
  );
}

function PodiumSkeleton() {
  return (
    <div className="grid grid-cols-3 gap-4 animate-pulse">
      {[0, 1, 2].map((i) => (
        <div key={i} className={`rounded-2xl p-5 bg-gray-100 ${i === 1 ? "-mt-4 h-44" : "h-36"}`} />
      ))}
    </div>
  );
}

function ListSkeleton() {
  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden divide-y divide-gray-50 animate-pulse">
      {Array.from({ length: 6 }).map((_, i) => (
        <div key={i} className="flex items-center gap-4 px-6 py-4">
          <div className="w-8 h-4 bg-gray-100 rounded-full" />
          <div className="w-9 h-9 rounded-full bg-gray-100 shrink-0" />
          <div className="flex-1 space-y-2">
            <div className="h-3.5 bg-gray-100 rounded-full w-2/5" />
            <div className="h-2 bg-gray-100 rounded-full w-full" />
          </div>
          <div className="h-5 w-14 bg-gray-100 rounded-full" />
        </div>
      ))}
    </div>
  );
}

export default function RankingPage() {
  const [ranking, setRanking] = useState<RankedStudent[]>([]);
  const [classes, setClasses] = useState<Class[]>([]);
  const [classId, setClassId] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/classes").then((r) => r.json()).then(setClasses);
  }, []);

  useEffect(() => {
    setLoading(true);
    const params = classId ? `?classId=${classId}` : "";
    fetch(`/api/ranking${params}`)
      .then((r) => r.json())
      .then((d) => { setRanking(d); setLoading(false); });
  }, [classId]);

  function auraBar(aura: number, max: number) {
    if (max <= 0) return 0;
    return Math.max(4, Math.round((aura / max) * 100));
  }

  const maxAura = ranking[0]?.aura ?? 1;

  const podiumOrder = ranking.length >= 3 ? [ranking[1], ranking[0], ranking[2]] : [];
  const podiumStyles = [
    { wrap: "bg-gradient-to-b from-slate-300 to-slate-400 border-slate-300 shadow-md", text: "text-slate-900", sub: "text-slate-700", height: "h-36" },
    { wrap: "bg-gradient-to-b from-yellow-400 to-amber-500 border-yellow-400 shadow-xl shadow-yellow-200 -mt-5", text: "text-yellow-950", sub: "text-yellow-800", height: "h-44" },
    { wrap: "bg-gradient-to-b from-orange-300 to-orange-400 border-orange-300 shadow-md", text: "text-orange-950", sub: "text-orange-800", height: "h-36" },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">🏆 Ranking de Aura</h1>
          <p className="text-gray-500 text-sm mt-1">
            {loading ? "Carregando…" : `${ranking.length} aluno${ranking.length !== 1 ? "s" : ""} no ranking`}
          </p>
        </div>
        <select
          value={classId}
          onChange={(e) => setClassId(e.target.value)}
          className="px-4 py-2.5 rounded-xl border border-gray-200 focus:border-violet-500 focus:ring-2 focus:ring-violet-100 outline-none text-sm bg-white min-w-[160px]"
        >
          <option value="">Todas as turmas</option>
          {classes.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
        </select>
      </div>

      {/* Top 3 podium */}
      {loading ? (
        <PodiumSkeleton />
      ) : podiumOrder.length === 3 && (
        <div className="grid grid-cols-3 gap-3 sm:gap-4 items-end">
          {podiumOrder.map((s, i) => {
            const style = podiumStyles[i];
            return (
              <div
                key={s.id}
                className={`rounded-2xl border flex flex-col items-center justify-end gap-1.5 pb-4 pt-3 px-2 transition ${style.wrap} ${style.height}`}
              >
                <Initials name={s.fullName} size="lg" />
                <span className="text-xl leading-none">{medal(s.position)}</span>
                <p className={`font-bold text-xs sm:text-sm leading-tight text-center line-clamp-2 ${style.text}`}>
                  {s.fullName.split(" ")[0]}
                </p>
                <p className={`text-sm sm:text-base font-black ${style.sub}`}>
                  {s.aura > 0 ? "+" : ""}{s.aura} ✨
                </p>
              </div>
            );
          })}
        </div>
      )}

      {/* Full list */}
      {loading ? (
        <ListSkeleton />
      ) : ranking.length === 0 ? (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm py-16 text-center">
          <p className="text-5xl mb-3">🏅</p>
          <p className="text-gray-800 font-semibold text-base">Nenhum aluno no ranking ainda</p>
          <p className="text-gray-400 text-sm mt-1">Adicione Aura aos alunos para vê-los aqui</p>
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="divide-y divide-gray-50">
            {ranking.map((student) => (
              <div key={student.id} className="flex items-center gap-3 sm:gap-4 px-4 sm:px-6 py-3.5 hover:bg-gray-50 transition">
                <span className="w-7 text-center text-sm font-bold text-gray-400 shrink-0">
                  {medal(student.position) ?? `#${student.position}`}
                </span>
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-violet-500 to-indigo-500 flex items-center justify-center text-white text-xs font-bold shrink-0 select-none">
                  {(() => {
                    const p = student.fullName.trim().split(" ");
                    return p.length >= 2 ? (p[0][0] + p[p.length - 1][0]).toUpperCase() : p[0].slice(0, 2).toUpperCase();
                  })()}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-1">
                    <p className="font-semibold text-gray-900 text-sm truncate">{student.fullName}</p>
                    <span className={`text-sm font-bold ml-4 shrink-0 ${student.aura >= 0 ? "text-green-600" : "text-red-600"}`}>
                      {student.aura > 0 ? "+" : ""}{student.aura} ✨
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="flex-1 bg-gray-100 rounded-full h-1.5 overflow-hidden">
                      <div
                        className="bg-gradient-to-r from-violet-500 to-indigo-500 h-1.5 rounded-full transition-all duration-700"
                        style={{ width: `${student.aura > 0 ? auraBar(student.aura, maxAura) : 0}%` }}
                      />
                    </div>
                    <span className="text-xs text-gray-400 shrink-0">{student.className}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
