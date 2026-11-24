import type { ExperimentTemplate, PlacedComponent } from "./workbenchTypes";

export const WIRE_COLORS = [
  { name: "Charcoal", value: "#27272a" },
  { name: "Slate", value: "#475569" },
  { name: "Olive", value: "#4d5d46" },
  { name: "Rust", value: "#8c4a3c" },
  { name: "Stone", value: "#78716c" },
];

// Breadboard placed consistently at (240, 212) so every experiment is built ON the breadboard!
// Column c (1..18) worldX = 240 + 28 + (c - 1)*16 = 268 + (c - 1)*16
// Top strip rows a..e: y = 266, 282, 298, 314, 330
// Bot strip rows f..j: y = 360, 376, 392, 408, 424
// Bottom rails: bp = 446, bn = 460
const BB_X = 240;
const BB_Y = 212;
const bbColX = (c: number) => BB_X + 28 + (c - 1) * 16;

const BASE_BB: PlacedComponent = {
  id: "bb1",
  type: "breadboard",
  x: BB_X,
  y: BB_Y,
  rotation: 0,
  props: {},
};

// Helper to place horizontal 2-pin component spanning from col `c` across the breadboard row `rowY`
function placeOnBB(
  id: string,
  type: PlacedComponent["type"],
  col: number,
  rowY: number,
  rotation: 0 | 90 | 180 | 270,
  props: Record<string, number | string>
): PlacedComponent {
  if (type === "resistor" && rotation === 0) {
    return { id, type, x: bbColX(col) - 4, y: rowY - 16, rotation, props };
  }
  if (type === "resistor" && rotation === 90) {
    // vertical: center at bbColX(col), spans 80px vertically (e.g. from row c=298 to row g=376)
    return { id, type, x: bbColX(col) - 44, y: rowY - 16, rotation, props };
  }
  if (type === "diode" || type === "zener") {
    if (rotation === 0 || rotation === 180) {
      return { id, type, x: bbColX(col) - 4, y: rowY - 16, rotation, props };
    }
    return { id, type, x: bbColX(col) - 42, y: rowY - 16, rotation, props };
  }
  if (type === "capacitor") {
    if (rotation === 0) {
      return { id, type, x: bbColX(col) - 4, y: rowY - 22, rotation, props };
    }
    return { id, type, x: bbColX(col) - 36, y: rowY - 22, rotation, props };
  }
  return { id, type, x: bbColX(col), y: rowY, rotation, props };
}

