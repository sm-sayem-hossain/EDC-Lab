"use client";

import React, { useMemo, useState } from "react";
import { CheckCircle2, Circle, Eye, EyeOff, HelpCircle, MessageSquare } from "lucide-react";
import { VIVA_ITEMS } from "@/data/viva";

interface VivaSectionProps {
  readyVivaIds: string[];
  onToggleReady: (id: string) => void;
}

const FILTERS = [
  { id: "all", label: "All Topics" },
  { id: "general", label: "Lab Instruments" },
  { id: "exp-1", label: "Exp 01" },
  { id: "exp-2", label: "Exp 02" },
  { id: "exp-3", label: "Exp 03" },
  { id: "exp-4", label: "Exp 04" },
  { id: "exp-5", label: "Exp 05" },
  { id: "exp-6", label: "Exp 06" },
  { id: "exp-7", label: "Exp 07" },
];

export function VivaSection({ readyVivaIds, onToggleReady }: VivaSectionProps) {
  const [activeFilter, setActiveFilter] = useState<string>("all");
  const [practiceMode, setPracticeMode] = useState<boolean>(false);
  const [revealedIds, setRevealedIds] = useState<string[]>([]);

  const filteredItems = useMemo(() => {
    if (activeFilter === "all") return VIVA_ITEMS;
    return VIVA_ITEMS.filter((item) => item.experimentId === activeFilter);
  }, [activeFilter]);

  const toggleReveal = (id: string) => {
    setRevealedIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  };

  return (
    <div className="space-y-5">
      {/* Header & Practice Toggle */}
      <div className="rounded-3xl bg-white p-6 shadow-[0_1px_2px_rgba(0,0,0,0.04)] flex flex-wrap items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-xs font-medium uppercase tracking-wider text-zinc-500">
            <MessageSquare className="h-3.5 w-3.5" />
            <span>Viva Preparation</span>
          </div>
          <h2 className="text-xl font-semibold text-zinc-900 tracking-tight">
            CSE-216 Lab Final Viva Bank
          </h2>
          <p className="text-sm text-zinc-600">
            Sir-er common viva proshno ebong shohoj Bangla explanation. Practice mode on kore nijeke test korte paro.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="rounded-full bg-zinc-100 px-4 py-2 text-xs font-medium text-zinc-700">
            {readyVivaIds.length} / {VIVA_ITEMS.length} Ready
          </div>
          <button
            type="button"
            onClick={() => {
              setPracticeMode((p) => !p);
              setRevealedIds([]);
            }}
            className="inline-flex items-center gap-2 rounded-full bg-zinc-900 px-4 py-2 text-xs font-medium text-white hover:bg-zinc-800 transition-colors cursor-pointer"
          >
            {practiceMode ? <Eye className="h-3.5 w-3.5" /> : <EyeOff className="h-3.5 w-3.5" />}
            <span>{practiceMode ? "Show All Answers" : "Self-Test Mode"}</span>
          </button>
        </div>
      </div>

      {/* Filter Pills */}
      <div className="flex flex-wrap gap-2">
        {FILTERS.map((f) => {
          const active = activeFilter === f.id;
          return (
            <button
              key={f.id}
              type="button"
              onClick={() => setActiveFilter(f.id)}
              className={`rounded-full px-4 py-2 text-xs font-medium transition-colors cursor-pointer ${
                active
                  ? "bg-zinc-900 text-white"
                  : "bg-white text-zinc-600 hover:bg-zinc-100"
              }`}
            >
              {f.label}
            </button>
          );
        })}
      </div>

      {/* Viva Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filteredItems.map((item) => {
          const isReady = readyVivaIds.includes(item.id);
          const isAnswerVisible = !practiceMode || revealedIds.includes(item.id);

          return (
            <div
              key={item.id}
              className="rounded-3xl bg-white p-6 shadow-[0_1px_2px_rgba(0,0,0,0.04)] flex flex-col justify-between gap-4"
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between gap-2">
                  <span className="text-xs font-medium text-zinc-500">
                    {item.experimentLabel}
                  </span>
                  <button
                    type="button"
                    onClick={() => onToggleReady(item.id)}
                    className="inline-flex items-center gap-1.5 text-xs font-medium text-zinc-700 hover:text-zinc-900 cursor-pointer"
                  >
                    {isReady ? (
                      <>
                        <CheckCircle2 className="h-4 w-4 text-zinc-900" />
                        <span>Ready</span>
                      </>
                    ) : (
                      <>
                        <Circle className="h-4 w-4 text-zinc-400" />
                        <span>Mark Ready</span>
                      </>
                    )}
                  </button>
                </div>

                <div className="flex items-start gap-2.5">
                  <HelpCircle className="h-4 w-4 text-zinc-500 mt-1 shrink-0" />
                  <h3 className="text-sm font-semibold text-zinc-900 leading-snug">
                    {item.question}
                  </h3>
                </div>

                {isAnswerVisible ? (
                  <div className="space-y-2.5 pt-1">
                    <p className="text-sm text-zinc-700 leading-relaxed">
                      {item.answerBangla}
                    </p>
                    <div className="rounded-2xl bg-zinc-50 p-3.5 text-xs text-zinc-600 leading-relaxed">
                      <span className="font-semibold text-zinc-800">Viva Tip: </span>
                      {item.keyTipBangla}
                    </div>
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={() => toggleReveal(item.id)}
                    className="w-full rounded-2xl bg-zinc-100 py-3 text-xs font-medium text-zinc-700 hover:bg-zinc-200/70 transition-colors cursor-pointer"
                  >
                    Tap to Reveal Answer
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
