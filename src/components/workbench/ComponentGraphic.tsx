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
          <line x1={18} y1={BB_TOP_RAIL_POS_Y - 6} x2={w - 18} y2={BB_TOP_RAIL_POS_Y - 6} stroke="#b97a72" strokeWidth={1.2} />
          <line x1={18} y1={BB_TOP_RAIL_NEG_Y + 6} x2={w - 18} y2={BB_TOP_RAIL_NEG_Y + 6} stroke="#7d8da1" strokeWidth={1.2} />
          <line x1={18} y1={BB_BOT_RAIL_POS_Y - 6} x2={w - 18} y2={BB_BOT_RAIL_POS_Y - 6} stroke="#b97a72" strokeWidth={1.2} />
          <line x1={18} y1={BB_BOT_RAIL_NEG_Y + 6} x2={w - 18} y2={BB_BOT_RAIL_NEG_Y + 6} stroke="#7d8da1" strokeWidth={1.2} />
          <rect x={14} y={128} width={w - 28} height={10} rx={5} fill="#e7e5e4" />
          <text x={11} y={BB_TOP_RAIL_POS_Y + 3} className="fill-zinc-500 text-[9px] font-mono">+</text>
          <text x={12} y={BB_TOP_RAIL_NEG_Y + 3} className="fill-zinc-500 text-[9px] font-mono">-</text>
          <text x={11} y={BB_BOT_RAIL_POS_Y + 3} className="fill-zinc-500 text-[9px] font-mono">+</text>
          <text x={12} y={BB_BOT_RAIL_NEG_Y + 3} className="fill-zinc-500 text-[9px] font-mono">-</text>
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
          {/* Benchtop light-grey casing matching Tinkercad Power Supply */}
          <rect
            x={0}
            y={0}
            width={def.width}
            height={def.height}
            rx={12}
            fill="#e4e4e2"
            stroke={isSelected ? "#18181b" : "#d4d4d1"}
            strokeWidth={isSelected ? 2 : 1}
          />
          {/* Top LCD: Voltage */}
          <rect x={10} y={10} width={92} height={32} rx={6} fill="#3f3f46" />
          <rect x={13} y={13} width={86} height={26} rx={4} fill="#cfd7da" />
          <text x={56} y={31} textAnchor="middle" className="fill-zinc-900 text-[13px] font-mono font-semibold">
            {v.toFixed(2)} V
          </text>
          {/* Bottom LCD: Current Limit */}
          <rect x={10} y={48} width={92} height={32} rx={6} fill="#3f3f46" />
          <rect x={13} y={51} width={86} height={26} rx={4} fill="#cfd7da" />
          <text x={56} y={69} textAnchor="middle" className="fill-zinc-700 text-[12px] font-mono">
            {simRunning ? "ON · 1.0A" : "0.00 A"}
          </text>
          {/* Rotary dials */}
          <circle cx={128} cy={26} r={14} fill="#71717a" stroke="#52525b" strokeWidth={1.5} />
          <circle cx={128} cy={26} r={10} fill="#a1a1aa" />
          <line x1={128} y1={26} x2={135} y2={20} stroke="#27272a" strokeWidth={2} strokeLinecap="round" />
          <text x={144} y={14} className="fill-zinc-500 text-[6px] font-mono">CV</text>

          <circle cx={128} cy={64} r={14} fill="#71717a" stroke="#52525b" strokeWidth={1.5} />
          <circle cx={128} cy={64} r={10} fill="#a1a1aa" />
          <line x1={128} y1={64} x2={135} y2={58} stroke="#27272a" strokeWidth={2} strokeLinecap="round" />
          <text x={144} y={52} className="fill-zinc-500 text-[6px] font-mono">CC</text>

          {/* Bottom power toggle */}
          <rect x={12} y={90} width={28} height={13} rx={6.5} fill="#52525b" />
          <circle cx={simRunning ? 33 : 19} cy={96.5} r={5} fill="#e4e4e2" />
          <text x={122} y={97} className="fill-zinc-500 text-[6px] font-mono uppercase">
            POWER
          </text>
          <text x={122} y={104} className="fill-zinc-500 text-[6px] font-mono uppercase">
            SUPPLY
          </text>

          {/* Bottom banana jacks (+ red, - black) */}
          <circle cx={74} cy={97} r={6} fill="#991b1b" />
          <circle cx={74} cy={97} r={2.5} fill="#27272a" />
          <circle cx={92} cy={97} r={6} fill="#27272a" />
          <circle cx={92} cy={97} r={2.5} fill="#71717a" />
        </g>
      );
    }

    case "func-gen": {
      const wave = String(comp.props.waveform ?? "sine");
      const vpp = Number(comp.props.vpp ?? 10);
      const freq = Number(comp.props.freq ?? 1000);
      const freqLabel = freq >= 1000 ? `${(freq / 1000).toFixed(2)} kHz` : `${freq} Hz`;
      return (
        <g>
          <rect
            x={0}
            y={0}
            width={def.width}
            height={def.height}
            rx={12}
            fill="#e4e4e2"
            stroke={isSelected ? "#18181b" : "#d4d4d1"}
            strokeWidth={isSelected ? 2 : 1}
          />
          {/* 3 Stacked LCDs on the left */}
          <rect x={10} y={10} width={78} height={26} rx={5} fill="#3f3f46" />
          <rect x={13} y={13} width={72} height={20} rx={3} fill="#cfd7da" />
          <text x={49} y={27} textAnchor="middle" className="fill-zinc-900 text-[10px] font-mono font-semibold">
            {freqLabel}
          </text>

          <rect x={10} y={40} width={78} height={26} rx={5} fill="#3f3f46" />
          <rect x={13} y={43} width={72} height={20} rx={3} fill="#cfd7da" />
          <text x={49} y={57} textAnchor="middle" className="fill-zinc-900 text-[10px] font-mono font-semibold">
            {vpp.toFixed(1)} Vpp
          </text>

          <rect x={10} y={70} width={78} height={26} rx={5} fill="#3f3f46" />
          <rect x={13} y={73} width={72} height={20} rx={3} fill="#cfd7da" />
          <text x={49} y={87} textAnchor="middle" className="fill-zinc-700 text-[10px] font-mono">
            0.00 V
          </text>

          {/* 3 Rotary dials in middle */}
          {[23, 53, 83].map((cy, idx) => (
            <g key={cy}>
              <circle cx={112} cy={cy} r={11.5} fill="#71717a" stroke="#52525b" strokeWidth={1.2} />
              <circle cx={112} cy={cy} r={8} fill="#a1a1aa" />
              <line
                x1={112}
                y1={cy}
                x2={112 + (idx === 1 ? 6 : 4)}
                y2={cy - 5}
                stroke="#27272a"
                strokeWidth={1.8}
                strokeLinecap="round"
              />
            </g>
          ))}

          {/* 3 Waveform buttons on top-right */}
          {[
            { id: "square", x: 136 },
            { id: "sine", x: 160 },
            { id: "triangle", x: 184 },
          ].map((btn) => {
            const active = wave === btn.id;
            return (
              <g key={btn.id}>
                <rect
                  x={btn.x}
                  y={12}
                  width={20}
                  height={20}
                  rx={4}
                  fill={active ? "#27272a" : "#d4d4d1"}
                />
                {btn.id === "square" && (
                  <path
                    d={`M ${btn.x + 4} 26 v -8 h 6 v 8 h 6`}
                    fill="none"
                    stroke={active ? "#f4f4f5" : "#3f3f46"}
                    strokeWidth={1.4}
                  />
                )}
                {btn.id === "sine" && (
                  <path
                    d={`M ${btn.x + 4} 22 q 3 -7 6 0 t 6 0`}
                    fill="none"
                    stroke={active ? "#f4f4f5" : "#3f3f46"}
                    strokeWidth={1.4}
                  />
                )}
                {btn.id === "triangle" && (
                  <path
                    d={`M ${btn.x + 4} 26 l 6 -9 l 6 9`}
                    fill="none"
                    stroke={active ? "#f4f4f5" : "#3f3f46"}
                    strokeWidth={1.4}
                  />
                )}
              </g>
            );
          })}

          {/* Decorative amplitude / offset diagrams on right */}
          <path d="M 146 54 q 10 -12 20 0 t 20 0" fill="none" stroke="#71717a" strokeWidth={1.3} />
          <line x1={144} y1={54} x2={188} y2={54} stroke="#a1a1aa" strokeWidth={0.8} strokeDasharray="2 2" />
          <path d="M 146 82 q 10 -10 20 0 t 20 0" fill="none" stroke="#71717a" strokeWidth={1.3} />
          <line x1={144} y1={82} x2={188} y2={82} stroke="#a1a1aa" strokeWidth={0.8} strokeDasharray="2 2" />

          {/* Bottom power toggle & label */}
          <rect x={12} y={104} width={28} height={13} rx={6.5} fill="#52525b" />
          <circle cx={simRunning ? 33 : 19} cy={110.5} r={5} fill="#e4e4e2" />
          <text x={148} y={110} className="fill-zinc-500 text-[6px] font-mono uppercase">
            FUNCTION
          </text>
          <text x={148} y={117} className="fill-zinc-500 text-[6px] font-mono uppercase">
            GENERATOR
          </text>

          {/* Bottom banana jacks (+ red, - black) */}
          <circle cx={100} cy={111} r={6} fill="#991b1b" />
          <circle cx={100} cy={111} r={2.5} fill="#27272a" />
          <circle cx={118} cy={111} r={6} fill="#27272a" />
          <circle cx={118} cy={111} r={2.5} fill="#71717a" />
        </g>
      );
    }

    case "oscilloscope": {
      // Tinkercad-style benchtop Oscilloscope with warm muted amber casing & gridded LCD
      let path1 = "";
      let path2 = "";
      if (simRunning && scopeData && scopeData.points.length > 1) {
        const pts = scopeData.points;
        const allVals = pts.flatMap((p) => [p.ch1, p.ch2]);
        const maxAbs = Math.max(1, ...allVals.map((v) => Math.abs(v)));
        const sx = 136 / (pts.length - 1);
        const sy = 56 / maxAbs;
        path1 = pts
          .map((p, i) => `${i === 0 ? "M" : "L"} ${(16 + i * sx).toFixed(1)} ${(82 - p.ch1 * sy).toFixed(1)}`)
          .join(" ");
        path2 = pts
          .map((p, i) => `${i === 0 ? "M" : "L"} ${(16 + i * sx).toFixed(1)} ${(82 - p.ch2 * sy).toFixed(1)}`)
          .join(" ");
      }
      return (
        <g>
          <rect
            x={0}
            y={0}
            width={def.width}
            height={def.height - 10}
            rx={12}
            fill="#d49a2a"
            stroke={isSelected ? "#18181b" : "#b8821d"}
            strokeWidth={isSelected ? 2 : 1}
          />
          {/* Dark screen bezel */}
          <rect x={11} y={10} width={146} height={140} rx={6} fill="#3f3f46" />
          {/* Gridded LCD */}
          <rect x={14} y={13} width={140} height={134} rx={4} fill="#cfd7da" />
          {/* Vertical gridlines */}
          {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((i) => (
            <line
              key={`vx-${i}`}
              x1={14 + i * 14}
              y1={13}
              x2={14 + i * 14}
              y2={147}
              stroke={i === 5 ? "#8b989e" : "#b4c0c4"}
              strokeWidth={i === 5 ? 1 : 0.6}
            />
          ))}
          {/* Horizontal gridlines */}
          {[1, 2, 3, 4, 5, 6, 7].map((i) => (
            <line
              key={`hy-${i}`}
              x1={14}
              y1={13 + i * 16.75}
              x2={154}
              y2={13 + i * 16.75}
              stroke={i === 4 ? "#8b989e" : "#b4c0c4"}
              strokeWidth={i === 4 ? 1 : 0.6}
            />
          ))}
          {path1 && <path d={path1} fill="none" stroke="#64748b" strokeWidth={1.35} />}
          {path2 && <path d={path2} fill="none" stroke="#18181b" strokeWidth={2.0} />}

          {/* Bottom 'Time' and right 'Voltage' labels */}
          <text x={84} y={162} textAnchor="middle" className="fill-zinc-900 text-[8px] font-semibold">
            Time
          </text>
          <text
            x={166}
            y={82}
            textAnchor="middle"
            transform="rotate(-90 166 82)"
            className="fill-zinc-900 text-[8px] font-semibold"
          >
            Voltage
          </text>

          {/* Bottom probe stubs: CH1 (-/+), CH2 (-/+) */}
          <rect x={50} y={168} width={4} height={8} rx={1} fill="#27272a" />
          <rect x={68} y={168} width={4} height={8} rx={1} fill="#991b1b" />
          <rect x={104} y={168} width={4} height={8} rx={1} fill="#27272a" />
          <rect x={122} y={168} width={4} height={8} rx={1} fill="#991b1b" />
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
          {/* Horizontal muted amber Tinkercad-style Multimeter */}
          <rect
            x={0}
            y={0}
            width={def.width}
            height={def.height - 8}
            rx={10}
            fill="#d49a2a"
            stroke={isSelected ? "#18181b" : "#b8821d"}
            strokeWidth={isSelected ? 2 : 1}
          />
          {/* Wide LCD */}
          <rect x={8} y={8} width={116} height={38} rx={5} fill="#3f3f46" />
          <rect x={11} y={11} width={110} height={32} rx={3} fill="#cfd7da" />
          <text x={66} y={32} textAnchor="middle" className="fill-zinc-900 text-[13px] font-mono font-semibold">
            {valText}
          </text>
          {/* A / V / R mode circles on right */}
          {[
            { label: "A", cy: 14, active: mode === "current" },
            { label: "V", cy: 27, active: mode === "voltage" },
            { label: "R", cy: 40, active: false },
          ].map((b) => (
            <g key={b.label}>
              <circle
                cx={138}
                cy={b.cy}
                r={5.5}
                fill={b.active ? "#27272a" : "#e7b95a"}
                stroke="#3f3f46"
                strokeWidth={0.9}
              />
              <text
                x={138}
                y={b.cy + 2.5}
                textAnchor="middle"
                className={`${b.active ? "fill-white" : "fill-zinc-900"} text-[7px] font-mono font-semibold`}
              >
                {b.label}
              </text>
            </g>
          ))}
          {/* Bottom test lead stubs */}
          <rect x={64} y={54} width={4} height={6} rx={1} fill="#27272a" />
          <rect x={82} y={54} width={4} height={6} rx={1} fill="#991b1b" />
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
          {isLit && <circle cx={34} cy={22} r={18} fill="#ca8a04" opacity={0.25} />}
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