export const EXPERIMENT_TEMPLATES: ExperimentTemplate[] = [
  // =========================================================================
  // EXP 01: Introduction to Electronic Devices and Circuits Lab (RLC + Scope)
  // =========================================================================
  {
    id: "exp-1",
    number: "01",
    shortTitle: "Instruments & RC",
    title: "Introduction to Electronic Devices and Circuits Lab",
    objective:
      "Connect the Function Generator and Oscilloscope to a Breadboard and observe Sine, Square, and RC phase-shift responses.",
    steps: [
      {
        id: "exp1-s1",
        title: "Step 1: Pure Resistive Circuit on Breadboard",
        instruction:
          "Place a 1 kOhm resistor across breadboard columns 3 to 8 (row C) and a 10 kOhm load from column 8 to ground rail. Feed 10 Vpp 1 kHz Sine to column 3.",
        observation:
          "CH1 (Input) and CH2 (Output) are completely in phase (0 deg phase shift).",
        components: [
          BASE_BB,
          { id: "fg1", type: "func-gen", x: 16, y: 24, rotation: 0, props: { waveform: "sine", vpp: 10, freq: 1000 } },
          { id: "sc1", type: "oscilloscope", x: 616, y: 24, rotation: 0, props: {} },
          placeOnBB("r1", "resistor", 3, 298, 0, { resistance: 1000 }),
          placeOnBB("rl", "resistor", 8, 338, 90, { resistance: 10000 }),
        ],
        wires: [
          { id: "w1", from: { compId: "fg1", pinId: "pos" }, to: { compId: "bb1", pinId: "a3" }, color: "#8c4a3c" },
          { id: "w2", from: { compId: "fg1", pinId: "neg" }, to: { compId: "bb1", pinId: "bn_2" }, color: "#27272a" },
          { id: "w3", from: { compId: "bb1", pinId: "j8" }, to: { compId: "bb1", pinId: "bn_8" }, color: "#27272a" },
          { id: "w4", from: { compId: "sc1", pinId: "ch1_pos" }, to: { compId: "bb1", pinId: "b3" }, color: "#475569" },
          { id: "w5", from: { compId: "sc1", pinId: "ch1_neg" }, to: { compId: "bb1", pinId: "bn_14" }, color: "#78716c" },
          { id: "w6", from: { compId: "sc1", pinId: "ch2_pos" }, to: { compId: "bb1", pinId: "a8" }, color: "#4d5d46" },
          { id: "w7", from: { compId: "sc1", pinId: "ch2_neg" }, to: { compId: "bb1", pinId: "bn_16" }, color: "#78716c" },
        ],
      },
      {
        id: "exp1-s2",
        title: "Step 2: RC Phase-Shift Network (1 kHz Sine)",
        instruction:
          "Replace the vertical load resistor at column 8 with a 0.1 uF Capacitor to the ground rail.",
        observation:
          "CH2 lags CH1 due to capacitive reactance (Xc = 1 / 2*pi*f*C) and amplitude drops slightly.",
        components: [
          BASE_BB,
          { id: "fg1", type: "func-gen", x: 16, y: 24, rotation: 0, props: { waveform: "sine", vpp: 10, freq: 1000 } },
          { id: "sc1", type: "oscilloscope", x: 616, y: 24, rotation: 0, props: {} },
          placeOnBB("r1", "resistor", 3, 298, 0, { resistance: 1000 }),
          placeOnBB("c1", "capacitor", 8, 344, 90, { capacitance: 0.1 }),
        ],
        wires: [
          { id: "w1", from: { compId: "fg1", pinId: "pos" }, to: { compId: "bb1", pinId: "a3" }, color: "#8c4a3c" },
          { id: "w2", from: { compId: "fg1", pinId: "neg" }, to: { compId: "bb1", pinId: "bn_2" }, color: "#27272a" },
          { id: "w3", from: { compId: "bb1", pinId: "j8" }, to: { compId: "bb1", pinId: "bn_8" }, color: "#27272a" },
          { id: "w4", from: { compId: "sc1", pinId: "ch1_pos" }, to: { compId: "bb1", pinId: "b3" }, color: "#475569" },
          { id: "w5", from: { compId: "sc1", pinId: "ch1_neg" }, to: { compId: "bb1", pinId: "bn_14" }, color: "#78716c" },
          { id: "w6", from: { compId: "sc1", pinId: "ch2_pos" }, to: { compId: "bb1", pinId: "a8" }, color: "#4d5d46" },
          { id: "w7", from: { compId: "sc1", pinId: "ch2_neg" }, to: { compId: "bb1", pinId: "bn_16" }, color: "#78716c" },
        ],
      },
      {
        id: "exp1-s3",
        title: "Step 3: Square Wave RC Charging Curve",
        instruction:
          "Switch the Function Generator to Square Wave (10 Vpp, 1 kHz) on the same breadboard RC circuit.",
        observation:
          "CH2 displays exponential capacitor charging and discharging curves with time constant tau = R * C = 0.1 ms.",
        components: [
          BASE_BB,
          { id: "fg1", type: "func-gen", x: 16, y: 24, rotation: 0, props: { waveform: "square", vpp: 10, freq: 1000 } },
          { id: "sc1", type: "oscilloscope", x: 616, y: 24, rotation: 0, props: {} },
          placeOnBB("r1", "resistor", 3, 298, 0, { resistance: 1000 }),
          placeOnBB("c1", "capacitor", 8, 344, 90, { capacitance: 0.1 }),
        ],
        wires: [
          { id: "w1", from: { compId: "fg1", pinId: "pos" }, to: { compId: "bb1", pinId: "a3" }, color: "#8c4a3c" },
          { id: "w2", from: { compId: "fg1", pinId: "neg" }, to: { compId: "bb1", pinId: "bn_2" }, color: "#27272a" },
          { id: "w3", from: { compId: "bb1", pinId: "j8" }, to: { compId: "bb1", pinId: "bn_8" }, color: "#27272a" },
          { id: "w4", from: { compId: "sc1", pinId: "ch1_pos" }, to: { compId: "bb1", pinId: "b3" }, color: "#475569" },
          { id: "w5", from: { compId: "sc1", pinId: "ch1_neg" }, to: { compId: "bb1", pinId: "bn_14" }, color: "#78716c" },
          { id: "w6", from: { compId: "sc1", pinId: "ch2_pos" }, to: { compId: "bb1", pinId: "a8" }, color: "#4d5d46" },
          { id: "w7", from: { compId: "sc1", pinId: "ch2_neg" }, to: { compId: "bb1", pinId: "bn_16" }, color: "#78716c" },
        ],
      },
    ],
  },

  // =========================================================================
  // EXP 02: I-V Characteristics of PN Junction Diode (Breadboard + Meters)
  // =========================================================================
  {
    id: "exp-2",
    number: "02",
    shortTitle: "Diode I-V Curve",
    title: "I-V Characteristics of PN Junction Diode",
    objective:
      "Build the Silicon 1N4007 forward and reverse bias test circuit on a breadboard and record Vd and Id using Multimeters.",
    steps: [
      {
        id: "exp2-s1",
        title: "Step 1: Forward Bias Below Knee (0.5 V)",
        instruction:
          "Wire DC Power Supply (0.5 V) -> Ammeter -> 1 kOhm Resistor (col 3-8) -> 1N4007 Diode (col 8-13) -> Ground rail. Place Voltmeter across Diode.",
        observation:
          "At Vdc = 0.5 V, diode voltage Vd is ~0.44 V and current Id is tiny (< 0.1 mA) because it is below the Silicon knee.",
        components: [
          BASE_BB,
          { id: "dc1", type: "dc-supply", x: 16, y: 40, rotation: 0, props: { voltage: 0.5 } },
          { id: "mm_i", type: "multimeter", x: 240, y: 48, rotation: 0, props: { mode: "current" } },
          { id: "mm_v", type: "multimeter", x: 432, y: 48, rotation: 0, props: { mode: "voltage" } },
          placeOnBB("r1", "resistor", 3, 298, 0, { resistance: 1000 }),
          placeOnBB("d1", "diode", 8, 298, 0, { material: "si" }),
        ],
        wires: [
          { id: "w1", from: { compId: "dc1", pinId: "pos" }, to: { compId: "mm_i", pinId: "pos" }, color: "#8c4a3c" },
          { id: "w2", from: { compId: "mm_i", pinId: "neg" }, to: { compId: "bb1", pinId: "a3" }, color: "#8c4a3c" },
          { id: "w3", from: { compId: "bb1", pinId: "e13" }, to: { compId: "bb1", pinId: "bn_13" }, color: "#27272a" },
          { id: "w4", from: { compId: "dc1", pinId: "neg" }, to: { compId: "bb1", pinId: "bn_2" }, color: "#27272a" },
          { id: "w5", from: { compId: "mm_v", pinId: "pos" }, to: { compId: "bb1", pinId: "a8" }, color: "#475569" },
          { id: "w6", from: { compId: "mm_v", pinId: "neg" }, to: { compId: "bb1", pinId: "a13" }, color: "#78716c" },
        ],
      },
      {
        id: "exp2-s2",
        title: "Step 2: Forward Bias Conduction (3.0 V)",
        instruction:
          "Raise DC Power Supply to 3.0 V on the same breadboard circuit and check both Multimeter displays.",
        observation:
          "Diode overcomes the barrier: Vd stays near ~0.60 V while Id jumps to ~2.4 mA (matching your lab report table!).",
        components: [
          BASE_BB,
          { id: "dc1", type: "dc-supply", x: 16, y: 40, rotation: 0, props: { voltage: 3.0 } },
          { id: "mm_i", type: "multimeter", x: 240, y: 48, rotation: 0, props: { mode: "current" } },
          { id: "mm_v", type: "multimeter", x: 432, y: 48, rotation: 0, props: { mode: "voltage" } },
          placeOnBB("r1", "resistor", 3, 298, 0, { resistance: 1000 }),
          placeOnBB("d1", "diode", 8, 298, 0, { material: "si" }),
        ],
        wires: [
          { id: "w1", from: { compId: "dc1", pinId: "pos" }, to: { compId: "mm_i", pinId: "pos" }, color: "#8c4a3c" },
          { id: "w2", from: { compId: "mm_i", pinId: "neg" }, to: { compId: "bb1", pinId: "a3" }, color: "#8c4a3c" },
          { id: "w3", from: { compId: "bb1", pinId: "e13" }, to: { compId: "bb1", pinId: "bn_13" }, color: "#27272a" },
          { id: "w4", from: { compId: "dc1", pinId: "neg" }, to: { compId: "bb1", pinId: "bn_2" }, color: "#27272a" },
          { id: "w5", from: { compId: "mm_v", pinId: "pos" }, to: { compId: "bb1", pinId: "a8" }, color: "#475569" },
          { id: "w6", from: { compId: "mm_v", pinId: "neg" }, to: { compId: "bb1", pinId: "a13" }, color: "#78716c" },
        ],
      },
      {
        id: "exp2-s3",
        title: "Step 3: Reverse Bias Blocking (5.0 V)",
        instruction:
          "Flip the 1N4007 Diode 180 degrees on the breadboard (Cathode on column 8, Anode on column 13) and set DC Supply to 5.0 V.",
        observation:
          "Diode blocks current: Ammeter reads 0.00 mA and the full 5.00 V supply voltage drops across the diode.",
        components: [
          BASE_BB,
          { id: "dc1", type: "dc-supply", x: 16, y: 40, rotation: 0, props: { voltage: 5.0 } },
          { id: "mm_i", type: "multimeter", x: 240, y: 48, rotation: 0, props: { mode: "current" } },
          { id: "mm_v", type: "multimeter", x: 432, y: 48, rotation: 0, props: { mode: "voltage" } },
          placeOnBB("r1", "resistor", 3, 298, 0, { resistance: 1000 }),
          placeOnBB("d1", "diode", 8, 298, 180, { material: "si" }),
        ],
        wires: [
          { id: "w1", from: { compId: "dc1", pinId: "pos" }, to: { compId: "mm_i", pinId: "pos" }, color: "#8c4a3c" },
          { id: "w2", from: { compId: "mm_i", pinId: "neg" }, to: { compId: "bb1", pinId: "a3" }, color: "#8c4a3c" },
          { id: "w3", from: { compId: "bb1", pinId: "e13" }, to: { compId: "bb1", pinId: "bn_13" }, color: "#27272a" },
          { id: "w4", from: { compId: "dc1", pinId: "neg" }, to: { compId: "bb1", pinId: "bn_2" }, color: "#27272a" },
          { id: "w5", from: { compId: "mm_v", pinId: "pos" }, to: { compId: "bb1", pinId: "a8" }, color: "#475569" },
          { id: "w6", from: { compId: "mm_v", pinId: "neg" }, to: { compId: "bb1", pinId: "a13" }, color: "#78716c" },
        ],
      },
    ],
  },

  // =========================================================================
  // EXP 03: Study of Zener Diode Applications (Voltage Regulator on Breadboard)
  // =========================================================================
  {
    id: "exp-3",
    number: "03",
    shortTitle: "Zener Regulator",
    title: "Study of Zener Diode Applications",
    objective:
      "Wire a 5.1 V Zener diode in reverse bias on the breadboard with a 470 Ohm series resistor and 10 kOhm load to verify voltage regulation.",
    steps: [
      {
        id: "exp3-s1",
        title: "Step 1: Below Breakdown (Vin = 3.0 V)",
        instruction:
          "Place 470 Ohm resistor (col 3-8), reverse-biased 5.1 V Zener across col 8 to ground strip, and 10 kOhm load at col 11. Set DC Supply to 3.0 V.",
        observation:
          "Since Vin (3.0 V) < Vz (5.1 V), the Zener does not conduct and Vout simply follows Vin (~2.87 V).",
        components: [
          BASE_BB,
          { id: "dc1", type: "dc-supply", x: 16, y: 40, rotation: 0, props: { voltage: 3.0 } },
          { id: "mm_i", type: "multimeter", x: 240, y: 48, rotation: 0, props: { mode: "current" } },
          { id: "mm_v", type: "multimeter", x: 432, y: 48, rotation: 0, props: { mode: "voltage" } },
          placeOnBB("r1", "resistor", 3, 298, 0, { resistance: 470 }),
          placeOnBB("z1", "zener", 8, 338, 270, { vz: 5.1 }),
          placeOnBB("rl", "resistor", 11, 338, 90, { resistance: 10000 }),
        ],
        wires: [
          { id: "w1", from: { compId: "dc1", pinId: "pos" }, to: { compId: "mm_i", pinId: "pos" }, color: "#8c4a3c" },
          { id: "w2", from: { compId: "mm_i", pinId: "neg" }, to: { compId: "bb1", pinId: "a3" }, color: "#8c4a3c" },
          { id: "w3", from: { compId: "bb1", pinId: "b8" }, to: { compId: "bb1", pinId: "b11" }, color: "#4d5d46" },
          { id: "w4", from: { compId: "bb1", pinId: "j8" }, to: { compId: "bb1", pinId: "bn_8" }, color: "#27272a" },
          { id: "w5", from: { compId: "bb1", pinId: "j11" }, to: { compId: "bb1", pinId: "bn_11" }, color: "#27272a" },
          { id: "w6", from: { compId: "dc1", pinId: "neg" }, to: { compId: "bb1", pinId: "bn_2" }, color: "#27272a" },
          { id: "w7", from: { compId: "mm_v", pinId: "pos" }, to: { compId: "bb1", pinId: "a11" }, color: "#475569" },
          { id: "w8", from: { compId: "mm_v", pinId: "neg" }, to: { compId: "bb1", pinId: "bn_14" }, color: "#78716c" },
        ],
      },
      {
        id: "exp3-s2",
        title: "Step 2: Active Regulation (Vin = 10.0 V)",
        instruction:
          "Increase DC Power Supply to 10.0 V. The Zener enters reverse breakdown and stabilizes the load node.",
        observation:
          "Voltmeter locks right around ~5.1 V while excess voltage drops across the 470 Ohm series resistor (~10.4 mA).",
        components: [
          BASE_BB,
          { id: "dc1", type: "dc-supply", x: 16, y: 40, rotation: 0, props: { voltage: 10.0 } },
          { id: "mm_i", type: "multimeter", x: 240, y: 48, rotation: 0, props: { mode: "current" } },
          { id: "mm_v", type: "multimeter", x: 432, y: 48, rotation: 0, props: { mode: "voltage" } },
          placeOnBB("r1", "resistor", 3, 298, 0, { resistance: 470 }),
          placeOnBB("z1", "zener", 8, 338, 270, { vz: 5.1 }),
          placeOnBB("rl", "resistor", 11, 338, 90, { resistance: 10000 }),
        ],
        wires: [
          { id: "w1", from: { compId: "dc1", pinId: "pos" }, to: { compId: "mm_i", pinId: "pos" }, color: "#8c4a3c" },
          { id: "w2", from: { compId: "mm_i", pinId: "neg" }, to: { compId: "bb1", pinId: "a3" }, color: "#8c4a3c" },
          { id: "w3", from: { compId: "bb1", pinId: "b8" }, to: { compId: "bb1", pinId: "b11" }, color: "#4d5d46" },
          { id: "w4", from: { compId: "bb1", pinId: "j8" }, to: { compId: "bb1", pinId: "bn_8" }, color: "#27272a" },
          { id: "w5", from: { compId: "bb1", pinId: "j11" }, to: { compId: "bb1", pinId: "bn_11" }, color: "#27272a" },
          { id: "w6", from: { compId: "dc1", pinId: "neg" }, to: { compId: "bb1", pinId: "bn_2" }, color: "#27272a" },
          { id: "w7", from: { compId: "mm_v", pinId: "pos" }, to: { compId: "bb1", pinId: "a11" }, color: "#475569" },
          { id: "w8", from: { compId: "mm_v", pinId: "neg" }, to: { compId: "bb1", pinId: "bn_14" }, color: "#78716c" },
        ],
      },
      {
        id: "exp3-s3",
        title: "Step 3: High Input Regulation (Vin = 15.0 V)",
        instruction:
          "Raise DC Power Supply to 15.0 V to confirm line regulation under higher supply voltage.",
        observation:
          "Even with a +5 V jump in Vin, the regulated output holds steady near ~5.1 V while Zener current absorbs the change.",
        components: [
          BASE_BB,
          { id: "dc1", type: "dc-supply", x: 16, y: 40, rotation: 0, props: { voltage: 15.0 } },
          { id: "mm_i", type: "multimeter", x: 240, y: 48, rotation: 0, props: { mode: "current" } },
          { id: "mm_v", type: "multimeter", x: 432, y: 48, rotation: 0, props: { mode: "voltage" } },
          placeOnBB("r1", "resistor", 3, 298, 0, { resistance: 470 }),
          placeOnBB("z1", "zener", 8, 338, 270, { vz: 5.1 }),
          placeOnBB("rl", "resistor", 11, 338, 90, { resistance: 10000 }),
        ],
        wires: [
          { id: "w1", from: { compId: "dc1", pinId: "pos" }, to: { compId: "mm_i", pinId: "pos" }, color: "#8c4a3c" },
          { id: "w2", from: { compId: "mm_i", pinId: "neg" }, to: { compId: "bb1", pinId: "a3" }, color: "#8c4a3c" },
          { id: "w3", from: { compId: "bb1", pinId: "b8" }, to: { compId: "bb1", pinId: "b11" }, color: "#4d5d46" },
          { id: "w4", from: { compId: "bb1", pinId: "j8" }, to: { compId: "bb1", pinId: "bn_8" }, color: "#27272a" },
          { id: "w5", from: { compId: "bb1", pinId: "j11" }, to: { compId: "bb1", pinId: "bn_11" }, color: "#27272a" },
          { id: "w6", from: { compId: "dc1", pinId: "neg" }, to: { compId: "bb1", pinId: "bn_2" }, color: "#27272a" },
          { id: "w7", from: { compId: "mm_v", pinId: "pos" }, to: { compId: "bb1", pinId: "a11" }, color: "#475569" },
          { id: "w8", from: { compId: "mm_v", pinId: "neg" }, to: { compId: "bb1", pinId: "bn_14" }, color: "#78716c" },
        ],
      },
    ],
  },

  // =========================================================================
  // EXP 04: Half-Wave Diode Rectifier on Breadboard
  // =========================================================================
  {
    id: "exp-4",
    number: "04",
    shortTitle: "Half-Wave Rectifier",
    title: "Study of a Half-Wave Diode Rectifier Circuit",
    objective:
      "Wire a 1N4007 half-wave rectifier on the breadboard and observe ripple reduction from Unfiltered -> 1 uF -> 10 uF -> 47 uF.",
    steps: [
      {
        id: "exp4-s1",
        title: "Step 1: Unfiltered Half-Wave Output",
        instruction:
          "Place 1N4007 diode across col 3-8 and 1 kOhm load resistor from col 8 to ground rail. Feed 10 Vpp 1 kHz Sine to col 3.",
        observation:
          "Only positive half-cycles pass (Vmax ~4.3 V, Vmin = 0 V, Ripple Factor ~1.21).",
        components: [
          BASE_BB,
          { id: "fg1", type: "func-gen", x: 16, y: 24, rotation: 0, props: { waveform: "sine", vpp: 10, freq: 1000 } },
          { id: "sc1", type: "oscilloscope", x: 616, y: 24, rotation: 0, props: {} },
          placeOnBB("d1", "diode", 3, 298, 0, { material: "si" }),
          placeOnBB("rl", "resistor", 11, 338, 90, { resistance: 1000 }),
        ],
        wires: [
          { id: "w1", from: { compId: "fg1", pinId: "pos" }, to: { compId: "bb1", pinId: "a3" }, color: "#8c4a3c" },
          { id: "w2", from: { compId: "fg1", pinId: "neg" }, to: { compId: "bb1", pinId: "bn_2" }, color: "#27272a" },
          { id: "w3", from: { compId: "bb1", pinId: "b8" }, to: { compId: "bb1", pinId: "b11" }, color: "#4d5d46" },
          { id: "w4", from: { compId: "bb1", pinId: "j11" }, to: { compId: "bb1", pinId: "bn_11" }, color: "#27272a" },
          { id: "w5", from: { compId: "sc1", pinId: "ch1_pos" }, to: { compId: "bb1", pinId: "b3" }, color: "#475569" },
          { id: "w6", from: { compId: "sc1", pinId: "ch1_neg" }, to: { compId: "bb1", pinId: "bn_14" }, color: "#78716c" },
          { id: "w7", from: { compId: "sc1", pinId: "ch2_pos" }, to: { compId: "bb1", pinId: "a11" }, color: "#4d5d46" },
          { id: "w8", from: { compId: "sc1", pinId: "ch2_neg" }, to: { compId: "bb1", pinId: "bn_16" }, color: "#78716c" },
        ],
      },
      {
        id: "exp4-s2",
        title: "Step 2: Add 1 uF Filter Capacitor",
        instruction:
          "Insert a 1 uF filter capacitor on column 8 in parallel with the 1 kOhm load resistor.",
        observation:
          "A sawtooth ripple waveform appears on CH2; Vmin rises above 0 V and Ripple Factor drops sharply.",
        components: [
          BASE_BB,
          { id: "fg1", type: "func-gen", x: 16, y: 24, rotation: 0, props: { waveform: "sine", vpp: 10, freq: 1000 } },
          { id: "sc1", type: "oscilloscope", x: 616, y: 24, rotation: 0, props: {} },
          placeOnBB("d1", "diode", 3, 298, 0, { material: "si" }),
          placeOnBB("c1", "capacitor", 8, 344, 90, { capacitance: 1 }),
          placeOnBB("rl", "resistor", 11, 338, 90, { resistance: 1000 }),
        ],
        wires: [
          { id: "w1", from: { compId: "fg1", pinId: "pos" }, to: { compId: "bb1", pinId: "a3" }, color: "#8c4a3c" },
          { id: "w2", from: { compId: "fg1", pinId: "neg" }, to: { compId: "bb1", pinId: "bn_2" }, color: "#27272a" },
          { id: "w3", from: { compId: "bb1", pinId: "b8" }, to: { compId: "bb1", pinId: "b11" }, color: "#4d5d46" },
          { id: "w4", from: { compId: "bb1", pinId: "j8" }, to: { compId: "bb1", pinId: "bn_8" }, color: "#27272a" },
          { id: "w5", from: { compId: "bb1", pinId: "j11" }, to: { compId: "bb1", pinId: "bn_11" }, color: "#27272a" },
          { id: "w6", from: { compId: "sc1", pinId: "ch1_pos" }, to: { compId: "bb1", pinId: "b3" }, color: "#475569" },
          { id: "w7", from: { compId: "sc1", pinId: "ch1_neg" }, to: { compId: "bb1", pinId: "bn_14" }, color: "#78716c" },
          { id: "w8", from: { compId: "sc1", pinId: "ch2_pos" }, to: { compId: "bb1", pinId: "a11" }, color: "#4d5d46" },
          { id: "w9", from: { compId: "sc1", pinId: "ch2_neg" }, to: { compId: "bb1", pinId: "bn_16" }, color: "#78716c" },
        ],
      },
      {
        id: "exp4-s3",
        title: "Step 3: Smooth DC with 10 uF Capacitor",
        instruction:
          "Swap the breadboard filter capacitor to 10 uF and check Vavg and Ripple Factor on the Oscilloscope.",
        observation:
          "CH2 becomes nearly flat DC (~4.1 V average) with very small ripple (< 0.04).",
        components: [
          BASE_BB,
          { id: "fg1", type: "func-gen", x: 16, y: 24, rotation: 0, props: { waveform: "sine", vpp: 10, freq: 1000 } },
          { id: "sc1", type: "oscilloscope", x: 616, y: 24, rotation: 0, props: {} },
          placeOnBB("d1", "diode", 3, 298, 0, { material: "si" }),
          placeOnBB("c1", "capacitor", 8, 344, 90, { capacitance: 10 }),
          placeOnBB("rl", "resistor", 11, 338, 90, { resistance: 1000 }),
        ],
        wires: [
          { id: "w1", from: { compId: "fg1", pinId: "pos" }, to: { compId: "bb1", pinId: "a3" }, color: "#8c4a3c" },
          { id: "w2", from: { compId: "fg1", pinId: "neg" }, to: { compId: "bb1", pinId: "bn_2" }, color: "#27272a" },
          { id: "w3", from: { compId: "bb1", pinId: "b8" }, to: { compId: "bb1", pinId: "b11" }, color: "#4d5d46" },
          { id: "w4", from: { compId: "bb1", pinId: "j8" }, to: { compId: "bb1", pinId: "bn_8" }, color: "#27272a" },
          { id: "w5", from: { compId: "bb1", pinId: "j11" }, to: { compId: "bb1", pinId: "bn_11" }, color: "#27272a" },
          { id: "w6", from: { compId: "sc1", pinId: "ch1_pos" }, to: { compId: "bb1", pinId: "b3" }, color: "#475569" },
          { id: "w7", from: { compId: "sc1", pinId: "ch1_neg" }, to: { compId: "bb1", pinId: "bn_14" }, color: "#78716c" },
          { id: "w8", from: { compId: "sc1", pinId: "ch2_pos" }, to: { compId: "bb1", pinId: "a11" }, color: "#4d5d46" },
          { id: "w9", from: { compId: "sc1", pinId: "ch2_neg" }, to: { compId: "bb1", pinId: "bn_16" }, color: "#78716c" },
        ],
      },
    ],
  },

  // =========================================================================
  // EXP 05: Full-Wave Bridge Diode Rectifier on Breadboard
  // =========================================================================
  {
    id: "exp-5",
    number: "05",
    shortTitle: "Full-Wave Bridge",
    title: "Study of Full-Wave Bridge Diode Rectifier Circuit",
    objective:
      "Build a 4-diode 1N4007 Bridge Rectifier on the breadboard and compare Unfiltered vs 0.47 uF vs 10 uF filtering.",
    steps: [
      {
        id: "exp5-s1",
        title: "Step 1: Unfiltered 4-Diode Bridge on Breadboard",
        instruction:
          "Wire D1 (col 3->8, row B), D2 (col 4->9, row D), D3 (col 8->3, row G), D4 (col 9->4, row I) on the breadboard. Feed AC+ to col 3, AC- to col 4, and connect DC+ (col 8/9) across 1 kOhm load to GND.",
        observation:
          "Both half cycles are rectified (double frequency 2 kHz pulses, Vmax ~3.6 V due to 2 diode drops, ripple ~0.48).",
        components: [
          BASE_BB,
          { id: "fg1", type: "func-gen", x: 16, y: 24, rotation: 0, props: { waveform: "sine", vpp: 10, freq: 1000 } },
          { id: "sc1", type: "oscilloscope", x: 616, y: 24, rotation: 0, props: {} },
          placeOnBB("d1", "diode", 3, 282, 0, { material: "si" }),
          placeOnBB("d2", "diode", 4, 314, 0, { material: "si" }),
          placeOnBB("d3", "diode", 3, 376, 180, { material: "si" }),
          placeOnBB("d4", "diode", 4, 408, 180, { material: "si" }),
          placeOnBB("rl", "resistor", 14, 338, 90, { resistance: 1000 }),
        ],
        wires: [
          // AC+ to col 3 (top & bottom)
          { id: "w1", from: { compId: "fg1", pinId: "pos" }, to: { compId: "bb1", pinId: "a3" }, color: "#8c4a3c" },
          { id: "w2", from: { compId: "bb1", pinId: "e3" }, to: { compId: "bb1", pinId: "f3" }, color: "#8c4a3c" },
          // AC- to col 4 (top & bottom)
          { id: "w3", from: { compId: "fg1", pinId: "neg" }, to: { compId: "bb1", pinId: "a4" }, color: "#475569" },
          { id: "w4", from: { compId: "bb1", pinId: "e4" }, to: { compId: "bb1", pinId: "f4" }, color: "#475569" },
          // DC+ joins D1 cathode (col 8) & D2 cathode (col 9) -> Load col 14
          { id: "w5", from: { compId: "bb1", pinId: "a8" }, to: { compId: "bb1", pinId: "a9" }, color: "#4d5d46" },
          { id: "w6", from: { compId: "bb1", pinId: "b9" }, to: { compId: "bb1", pinId: "b14" }, color: "#4d5d46" },
          // DC- joins D3 anode (f8/g8) & D4 anode (i9) -> Ground rail
          { id: "w7", from: { compId: "bb1", pinId: "j8" }, to: { compId: "bb1", pinId: "bn_8" }, color: "#27272a" },
          { id: "w8", from: { compId: "bb1", pinId: "j9" }, to: { compId: "bb1", pinId: "bn_9" }, color: "#27272a" },
          { id: "w9", from: { compId: "bb1", pinId: "j14" }, to: { compId: "bb1", pinId: "bn_14" }, color: "#27272a" },
          // Scope CH1 across AC input, CH2 across load
          { id: "w10", from: { compId: "sc1", pinId: "ch1_pos" }, to: { compId: "bb1", pinId: "c3" }, color: "#78716c" },
          { id: "w11", from: { compId: "sc1", pinId: "ch1_neg" }, to: { compId: "bb1", pinId: "c4" }, color: "#78716c" },
          { id: "w12", from: { compId: "sc1", pinId: "ch2_pos" }, to: { compId: "bb1", pinId: "a14" }, color: "#27272a" },
          { id: "w13", from: { compId: "sc1", pinId: "ch2_neg" }, to: { compId: "bb1", pinId: "bn_16" }, color: "#27272a" },
        ],
      },
      {
        id: "exp5-s2",
        title: "Step 2: Bridge with 10 uF Filter Capacitor",
        instruction:
          "Insert a 10 uF capacitor at column 12 in parallel with the 1 kOhm load resistor on the breadboard.",
        observation:
          "Because the bridge recharges twice per cycle, 10 uF yields ultra-smooth DC with ripple factor < 0.02.",
        components: [
          BASE_BB,
          { id: "fg1", type: "func-gen", x: 16, y: 24, rotation: 0, props: { waveform: "sine", vpp: 10, freq: 1000 } },
          { id: "sc1", type: "oscilloscope", x: 616, y: 24, rotation: 0, props: {} },
          placeOnBB("d1", "diode", 3, 282, 0, { material: "si" }),
          placeOnBB("d2", "diode", 4, 314, 0, { material: "si" }),
          placeOnBB("d3", "diode", 3, 376, 180, { material: "si" }),
          placeOnBB("d4", "diode", 4, 408, 180, { material: "si" }),
          placeOnBB("c1", "capacitor", 12, 344, 90, { capacitance: 10 }),
          placeOnBB("rl", "resistor", 14, 338, 90, { resistance: 1000 }),
        ],
        wires: [
          { id: "w1", from: { compId: "fg1", pinId: "pos" }, to: { compId: "bb1", pinId: "a3" }, color: "#8c4a3c" },
          { id: "w2", from: { compId: "bb1", pinId: "e3" }, to: { compId: "bb1", pinId: "f3" }, color: "#8c4a3c" },
          { id: "w3", from: { compId: "fg1", pinId: "neg" }, to: { compId: "bb1", pinId: "a4" }, color: "#475569" },
          { id: "w4", from: { compId: "bb1", pinId: "e4" }, to: { compId: "bb1", pinId: "f4" }, color: "#475569" },
          { id: "w5", from: { compId: "bb1", pinId: "a8" }, to: { compId: "bb1", pinId: "a9" }, color: "#4d5d46" },
          { id: "w6", from: { compId: "bb1", pinId: "b9" }, to: { compId: "bb1", pinId: "b12" }, color: "#4d5d46" },
          { id: "w7", from: { compId: "bb1", pinId: "b12" }, to: { compId: "bb1", pinId: "b14" }, color: "#4d5d46" },
          { id: "w8", from: { compId: "bb1", pinId: "j8" }, to: { compId: "bb1", pinId: "bn_8" }, color: "#27272a" },
          { id: "w9", from: { compId: "bb1", pinId: "j9" }, to: { compId: "bb1", pinId: "bn_9" }, color: "#27272a" },
          { id: "w10", from: { compId: "bb1", pinId: "j12" }, to: { compId: "bb1", pinId: "bn_12" }, color: "#27272a" },
          { id: "w11", from: { compId: "bb1", pinId: "j14" }, to: { compId: "bb1", pinId: "bn_14" }, color: "#27272a" },
          { id: "w12", from: { compId: "sc1", pinId: "ch1_pos" }, to: { compId: "bb1", pinId: "c3" }, color: "#78716c" },
          { id: "w13", from: { compId: "sc1", pinId: "ch1_neg" }, to: { compId: "bb1", pinId: "c4" }, color: "#78716c" },
          { id: "w14", from: { compId: "sc1", pinId: "ch2_pos" }, to: { compId: "bb1", pinId: "a14" }, color: "#27272a" },
          { id: "w15", from: { compId: "sc1", pinId: "ch2_neg" }, to: { compId: "bb1", pinId: "bn_16" }, color: "#27272a" },
        ],
      },
    ],
  },

  // =========================================================================
  // EXP 06: Diode Clipper Circuits on Breadboard
  // =========================================================================
  {
    id: "exp-6",
    number: "06",
    shortTitle: "Diode Clipper",
    title: "Study of Diode Clipper Circuits",
    objective:
      "Wire biased positive and negative diode clippers on the breadboard using a 19.6 Vpp 1 kHz Sine input and a 2.3 V DC bias supply.",
    steps: [
      {
        id: "exp6-s1",
        title: "Step 1: Biased Positive Clipper (+3.0 V Clip)",
        instruction:
          "Place 1 kOhm resistor (col 3-8) and vertical 1N4007 diode (col 8, Anode up, Cathode to col 8 bottom). Connect DC Supply (+2.3 V) to bottom of diode.",
        observation:
          "Positive peak clips flat near +3.0 V (2.3 V + 0.7 V) while negative half passes down to -9.8 V.",
        components: [
          BASE_BB,
          { id: "fg1", type: "func-gen", x: 16, y: 24, rotation: 0, props: { waveform: "sine", vpp: 19.6, freq: 1000 } },
          { id: "dc1", type: "dc-supply", x: 248, y: 38, rotation: 0, props: { voltage: 2.3 } },
          { id: "sc1", type: "oscilloscope", x: 616, y: 24, rotation: 0, props: {} },
          placeOnBB("r1", "resistor", 3, 298, 0, { resistance: 1000 }),
          placeOnBB("d1", "diode", 8, 338, 90, { material: "si" }),
        ],
        wires: [
          { id: "w1", from: { compId: "fg1", pinId: "pos" }, to: { compId: "bb1", pinId: "a3" }, color: "#8c4a3c" },
          { id: "w2", from: { compId: "fg1", pinId: "neg" }, to: { compId: "bb1", pinId: "bn_2" }, color: "#27272a" },
          { id: "w3", from: { compId: "dc1", pinId: "pos" }, to: { compId: "bb1", pinId: "j8" }, color: "#8c4a3c" },
          { id: "w4", from: { compId: "dc1", pinId: "neg" }, to: { compId: "bb1", pinId: "bn_6" }, color: "#27272a" },
          { id: "w5", from: { compId: "sc1", pinId: "ch1_pos" }, to: { compId: "bb1", pinId: "b3" }, color: "#475569" },
          { id: "w6", from: { compId: "sc1", pinId: "ch1_neg" }, to: { compId: "bb1", pinId: "bn_14" }, color: "#78716c" },
          { id: "w7", from: { compId: "sc1", pinId: "ch2_pos" }, to: { compId: "bb1", pinId: "a8" }, color: "#4d5d46" },
          { id: "w8", from: { compId: "sc1", pinId: "ch2_neg" }, to: { compId: "bb1", pinId: "bn_16" }, color: "#78716c" },
        ],
      },
      {
        id: "exp6-s2",
        title: "Step 2: Biased Negative Clipper (-3.2 V Clip)",
        instruction:
          "Flip the Diode 180 deg (Cathode up at col 8) and reverse the DC Supply terminals so -2.5 V biases the diode anode.",
        observation:
          "Negative peak clips flat near -3.2 V while the positive peak passes cleanly up to +9.8 V.",
        components: [
          BASE_BB,
          { id: "fg1", type: "func-gen", x: 16, y: 24, rotation: 0, props: { waveform: "sine", vpp: 19.6, freq: 1000 } },
          { id: "dc1", type: "dc-supply", x: 248, y: 38, rotation: 0, props: { voltage: 2.5 } },
          { id: "sc1", type: "oscilloscope", x: 616, y: 24, rotation: 0, props: {} },
          placeOnBB("r1", "resistor", 3, 298, 0, { resistance: 1000 }),
          placeOnBB("d1", "diode", 8, 338, 270, { material: "si" }),
        ],
        wires: [
          { id: "w1", from: { compId: "fg1", pinId: "pos" }, to: { compId: "bb1", pinId: "a3" }, color: "#8c4a3c" },
          { id: "w2", from: { compId: "fg1", pinId: "neg" }, to: { compId: "bb1", pinId: "bn_2" }, color: "#27272a" },
          { id: "w3", from: { compId: "dc1", pinId: "neg" }, to: { compId: "bb1", pinId: "j8" }, color: "#475569" },
          { id: "w4", from: { compId: "dc1", pinId: "pos" }, to: { compId: "bb1", pinId: "bn_6" }, color: "#27272a" },
          { id: "w5", from: { compId: "sc1", pinId: "ch1_pos" }, to: { compId: "bb1", pinId: "b3" }, color: "#475569" },
          { id: "w6", from: { compId: "sc1", pinId: "ch1_neg" }, to: { compId: "bb1", pinId: "bn_14" }, color: "#78716c" },
          { id: "w7", from: { compId: "sc1", pinId: "ch2_pos" }, to: { compId: "bb1", pinId: "a8" }, color: "#4d5d46" },
          { id: "w8", from: { compId: "sc1", pinId: "ch2_neg" }, to: { compId: "bb1", pinId: "bn_16" }, color: "#78716c" },
        ],
      },
    ],
  },

  // =========================================================================
  // EXP 07: Diode Clamper Circuit on Breadboard
  // =========================================================================
  {
    id: "exp-7",
    number: "07",
    shortTitle: "Diode Clamper",
    title: "Study of Diode Clamper Circuit",
    objective:
      "Wire Positive and Negative Diode Clampers on the breadboard using a series 10 uF capacitor, shunt 1N4007 diode, and 100 kOhm resistor.",
    steps: [
      {
        id: "exp7-s1",
        title: "Step 1: Positive Clamper (Shift Upward)",
        instruction:
          "Place 10 uF Capacitor across col 3-7, vertical 1N4007 Diode at col 7 (Cathode up, Anode to ground), and 100 kOhm Load at col 11.",
        observation:
          "The 10 Vpp sine wave shifts upward without changing shape: Vmin sits near -0.7 V and Vmax reaches +9.3 V.",
        components: [
          BASE_BB,
          { id: "fg1", type: "func-gen", x: 16, y: 24, rotation: 0, props: { waveform: "sine", vpp: 10, freq: 1000 } },
          { id: "sc1", type: "oscilloscope", x: 616, y: 24, rotation: 0, props: {} },
          placeOnBB("c1", "capacitor", 3, 298, 0, { capacitance: 10 }),
          placeOnBB("d1", "diode", 7, 338, 270, { material: "si" }),
          placeOnBB("rl", "resistor", 11, 338, 90, { resistance: 100000 }),
        ],
        wires: [
          { id: "w1", from: { compId: "fg1", pinId: "pos" }, to: { compId: "bb1", pinId: "a3" }, color: "#8c4a3c" },
          { id: "w2", from: { compId: "fg1", pinId: "neg" }, to: { compId: "bb1", pinId: "bn_2" }, color: "#27272a" },
          { id: "w3", from: { compId: "bb1", pinId: "b7" }, to: { compId: "bb1", pinId: "b11" }, color: "#4d5d46" },
          { id: "w4", from: { compId: "bb1", pinId: "j7" }, to: { compId: "bb1", pinId: "bn_7" }, color: "#27272a" },
          { id: "w5", from: { compId: "bb1", pinId: "j11" }, to: { compId: "bb1", pinId: "bn_11" }, color: "#27272a" },
          { id: "w6", from: { compId: "sc1", pinId: "ch1_pos" }, to: { compId: "bb1", pinId: "b3" }, color: "#475569" },
          { id: "w7", from: { compId: "sc1", pinId: "ch1_neg" }, to: { compId: "bb1", pinId: "bn_14" }, color: "#78716c" },
          { id: "w8", from: { compId: "sc1", pinId: "ch2_pos" }, to: { compId: "bb1", pinId: "a11" }, color: "#4d5d46" },
          { id: "w9", from: { compId: "sc1", pinId: "ch2_neg" }, to: { compId: "bb1", pinId: "bn_16" }, color: "#78716c" },
        ],
      },
      {
        id: "exp7-s2",
        title: "Step 2: Negative Clamper (Shift Downward)",
        instruction:
          "Flip the 1N4007 Diode 180 deg on column 7 (Anode up, Cathode to ground rail) on the breadboard.",
        observation:
          "The entire waveform shifts downward: Vmax clamps near +0.7 V and Vmin drops to -9.3 V while Vp-p stays 10 V.",
        components: [
          BASE_BB,
          { id: "fg1", type: "func-gen", x: 16, y: 24, rotation: 0, props: { waveform: "sine", vpp: 10, freq: 1000 } },
          { id: "sc1", type: "oscilloscope", x: 616, y: 24, rotation: 0, props: {} },
          placeOnBB("c1", "capacitor", 3, 298, 0, { capacitance: 10 }),
          placeOnBB("d1", "diode", 7, 338, 90, { material: "si" }),
          placeOnBB("rl", "resistor", 11, 338, 90, { resistance: 100000 }),
        ],
        wires: [
          { id: "w1", from: { compId: "fg1", pinId: "pos" }, to: { compId: "bb1", pinId: "a3" }, color: "#8c4a3c" },
          { id: "w2", from: { compId: "fg1", pinId: "neg" }, to: { compId: "bb1", pinId: "bn_2" }, color: "#27272a" },
          { id: "w3", from: { compId: "bb1", pinId: "b7" }, to: { compId: "bb1", pinId: "b11" }, color: "#4d5d46" },
          { id: "w4", from: { compId: "bb1", pinId: "j7" }, to: { compId: "bb1", pinId: "bn_7" }, color: "#27272a" },
          { id: "w5", from: { compId: "bb1", pinId: "j11" }, to: { compId: "bb1", pinId: "bn_11" }, color: "#27272a" },
          { id: "w6", from: { compId: "sc1", pinId: "ch1_pos" }, to: { compId: "bb1", pinId: "b3" }, color: "#475569" },
          { id: "w7", from: { compId: "sc1", pinId: "ch1_neg" }, to: { compId: "bb1", pinId: "bn_14" }, color: "#78716c" },
          { id: "w8", from: { compId: "sc1", pinId: "ch2_pos" }, to: { compId: "bb1", pinId: "a11" }, color: "#4d5d46" },
          { id: "w9", from: { compId: "sc1", pinId: "ch2_neg" }, to: { compId: "bb1", pinId: "bn_16" }, color: "#78716c" },
        ],
      },
    ],
  },
];
