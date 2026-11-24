import type { LucideIcon } from "lucide-react";

export type ExperimentId =
  | "exp-1"
  | "exp-2"
  | "exp-3"
  | "exp-4"
  | "exp-5"
  | "exp-6"
  | "exp-7";

export type PlotMode = "transient" | "iv-curve";

export interface GuidedStep {
  id: string;
  title: string;
  instruction: string;
  hint: string;
  checkLabel: string;
  /** Optional predicate to auto-verify against current params/metrics */
  verify?: (params: Record<string, number | string>, metrics: SimulationMetrics) => boolean;
}

export interface LabChallenge {
  title: string;
  prompt: string;
  targetDescription: string;
  verify: (params: Record<string, number | string>, metrics: SimulationMetrics) => boolean;
}

export interface ControlDef {
  key: string;
  label: string;
  unit?: string;
  type: "slider" | "select" | "toggle";
  min?: number;
  max?: number;
  step?: number;
  options?: { label: string; value: string | number }[];
  defaultValue: number | string;
}

export interface ExperimentMeta {
  id: ExperimentId;
  number: string;
  shortTitle: string;
  title: string;
  objective: string;
  apparatus: string[];
  formulas: { label: string; expression: string }[];
  plotMode: PlotMode;
  xLabel: string;
  yLabel: string;
  controls: ControlDef[];
  steps: GuidedStep[];
  challenge: LabChallenge;
  referenceNote: string;
}

export interface SimulationPoint {
  x: number;
  ch1: number;
  ch2?: number;
  currentMa?: number;
}

export interface SimulationMetrics {
  vinPp?: number;
  vmax?: number;
  vmin?: number;
  vpp?: number;
  vrms?: number;
  vavg?: number;
  rippleFactor?: number;
  phaseShiftDeg?: number;
  vd?: number;
  vr?: number;
  idMa?: number;
  vz?: number;
  izMa?: number;
  dcShift?: number;
  clipHigh?: number;
  clipLow?: number;
}

export interface SimulationOutput {
  points: SimulationPoint[];
  metrics: SimulationMetrics;
  netlist: string;
  errors: string[];
}

export interface VivaItem {
  id: string;
  experimentId: ExperimentId | "general";
  experimentLabel: string;
  question: string;
  answerBangla: string;
  keyTipBangla: string;
}

export interface RecordedRow {
  id: string;
  values: Record<string, string | number>;
}
