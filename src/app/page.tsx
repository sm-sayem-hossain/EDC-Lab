"use client";

import React, { useEffect, useState } from "react";
import { Cpu, MessageSquare } from "lucide-react";
import { CircuitWorkbench } from "@/components/workbench/CircuitWorkbench";
import { VivaSection } from "@/components/VivaSection";

const STORAGE_KEY = "edc_lab_viva_v1";

export default function HomePage() {
  const [activeTab, setActiveTab] = useState<"studio" | "viva">("studio");
  const [readyViva, setReadyViva] = useState<string[]>([]);

  useEffect(() => {
    const timer = setTimeout(() => {
      try {
        const saved = localStorage.getItem(STORAGE_KEY);
        if (saved) setReadyViva(JSON.parse(saved) as string[]);
      } catch {
        // Ignore storage errors
      }
    }, 0);
    return () => clearTimeout(timer);
  }, []);

  const handleToggleVivaReady = (id: string) => {
    setReadyViva((prev) => {
      const next = prev.includes(id)
        ? prev.filter((x) => x !== id)
        : [...prev, id];
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
      } catch {
        // Ignore storage errors
      }
      return next;
    });
  };

  return (
    <div className="min-h-screen bg-[#f6f6f5] text-zinc-900">
      <div className="mx-auto max-w-[1440px] px-4 py-4 space-y-3">
        {/* Minimal Top Header */}
        <header className="rounded-3xl bg-white px-5 py-3 shadow-[0_1px_2px_rgba(0,0,0,0.04)] flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="h-9 w-9 rounded-2xl bg-zinc-900 text-white flex items-center justify-center">
              <Cpu className="h-4 w-4" />
            </div>
            <div>
              <h1 className="text-sm font-semibold tracking-tight text-zinc-900">
                EDC Lab Studio
              </h1>
              <p className="text-[11px] text-zinc-500">
                Interactive Circuit Workbench · CSE-216
              </p>
            </div>
          </div>

          <nav className="flex items-center gap-1 rounded-full bg-zinc-100 p-1">
            <button
              type="button"
              onClick={() => setActiveTab("studio")}
              className={`inline-flex items-center gap-2 rounded-full px-4 py-1.5 text-xs font-medium transition-colors cursor-pointer ${
                activeTab === "studio"
                  ? "bg-white text-zinc-900 shadow-xs"
                  : "text-zinc-600 hover:text-zinc-900"
              }`}
            >
              <Cpu className="h-3.5 w-3.5" />
              <span>Circuit Studio</span>
            </button>
            <button
              type="button"
              onClick={() => setActiveTab("viva")}
              className={`inline-flex items-center gap-2 rounded-full px-4 py-1.5 text-xs font-medium transition-colors cursor-pointer ${
                activeTab === "viva"
                  ? "bg-white text-zinc-900 shadow-xs"
                  : "text-zinc-600 hover:text-zinc-900"
              }`}
            >
              <MessageSquare className="h-3.5 w-3.5" />
              <span>Viva Prep</span>
            </button>
          </nav>
        </header>

        <main>
          {activeTab === "studio" ? (
            <CircuitWorkbench />
          ) : (
            <VivaSection
              readyVivaIds={readyViva}
              onToggleReady={handleToggleVivaReady}
            />
          )}
        </main>
      </div>
    </div>
  );
}
