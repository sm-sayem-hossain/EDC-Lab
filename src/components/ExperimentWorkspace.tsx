"use client";

import React, { useEffect, useMemo, useState } from "react";
import {
  Activity,
  BookOpen,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  Circle,
  Cpu,
  Gauge,
  Plus,
  RotateCcw,
  Sliders,
  Target,
  Trash2,
} from "lucide-react";
import type {
  ExperimentMeta,
  RecordedRow,
  SimulationMetrics,
  SimulationPoint,
} from "@/types/lab";
import { runCircuitSimulation } from "@/lib/spice/engine";
import { CircuitSchematic } from "@/components/CircuitSchematic";
import { OscilloscopeChart } from "@/components/OscilloscopeChart";

interface ExperimentWorkspaceProps {
  experiment: ExperimentMeta;
  completedStepIds: string[];
  onToggleStep: (stepId: string) => void;
  onChallengeSolved: (expId: string) => void;
  challengeSolved: boolean;
}

function getDefaultParams(exp: ExperimentMeta): Record<string, number | string> {
  const obj: Record<string, number | string> = {};
  for (const c of exp.controls) {
    obj[c.key] = c.defaultValue;
  }
  return obj;
}

export function ExperimentWorkspace({
  experiment,
  completedStepIds,
  onToggleStep,
  onChallengeSolved,
  challengeSolved,
}: ExperimentWorkspaceProps) {
  const [params, setParams] = useState<Record<string, number | string>>(() =>
    getDefaultParams(experiment)
  );
  const [points, setPoints] = useState<SimulationPoint[]>([]);
  const [metrics, setMetrics] = useState<SimulationMetrics>({});
  const [netlist, setNetlist] = useState<string>("");
  const [simError, setSimError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [recordedRows, setRecordedRows] = useState<RecordedRow[]>([]);
  const [showTheory, setShowTheory] = useState<boolean>(false);
  const [showNetlist, setShowNetlist] = useState<boolean>(false);
  const [openHints, setOpenHints] = useState<Record<string, boolean>>({});

  const [prevExpId, setPrevExpId] = useState(experiment.id);
  if (prevExpId !== experiment.id) {
    setPrevExpId(experiment.id);
    setParams(getDefaultParams(experiment));
    setRecordedRows([]);
    setOpenHints({});
  }

  // Run ngspice simulation when params change
  useEffect(() => {
    let cancelled = false;
    const timer = setTimeout(async () => {
      setIsLoading(true);
      try {
        const res = await runCircuitSimulation(experiment.id, params);
        if (cancelled) return;
        setPoints(res.points);
        setMetrics(res.metrics);
        setNetlist(res.netlist);
        setSimError(res.errors.length ? res.errors.join("; ") : null);
      } catch (err) {
        if (cancelled) return;
        setSimError(err instanceof Error ? err.message : "Simulation failed");
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    }, 90);

    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, [experiment.id, params]);

  // Auto-verify challenge
  const isChallengeCurrentlyPassing = useMemo(
    () => experiment.challenge.verify(params, metrics),
    [experiment.challenge, params, metrics]
  );

  useEffect(() => {
    if (isChallengeCurrentlyPassing && !challengeSolved) {
      onChallengeSolved(experiment.id);
    }
  }, [isChallengeCurrentlyPassing, challengeSolved, experiment.id, onChallengeSolved]);

  const handleParamChange = (key: string, value: number | string) => {
    setParams((prev) => ({ ...prev, [key]: value }));
  };

  const handleReset = () => {
    setParams(getDefaultParams(experiment));
  };

  const handleRecordRow = () => {
    const id = `${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
    let values: Record<string, string | number> = {};

    if (experiment.id === "exp-1") {
      values = {
        Waveform: String(params.waveform),
        Network: String(params.component).toUpperCase(),
        "Freq (Hz)": Number(params.freq),
        "Vin (Vpp)": metrics.vinPp ?? "-",
        "Vout (Vpp)": metrics.vpp ?? "-",
        "Phase (deg)": metrics.phaseShiftDeg ?? 0,
      };
    } else if (experiment.id === "exp-2") {
      values = {
        Bias: String(params.bias),
        Material: String(params.material).toUpperCase(),
        "Vdc (V)": Number(params.vin),
        "Vd (V)": metrics.vd ?? "-",
        "Vr (V)": metrics.vr ?? "-",
        "Id (mA)": metrics.idMa ?? "-",
      };
    } else if (experiment.id === "exp-3") {
      values = {
        "Target Vz": `${params.zenerVoltage} V`,
        "Vin (V)": Number(params.vin),
        "R (Ohm)": Number(params.resistor),
        "Vz (V)": metrics.vz ?? "-",
        "Vr (V)": metrics.vr ?? "-",
        "Iz (mA)": metrics.izMa ?? "-",
      };
    } else if (experiment.id === "exp-4" || experiment.id === "exp-5") {
      values = {
        "Cap (uF)": Number(params.capacitor) === 0 ? "Unfiltered" : `${params.capacitor} uF`,
        "Vmax (V)": metrics.vmax ?? "-",
        "Vmin (V)": metrics.vmin ?? "-",
        "Vp-p (V)": metrics.vpp ?? "-",
        "Vavg (V)": metrics.vavg ?? "-",
        "Ripple": metrics.rippleFactor ?? "-",
      };
    } else {
      values = {
        Mode: String(params.clipMode ?? params.clampMode),
        "Vin (Vpp)": metrics.vinPp ?? "-",
        "Vmax (V)": metrics.vmax ?? "-",
        "Vmin (V)": metrics.vmin ?? "-",
        "Vout (Vpp)": metrics.vpp ?? "-",
        "DC Shift (V)": metrics.dcShift ?? "-",
      };
    }

    setRecordedRows((prev) => [...prev, { id, values }]);
  };

  const metricCards = useMemo(() => {
    if (experiment.id === "exp-2") {
      return [
        { label: "Diode Voltage (Vd)", value: `${metrics.vd ?? "0.000"} V` },
        { label: "Resistor Drop (Vr)", value: `${metrics.vr ?? "0.000"} V` },
        { label: "Diode Current (Id)", value: `${metrics.idMa ?? "0.000"} mA` },
      ];
    }
    if (experiment.id === "exp-3") {
      return [
        { label: "Regulated Vout (Vz)", value: `${metrics.vz ?? "0.000"} V` },
        { label: "Series Drop (Vr)", value: `${metrics.vr ?? "0.000"} V` },
        { label: "Current (I)", value: `${metrics.izMa ?? "0.000"} mA` },
      ];
    }
    if (experiment.id === "exp-1") {
      return [
        { label: "Input Vp-p", value: `${metrics.vinPp ?? "0.00"} V` },
        { label: "Output Vp-p", value: `${metrics.vpp ?? "0.00"} V` },
        { label: "Phase Shift", value: `${metrics.phaseShiftDeg ?? "0.0"} deg` },
        { label: "Output Vrms", value: `${metrics.vrms ?? "0.00"} V` },
      ];
    }
    if (experiment.id === "exp-4" || experiment.id === "exp-5") {
      return [
        { label: "Vmax", value: `${metrics.vmax ?? "0.00"} V` },
        { label: "Vmin", value: `${metrics.vmin ?? "0.00"} V` },
        { label: "Vavg (Vdc)", value: `${metrics.vavg ?? "0.00"} V` },
        { label: "Ripple Factor", value: `${metrics.rippleFactor ?? "0.000"}` },
      ];
    }
    return [
      { label: "Vmax", value: `${metrics.vmax ?? "0.00"} V` },
      { label: "Vmin", value: `${metrics.vmin ?? "0.00"} V` },
      { label: "Output Vp-p", value: `${metrics.vpp ?? "0.00"} V` },
      { label: "DC Shift", value: `${metrics.dcShift ?? "0.00"} V` },
    ];
  }, [experiment.id, metrics]);

  return (
    <div className="space-y-5">
      {/* Experiment Header Card */}
      <div className="rounded-3xl bg-white p-6 shadow-[0_1px_2px_rgba(0,0,0,0.04)]">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="space-y-1.5 max-w-2xl">
            <div className="flex items-center gap-2 text-xs font-medium text-zinc-500 uppercase tracking-wider">
              <Cpu className="h-3.5 w-3.5" />
              <span>Experiment {experiment.number}</span>
            </div>
            <h2 className="text-xl font-semibold text-zinc-900 tracking-tight">
              {experiment.title}
            </h2>
            <p className="text-sm text-zinc-600 leading-relaxed">
              {experiment.objective}
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setShowTheory((s) => !s)}
              className="inline-flex items-center gap-2 rounded-full bg-zinc-100 px-4 py-2 text-xs font-medium text-zinc-700 hover:bg-zinc-200/80 transition-colors cursor-pointer"
            >
              <BookOpen className="h-3.5 w-3.5" />
              <span>{showTheory ? "Hide Theory & Apparatus" : "Theory & Apparatus"}</span>
              {showTheory ? <ChevronUp className="h-3.5 w-3.5" /> : <ChevronDown className="h-3.5 w-3.5" />}
            </button>
            <button
              type="button"
              onClick={handleReset}
              className="inline-flex items-center gap-1.5 rounded-full bg-zinc-100 px-4 py-2 text-xs font-medium text-zinc-700 hover:bg-zinc-200/80 transition-colors cursor-pointer"
            >
              <RotateCcw className="h-3.5 w-3.5" />
              <span>Reset</span>
            </button>
          </div>
        </div>

        {showTheory && (
          <div className="mt-5 grid grid-cols-1 md:grid-cols-3 gap-4 rounded-2xl bg-zinc-50 p-4">
            <div>
              <h4 className="text-xs font-semibold uppercase tracking-wider text-zinc-500 mb-2">
                Apparatus
              </h4>
              <ul className="space-y-1 text-xs text-zinc-700">
                {experiment.apparatus.map((item) => (
                  <li key={item} className="leading-relaxed">
                    {item}
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <h4 className="text-xs font-semibold uppercase tracking-wider text-zinc-500 mb-2">
                Key Formulas
              </h4>
              <ul className="space-y-1.5 text-xs text-zinc-700">
                {experiment.formulas.map((f) => (
                  <li key={f.label}>
                    <span className="font-medium text-zinc-900">{f.label}: </span>
                    <span className="font-mono text-[11px] text-zinc-600">{f.expression}</span>
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <h4 className="text-xs font-semibold uppercase tracking-wider text-zinc-500 mb-2">
                Lab Reference Note
              </h4>
              <p className="text-xs text-zinc-600 leading-relaxed">
                {experiment.referenceNote}
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Main Bench Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* Left Column: Controls & Schematic */}
        <div className="lg:col-span-5 space-y-5">
          {/* Controls Panel */}
          <div className="rounded-3xl bg-white p-5 shadow-[0_1px_2px_rgba(0,0,0,0.04)] space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Sliders className="h-4 w-4 text-zinc-700" />
                <h3 className="text-sm font-semibold text-zinc-900">
                  Bench Controls
                </h3>
              </div>
              <span className="text-xs text-zinc-500">Real-time SPICE</span>
            </div>

            <div className="space-y-4">
              {experiment.controls.map((ctrl) => {
                const val = params[ctrl.key] ?? ctrl.defaultValue;
                if (ctrl.type === "select" && ctrl.options) {
                  return (
                    <div key={ctrl.key} className="space-y-1.5">
                      <label className="block text-xs font-medium text-zinc-600">
                        {ctrl.label}
                      </label>
                      <select
                        value={String(val)}
                        onChange={(e) => {
                          const raw = e.target.value;
                          const matched = ctrl.options?.find((o) => String(o.value) === raw);
                          handleParamChange(ctrl.key, matched ? matched.value : raw);
                        }}
                        className="w-full rounded-xl bg-zinc-100/90 px-3.5 py-2.5 text-sm text-zinc-900 outline-none focus:bg-zinc-100 transition-colors cursor-pointer"
                      >
                        {ctrl.options.map((opt) => (
                          <option key={String(opt.value)} value={String(opt.value)}>
                            {opt.label}
                          </option>
                        ))}
                      </select>
                    </div>
                  );
                }

                return (
                  <div key={ctrl.key} className="space-y-1.5">
                    <div className="flex items-center justify-between text-xs">
                      <label className="font-medium text-zinc-600">{ctrl.label}</label>
                      <span className="font-mono font-medium text-zinc-900">
                        {val} {ctrl.unit ?? ""}
                      </span>
                    </div>
                    <input
                      type="range"
                      min={ctrl.min}
                      max={ctrl.max}
                      step={ctrl.step}
                      value={Number(val)}
                      onChange={(e) => handleParamChange(ctrl.key, Number(e.target.value))}
                      className="w-full accent-zinc-900 cursor-pointer"
                    />
                  </div>
                );
              })}
            </div>
          </div>

          {/* Schematic */}
          <CircuitSchematic expId={experiment.id} params={params} />
        </div>

        {/* Right Column: Oscilloscope, Live Meters, Data Logger */}
        <div className="lg:col-span-7 space-y-5">
          <OscilloscopeChart
            experiment={experiment}
            points={points}
            isLoading={isLoading}
          />

          {simError && (
            <div className="rounded-2xl bg-zinc-100 p-3.5 text-xs text-zinc-700">
              Simulation note: {simError}
            </div>
          )}

          {/* Live Multimeter / Scope Readouts */}
          <div className="rounded-3xl bg-white p-5 shadow-[0_1px_2px_rgba(0,0,0,0.04)]">
            <div className="flex items-center justify-between mb-3.5">
              <div className="flex items-center gap-2">
                <Gauge className="h-4 w-4 text-zinc-700" />
                <h3 className="text-sm font-semibold text-zinc-900">
                  Live Instrument Readout
                </h3>
              </div>
              <button
                type="button"
                onClick={handleRecordRow}
                className="inline-flex items-center gap-1.5 rounded-full bg-zinc-900 px-3.5 py-1.5 text-xs font-medium text-white hover:bg-zinc-800 transition-colors cursor-pointer"
              >
                <Plus className="h-3.5 w-3.5" />
                <span>Record Reading</span>
              </button>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {metricCards.map((m) => (
                <div key={m.label} className="rounded-2xl bg-zinc-50 p-3.5">
                  <div className="text-[11px] text-zinc-500 mb-1">{m.label}</div>
                  <div className="text-base font-semibold font-mono text-zinc-900">
                    {m.value}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Recorded Data Table */}
          {recordedRows.length > 0 && (
            <div className="rounded-3xl bg-white p-5 shadow-[0_1px_2px_rgba(0,0,0,0.04)]">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm font-semibold text-zinc-900">
                  Lab Observation Table
                </h3>
                <button
                  type="button"
                  onClick={() => setRecordedRows([])}
                  className="inline-flex items-center gap-1 rounded-full bg-zinc-100 px-3 py-1 text-xs text-zinc-600 hover:bg-zinc-200 transition-colors cursor-pointer"
                >
                  <Trash2 className="h-3 w-3" />
                  <span>Clear</span>
                </button>
              </div>
              <div className="overflow-x-auto rounded-2xl bg-zinc-50 p-2">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="text-zinc-500">
                      {Object.keys(recordedRows[0].values).map((col) => (
                        <th key={col} className="px-3 py-2 font-medium">
                          {col}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {recordedRows.map((row) => (
                      <tr key={row.id} className="text-zinc-800">
                        {Object.values(row.values).map((val, idx) => (
                          <td key={idx} className="px-3 py-2 font-mono">
                            {val}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Bottom Row: Step-by-Step Guided Practice & Sir's Lab Final Challenge */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        <div className="lg:col-span-7 rounded-3xl bg-white p-5 shadow-[0_1px_2px_rgba(0,0,0,0.04)]">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Activity className="h-4 w-4 text-zinc-700" />
              <h3 className="text-sm font-semibold text-zinc-900">
                Step-by-Step Guided Practice
              </h3>
            </div>
            <span className="text-xs text-zinc-500">
              {
                experiment.steps.filter(
                  (s) => completedStepIds.includes(s.id) || (s.verify ? s.verify(params, metrics) : false)
                ).length
              }{" "}
              of {experiment.steps.length} completed
            </span>
          </div>

          <div className="space-y-3">
            {experiment.steps.map((step, idx) => {
              const autoDone = step.verify ? step.verify(params, metrics) : false;
              const isDone = completedStepIds.includes(step.id) || autoDone;
              const hintOpen = !!openHints[step.id];

              return (
                <div
                  key={step.id}
                  className={`rounded-2xl p-4 transition-colors ${
                    isDone ? "bg-zinc-100/90" : "bg-zinc-50/80"
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <button
                      type="button"
                      onClick={() => onToggleStep(step.id)}
                      className="mt-0.5 text-zinc-700 hover:text-zinc-900 cursor-pointer shrink-0"
                      aria-label={`Mark step ${idx + 1} complete`}
                    >
                      {isDone ? (
                        <CheckCircle2 className="h-5 w-5 text-zinc-900" />
                      ) : (
                        <Circle className="h-5 w-5 text-zinc-400" />
                      )}
                    </button>

                    <div className="flex-1 space-y-1">
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-sm font-medium text-zinc-900">
                          {idx + 1}. {step.title}
                        </span>
                        <button
                          type="button"
                          onClick={() =>
                            setOpenHints((prev) => ({ ...prev, [step.id]: !prev[step.id] }))
                          }
                          className="text-[11px] font-medium text-zinc-500 hover:text-zinc-800 cursor-pointer"
                        >
                          {hintOpen ? "Hide Hint" : "Hint"}
                        </button>
                      </div>
                      <p className="text-xs text-zinc-600 leading-relaxed">
                        {step.instruction}
                      </p>
                      {hintOpen && (
                        <p className="text-xs text-zinc-500 bg-white rounded-xl px-3 py-2 mt-2">
                          {step.hint}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="lg:col-span-5 space-y-5">
          {/* Lab Final Challenge */}
          <div
            className={`rounded-3xl p-6 transition-colors ${
              isChallengeCurrentlyPassing || challengeSolved
                ? "bg-zinc-900 text-white"
                : "bg-white text-zinc-900 shadow-[0_1px_2px_rgba(0,0,0,0.04)]"
            }`}
          >
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <Target className="h-4 w-4" />
                <h3 className="text-sm font-semibold">{experiment.challenge.title}</h3>
              </div>
              <span
                className={`text-xs font-medium rounded-full px-3 py-1 ${
                  isChallengeCurrentlyPassing || challengeSolved
                    ? "bg-zinc-800 text-zinc-100"
                    : "bg-zinc-100 text-zinc-600"
                }`}
              >
                {isChallengeCurrentlyPassing
                  ? "Verified"
                  : challengeSolved
                  ? "Previously Passed"
                  : "In Progress"}
              </span>
            </div>

            <p
              className={`text-sm leading-relaxed mb-4 ${
                isChallengeCurrentlyPassing || challengeSolved ? "text-zinc-200" : "text-zinc-600"
              }`}
            >
              {experiment.challenge.prompt}
            </p>

            <div
              className={`rounded-2xl p-3.5 text-xs font-mono ${
                isChallengeCurrentlyPassing || challengeSolved
                  ? "bg-zinc-800 text-zinc-200"
                  : "bg-zinc-50 text-zinc-700"
              }`}
            >
              Target: {experiment.challenge.targetDescription}
            </div>
          </div>

          {/* Optional Netlist Inspector */}
          <div className="rounded-3xl bg-white p-5 shadow-[0_1px_2px_rgba(0,0,0,0.04)]">
            <button
              type="button"
              onClick={() => setShowNetlist((s) => !s)}
              className="w-full flex items-center justify-between text-xs font-medium text-zinc-700 cursor-pointer"
            >
              <span>Inspect Active SPICE Netlist</span>
              {showNetlist ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
            </button>
            {showNetlist && (
              <pre className="mt-3 rounded-2xl bg-zinc-50 p-3.5 text-[11px] font-mono text-zinc-700 overflow-x-auto leading-relaxed">
                {netlist}
              </pre>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
