"use client";

import React from "react";
import type { ExperimentId } from "@/types/lab";

interface CircuitSchematicProps {
  expId: ExperimentId;
  params: Record<string, number | string>;
}

const strokeColor = "#27272a";
const mutedStroke = "#71717a";

function Ground({ x, y }: { x: number; y: number }) {
  return (
    <g stroke={strokeColor} strokeWidth="1.75" strokeLinecap="round">
      <line x1={x} y1={y} x2={x} y2={y + 10} />
      <line x1={x - 11} y1={y + 10} x2={x + 11} y2={y + 10} />
      <line x1={x - 7} y1={y + 15} x2={x + 7} y2={y + 15} />
      <line x1={x - 3} y1={y + 20} x2={x + 3} y2={y + 20} />
    </g>
  );
}

function ResistorH({ x, y, label }: { x: number; y: number; label: string }) {
  return (
    <g>
      <path
        d={`M ${x} ${y} l 8 0 l 4 -7 l 7 14 l 7 -14 l 7 14 l 7 -14 l 4 7 l 8 0`}
        fill="none"
        stroke={strokeColor}
        strokeWidth="1.75"
        strokeLinejoin="round"
        strokeLinecap="round"
      />
      <text
        x={x + 26}
        y={y - 12}
        textAnchor="middle"
        className="fill-zinc-700 text-[11px] font-medium"
      >
        {label}
      </text>
    </g>
  );
}

function ResistorV({ x, y, label }: { x: number; y: number; label: string }) {
  return (
    <g>
      <path
        d={`M ${x} ${y} l 0 8 l -7 4 l 14 7 l -14 7 l 14 7 l -14 7 l 7 4 l 0 8`}
        fill="none"
        stroke={strokeColor}
        strokeWidth="1.75"
        strokeLinejoin="round"
        strokeLinecap="round"
      />
      <text
        x={x + 15}
        y={y + 30}
        className="fill-zinc-700 text-[11px] font-medium"
      >
        {label}
      </text>
    </g>
  );
}

function CapacitorV({ x, y, label }: { x: number; y: number; label: string }) {
  return (
    <g>
      <line x1={x} y1={y} x2={x} y2={y + 22} stroke={strokeColor} strokeWidth="1.75" />
      <line x1={x - 12} y1={y + 22} x2={x + 12} y2={y + 22} stroke={strokeColor} strokeWidth="2" strokeLinecap="round" />
      <line x1={x - 12} y1={y + 30} x2={x + 12} y2={y + 30} stroke={strokeColor} strokeWidth="2" strokeLinecap="round" />
      <line x1={x} y1={y + 30} x2={x} y2={y + 52} stroke={strokeColor} strokeWidth="1.75" />
      <text x={x + 16} y={y + 30} className="fill-zinc-700 text-[11px] font-medium">
        {label}
      </text>
    </g>
  );
}

function CapacitorH({ x, y, label }: { x: number; y: number; label: string }) {
  return (
    <g>
      <line x1={x} y1={y} x2={x + 22} y2={y} stroke={strokeColor} strokeWidth="1.75" />
      <line x1={x + 22} y1={y - 12} x2={x + 22} y2={y + 12} stroke={strokeColor} strokeWidth="2" strokeLinecap="round" />
      <line x1={x + 30} y1={y - 12} x2={x + 30} y2={y + 12} stroke={strokeColor} strokeWidth="2" strokeLinecap="round" />
      <line x1={x + 30} y1={y} x2={x + 52} y2={y} stroke={strokeColor} strokeWidth="1.75" />
      <text x={x + 26} y={y - 16} textAnchor="middle" className="fill-zinc-700 text-[11px] font-medium">
        {label}
      </text>
    </g>
  );
}

