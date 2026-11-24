import type { ComponentDef, ComponentType, PinDef } from "./workbenchTypes";

export const BB_COLS = 18;
export const BB_PITCH = 16;
export const BB_ORIGIN_X = 28;
export const BB_TOP_RAIL_POS_Y = 18;
export const BB_TOP_RAIL_NEG_Y = 32;
export const BB_TOP_ROWS_Y = [54, 70, 86, 102, 118]; // a..e
export const BB_BOT_ROWS_Y = [150, 166, 182, 198, 214]; // f..j (32px gap across e->f = 2*16px)
export const BB_BOT_RAIL_POS_Y = 236;
export const BB_BOT_RAIL_NEG_Y = 250;

function buildBreadboardPins(): PinDef[] {
  const pins: PinDef[] = [];
  const topRows = ["a", "b", "c", "d", "e"];
  const botRows = ["f", "g", "h", "i", "j"];

  for (let c = 1; c <= BB_COLS; c++) {
    const x = BB_ORIGIN_X + (c - 1) * BB_PITCH;
    pins.push({ id: `tp_${c}`, label: `Top + (${c})`, x, y: BB_TOP_RAIL_POS_Y, kind: "hole" });
    pins.push({ id: `tn_${c}`, label: `Top - (${c})`, x, y: BB_TOP_RAIL_NEG_Y, kind: "hole" });

    topRows.forEach((r, idx) => {
      pins.push({ id: `${r}${c}`, label: `${r.toUpperCase()}${c}`, x, y: BB_TOP_ROWS_Y[idx], kind: "hole" });
    });

    botRows.forEach((r, idx) => {
      pins.push({ id: `${r}${c}`, label: `${r.toUpperCase()}${c}`, x, y: BB_BOT_ROWS_Y[idx], kind: "hole" });
    });

    pins.push({ id: `bp_${c}`, label: `Bot + (${c})`, x, y: BB_BOT_RAIL_POS_Y, kind: "hole" });
    pins.push({ id: `bn_${c}`, label: `Bot - (${c})`, x, y: BB_BOT_RAIL_NEG_Y, kind: "hole" });
  }
  return pins;
}

