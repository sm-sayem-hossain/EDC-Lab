"use client";

import React from "react";
import {
  BB_BOT_RAIL_NEG_Y,
  BB_BOT_RAIL_POS_Y,
  BB_BOT_ROWS_Y,
  BB_COLS,
  BB_ORIGIN_X,
  BB_PITCH,
  BB_TOP_RAIL_NEG_Y,
  BB_TOP_RAIL_POS_Y,
  BB_TOP_ROWS_Y,
  COMPONENT_CATALOG,
} from "@/lib/workbench/componentCatalog";
import type {
  MultimeterReading,
  OscilloscopeData,
  PlacedComponent,
} from "@/lib/workbench/workbenchTypes";

interface ComponentGraphicProps {
  comp: PlacedComponent;
  isSelected: boolean;
  simRunning: boolean;
  scopeData?: OscilloscopeData;
  meterReading?: MultimeterReading;
  ledCurrentMa?: number;
}

function getResistorBands(ohms: number): [string, string, string] {
  const palette = [
    "#27272a", // 0 black
    "#78350f", // 1 brown
    "#991b1b", // 2 red
    "#b45309", // 3 orange
    "#a16207", // 4 yellow
    "#3f6212", // 5 green
    "#1e40af", // 6 blue
    "#6b21a8", // 7 violet
    "#52525b", // 8 grey
    "#e4e4e7", // 9 white
  ];
  const val = Math.max(10, Math.round(ohms));
  const str = String(val);
  const d1 = Number(str[0]) || 1;
  const d2 = Number(str[1]) || 0;
  const mult = Math.min(6, Math.max(0, str.length - 2));
  return [palette[d1], palette[d2], palette[mult]];
}

function formatResistance(ohms: number): string {
  if (ohms >= 1000000) return `${(ohms / 1000000).toFixed(1)}M`;
  if (ohms >= 1000) return `${(ohms / 1000).toFixed(ohms % 1000 === 0 ? 0 : 1)}k`;
  return `${ohms}`;
}

