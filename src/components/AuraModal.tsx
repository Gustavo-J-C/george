"use client";
import { useEffect, useState } from "react";
import { Toast } from "./Toast";

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

function auraLevel(aura: number) {
  if (aura >= 50) return { label: "Lendário", color: "text-yellow-500", bg: "bg-yellow-50" };
  if (aura >= 20) return { label: "Destaque", color: "text-green-500", bg: "bg-green-50" };
  if (aura >= 0)  return { label: "Regular",  color: "text-blue-500",  bg: "bg-blue-50"  };
  return              { label: "Em risco",  color: "text-red-500",   bg: "bg-red-50"   };
}

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
  const [customPoints, setCustomPoints] = useState("5");
  const [customSign, setCustomSign] = useState<1 | -1>(1);
  const [customReason, setCustomReason] = useState("");
  const [sending, setSending] = useState(false);
  const [tab, setTab] = useState<"quick" | "custom" | "history">("quick");
  const [toast, setToast] = useState<{ message: string; type: "success" | "error" } | null>(null);

  useEffect(() => {
    fetch(`/api/aura?studentId=${student.id}`)
      .then((r) => r.json())
      .then((d) => { setHistory(d.events); setTotal(d.total); });
  }, [student.id]);

  // close on Escape
  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [onClose]);

  async function applyAura(delta: number, reason: string) {
    if (sending) return;
    setSending(true);
    try {
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
        setToast({ message: `${delta > 0 ? "+" : ""}${delta} Aura aplicado!`, type: "success" });
      } else {
        setToast({ message: data.error ?? "Erro ao aplicar Aura", type: "error" });
      }
    } finally {
      setSending(false);
    }
  }

  async function handleCustom(e: React.FormEvent) {
    e.preventDefault();
    const pts = parseInt(customPoints);
    if (!pts || pts <= 0 || !customReason.trim()) return;
    await applyAura(customSign * pts, customReason.trim());
    setCustomPoints("5");
    setCustomReason("");
  }

  const level = auraLevel(total);

  // running totals for history tab
  let running = total;
  const historyWithRunning = history.map((e) => {
    const before = running - e.delta;
    const after = running;
    running = before;
    return { ...e, runningTotal: after };
  });

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-end sm:items-center justify-center p-0 sm:p-4"
        onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
      >
        <div className="bg-white w-full sm:rounded-2xl sm:max-w-lg max-h-[92dvh] sm:max-h-[88vh] flex flex-col shadow-2xl rounded-t-3xl">

          {/* Header */}
          <div className="px-5 pt-5 pb-4 bg-gradient-to-br from-violet-600 to-indigo-600 sm:rounded-t-2xl rounded-t-3xl flex-shrink-0">
            {/* drag handle on mobile */}
            <div className="w-10 h-1 bg-white/30 rounded-full mx-auto mb-4 sm:hidden" />
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 rounded-full bg-white/20 flex items-center justify-center text-xl font-bold text-white shrink-0">
                  {student.fullName.charAt(0)}
                </div>
                <div>
                  <h2 className="text-base font-bold text-white leading-tight">{student.fullName}</h2>
                  <span className={`inline-block text-xs font-semibold px-2 py-0.5 rounded-full mt-1 ${level.bg} ${level.color}`}>
                    {level.label}
                  </span>
                </div>
              </div>
              <div className="text-right shrink-0">
                <p className="text-2xl font-black text-white leading-none">{total > 0 ? "+" : ""}{total}</p>
                <p className="text-yellow-200 text-xs font-medium mt-0.5">✨ Aura</p>
              </div>
            </div>
          </div>

          {/* Tabs */}
          <div className="flex border-b border-gray-100 bg-white shrink-0">
            {(["quick", "custom", "history"] as const).map((t) => (
              <button
                key={t}
                onClick={() => setTab(t)}
                className={`flex-1 py-3 text-xs sm:text-sm font-semibold transition border-b-2
                  ${tab === t ? "border-violet-600 text-violet-700" : "border-transparent text-gray-400 hover:text-gray-600"}`}
              >
                {t === "quick" ? "⚡ Rápido" : t === "custom" ? "✏️ Personalizado" : `📋 Histórico${history.length > 0 ? ` (${history.length})` : ""}`}
              </button>
            ))}
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto p-4 sm:p-5">

            {/* Quick actions */}
            {tab === "quick" && (
              <div className="grid grid-cols-1 gap-2">
                <p className="text-xs text-gray-400 font-medium pb-1">Toque para aplicar instantaneamente</p>
                {QUICK_REASONS.map((q) => (
                  <button
                    key={q.label}
                    onClick={() => applyAura(q.delta, q.label)}
                    disabled={sending}
                    className={`flex items-center justify-between px-4 py-3 rounded-xl border text-sm font-medium transition active:scale-[0.98] disabled:opacity-50
                      ${q.delta > 0
                        ? "border-green-100 bg-green-50 text-green-800 hover:bg-green-100 hover:border-green-200"
                        : "border-red-100 bg-red-50 text-red-800 hover:bg-red-100 hover:border-red-200"}`}
                  >
                    <span className="flex items-center gap-2.5">
                      <span className="text-base">{q.emoji}</span>
                      {q.label}
                    </span>
                    <span className={`font-bold text-base shrink-0 ${q.delta > 0 ? "text-green-600" : "text-red-600"}`}>
                      {q.delta > 0 ? "+" : ""}{q.delta}
                    </span>
                  </button>
                ))}
              </div>
            )}

            {/* Custom */}
            {tab === "custom" && (
              <form onSubmit={handleCustom} className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Tipo</label>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => setCustomSign(1)}
                      className={`flex items-center justify-center gap-2 py-2.5 rounded-xl border text-sm font-semibold transition
                        ${customSign === 1 ? "bg-green-500 border-green-500 text-white shadow-lg shadow-green-100" : "border-gray-200 text-gray-500 hover:border-green-300"}`}
                    >
                      ▲ Adicionar Aura
                    </button>
                    <button
                      type="button"
                      onClick={() => setCustomSign(-1)}
                      className={`flex items-center justify-center gap-2 py-2.5 rounded-xl border text-sm font-semibold transition
                        ${customSign === -1 ? "bg-red-500 border-red-500 text-white shadow-lg shadow-red-100" : "border-gray-200 text-gray-500 hover:border-red-300"}`}
                    >
                      ▼ Remover Aura
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Pontos</label>
                  <div className="flex items-center gap-3">
                    <button type="button" onClick={() => setCustomPoints(v => String(Math.max(1, parseInt(v || "1") - 1)))}
                      className="w-10 h-10 rounded-xl border border-gray-200 text-gray-600 hover:bg-gray-100 font-bold text-lg flex items-center justify-center shrink-0 transition">−</button>
                    <input
                      type="number"
                      value={customPoints}
                      onChange={(e) => setCustomPoints(e.target.value)}
                      min="1"
                      max="100"
                      className="flex-1 text-center text-2xl font-bold px-4 py-2 rounded-xl border border-gray-200 focus:border-violet-500 focus:ring-2 focus:ring-violet-100 outline-none"
                      required
                    />
                    <button type="button" onClick={() => setCustomPoints(v => String(Math.min(100, parseInt(v || "0") + 1)))}
                      className="w-10 h-10 rounded-xl border border-gray-200 text-gray-600 hover:bg-gray-100 font-bold text-lg flex items-center justify-center shrink-0 transition">+</button>
                  </div>
                  <div className="flex gap-2 mt-2">
                    {[1, 3, 5, 10].map((v) => (
                      <button key={v} type="button" onClick={() => setCustomPoints(String(v))}
                        className={`flex-1 py-1.5 rounded-lg text-xs font-semibold border transition
                          ${customPoints === String(v) ? "bg-violet-100 border-violet-300 text-violet-700" : "border-gray-200 text-gray-500 hover:border-violet-200"}`}>
                        {v}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Motivo</label>
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
                  disabled={sending || !customReason.trim()}
                  className={`w-full py-3 font-bold rounded-xl transition shadow-lg disabled:opacity-50 text-white
                    ${customSign === 1 ? "bg-green-500 hover:bg-green-600 shadow-green-100" : "bg-red-500 hover:bg-red-600 shadow-red-100"}`}
                >
                  {sending ? "Aplicando…" : `${customSign > 0 ? "+" : "-"}${customPoints || 0} Aura — Aplicar`}
                </button>
              </form>
            )}

            {/* History */}
            {tab === "history" && (
              <div className="space-y-2">
                {history.length === 0 && (
                  <div className="text-center py-10">
                    <p className="text-3xl mb-2">📭</p>
                    <p className="text-gray-400 text-sm">Nenhum registro ainda.</p>
                  </div>
                )}
                {historyWithRunning.map((event) => (
                  <div key={event.id} className="flex items-center gap-3 p-3 rounded-xl border border-gray-100 hover:bg-gray-50 transition">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 text-xs font-bold
                      ${event.delta > 0 ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}`}>
                      {event.delta > 0 ? "▲" : "▼"}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-gray-800 truncate font-medium">{event.reason}</p>
                      <p className="text-xs text-gray-400 mt-0.5">
                        {event.teacher?.fullName ?? "Professor"} · {new Date(event.createdAt).toLocaleDateString("pt-BR")}
                      </p>
                    </div>
                    <div className="text-right shrink-0">
                      <span className={`text-sm font-bold block ${event.delta > 0 ? "text-green-600" : "text-red-600"}`}>
                        {event.delta > 0 ? "+" : ""}{event.delta}
                      </span>
                      <span className="text-xs text-gray-400">→ {event.runningTotal}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="px-5 py-4 border-t border-gray-100 shrink-0">
            <button
              onClick={onClose}
              className="w-full py-2.5 rounded-xl border border-gray-200 text-gray-600 text-sm font-semibold hover:bg-gray-50 transition"
            >
              Fechar
            </button>
          </div>
        </div>
      </div>

      {toast && (
        <Toast message={toast.message} type={toast.type} onDone={() => setToast(null)} />
      )}
    </>
  );
}
