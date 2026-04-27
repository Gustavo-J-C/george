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

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">🏆 Ranking de Aura</h1>
          <p className="text-gray-500 text-sm mt-1">{ranking.length} aluno(s) no ranking</p>
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

      {/* Top 3 */}
      {!loading && ranking.length >= 3 && (
        <div className="grid grid-cols-3 gap-4">
          {[ranking[1], ranking[0], ranking[2]].map((s, i) => (
            <div
              key={s.id}
              className={`rounded-2xl p-5 text-center border flex flex-col items-center justify-center gap-2
                ${i === 1 ? "bg-gradient-to-b from-yellow-400 to-yellow-500 border-yellow-400 shadow-lg shadow-yellow-200 -mt-4" :
                  i === 0 ? "bg-gradient-to-b from-gray-200 to-gray-300 border-gray-300" :
                  "bg-gradient-to-b from-orange-300 to-orange-400 border-orange-300"}`}
            >
              <span className="text-3xl">{medal(s.position)}</span>
              <p className={`font-bold text-sm leading-tight ${i === 1 ? "text-yellow-900" : "text-gray-800"}`}>
                {s.fullName.split(" ")[0]}
              </p>
              <p className={`text-lg font-black ${i === 1 ? "text-yellow-950" : "text-gray-900"}`}>
                +{s.aura} ✨
              </p>
            </div>
          ))}
        </div>
      )}

      {loading ? (
        <div className="text-center py-12 text-gray-400">Carregando…</div>
      ) : ranking.length === 0 ? (
        <div className="text-center py-12 text-gray-400">Nenhum aluno no ranking ainda.</div>
      ) : (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="divide-y divide-gray-50">
            {ranking.map((student) => (
              <div key={student.id} className="flex items-center gap-4 px-6 py-4 hover:bg-gray-50">
                <span className="w-8 text-center text-sm font-bold text-gray-400">
                  {medal(student.position) ?? `#${student.position}`}
                </span>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-1">
                    <p className="font-semibold text-gray-900 truncate">{student.fullName}</p>
                    <span className={`text-sm font-bold ml-4 shrink-0 ${student.aura >= 0 ? "text-green-600" : "text-red-600"}`}>
                      {student.aura > 0 ? "+" : ""}{student.aura} ✨
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="flex-1 bg-gray-100 rounded-full h-1.5">
                      <div
                        className="bg-gradient-to-r from-violet-500 to-indigo-500 h-1.5 rounded-full transition-all"
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