export function ComponentGraphic({
  comp,
  isSelected,
  simRunning,
  scopeData,
  meterReading,
  ledCurrentMa = 0,
}: ComponentGraphicProps) {
  const def = COMPONENT_CATALOG[comp.type];

  switch (comp.type) {
    case "breadboard": {
      const w = def.width;
      const h = def.height;
      return (
        <g>
          <rect
            x={0}
            y={0}
            width={w}
            height={h}
            rx={14}
            fill="#fafaf9"
            stroke={isSelected ? "#18181b" : "#e4e4e7"}
            strokeWidth={isSelected ? 2 : 1}
          />
          {/* Subtle power rail guide lines */}
          <line x1={18} y1={BB_TOP_RAIL_POS_Y - 6} x2={w - 18} y2={BB_TOP_RAIL_POS_Y - 6} stroke="#a8a29e" strokeWidth={1} strokeDasharray="4 4" />
          <line x1={18} y1={BB_TOP_RAIL_NEG_Y + 6} x2={w - 18} y2={BB_TOP_RAIL_NEG_Y + 6} stroke="#d4d4d8" strokeWidth={1} />
          <line x1={18} y1={BB_BOT_RAIL_POS_Y - 6} x2={w - 18} y2={BB_BOT_RAIL_POS_Y - 6} stroke="#d4d4d8" strokeWidth={1} />
          <line x1={18} y1={BB_BOT_RAIL_NEG_Y + 6} x2={w - 18} y2={BB_BOT_RAIL_NEG_Y + 6} stroke="#a8a29e" strokeWidth={1} strokeDasharray="4 4" />
          {/* Center DIP trough */}
          <rect x={14} y={128} width={w - 28} height={10} rx={5} fill="#e7e5e4" />
          {/* Rail +/- markers */}
          <text x={11} y={BB_TOP_RAIL_POS_Y + 3} className="fill-zinc-500 text-[9px] font-mono">+</text>
          <text x={12} y={BB_TOP_RAIL_NEG_Y + 3} className="fill-zinc-500 text-[9px] font-mono">-</text>
          <text x={11} y={BB_BOT_RAIL_POS_Y + 3} className="fill-zinc-500 text-[9px] font-mono">+</text>
          <text x={12} y={BB_BOT_RAIL_NEG_Y + 3} className="fill-zinc-500 text-[9px] font-mono">-</text>
          {/* Column numbers every 5 */}
          {Array.from({ length: BB_COLS }, (_, idx) => idx + 1).map((col) =>
            col === 1 || col % 5 === 0 ? (
              <text
                key={col}
                x={BB_ORIGIN_X + (col - 1) * BB_PITCH}
                y={46}
                textAnchor="middle"
                className="fill-zinc-400 text-[8px] font-mono"
              >
                {col}
              </text>
            ) : null
          )}
          {/* Row letters */}
          {["a", "b", "c", "d", "e"].map((r, i) => (
            <text key={r} x={11} y={BB_TOP_ROWS_Y[i] + 3} className="fill-zinc-400 text-[8px] font-mono">
              {r}
            </text>
          ))}
          {["f", "g", "h", "i", "j"].map((r, i) => (
            <text key={r} x={11} y={BB_BOT_ROWS_Y[i] + 3} className="fill-zinc-400 text-[8px] font-mono">
              {r}
            </text>
          ))}
        </g>
      );
    }

    case "dc-supply": {
      const v = Number(comp.props.voltage ?? 5);
      return (
        <g>
          <rect
            x={0}
            y={0}
            width={def.width}
            height={def.height}
            rx={16}
            fill="#27272a"
            stroke={isSelected ? "#18181b" : "none"}
            strokeWidth={2}
          />
          <text x={14} y={20} className="fill-zinc-400 text-[9px] font-medium uppercase tracking-wider">
            DC Power Supply
          </text>
          <rect x={14} y={28} width={100} height={36} rx={10} fill="#18181b" />
          <text x={64} y={51} textAnchor="middle" className="fill-zinc-100 text-[16px] font-mono font-semibold">
            {v.toFixed(1)} V
          </text>
          <text x={14} y={80} className="fill-zinc-400 text-[9px] font-mono">
            {simRunning ? "OUTPUT ON" : "STANDBY"}
          </text>
          <text x={132} y={33} textAnchor="end" className="fill-zinc-300 text-[10px] font-mono">+</text>
          <text x={132} y={65} textAnchor="end" className="fill-zinc-400 text-[10px] font-mono">-</text>
        </g>
      );
    }

    case "func-gen": {
      const wave = String(comp.props.waveform ?? "sine");
      const vpp = Number(comp.props.vpp ?? 10);
      const freq = Number(comp.props.freq ?? 1000);
      return (
        <g>
          <rect
            x={0}
            y={0}
            width={def.width}
            height={def.height}
            rx={16}
            fill="#27272a"
            stroke={isSelected ? "#18181b" : "none"}
            strokeWidth={2}
          />
          <text x={14} y={20} className="fill-zinc-400 text-[9px] font-medium uppercase tracking-wider">
            Function Generator
          </text>
          <rect x={14} y={28} width={118} height={46} rx={10} fill="#18181b" />
          <text x={24} y={47} className="fill-zinc-100 text-[13px] font-mono font-semibold">
            {freq >= 1000 ? `${(freq / 1000).toFixed(1)} kHz` : `${freq} Hz`}
          </text>
          <text x={24} y={64} className="fill-zinc-400 text-[10px] font-mono">
            {vpp} Vpp · {wave.toUpperCase()}
          </text>
          <text x={14} y={90} className="fill-zinc-400 text-[9px] font-mono">
            {simRunning ? "ACTIVE" : "READY"}
          </text>
          <text x={152} y={37} textAnchor="end" className="fill-zinc-300 text-[10px] font-mono">+</text>
          <text x={152} y={71} textAnchor="end" className="fill-zinc-400 text-[10px] font-mono">-</text>
        </g>
      );
    }

    case "oscilloscope": {
      // Mini waveform preview path on the scope screen
      let path1 = "";
      let path2 = "";
      if (simRunning && scopeData && scopeData.points.length > 1) {
        const pts = scopeData.points;
        const allVals = pts.flatMap((p) => [p.ch1, p.ch2]);
        const maxAbs = Math.max(1, ...allVals.map((v) => Math.abs(v)));
        const sx = 112 / (pts.length - 1);
        const sy = 22 / maxAbs;
        path1 = pts
          .map((p, i) => `${i === 0 ? "M" : "L"} ${(56 + i * sx).toFixed(1)} ${(56 - p.ch1 * sy).toFixed(1)}`)
          .join(" ");
        path2 = pts
          .map((p, i) => `${i === 0 ? "M" : "L"} ${(56 + i * sx).toFixed(1)} ${(56 - p.ch2 * sy).toFixed(1)}`)
          .join(" ");
      }
      return (
        <g>
          <rect
            x={0}
            y={0}
            width={def.width}
            height={def.height}
            rx={16}
            fill="#27272a"
            stroke={isSelected ? "#18181b" : "none"}
            strokeWidth={2}
          />
          <text x={54} y={18} className="fill-zinc-400 text-[9px] font-medium uppercase tracking-wider">
            Oscilloscope 2-CH
          </text>
          <rect x={52} y={24} width={120} height={64} rx={10} fill="#18181b" />
          {/* Subtle grid */}
          <line x1={52} y1={56} x2={172} y2={56} stroke="#27272a" strokeWidth={1} />
          <line x1={112} y1={24} x2={112} y2={88} stroke="#27272a" strokeWidth={1} />
          {path1 && <path d={path1} fill="none" stroke="#71717a" strokeWidth={1.2} />}
          {path2 && <path d={path2} fill="none" stroke="#f4f4f5" strokeWidth={1.6} />}
          {!simRunning && (
            <text x={112} y={59} textAnchor="middle" className="fill-zinc-500 text-[9px] font-mono">
              CH1 / CH2
            </text>
          )}
          <text x={54} y={104} className="fill-zinc-400 text-[9px] font-mono">
            {simRunning && scopeData
              ? `CH2 ${scopeData.ch2.vpp}Vpp`
              : "Wire probes to view"}
          </text>
          {/* Probe labels */}
          <text x={12} y={31} className="fill-zinc-300 text-[8px] font-mono">CH1+</text>
          <text x={12} y={53} className="fill-zinc-500 text-[8px] font-mono">GND</text>
          <text x={12} y={81} className="fill-zinc-300 text-[8px] font-mono">CH2+</text>
          <text x={12} y={103} className="fill-zinc-500 text-[8px] font-mono">GND</text>
        </g>
      );
    }

    case "multimeter": {
      const mode = String(comp.props.mode ?? "voltage");
      const valText =
        simRunning && meterReading
          ? `${meterReading.value.toFixed(2)} ${meterReading.unit}`
          : mode === "current"
          ? "0.00 mA"
          : "0.00 V";
      return (
        <g>
          <rect
            x={0}
            y={0}
            width={def.width}
            height={def.height}
            rx={16}
            fill="#3f3f46"
            stroke={isSelected ? "#18181b" : "none"}
            strokeWidth={2}
          />
          <text x={56} y={19} textAnchor="middle" className="fill-zinc-300 text-[9px] font-medium uppercase tracking-wider">
            {mode === "current" ? "Ammeter" : "Voltmeter"}
          </text>
          <rect x={12} y={26} width={88} height={38} rx={9} fill="#e7e5e4" />
          <text x={56} y={50} textAnchor="middle" className="fill-zinc-900 text-[13px] font-mono font-semibold">
            {valText}
          </text>
          <circle cx={56} cy={84} r={12} fill="#27272a" />
          <line x1={56} y1={84} x2={mode === "current" ? 64 : 48} y2={78} stroke="#e4e4e7" strokeWidth={2} strokeLinecap="round" />
          <text x={34} y={108} textAnchor="middle" className="fill-zinc-200 text-[9px] font-mono">+</text>
          <text x={78} y={108} textAnchor="middle" className="fill-zinc-400 text-[9px] font-mono">-</text>
        </g>
      );
    }

    case "ground": {
      return (
        <g>
          <rect
            x={0}
            y={0}
            width={def.width}
            height={def.height}
            rx={12}
            fill={isSelected ? "#f4f4f5" : "transparent"}
          />
          <line x1={22} y1={4} x2={22} y2={20} stroke="#27272a" strokeWidth={2} strokeLinecap="round" />
          <line x1={9} y1={20} x2={35} y2={20} stroke="#27272a" strokeWidth={2.2} strokeLinecap="round" />
          <line x1={13} y1={26} x2={31} y2={26} stroke="#27272a" strokeWidth={2} strokeLinecap="round" />
          <line x1={17} y1={32} x2={27} y2={32} stroke="#27272a" strokeWidth={1.8} strokeLinecap="round" />
          <text x={22} y={42} textAnchor="middle" className="fill-zinc-500 text-[8px] font-mono">GND</text>
        </g>
      );
    }

    case "resistor": {
      const r = Number(comp.props.resistance ?? 1000);
      const [b1, b2, b3] = getResistorBands(r);
      return (
        <g>
          <line x1={4} y1={16} x2={84} y2={16} stroke="#71717a" strokeWidth={2.2} strokeLinecap="round" />
          <rect
            x={18}
            y={7}
            width={52}
            height={18}
            rx={7}
            fill="#e7d7c1"
            stroke={isSelected ? "#18181b" : "#c7b299"}
            strokeWidth={isSelected ? 1.8 : 1}
          />
          <rect x={28} y={7} width={4} height={18} fill={b1} />
          <rect x={37} y={7} width={4} height={18} fill={b2} />
          <rect x={46} y={7} width={4} height={18} fill={b3} />
          <rect x={58} y={7} width={3.5} height={18} fill="#b45309" opacity={0.7} />
          <text x={44} y={31} textAnchor="middle" className="fill-zinc-600 text-[9px] font-mono">
            {formatResistance(r)} Ω
          </text>
        </g>
      );
    }

    case "capacitor": {
      const cap = Number(comp.props.capacitance ?? 10);
      return (
        <g>
          <line x1={4} y1={22} x2={26} y2={22} stroke="#71717a" strokeWidth={2.2} strokeLinecap="round" />
          <line x1={46} y1={22} x2={68} y2={22} stroke="#71717a" strokeWidth={2.2} strokeLinecap="round" />
          <rect
            x={24}
            y={8}
            width={24}
            height={28}
            rx={10}
            fill="#3f3f46"
            stroke={isSelected ? "#18181b" : "#27272a"}
            strokeWidth={isSelected ? 1.8 : 1}
          />
          <rect x={40} y={9} width={5} height={26} rx={2} fill="#d4d4d8" />
          <text x={36} y={43} textAnchor="middle" className="fill-zinc-600 text-[9px] font-mono">
            {cap} uF
          </text>
        </g>
      );
    }

    case "inductor": {
      const l = Number(comp.props.inductance ?? 100);
      return (
        <g>
          <line x1={4} y1={18} x2={20} y2={18} stroke="#71717a" strokeWidth={2.2} strokeLinecap="round" />
          <line x1={68} y1={18} x2={84} y2={18} stroke="#71717a" strokeWidth={2.2} strokeLinecap="round" />
          <path
            d="M 20 18 c 0 -10 12 -10 12 0 c 0 -10 12 -10 12 0 c 0 -10 12 -10 12 0 c 0 -10 12 -10 12 0"
            fill="none"
            stroke={isSelected ? "#18181b" : "#52525b"}
            strokeWidth={2.4}
            strokeLinecap="round"
          />
          <text x={44} y={33} textAnchor="middle" className="fill-zinc-600 text-[9px] font-mono">
            {l} mH
          </text>
        </g>
      );
    }

    case "diode": {
      const mat = String(comp.props.material ?? "si");
      return (
        <g>
          <line x1={4} y1={16} x2={80} y2={16} stroke="#71717a" strokeWidth={2.2} strokeLinecap="round" />
          <rect
            x={20}
            y={7}
            width={44}
            height={18}
            rx={6}
            fill="#27272a"
            stroke={isSelected ? "#18181b" : "#18181b"}
            strokeWidth={isSelected ? 1.8 : 1}
          />
          {/* Cathode silver band on right */}
          <rect x={54} y={7} width={5} height={18} fill="#d4d4d8" />
          <text x={42} y={31} textAnchor="middle" className="fill-zinc-600 text-[9px] font-mono">
            {mat === "ge" ? "1N34A" : "1N4007"}
          </text>
        </g>
      );
    }

    case "zener": {
      const vz = Number(comp.props.vz ?? 5.1);
      return (
        <g>
          <line x1={4} y1={16} x2={80} y2={16} stroke="#71717a" strokeWidth={2.2} strokeLinecap="round" />
          <rect
            x={20}
            y={7}
            width={44}
            height={18}
            rx={6}
            fill="#785a46"
            stroke={isSelected ? "#18181b" : "#574031"}
            strokeWidth={isSelected ? 1.8 : 1}
          />
          {/* Cathode dark band on right */}
          <rect x={54} y={7} width={5} height={18} fill="#18181b" />
          <text x={42} y={31} textAnchor="middle" className="fill-zinc-600 text-[9px] font-mono">
            Z {vz}V
          </text>
        </g>
      );
    }

    case "led": {
      const isLit = simRunning && ledCurrentMa > 0.5;
      return (
        <g>
          <line x1={4} y1={22} x2={22} y2={22} stroke="#71717a" strokeWidth={2.2} strokeLinecap="round" />
          <line x1={46} y1={22} x2={64} y2={22} stroke="#71717a" strokeWidth={2.2} strokeLinecap="round" />
          {isLit && <circle cx={34} cy={22} r={18} fill="#a16207" opacity={0.22} />}
          <circle
            cx={34}
            cy={22}
            r={12}
            fill={isLit ? "#ca8a04" : "#d4d4d8"}
            stroke={isSelected ? "#18181b" : "#71717a"}
            strokeWidth={isSelected ? 1.8 : 1.2}
          />
          <text x={34} y={42} textAnchor="middle" className="fill-zinc-600 text-[9px] font-mono">
            {isLit ? `${ledCurrentMa.toFixed(1)}mA` : "LED"}
          </text>
        </g>
      );
    }
  }
}
