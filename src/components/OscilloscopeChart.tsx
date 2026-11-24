"use client";

import React from "react";
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
import type { ExperimentMeta, SimulationPoint } from "@/types/lab";

interface OscilloscopeChartProps {
  experiment: ExperimentMeta;
  points: SimulationPoint[];
  isLoading: boolean;
}

export function OscilloscopeChart({
  experiment,
  points,
  isLoading,
}: OscilloscopeChartProps) {
  const isTransient = experiment.plotMode === "transient";

  return (
    <div className="rounded-2xl bg-white p-5 shadow-[0_1px_2px_rgba(0,0,0,0.04)]">
      <div className="flex flex-wrap items-center justify-between gap-2 mb-4">
        <div>
          <h3 className="text-sm font-semibold text-zinc-900">
            {isTransient ? "Digital Oscilloscope View" : "Characteristic Curve Plot"}
          </h3>
          <p className="text-xs text-zinc-500">
            {isTransient
              ? "CH1 (Input Vin) and CH2 (Output Vout) via ngspice"
              : `${experiment.yLabel} vs ${experiment.xLabel}`}
          </p>
        </div>

        <div className="flex items-center gap-4 text-xs text-zinc-600">
          {isTransient ? (
            <>
              <span className="inline-flex items-center gap-1.5">
                <span className="h-2 w-4 rounded-full bg-zinc-400 inline-block" />
                CH1 Vin
              </span>
              <span className="inline-flex items-center gap-1.5">
                <span className="h-2 w-4 rounded-full bg-zinc-900 inline-block" />
                CH2 Vout
              </span>
            </>
          ) : (
            <span className="inline-flex items-center gap-1.5">
              <span className="h-2 w-4 rounded-full bg-zinc-900 inline-block" />
              {experiment.yLabel}
            </span>
          )}
        </div>
      </div>

      <div className="h-64 w-full rounded-xl bg-zinc-50/70 p-2 relative">
        {isLoading && points.length === 0 ? (
          <div className="h-full flex items-center justify-center text-xs text-zinc-500">
            Running SPICE simulation...
          </div>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={points} margin={{ top: 10, right: 14, left: -10, bottom: 8 }}>
              <CartesianGrid stroke="#e4e4e7" strokeDasharray="3 3" />
              <XAxis
                dataKey="x"
                tick={{ fontSize: 11, fill: "#71717a" }}
                axisLine={false}
                tickLine={false}
                label={{
                  value: experiment.xLabel,
                  position: "insideBottom",
                  offset: -4,
                  fontSize: 11,
                  fill: "#71717a",
                }}
              />
              <YAxis
                tick={{ fontSize: 11, fill: "#71717a" }}
                axisLine={false}
                tickLine={false}
              />
              <ReferenceLine y={0} stroke="#d4d4d8" strokeWidth={1} />
              <Tooltip
                contentStyle={{
                  backgroundColor: "#ffffff",
                  border: "none",
                  borderRadius: "12px",
                  boxShadow: "0 4px 12px rgba(0,0,0,0.08)",
                  fontSize: "12px",
                }}
              />
              {isTransient ? (
                <>
                  <Line
                    type="monotone"
                    dataKey="ch1"
                    name="CH1 Vin (V)"
                    stroke="#a1a1aa"
                    strokeWidth={1.75}
                    dot={false}
                    isAnimationActive={false}
                  />
                  <Line
                    type="monotone"
                    dataKey="ch2"
                    name="CH2 Vout (V)"
                    stroke="#18181b"
                    strokeWidth={2.25}
                    dot={false}
                    isAnimationActive={false}
                  />
                </>
              ) : (
                <Line
                  type="monotone"
                  dataKey="ch1"
                  name={experiment.yLabel}
                  stroke="#18181b"
                  strokeWidth={2.25}
                  dot={false}
                  isAnimationActive={false}
                />
              )}
            </LineChart>
          </ResponsiveContainer>
        )}
      </div>
    </div>
  );
}
