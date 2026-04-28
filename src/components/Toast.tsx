"use client";
import { useEffect, useState } from "react";

interface ToastProps {
  message: string;
  type: "success" | "error";
  onDone: () => void;
}

export function Toast({ message, type, onDone }: ToastProps) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    requestAnimationFrame(() => setVisible(true));
    const t = setTimeout(() => { setVisible(false); setTimeout(onDone, 300); }, 2500);
    return () => clearTimeout(t);
  }, [onDone]);

  return (
    <div
      className={`fixed bottom-6 left-1/2 z-[100] transition-all duration-300 pointer-events-none
        ${visible ? "opacity-100 -translate-x-1/2 translate-y-0" : "opacity-0 -translate-x-1/2 translate-y-4"}`}
    >
      <div className={`flex items-center gap-2.5 px-5 py-3 rounded-2xl shadow-2xl text-sm font-semibold text-white
        ${type === "success" ? "bg-gray-900" : "bg-red-600"}`}>
        <span>{type === "success" ? "✓" : "✕"}</span>
        {message}
      </div>
    </div>
  );
}