export const COMPONENT_CATALOG: Record<ComponentType, ComponentDef> = {
  breadboard: {
    type: "breadboard",
    name: "Breadboard",
    shortName: "Breadboard",
    category: "passive",
    width: BB_ORIGIN_X * 2 + (BB_COLS - 1) * BB_PITCH,
    height: 270,
    pins: buildBreadboardPins(),
    defaultProps: {},
    properties: [],
  },
  "dc-supply": {
    type: "dc-supply",
    name: "Power Supply",
    shortName: "Power Supply",
    category: "instruments",
    width: 156,
    height: 112,
    pins: [
      { id: "pos", label: "DC + (Red)", x: 74, y: 110, kind: "power" },
      { id: "neg", label: "DC - (Black)", x: 92, y: 110, kind: "power" },
    ],
    defaultProps: { voltage: 5 },
    properties: [
      { key: "voltage", label: "Voltage", unit: "V", type: "number", min: -30, max: 30, step: 0.1 },
    ],
  },
  "func-gen": {
    type: "func-gen",
    name: "Function Generator",
    shortName: "Function Generator",
    category: "instruments",
    width: 214,
    height: 126,
    pins: [
      { id: "pos", label: "OUT + (Red)", x: 100, y: 124, kind: "signal" },
      { id: "neg", label: "OUT - (Black)", x: 118, y: 124, kind: "signal" },
    ],
    defaultProps: { waveform: "sine", vpp: 10, freq: 1000 },
    properties: [
      {
        key: "waveform",
        label: "Waveform",
        type: "select",
        options: [
          { label: "Sine", value: "sine" },
          { label: "Square", value: "square" },
          { label: "Triangle", value: "triangle" },
        ],
      },
      { key: "vpp", label: "Amplitude", unit: "Vpp", type: "number", min: 0.5, max: 30, step: 0.2 },
      { key: "freq", label: "Frequency", unit: "Hz", type: "number", min: 50, max: 10000, step: 50 },
    ],
  },
  oscilloscope: {
    type: "oscilloscope",
    name: "Oscilloscope",
    shortName: "Oscilloscope",
    category: "instruments",
    width: 176,
    height: 178,
    pins: [
      { id: "ch1_neg", label: "CH1 GND (Black)", x: 52, y: 176, kind: "probe" },
      { id: "ch1_pos", label: "CH1 + (Red)", x: 70, y: 176, kind: "probe" },
      { id: "ch2_neg", label: "CH2 GND (Black)", x: 106, y: 176, kind: "probe" },
      { id: "ch2_pos", label: "CH2 + (Red)", x: 124, y: 176, kind: "probe" },
    ],
    defaultProps: {},
    properties: [],
  },
  multimeter: {
    type: "multimeter",
    name: "Multimeter",
    shortName: "Multimeter",
    category: "instruments",
    width: 152,
    height: 62,
    pins: [
      { id: "neg", label: "COM - (Black)", x: 66, y: 60, kind: "probe" },
      { id: "pos", label: "V/mA + (Red)", x: 84, y: 60, kind: "probe" },
    ],
    defaultProps: { mode: "voltage" },
    properties: [
      {
        key: "mode",
        label: "Mode",
        type: "select",
        options: [
          { label: "DC Voltage (V)", value: "voltage" },
          { label: "AC Voltage (Vrms)", value: "voltage_ac" },
          { label: "Current (mA)", value: "current" },
        ],
      },
    ],
  },
  ground: {
    type: "ground",
    name: "Ground (GND)",
    shortName: "Ground",
    category: "instruments",
    width: 44,
    height: 44,
    pins: [{ id: "gnd", label: "GND", x: 22, y: 4, kind: "power" }],
    defaultProps: {},
    properties: [],
  },
  resistor: {
    type: "resistor",
    name: "Resistor",
    shortName: "Resistor",
    category: "passive",
    width: 88,
    height: 32,
    pins: [
      { id: "a", label: "Terminal 1", x: 4, y: 16 },
      { id: "b", label: "Terminal 2", x: 84, y: 16 },
    ],
    defaultProps: { resistance: 1000 },
    properties: [
      { key: "resistance", label: "Resistance", unit: "Ohm", type: "number", min: 10, max: 1000000, step: 100 },
    ],
  },
  capacitor: {
    type: "capacitor",
    name: "Capacitor",
    shortName: "Capacitor",
    category: "passive",
    width: 72,
    height: 44,
    pins: [
      { id: "a", label: "Lead 1 (+)", x: 4, y: 22 },
      { id: "b", label: "Lead 2 (-)", x: 68, y: 22 },
    ],
    defaultProps: { capacitance: 10 },
    properties: [
      { key: "capacitance", label: "Capacitance", unit: "uF", type: "number", min: 0.01, max: 1000, step: 0.1 },
    ],
  },
  inductor: {
    type: "inductor",
    name: "Inductor",
    shortName: "Inductor",
    category: "passive",
    width: 88,
    height: 36,
    pins: [
      { id: "a", label: "Lead 1", x: 4, y: 18 },
      { id: "b", label: "Lead 2", x: 84, y: 18 },
    ],
    defaultProps: { inductance: 100 },
    properties: [
      { key: "inductance", label: "Inductance", unit: "mH", type: "number", min: 1, max: 1000, step: 10 },
    ],
  },
  diode: {
    type: "diode",
    name: "PN Diode",
    shortName: "Diode",
    category: "semiconductors",
    width: 88,
    height: 32,
    pins: [
      { id: "anode", label: "Anode (+)", x: 4, y: 16 },
      { id: "cathode", label: "Cathode (-)", x: 84, y: 16 },
    ],
    defaultProps: { material: "si" },
    properties: [
      {
        key: "material",
        label: "Semiconductor",
        type: "select",
        options: [
          { label: "Silicon (1N4007)", value: "si" },
          { label: "Germanium (1N34A)", value: "ge" },
        ],
      },
    ],
  },
  zener: {
    type: "zener",
    name: "Zener Diode",
    shortName: "Zener",
    category: "semiconductors",
    width: 88,
    height: 32,
    pins: [
      { id: "anode", label: "Anode (+)", x: 4, y: 16 },
      { id: "cathode", label: "Cathode (-)", x: 84, y: 16 },
    ],
    defaultProps: { vz: 8.9 },
    properties: [
      { key: "vz", label: "Breakdown Vz", unit: "V", type: "number", min: 2.7, max: 24, step: 0.1 },
    ],
  },
  led: {
    type: "led",
    name: "LED",
    shortName: "LED",
    category: "semiconductors",
    width: 72,
    height: 44,
    pins: [
      { id: "anode", label: "Anode (+)", x: 4, y: 22 },
      { id: "cathode", label: "Cathode (-)", x: 68, y: 22 },
    ],
    defaultProps: { vf: 2.0 },
    properties: [
      { key: "vf", label: "Forward Drop", unit: "V", type: "number", min: 1.6, max: 3.6, step: 0.1 },
    ],
  },
};

export const CATALOG_LIST: ComponentDef[] = [
  COMPONENT_CATALOG.breadboard,
  COMPONENT_CATALOG.multimeter,
  COMPONENT_CATALOG["dc-supply"],
  COMPONENT_CATALOG["func-gen"],
  COMPONENT_CATALOG.oscilloscope,
  COMPONENT_CATALOG.ground,
  COMPONENT_CATALOG.resistor,
  COMPONENT_CATALOG.capacitor,
  COMPONENT_CATALOG.inductor,
  COMPONENT_CATALOG.diode,
  COMPONENT_CATALOG.zener,
  COMPONENT_CATALOG.led,
];

export function getPinWorldPos(
  comp: { type: ComponentType; x: number; y: number; rotation: 0 | 90 | 180 | 270 },
  pinId: string
): { x: number; y: number } {
  const def = COMPONENT_CATALOG[comp.type];
  const pin = def.pins.find((p) => p.id === pinId);
  if (!pin) return { x: comp.x, y: comp.y };

  const cx = def.width / 2;
  const cy = def.height / 2;
  const dx = pin.x - cx;
  const dy = pin.y - cy;

  let rx = dx;
  let ry = dy;
  if (comp.rotation === 90) {
    rx = -dy;
    ry = dx;
  } else if (comp.rotation === 180) {
    rx = -dx;
    ry = -dy;
  } else if (comp.rotation === 270) {
    rx = dy;
    ry = -dx;
  }

  return {
    x: comp.x + cx + rx,
    y: comp.y + cy + ry,
  };
}
