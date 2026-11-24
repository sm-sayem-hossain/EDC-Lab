export type ComponentType =
  | "breadboard"
  | "dc-supply"
  | "func-gen"
  | "oscilloscope"
  | "multimeter"
  | "ground"
  | "resistor"
  | "capacitor"
  | "inductor"
  | "diode"
  | "zener"
  | "led";

export type ComponentCategory = "instruments" | "passive" | "semiconductors";

export interface PinDef {
  id: string;
  label: string;
  x: number;
  y: number;
  kind?: "power" | "signal" | "probe" | "hole";
}

export interface ComponentPropertyDef {
  key: string;
  label: string;
  unit?: string;
  type: "number" | "select";
  min?: number;
  max?: number;
  step?: number;
  options?: { label: string; value: string | number }[];
}

export interface ComponentDef {
  type: ComponentType;
  name: string;
  shortName: string;
  category: ComponentCategory;
  width: number;
  height: number;
  pins: PinDef[];
  defaultProps: Record<string, number | string>;
  properties: ComponentPropertyDef[];
}

export interface PlacedComponent {
  id: string;
  type: ComponentType;
  x: number;
  y: number;
  rotation: 0 | 90 | 180 | 270;
  props: Record<string, number | string>;
}

export interface WireEndpoint {
  compId: string;
  pinId: string;
}

export interface Wire {
  id: string;
  from: WireEndpoint;
  to: WireEndpoint;
  color: string;
}

export interface OscilloscopeData {
  compId: string;
  points: { t: number; ch1: number; ch2: number }[];
  ch1: { vmax: number; vmin: number; vpp: number; vavg: number; vrms: number };
  ch2: {
    vmax: number;
    vmin: number;
    vpp: number;
    vavg: number;
    vrms: number;
    rippleFactor: number;
  };
}

export interface MultimeterReading {
  compId: string;
  value: number;
  unit: string;
  mode: string;
}

export interface WorkbenchSimResult {
  running: boolean;
  oscilloscopes: Record<string, OscilloscopeData>;
  multimeters: Record<string, MultimeterReading>;
  ledCurrentsMa: Record<string, number>;
  nodeVoltages: Record<string, number>;
  netlist: string;
  errors: string[];
  warnings: string[];
}

export interface ExperimentStepState {
  id: string;
  title: string;
  instruction: string;
  observation: string;
  components: PlacedComponent[];
  wires: Wire[];
}

export interface ExperimentTemplate {
  id: string;
  number: string;
  shortTitle: string;
  title: string;
  objective: string;
  steps: ExperimentStepState[];
}
