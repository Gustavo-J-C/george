"use client";
import { useEffect, useState } from "react";

interface AuraEvent {
  id: string;
  delta: number;
  reason: string;
  createdAt: string;
  teacher?: { fullName: string };
}

interface Student {
  id: string;
  fullName: string;
  aura: number;
}

const QUICK_REASONS = [
  { label: "Participação excelente", delta: 5, emoji: "⭐" },
  { label: "Trabalho em equipe", delta: 3, emoji: "🤝" },
  { label: "Comportamento exemplar", delta: 4, emoji: "🌟" },
  { label: "Entrega do dever", delta: 2, emoji: "📝" },
  { label: "Ajudou colega", delta: 3, emoji: "💪" },
  { label: "Resposta correta", delta: 2, emoji: "✅" },
  { label: "Perturbou a aula", delta: -3, emoji: "🔇" },
  { label: "Desrespeito", delta: -5, emoji: "⚠️" },
  { label: "Não fez a lição", delta: -2, emoji: "📌" },
];

export default function AuraModal({
  student,
  onClose,
  onUpdate,
}: {
  student: Student;
  onClose: () => void;
  onUpdate: () => void;
}) {
  const [history, setHistory] = useState<AuraEvent[]>([]);
  const [total, setTotal] = useState(student.aura);
  const [customDelta, setCustomDelta] = useState("");
  const [customReason, setCustomReason] = useState("");
  const [sending, setSending] = useState(false);
  const [tab, setTab] = useState<"quick" | "custom" | "history">("quick");

  useEffect(() => {
    fetch(`/api/aura?studentId=${student.id}`)
      .then((r) => r.json())
      .then((d) => { setHistory(d.events); setTotal(d.total); });
  }, [student.id]);

  async function applyAura(delta: number, reason: string) {
    if (sending) return;
    setSending(true);
    const res = await fetch("/api/aura", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ studentId: student.id, delta, reason }),
    });
    const data = await res.json();
    if (res.ok) {
      setTotal(data.totalAura);
      setHistory((prev) => [data.event, ...prev]);
      onUpdate();
    }
    setSending(false);
  }

  async function handleCustom(e: React.FormEvent) {
    e.preventDefault();
    const delta = parseInt(customDelta);
    if (!delta || !customReason.trim()) return;
    await applyAura(delta, customReason.trim());
    setCustomDelta("");
    setCustomReason("");
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="px-6 py-5 border-b border-gray-100 flex items-center justify-between bg-gradient-to-r from-violet-600 to-indigo-600 rounded-t-2xl">
          <div>
            <h2 className="text-lg font-bold text-white">{student.fullName}</h2>
            <div className="flex items-center gap-1.5 mt-0.5">
              <span className="text-yellow-300 text-sm font-semibold">✨ {total > 0 ? "+" : ""}{total} Aura</span>
            </div>
          </div>
          <button onClick={onClose} className="text-white/70 hover:text-white text-xl leading-none p-1">✕</button>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-gray-100">
          {[
            { key: "quick", label: "Rápido" },
            { key: "custom", label: "Personalizado" },
            { key: "history", label: "Histórico" },
          ].map((t) => (
            <button
              key={t.key}
              onClick={() => setTab(t.key as typeof tab)}
              className={`flex-1 py-3 text-sm font-medium transition border-b-2
                ${tab === t.key ? "border-violet-600 text-violet-600" : "border-transparent text-gray-500 hover:text-gray-700"}`}
            >
              {t.label}
            </button>
          ))}
        </div>

        <div className="flex-1 overflow-y-auto p-4">
          {/* Quick actions */}
          {tab === "quick" && (
            <div className="grid grid-cols-1 gap-2">
              {QUICK_REASONS.map((q) => (
                <button
                  key={q.label}
                  onClick={() => applyAura(q.delta, q.label)}
                  disabled={sending}
                  className={`flex items-center justify-between px-4 py-3 rounded-xl border text-sm font-medium transition disabled:opacity-60
                    ${q.delta > 0
                      ? "border-green-200 bg-green-50 text-green-700 hover:bg-green-100"
                      : "border-red-200 bg-red-50 text-red-700 hover:bg-red-100"}`}
                >
                  <span>{q.emoji} {q.label}</span>
                  <span className="font-bold text-base">{q.delta > 0 ? "+" : ""}{q.delta}</span>
                </button>
              ))}
            </div>
          )}

          {/* Custom */}
          {tab === "custom" && (
            <form onSubmit={handleCustom} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  Pontos (positivo ou negativo)
                </label>
                <input
                  type="number"
                  value={customDelta}
                  onChange={(e) => setCustomDelta(e.target.value)}
                  placeholder="ex: 5 ou -3"
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-violet-500 focus:ring-2 focus:ring-violet-100 outline-none text-sm"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Motivo</label>
                <input
                  type="text"
                  value={customReason}
                  onChange={(e) => setCustomReason(e.target.value)}
                  placeholder="Descreva o motivo…"
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-violet-500 focus:ring-2 focus:ring-violet-100 outline-none text-sm"
                  required
                />
              </div>
              <button
                type="submit"
                disabled={sending}
                className="w-full py-3 bg-violet-600 hover:bg-violet-700 disabled:opacity-60 text-white font-semibold rounded-xl transition"
              >
                {sending ? "Aplicando…" : "Aplicar Aura"}
              </button>
            </form>
          )}

          {/* History */}
          {tab === "history" && (
            <div className="space-y-2">
              {history.length === 0 && (
                <p className="text-center text-gray-400 py-6 text-sm">Nenhum registro ainda.</p>
              )}
              {history.map((event) => (
                <div key={event.id} className="flex items-center gap-3 p-3 rounded-xl border border-gray-100 hover:bg-gray-50">
                  <span className={`text-base ${event.delta > 0 ? "text-green-500" : "text-red-500"}`}>
                    {event.delta > 0 ? "▲" : "▼"}
                  </span>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-gray-800 truncate">{event.reason}</p>
                    <p className="text-xs text-gray-400">{event.teacher?.fullName ?? "Professor"} · {new Date(event.createdAt).toLocaleDateString("pt-BR")}</p>
                  </div>
                  <span className={`text-sm font-bold shrink-0 ${event.delta > 0 ? "text-green-600" : "text-red-600"}`}>
                    {event.delta > 0 ? "+" : ""}{event.delta}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
