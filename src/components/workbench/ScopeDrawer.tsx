"use client";

import React, { useState } from "react";
import {
  CartesianGrid,
  Line,
  LineChart,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { Activity, ChevronDown, ChevronUp, Plus, Trash2, X } from "lucide-react";
import type { OscilloscopeData } from "@/lib/workbench/workbenchTypes";

interface ScopeDrawerProps {
  scopeData: OscilloscopeData;
  onClose: () => void;
}

interface LoggedScopeRow {
  id: string;
  ch1Vpp: number;
  ch2Vmax: number;
  ch2Vmin: number;
  ch2Vpp: number;
  ch2Vavg: number;
  ripple: number;
}

export function ScopeDrawer({ scopeData, onClose }: ScopeDrawerProps) {
  const [collapsed, setCollapsed] = useState(false);
  const [rows, setRows] = useState<LoggedScopeRow[]>([]);

  const handleRecord = () => {
    setRows((prev) => [
      ...prev,
      {
        id: `${Date.now()}`,
        ch1Vpp: scopeData.ch1.vpp,
        ch2Vmax: scopeData.ch2.vmax,
        ch2Vmin: scopeData.ch2.vmin,
        ch2Vpp: scopeData.ch2.vpp,
        ch2Vavg: scopeData.ch2.vavg,
        ripple: scopeData.ch2.rippleFactor,
      },
    ]);
  };

  return (
    <div className="rounded-3xl bg-white shadow-[0_8px_30px_rgba(0,0,0,0.08)] overflow-hidden">
      <div className="flex items-center justify-between px-5 py-3 bg-zinc-50/80">
        <div className="flex items-center gap-2.5">
          <Activity className="h-4 w-4 text-zinc-700" />
          <span className="text-xs font-semibold text-zinc-900">
            Dual-Channel Digital Oscilloscope
          </span>
          <span className="text-xs text-zinc-500">
            CH1 (Gray) · CH2 (Black)
          </span>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleRecord}
            className="inline-flex items-center gap-1.5 rounded-full bg-zinc-900 px-3 py-1.5 text-[11px] font-medium text-white hover:bg-zinc-800 transition-colors cursor-pointer"
          >
            <Plus className="h-3 w-3" />
            <span>Record Reading</span>
          </button>
          <button
            type="button"
            onClick={() => setCollapsed((c) => !c)}
            className="rounded-full p-1.5 text-zinc-600 hover:bg-zinc-200/70 transition-colors cursor-pointer"
            aria-label={collapsed ? "Expand oscilloscope" : "Collapse oscilloscope"}
          >
            {collapsed ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
          </button>
          <button
            type="button"
            onClick={onClose}
            className="rounded-full p-1.5 text-zinc-600 hover:bg-zinc-200/70 transition-colors cursor-pointer"
            aria-label="Close oscilloscope"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      </div>

      {!collapsed && (
        <div className="p-4 grid grid-cols-1 lg:grid-cols-12 gap-4">
          <div className="lg:col-span-8 h-52 rounded-2xl bg-zinc-50 p-2">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={scopeData.points} margin={{ top: 8, right: 12, left: -12, bottom: 4 }}>
                <CartesianGrid stroke="#e4e4e7" strokeDasharray="3 3" />
                <XAxis
                  dataKey="t"
                  tick={{ fontSize: 10, fill: "#71717a" }}
                  axisLine={false}
                  tickLine={false}
                  unit="ms"
                />
                <YAxis
                  tick={{ fontSize: 10, fill: "#71717a" }}
                  axisLine={false}
                  tickLine={false}
                  unit="V"
                />
                <ReferenceLine y={0} stroke="#d4d4d8" />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#ffffff",
                    border: "none",
                    borderRadius: "12px",
                    boxShadow: "0 4px 12px rgba(0,0,0,0.08)",
                    fontSize: "11px",
                  }}
                />
                <Line
                  type="monotone"
                  dataKey="ch1"
                  name="CH1 (V)"
                  stroke="#a1a1aa"
                  strokeWidth={1.75}
                  dot={false}
                  isAnimationActive={false}
                />
                <Line
                  type="monotone"
                  dataKey="ch2"
                  name="CH2 (V)"
                  stroke="#18181b"
                  strokeWidth={2.2}
                  dot={false}
                  isAnimationActive={false}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>

          <div className="lg:col-span-4 flex flex-col justify-between gap-3">
            <div className="grid grid-cols-2 gap-2">
              <div className="rounded-2xl bg-zinc-50 p-3">
                <div className="text-[10px] text-zinc-500">CH1 Vp-p</div>
                <div className="text-sm font-mono font-semibold text-zinc-900">
                  {scopeData.ch1.vpp} V
                </div>
              </div>
              <div className="rounded-2xl bg-zinc-50 p-3">
                <div className="text-[10px] text-zinc-500">CH2 Vp-p</div>
                <div className="text-sm font-mono font-semibold text-zinc-900">
                  {scopeData.ch2.vpp} V
                </div>
              </div>
              <div className="rounded-2xl bg-zinc-50 p-3">
                <div className="text-[10px] text-zinc-500">CH2 Vmax / Vmin</div>
                <div className="text-xs font-mono font-semibold text-zinc-900">
                  {scopeData.ch2.vmax} / {scopeData.ch2.vmin} V
                </div>
              </div>
              <div className="rounded-2xl bg-zinc-50 p-3">
                <div className="text-[10px] text-zinc-500">CH2 Vavg / Ripple</div>
                <div className="text-xs font-mono font-semibold text-zinc-900">
                  {scopeData.ch2.vavg} V · {scopeData.ch2.rippleFactor}
                </div>
              </div>
            </div>

            {rows.length > 0 && (
              <div className="rounded-2xl bg-zinc-50 p-2.5 max-h-24 overflow-y-auto">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-[10px] font-medium text-zinc-500">
                    Recorded ({rows.length})
                  </span>
                  <button
                    type="button"
                    onClick={() => setRows([])}
                    className="text-zinc-500 hover:text-zinc-800 cursor-pointer"
                    aria-label="Clear recorded readings"
                  >
                    <Trash2 className="h-3 w-3" />
                  </button>
                </div>
                <div className="space-y-1 text-[10px] font-mono text-zinc-700">
                  {rows.map((r, i) => (
                    <div key={r.id} className="flex justify-between">
                      <span>#{i + 1}</span>
                      <span>
                        Max {r.ch2Vmax}V · Min {r.ch2Vmin}V · Avg {r.ch2Vavg}V · r {r.ripple}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