function DiodeH({
  x,
  y,
  reverse = false,
  label,
}: {
  x: number;
  y: number;
  reverse?: boolean;
  label?: string;
}) {
  return (
    <g>
      <line x1={x} y1={y} x2={x + 14} y2={y} stroke={strokeColor} strokeWidth="1.75" />
      {!reverse ? (
        <>
          <polygon
            points={`${x + 14},${y - 9} ${x + 14},${y + 9} ${x + 30},${y}`}
            fill="none"
            stroke={strokeColor}
            strokeWidth="1.75"
            strokeLinejoin="round"
          />
          <line x1={x + 30} y1={y - 9} x2={x + 30} y2={y + 9} stroke={strokeColor} strokeWidth="2" strokeLinecap="round" />
        </>
      ) : (
        <>
          <line x1={x + 14} y1={y - 9} x2={x + 14} y2={y + 9} stroke={strokeColor} strokeWidth="2" strokeLinecap="round" />
          <polygon
            points={`${x + 30},${y - 9} ${x + 30},${y + 9} ${x + 14},${y}`}
            fill="none"
            stroke={strokeColor}
            strokeWidth="1.75"
            strokeLinejoin="round"
          />
        </>
      )}
      <line x1={x + 30} y1={y} x2={x + 44} y2={y} stroke={strokeColor} strokeWidth="1.75" />
      {label && (
        <text x={x + 22} y={y - 14} textAnchor="middle" className="fill-zinc-700 text-[11px] font-medium">
          {label}
        </text>
      )}
    </g>
  );
}

function DiodeV({
  x,
  y,
  up = false,
  zener = false,
  label,
}: {
  x: number;
  y: number;
  up?: boolean;
  zener?: boolean;
  label?: string;
}) {
  return (
    <g>
      <line x1={x} y1={y} x2={x} y2={y + 16} stroke={strokeColor} strokeWidth="1.75" />
      {up ? (
        <>
          <line x1={x - 10} y1={y + 16} x2={x + 10} y2={y + 16} stroke={strokeColor} strokeWidth="2" strokeLinecap="round" />
          {zener && (
            <>
              <line x1={x - 10} y1={y + 16} x2={x - 14} y2={y + 21} stroke={strokeColor} strokeWidth="1.75" strokeLinecap="round" />
              <line x1={x + 10} y1={y + 16} x2={x + 14} y2={y + 11} stroke={strokeColor} strokeWidth="1.75" strokeLinecap="round" />
            </>
          )}
          <polygon
            points={`${x - 9},${y + 34} ${x + 9},${y + 34} ${x},${y + 16}`}
            fill="none"
            stroke={strokeColor}
            strokeWidth="1.75"
            strokeLinejoin="round"
          />
        </>
      ) : (
        <>
          <polygon
            points={`${x - 9},${y + 16} ${x + 9},${y + 16} ${x},${y + 34}`}
            fill="none"
            stroke={strokeColor}
            strokeWidth="1.75"
            strokeLinejoin="round"
          />
          <line x1={x - 10} y1={y + 34} x2={x + 10} y2={y + 34} stroke={strokeColor} strokeWidth="2" strokeLinecap="round" />
        </>
      )}
      <line x1={x} y1={y + 34} x2={x} y2={y + 52} stroke={strokeColor} strokeWidth="1.75" />
      {label && (
        <text x={x + 16} y={y + 29} className="fill-zinc-700 text-[11px] font-medium">
          {label}
        </text>
      )}
    </g>
  );
}

function SourceCircle({
  x,
  y,
  label,
  isAc = true,
}: {
  x: number;
  y: number;
  label: string;
  isAc?: boolean;
}) {
  return (
    <g>
      <circle cx={x} cy={y} r={16} fill="#ffffff" stroke={strokeColor} strokeWidth="1.75" />
      {isAc ? (
        <path
          d={`M ${x - 8} ${y} q 4 -7 8 0 t 8 0`}
          fill="none"
          stroke={strokeColor}
          strokeWidth="1.5"
          strokeLinecap="round"
        />
      ) : (
        <g stroke={strokeColor} strokeWidth="1.5" strokeLinecap="round">
          <line x1={x - 4} y1={y - 5} x2={x + 4} y2={y - 5} />
          <line x1={x} y1={y - 9} x2={x} y2={y - 1} />
          <line x1={x - 4} y1={y + 6} x2={x + 4} y2={y + 6} />
        </g>
      )}
      <text x={x - 22} y={y + 4} textAnchor="end" className="fill-zinc-700 text-[11px] font-medium">
        {label}
      </text>
    </g>
  );
}

export function CircuitSchematic({ expId, params }: CircuitSchematicProps) {
  return (
    <div className="rounded-2xl bg-zinc-50/90 p-4 flex flex-col justify-between">
      <div className="flex items-center justify-between mb-2">
        <span className="text-xs font-medium tracking-wide uppercase text-zinc-500">
          Circuit Schematic
        </span>
        <span className="text-xs text-zinc-500">Live Topology</span>
      </div>

      <svg
        viewBox="0 0 380 185"
        className="w-full h-44 select-none"
        role="img"
        aria-label={`Circuit schematic for ${expId}`}
      >
        {expId === "exp-1" && (
          <>
            <SourceCircle x={75} y={92} label={`${params.vpp ?? 10}Vpp`} isAc />
            <line x1={75} y1={42} x2={75} y2={76} stroke={strokeColor} strokeWidth="1.75" />
            <line x1={75} y1={108} x2={75} y2={145} stroke={strokeColor} strokeWidth="1.75" />
            <line x1={75} y1={42} x2={135} y2={42} stroke={strokeColor} strokeWidth="1.75" />
            <ResistorH x={135} y={42} label={`${params.resistor ?? 1000} Ω`} />
            <line x1={187} y1={42} x2={255} y2={42} stroke={strokeColor} strokeWidth="1.75" />
            {params.component === "rc" ? (
              <CapacitorV x={255} y={66} label={`${params.capacitor ?? 0.1} uF`} />
            ) : params.component === "rl" ? (
              <g>
                <line x1={255} y1={66} x2={255} y2={74} stroke={strokeColor} strokeWidth="1.75" />
                <path
                  d="M 255 74 c 8 0 8 9 0 9 c 8 0 8 9 0 9 c 8 0 8 9 0 9 c 8 0 8 9 0 9"
                  fill="none"
                  stroke={strokeColor}
                  strokeWidth="1.75"
                />
                <line x1={255} y1={110} x2={255} y2={118} stroke={strokeColor} strokeWidth="1.75" />
                <text x={270} y={96} className="fill-zinc-700 text-[11px] font-medium">
                  100 mH
                </text>
              </g>
            ) : (
              <ResistorV x={255} y={66} label="Load" />
            )}
            <line x1={255} y1={42} x2={255} y2={66} stroke={strokeColor} strokeWidth="1.75" />
            <line x1={255} y1={118} x2={255} y2={145} stroke={strokeColor} strokeWidth="1.75" />
            <line x1={75} y1={145} x2={255} y2={145} stroke={strokeColor} strokeWidth="1.75" />
            <Ground x={165} y={145} />
            <line x1={255} y1={42} x2={315} y2={42} stroke={mutedStroke} strokeDasharray="3 3" strokeWidth="1.5" />
            <circle cx={315} cy={42} r={3} fill={strokeColor} />
            <text x={322} y={46} className="fill-zinc-700 text-[11px] font-medium">CH2</text>
          </>
        )}

        {expId === "exp-2" && (
          <>
            <SourceCircle x={75} y={92} label={`${params.vin ?? 3}V DC`} isAc={false} />
            <line x1={75} y1={42} x2={75} y2={76} stroke={strokeColor} strokeWidth="1.75" />
            <line x1={75} y1={108} x2={75} y2={145} stroke={strokeColor} strokeWidth="1.75" />
            <line x1={75} y1={42} x2={135} y2={42} stroke={strokeColor} strokeWidth="1.75" />
            <ResistorH x={135} y={42} label={`${params.resistor ?? 1000} Ω`} />
            <line x1={187} y1={42} x2={255} y2={42} stroke={strokeColor} strokeWidth="1.75" />
            <line x1={255} y1={42} x2={255} y2={66} stroke={strokeColor} strokeWidth="1.75" />
            <DiodeV
              x={255}
              y={66}
              up={params.bias === "reverse"}
              label={params.material === "ge" ? "1N34A (Ge)" : "1N4007 (Si)"}
            />
            <line x1={255} y1={118} x2={255} y2={145} stroke={strokeColor} strokeWidth="1.75" />
            <line x1={75} y1={145} x2={255} y2={145} stroke={strokeColor} strokeWidth="1.75" />
            <Ground x={165} y={145} />
          </>
        )}

        {expId === "exp-3" && (
          <>
            <SourceCircle x={70} y={92} label={`${params.vin ?? 10}V`} isAc={false} />
            <line x1={70} y1={42} x2={70} y2={76} stroke={strokeColor} strokeWidth="1.75" />
            <line x1={70} y1={108} x2={70} y2={145} stroke={strokeColor} strokeWidth="1.75" />
            <line x1={70} y1={42} x2={118} y2={42} stroke={strokeColor} strokeWidth="1.75" />
            <ResistorH x={118} y={42} label={`${params.resistor ?? 470} Ω`} />
            <line x1={170} y1={42} x2={295} y2={42} stroke={strokeColor} strokeWidth="1.75" />
            <line x1={225} y1={42} x2={225} y2={66} stroke={strokeColor} strokeWidth="1.75" />
            <DiodeV x={225} y={66} up zener label={`Vz ${params.zenerVoltage ?? 5.1}V`} />
            <line x1={225} y1={118} x2={225} y2={145} stroke={strokeColor} strokeWidth="1.75" />
            <line x1={295} y1={42} x2={295} y2={66} stroke={strokeColor} strokeWidth="1.75" />
            <ResistorV x={295} y={66} label={`RL`} />
            <line x1={295} y1={118} x2={295} y2={145} stroke={strokeColor} strokeWidth="1.75" />
            <line x1={70} y1={145} x2={295} y2={145} stroke={strokeColor} strokeWidth="1.75" />
            <Ground x={182} y={145} />
          </>
        )}

        {expId === "exp-4" && (
          <>
            <SourceCircle x={70} y={92} label={`${params.vpp ?? 10}Vpp`} isAc />
            <line x1={70} y1={42} x2={70} y2={76} stroke={strokeColor} strokeWidth="1.75" />
            <line x1={70} y1={108} x2={70} y2={145} stroke={strokeColor} strokeWidth="1.75" />
            <line x1={70} y1={42} x2={125} y2={42} stroke={strokeColor} strokeWidth="1.75" />
            <DiodeH x={125} y={42} label="1N4007" />
            <line x1={169} y1={42} x2={295} y2={42} stroke={strokeColor} strokeWidth="1.75" />
            {Number(params.capacitor ?? 0) > 0 && (
              <>
                <line x1={220} y1={42} x2={220} y2={66} stroke={strokeColor} strokeWidth="1.75" />
                <CapacitorV x={220} y={66} label={`${params.capacitor}uF`} />
                <line x1={220} y1={118} x2={220} y2={145} stroke={strokeColor} strokeWidth="1.75" />
              </>
            )}
            <line x1={295} y1={42} x2={295} y2={66} stroke={strokeColor} strokeWidth="1.75" />
            <ResistorV x={295} y={66} label={`${params.loadResistor ?? 1000} Ω`} />
            <line x1={295} y1={118} x2={295} y2={145} stroke={strokeColor} strokeWidth="1.75" />
            <line x1={70} y1={145} x2={295} y2={145} stroke={strokeColor} strokeWidth="1.75" />
            <Ground x={182} y={145} />
          </>
        )}

        {expId === "exp-5" && (
          <>
            <SourceCircle x={65} y={92} label={`${params.vpp ?? 10}Vpp`} isAc />
            <line x1={65} y1={48} x2={65} y2={76} stroke={strokeColor} strokeWidth="1.75" />
            <line x1={65} y1={108} x2={65} y2={136} stroke={strokeColor} strokeWidth="1.75" />
            <line x1={65} y1={48} x2={135} y2={48} stroke={strokeColor} strokeWidth="1.75" />
            <line x1={65} y1={136} x2={135} y2={136} stroke={strokeColor} strokeWidth="1.75" />
            {/* Bridge diamond */}
            <polygon
              points="175,34 215,92 175,150 135,92"
              fill="#ffffff"
              stroke={strokeColor}
              strokeWidth="1.75"
              strokeLinejoin="round"
            />
            <text x={175} y={88} textAnchor="middle" className="fill-zinc-700 text-[10px] font-medium">
              4x 1N4007
            </text>
            <text x={175} y={102} textAnchor="middle" className="fill-zinc-500 text-[10px]">
              Bridge
            </text>
            <line x1={135} y1={48} x2={135} y2={92} stroke={strokeColor} strokeWidth="1.75" />
            <line x1={135} y1={136} x2={135} y2={92} stroke={strokeColor} strokeWidth="1.75" />
            <line x1={175} y1={34} x2={315} y2={34} stroke={strokeColor} strokeWidth="1.75" />
            <line x1={175} y1={150} x2={315} y2={150} stroke={strokeColor} strokeWidth="1.75" />
            {Number(params.capacitor ?? 0) > 0 && (
              <>
                <line x1={255} y1={34} x2={255} y2={66} stroke={strokeColor} strokeWidth="1.75" />
                <CapacitorV x={255} y={66} label={`${params.capacitor}uF`} />
                <line x1={255} y1={118} x2={255} y2={150} stroke={strokeColor} strokeWidth="1.75" />
              </>
            )}
            <line x1={315} y1={34} x2={315} y2={66} stroke={strokeColor} strokeWidth="1.75" />
            <ResistorV x={315} y={66} label="RL" />
            <line x1={315} y1={118} x2={315} y2={150} stroke={strokeColor} strokeWidth="1.75" />
            <Ground x={215} y={150} />
          </>
        )}

        {expId === "exp-6" && (
          <>
            <SourceCircle x={70} y={92} label={`${params.vpp ?? 19.6}Vpp`} isAc />
            <line x1={70} y1={42} x2={70} y2={76} stroke={strokeColor} strokeWidth="1.75" />
            <line x1={70} y1={108} x2={70} y2={145} stroke={strokeColor} strokeWidth="1.75" />
            <line x1={70} y1={42} x2={125} y2={42} stroke={strokeColor} strokeWidth="1.75" />
            <ResistorH x={125} y={42} label="1 kΩ" />
            <line x1={177} y1={42} x2={295} y2={42} stroke={strokeColor} strokeWidth="1.75" />
            <line x1={235} y1={42} x2={235} y2={62} stroke={strokeColor} strokeWidth="1.75" />
            <DiodeV
              x={235}
              y={62}
              up={params.clipMode === "neg" || params.clipMode === "biased-neg"}
              label={
                params.clipMode === "biased-pos" || params.clipMode === "biased-neg" || params.clipMode === "dual"
                  ? `Vbias ${params.biasVoltage ?? 2.3}V`
                  : "Clip"
              }
            />
            <line x1={235} y1={114} x2={235} y2={145} stroke={strokeColor} strokeWidth="1.75" />
            <line x1={70} y1={145} x2={295} y2={145} stroke={strokeColor} strokeWidth="1.75" />
            <Ground x={182} y={145} />
            <circle cx={295} cy={42} r={3} fill={strokeColor} />
            <text x={303} y={46} className="fill-zinc-700 text-[11px] font-medium">Vout</text>
          </>
        )}

        {expId === "exp-7" && (
          <>
            <SourceCircle x={70} y={92} label={`${params.vpp ?? 10}Vpp`} isAc />
            <line x1={70} y1={42} x2={70} y2={76} stroke={strokeColor} strokeWidth="1.75" />
            <line x1={70} y1={108} x2={70} y2={145} stroke={strokeColor} strokeWidth="1.75" />
            <line x1={70} y1={42} x2={125} y2={42} stroke={strokeColor} strokeWidth="1.75" />
            <CapacitorH x={125} y={42} label={`${params.capacitor ?? 10} uF`} />
            <line x1={177} y1={42} x2={295} y2={42} stroke={strokeColor} strokeWidth="1.75" />
            <line x1={225} y1={42} x2={225} y2={66} stroke={strokeColor} strokeWidth="1.75" />
            <DiodeV x={225} y={66} up={params.clampMode === "positive"} label="1N4007" />
            <line x1={225} y1={118} x2={225} y2={145} stroke={strokeColor} strokeWidth="1.75" />
            <line x1={295} y1={42} x2={295} y2={66} stroke={strokeColor} strokeWidth="1.75" />
            <ResistorV x={295} y={66} label="R" />
            <line x1={295} y1={118} x2={295} y2={145} stroke={strokeColor} strokeWidth="1.75" />
            <line x1={70} y1={145} x2={295} y2={145} stroke={strokeColor} strokeWidth="1.75" />
            <Ground x={182} y={145} />
          </>
        )}
      </svg>
    </div>
  );
}
