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
// Bot strip rows f..j: y = 362, 378, 394, 410, 426
// Bottom rails: bp = 448, bn = 462
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

// Place 2-pin components so pins land at exact 0.0px alignment on breadboard holes
function placeOnBB(
  id: string,
  type: PlacedComponent["type"],
  col: number,
  rowY: number,
  rotation: 0 | 90 | 180 | 270,
  props: Record<string, number | string>
): PlacedComponent {
  if (type === "resistor") {
    if (rotation === 0 || rotation === 180) {
      return { id, type, x: bbColX(col) - 4, y: rowY - 16, rotation, props };
    }
    // vertical: pins land at row c (298) and row g (378) -> center at 338
    return { id, type, x: bbColX(col) - 44, y: rowY - 16, rotation, props };
  }
  if (type === "inductor") {
    if (rotation === 0 || rotation === 180) {
      return { id, type, x: bbColX(col) - 4, y: rowY - 18, rotation, props };
    }
    // vertical: pins land at row c (298) and row g (378) -> center at 338
    return { id, type, x: bbColX(col) - 44, y: rowY - 18, rotation, props };
  }
  if (type === "diode" || type === "zener") {
    if (rotation === 0 || rotation === 180) {
      return { id, type, x: bbColX(col) - 4, y: rowY - 16, rotation, props };
    }
    // vertical: pins land at row c (298) and row g (378) -> center at 338
    return { id, type, x: bbColX(col) - 44, y: rowY - 16, rotation, props };
  }
  if (type === "capacitor" || type === "led") {
    if (rotation === 0 || rotation === 180) {
      return { id, type, x: bbColX(col) - 4, y: rowY - 22, rotation, props };
    }
    // vertical: 64px span -> pins land at row d (314) and row g (378) -> center at 346
    return { id, type, x: bbColX(col) - 36, y: rowY - 22, rotation, props };
  }
  return { id, type, x: bbColX(col), y: rowY, rotation, props };
}

export const EXPERIMENT_TEMPLATES: ExperimentTemplate[] = [
  // =========================================================================
  // EXP 01: Introduction to Electronic Devices and Circuits Lab (PDF pp. 3-7)
  // =========================================================================
  {
    id: "exp-1",
    number: "01",
    shortTitle: "Lab Instruments",
    title: "Introduction to Electronic Devices and Circuits Lab",
    objective:
      "Introduce the basic lab equipment and passive electronic components: Trainer Board, Signal Generator, Oscilloscope, Resistors, Capacitors, and Inductors.",
    steps: [
      {
        id: "exp1-s1",
        title: "1. Trainer Board (Breadboard)",
        instruction:
          "A compact platform used for constructing and testing electronic circuits without soldering. It contains built-in power supply terminals and connecting sockets.",
        observation:
          "Top/bottom rails are connected horizontally; middle 5-hole columns (a-e and f-j) are connected vertically.",
        components: [BASE_BB],
        wires: [],
      },
      {
        id: "exp1-s2",
        title: "2. Signal Generator",
        instruction:
          "Produces electrical waveforms of various shapes — Sine, Square, and Triangular — to provide an input signal to a circuit.",
        observation:
          "Click the Signal Generator to adjust Waveform (Sine/Square/Triangle), Amplitude (Vpp), and Frequency (Hz).",
        components: [
          { id: "fg1", type: "func-gen", x: 300, y: 180, rotation: 0, props: { waveform: "sine", vpp: 10, freq: 1000 } },
        ],
        wires: [],
      },
      {
        id: "exp1-s3",
        title: "3. Oscilloscope",
        instruction:
          "An electronic test instrument that graphically displays varying voltages of one or more signals as a function of time.",
        observation:
          "Has CH1 and CH2 probes to observe waveforms and phase differences. Use 'Open Scope' in the toolbar when needed.",
        components: [
          { id: "sc1", type: "oscilloscope", x: 320, y: 160, rotation: 0, props: {} },
        ],
        wires: [],
      },
      {
        id: "exp1-s4",
        title: "4. Resistor",
        instruction:
          "A passive two-terminal component that implements electrical resistance to reduce current flow, adjust signal levels, and divide voltages.",
        observation:
          "Resistors obey Ohm's law, with voltage and current completely in phase (0 deg phase difference).",
        components: [
          { id: "r1", type: "resistor", x: 356, y: 224, rotation: 0, props: { resistance: 1000 } },
        ],
        wires: [],
      },
      {
        id: "exp1-s5",
        title: "5. Capacitor",
        instruction:
          "An energy storage device (polarized or non-polarized) commonly used in circuits for filtering, timing, coupling, and decoupling.",
        observation:
          "Capacitors cause current to lead voltage.",
        components: [
          { id: "c1", type: "capacitor", x: 364, y: 218, rotation: 0, props: { capacitance: 10 } },
        ],
        wires: [],
      },
      {
        id: "exp1-s6",
        title: "6. Inductor",
        instruction:
          "Coil-shaped passive component that stores energy in the form of a magnetic field when current flows through it.",
        observation:
          "Inductors cause voltage to lead current. Often used with capacitors to form LC circuits.",
        components: [
          { id: "l1", type: "inductor", x: 356, y: 222, rotation: 0, props: { inductance: 100 } },
        ],
        wires: [],
      },
    ],
  },

  // =========================================================================
  // EXP 02: I-V Characteristics of PN Junction Diode (Matches PDF Table 1 & 2)
  // =========================================================================
  {
    id: "exp-2",
    number: "02",
    shortTitle: "Diode I-V Curve",
    title: "I-V Characteristics of PN Junction Diode",
    objective:
      "Measure forward and reverse bias current-voltage characteristics of a PN junction diode with R = 1 kOhm using Ammeter and Voltmeter.",
    steps: [
      {
        id: "exp2-s1",
        title: "Step 1: Forward Bias Below Knee (0.5 V)",
        instruction:
          "Wire DC Power Supply (0.5 V) -> Ammeter -> 1 kOhm Resistor (col 3-8) -> 1N4007 Diode (col 8-13) -> Ground rail. Voltmeter across Diode.",
        observation:
          "PDF Table 1 match: At Vdc = 0.5 V, Vd is ~0.42-0.44 V and Id is tiny (< 0.1 mA) below the 0.6-0.7 V threshold.",
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
        title: "Step 2: Forward Bias Knee (1.0 V)",
        instruction:
          "Raise DC Power Supply to 1.0 V on the same circuit and inspect Vd and Id.",
        observation:
          "PDF Table 1 match: At Vdc = 1.0 V, Vd reaches ~0.50 V and Id rises to ~0.50 mA (VR ~ 0.50 V).",
        components: [
          BASE_BB,
          { id: "dc1", type: "dc-supply", x: 16, y: 40, rotation: 0, props: { voltage: 1.0 } },
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
        title: "Step 3: Forward Bias Conduction (3.0 V)",
        instruction:
          "Raise DC Power Supply to 3.0 V and check both Multimeter displays.",
        observation:
          "PDF Table 1 match: Vd stays near ~0.58-0.60 V while Id jumps to ~2.42 mA (VR ~ 2.42 V).",
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
        id: "exp2-s4",
        title: "Step 4: Reverse Bias Blocking (3.0 V)",
        instruction:
          "Flip the 1N4007 Diode 180 degrees (Cathode on col 8, Anode on col 13) with DC Supply at 3.0 V.",
        observation:
          "PDF Table 2 match: Diode blocks current (Id = 0.00 mA) and the full 3.00 V supply voltage drops across the diode.",
        components: [
          BASE_BB,
          { id: "dc1", type: "dc-supply", x: 16, y: 40, rotation: 0, props: { voltage: 3.0 } },
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
  // EXP 03: Study of Zener Diode Applications (Matches PDF R=456 Ohm, Vz=8.92V)
  // =========================================================================
  {
    id: "exp-3",
    number: "03",
    shortTitle: "Zener Regulator",
    title: "Study of Zener Diode Applications",
    objective:
      "Wire the reverse-biased 8.9 V Zener diode with R = 456 Ohm on the breadboard to verify breakdown characteristics and load voltage regulation.",
    steps: [
      {
        id: "exp3-s1",
        title: "Step 1: Below Breakdown (Vin = 5.0 V)",
        instruction:
          "Place 456 Ohm resistor (col 3-8) and reverse-biased 8.9 V Zener across col 8 to ground rail. Set DC Supply to 5.0 V.",
        observation:
          "PDF Table match: Since Vin (5.0 V) < Vz (8.9 V), Zener blocks reverse current (Iz = 0.00 mA) and Vz follows Vin (5.00 V).",
        components: [
          BASE_BB,
          { id: "dc1", type: "dc-supply", x: 16, y: 40, rotation: 0, props: { voltage: 5.0 } },
          { id: "mm_i", type: "multimeter", x: 240, y: 48, rotation: 0, props: { mode: "current" } },
          { id: "mm_v", type: "multimeter", x: 432, y: 48, rotation: 0, props: { mode: "voltage" } },
          placeOnBB("r1", "resistor", 3, 298, 0, { resistance: 456 }),
          placeOnBB("z1", "zener", 8, 338, 270, { vz: 8.92 }),
        ],
        wires: [
          { id: "w1", from: { compId: "dc1", pinId: "pos" }, to: { compId: "mm_i", pinId: "pos" }, color: "#8c4a3c" },
          { id: "w2", from: { compId: "mm_i", pinId: "neg" }, to: { compId: "bb1", pinId: "a3" }, color: "#8c4a3c" },
          { id: "w3", from: { compId: "bb1", pinId: "j8" }, to: { compId: "bb1", pinId: "bn_8" }, color: "#27272a" },
          { id: "w4", from: { compId: "dc1", pinId: "neg" }, to: { compId: "bb1", pinId: "bn_2" }, color: "#27272a" },
          { id: "w5", from: { compId: "mm_v", pinId: "pos" }, to: { compId: "bb1", pinId: "a8" }, color: "#475569" },
          { id: "w6", from: { compId: "mm_v", pinId: "neg" }, to: { compId: "bb1", pinId: "bn_14" }, color: "#78716c" },
        ],
      },
      {
        id: "exp3-s2",
        title: "Step 2: Zener Breakdown (Vin = 12.0 V)",
        instruction:
          "Increase DC Power Supply to 12.0 V. The 8.92 V Zener enters reverse breakdown and clamps Vz.",
        observation:
          "PDF Table match: Voltmeter regulates near ~8.9 V (PDF: 9.06 V) while Ammeter reads Iz ~ 6.7 mA (PDF: 5.94 mA).",
        components: [
          BASE_BB,
          { id: "dc1", type: "dc-supply", x: 16, y: 40, rotation: 0, props: { voltage: 12.0 } },
          { id: "mm_i", type: "multimeter", x: 240, y: 48, rotation: 0, props: { mode: "current" } },
          { id: "mm_v", type: "multimeter", x: 432, y: 48, rotation: 0, props: { mode: "voltage" } },
          placeOnBB("r1", "resistor", 3, 298, 0, { resistance: 456 }),
          placeOnBB("z1", "zener", 8, 338, 270, { vz: 8.92 }),
        ],
        wires: [
          { id: "w1", from: { compId: "dc1", pinId: "pos" }, to: { compId: "mm_i", pinId: "pos" }, color: "#8c4a3c" },
          { id: "w2", from: { compId: "mm_i", pinId: "neg" }, to: { compId: "bb1", pinId: "a3" }, color: "#8c4a3c" },
          { id: "w3", from: { compId: "bb1", pinId: "j8" }, to: { compId: "bb1", pinId: "bn_8" }, color: "#27272a" },
          { id: "w4", from: { compId: "dc1", pinId: "neg" }, to: { compId: "bb1", pinId: "bn_2" }, color: "#27272a" },
          { id: "w5", from: { compId: "mm_v", pinId: "pos" }, to: { compId: "bb1", pinId: "a8" }, color: "#475569" },
          { id: "w6", from: { compId: "mm_v", pinId: "neg" }, to: { compId: "bb1", pinId: "bn_14" }, color: "#78716c" },
        ],
      },
      {
        id: "exp3-s3",
        title: "Step 3: High Input (Vin = 15.0 V)",
        instruction:
          "Raise DC Power Supply to 15.0 V to confirm Zener voltage stability as input increases.",
        observation:
          "PDF Table match: Vz holds near ~8.9-9.2 V while Iz rises to ~13 mA (PDF: Vz = 9.23 V, Iz = 12.46 mA).",
        components: [
          BASE_BB,
          { id: "dc1", type: "dc-supply", x: 16, y: 40, rotation: 0, props: { voltage: 15.0 } },
          { id: "mm_i", type: "multimeter", x: 240, y: 48, rotation: 0, props: { mode: "current" } },
          { id: "mm_v", type: "multimeter", x: 432, y: 48, rotation: 0, props: { mode: "voltage" } },
          placeOnBB("r1", "resistor", 3, 298, 0, { resistance: 456 }),
          placeOnBB("z1", "zener", 8, 338, 270, { vz: 8.92 }),
        ],
        wires: [
          { id: "w1", from: { compId: "dc1", pinId: "pos" }, to: { compId: "mm_i", pinId: "pos" }, color: "#8c4a3c" },
          { id: "w2", from: { compId: "mm_i", pinId: "neg" }, to: { compId: "bb1", pinId: "a3" }, color: "#8c4a3c" },
          { id: "w3", from: { compId: "bb1", pinId: "j8" }, to: { compId: "bb1", pinId: "bn_8" }, color: "#27272a" },
          { id: "w4", from: { compId: "dc1", pinId: "neg" }, to: { compId: "bb1", pinId: "bn_2" }, color: "#27272a" },
          { id: "w5", from: { compId: "mm_v", pinId: "pos" }, to: { compId: "bb1", pinId: "a8" }, color: "#475569" },
          { id: "w6", from: { compId: "mm_v", pinId: "neg" }, to: { compId: "bb1", pinId: "bn_14" }, color: "#78716c" },
        ],
      },
      {
        id: "exp3-s4",
        title: "Step 4: Loaded Voltage Regulator (with RL)",
        instruction:
          "Connect a 10 kOhm load resistor RL at col 11 in parallel with the Zener diode (PDF Report Question #3).",
        observation:
          "Load voltage Vout stays regulated at ~8.9 V across RL while excess input voltage drops across R.",
        components: [
          BASE_BB,
          { id: "dc1", type: "dc-supply", x: 16, y: 40, rotation: 0, props: { voltage: 15.0 } },
          { id: "mm_i", type: "multimeter", x: 240, y: 48, rotation: 0, props: { mode: "current" } },
          { id: "mm_v", type: "multimeter", x: 432, y: 48, rotation: 0, props: { mode: "voltage" } },
          placeOnBB("r1", "resistor", 3, 298, 0, { resistance: 456 }),
          placeOnBB("z1", "zener", 8, 338, 270, { vz: 8.92 }),
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
  // EXP 04: Half-Wave Diode Rectifier (Matches PDF Table: 19 Vpp -> Vmax 8.8V)
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
          "Place 1N4007 diode across col 3-8 and 1 kOhm load resistor from col 11 to ground rail. Feed 19 Vpp (9.5 V peak) 1 kHz Sine to col 3.",
        observation:
          "PDF Table match: Only positive half-cycles pass (Vmax ~8.80 V, Vrms ~4.35 V, Vavg ~2.75 V, Ripple ~1.24).",
        components: [
          BASE_BB,
          { id: "fg1", type: "func-gen", x: 16, y: 24, rotation: 0, props: { waveform: "sine", vpp: 19, freq: 1000 } },
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
          "Insert a 1 uF filter capacitor on col 8 in parallel with the 1 kOhm load resistor.",
        observation:
          "Sawtooth ripple waveform appears on CH2; Vmin rises sharply and Ripple Factor drops below 0.3.",
        components: [
          BASE_BB,
          { id: "fg1", type: "func-gen", x: 16, y: 24, rotation: 0, props: { waveform: "sine", vpp: 19, freq: 1000 } },
          { id: "sc1", type: "oscilloscope", x: 616, y: 24, rotation: 0, props: {} },
          placeOnBB("d1", "diode", 3, 298, 0, { material: "si" }),
          placeOnBB("c1", "capacitor", 8, 346, 90, { capacitance: 1 }),
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
          "Swap the filter capacitor to 10 uF and observe Vavg, Vmin, and Ripple Factor on the Oscilloscope.",
        observation:
          "PDF Table match: Vmax ~8.7 V, Vmin ~8.0 V, Vavg ~8.35 V, Ripple ~0.03 (smooth DC).",
        components: [
          BASE_BB,
          { id: "fg1", type: "func-gen", x: 16, y: 24, rotation: 0, props: { waveform: "sine", vpp: 19, freq: 1000 } },
          { id: "sc1", type: "oscilloscope", x: 616, y: 24, rotation: 0, props: {} },
          placeOnBB("d1", "diode", 3, 298, 0, { material: "si" }),
          placeOnBB("c1", "capacitor", 8, 346, 90, { capacitance: 10 }),
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
        id: "exp4-s4",
        title: "Step 4: Ultra-Smooth DC with 47 uF Capacitor",
        instruction:
          "Increase the filter capacitor to 47 uF for minimal ripple.",
        observation:
          "Higher capacitance reduces ripple factor below 0.01 and yields steady DC near ~8.6 V.",
        components: [
          BASE_BB,
          { id: "fg1", type: "func-gen", x: 16, y: 24, rotation: 0, props: { waveform: "sine", vpp: 19, freq: 1000 } },
          { id: "sc1", type: "oscilloscope", x: 616, y: 24, rotation: 0, props: {} },
          placeOnBB("d1", "diode", 3, 298, 0, { material: "si" }),
          placeOnBB("c1", "capacitor", 8, 346, 90, { capacitance: 47 }),
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
  // EXP 05: Full-Wave Bridge Rectifier (Matches PDF Table: 20 Vpp -> Vmax 8.6V)
  // =========================================================================
  {
    id: "exp-5",
    number: "05",
    shortTitle: "Full-Wave Bridge",
    title: "Study of Full-Wave Bridge Diode Rectifier Circuit",
    objective:
      "Build a 4-diode 1N4007 Bridge Rectifier on the breadboard and compare Unfiltered, 0.47 uF, 10 uF, and 47 uF filtering.",
    steps: [
      {
        id: "exp5-s1",
        title: "Step 1: Unfiltered 4-Diode Bridge",
        instruction:
          "Wire D1 (col 3->8, row B), D2 (col 4->9, row D), D3 (col 8->3, row G), D4 (col 9->4, row I). Feed 20 Vpp 1 kHz Sine across col 3 & 4.",
        observation:
          "PDF Table match: Both half cycles rectify at 2 kHz (Vmax ~8.6 V, Vrms ~5.8 V, Vavg ~5.0 V, Ripple ~0.55).",
        components: [
          BASE_BB,
          { id: "fg1", type: "func-gen", x: 16, y: 24, rotation: 0, props: { waveform: "sine", vpp: 20, freq: 1000 } },
          { id: "sc1", type: "oscilloscope", x: 616, y: 24, rotation: 0, props: {} },
          placeOnBB("d1", "diode", 3, 282, 0, { material: "si" }),
          placeOnBB("d2", "diode", 4, 314, 0, { material: "si" }),
          placeOnBB("d3", "diode", 3, 378, 180, { material: "si" }),
          placeOnBB("d4", "diode", 4, 410, 180, { material: "si" }),
          placeOnBB("rl", "resistor", 14, 338, 90, { resistance: 1000 }),
        ],
        wires: [
          { id: "w1", from: { compId: "fg1", pinId: "pos" }, to: { compId: "bb1", pinId: "a3" }, color: "#8c4a3c" },
          { id: "w2", from: { compId: "bb1", pinId: "e3" }, to: { compId: "bb1", pinId: "f3" }, color: "#8c4a3c" },
          { id: "w3", from: { compId: "fg1", pinId: "neg" }, to: { compId: "bb1", pinId: "a4" }, color: "#475569" },
          { id: "w4", from: { compId: "bb1", pinId: "e4" }, to: { compId: "bb1", pinId: "f4" }, color: "#475569" },
          { id: "w5", from: { compId: "bb1", pinId: "a8" }, to: { compId: "bb1", pinId: "a9" }, color: "#4d5d46" },
          { id: "w6", from: { compId: "bb1", pinId: "b9" }, to: { compId: "bb1", pinId: "b14" }, color: "#4d5d46" },
          { id: "w7", from: { compId: "bb1", pinId: "j8" }, to: { compId: "bb1", pinId: "bn_8" }, color: "#27272a" },
          { id: "w8", from: { compId: "bb1", pinId: "j9" }, to: { compId: "bb1", pinId: "bn_9" }, color: "#27272a" },
          { id: "w9", from: { compId: "bb1", pinId: "j14" }, to: { compId: "bb1", pinId: "bn_14" }, color: "#27272a" },
          { id: "w10", from: { compId: "sc1", pinId: "ch1_pos" }, to: { compId: "bb1", pinId: "c3" }, color: "#78716c" },
          { id: "w11", from: { compId: "sc1", pinId: "ch1_neg" }, to: { compId: "bb1", pinId: "c4" }, color: "#78716c" },
          { id: "w12", from: { compId: "sc1", pinId: "ch2_pos" }, to: { compId: "bb1", pinId: "a14" }, color: "#27272a" },
          { id: "w13", from: { compId: "sc1", pinId: "ch2_neg" }, to: { compId: "bb1", pinId: "bn_16" }, color: "#27272a" },
        ],
      },
      {
        id: "exp5-s2",
        title: "Step 2: Bridge with 0.47 uF Capacitor",
        instruction:
          "Add a 0.47 uF filter capacitor at col 12 in parallel with the 1 kOhm load resistor.",
        observation:
          "PDF Table match: Ripple drops significantly (Vmax ~8.5 V, Vavg ~6.7-7.7 V) as the bridge recharges twice per cycle.",
        components: [
          BASE_BB,
          { id: "fg1", type: "func-gen", x: 16, y: 24, rotation: 0, props: { waveform: "sine", vpp: 20, freq: 1000 } },
          { id: "sc1", type: "oscilloscope", x: 616, y: 24, rotation: 0, props: {} },
          placeOnBB("d1", "diode", 3, 282, 0, { material: "si" }),
          placeOnBB("d2", "diode", 4, 314, 0, { material: "si" }),
          placeOnBB("d3", "diode", 3, 378, 180, { material: "si" }),
          placeOnBB("d4", "diode", 4, 410, 180, { material: "si" }),
          placeOnBB("c1", "capacitor", 12, 346, 90, { capacitance: 0.47 }),
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
      {
        id: "exp5-s3",
        title: "Step 3: Bridge with 10 uF Capacitor",
        instruction:
          "Increase the filter capacitor to 10 uF at col 12 and observe ripple collapse.",
        observation:
          "PDF Table match: Vavg stabilizes near ~8.2 V with tiny ripple (~0.01).",
        components: [
          BASE_BB,
          { id: "fg1", type: "func-gen", x: 16, y: 24, rotation: 0, props: { waveform: "sine", vpp: 20, freq: 1000 } },
          { id: "sc1", type: "oscilloscope", x: 616, y: 24, rotation: 0, props: {} },
          placeOnBB("d1", "diode", 3, 282, 0, { material: "si" }),
          placeOnBB("d2", "diode", 4, 314, 0, { material: "si" }),
          placeOnBB("d3", "diode", 3, 378, 180, { material: "si" }),
          placeOnBB("d4", "diode", 4, 410, 180, { material: "si" }),
          placeOnBB("c1", "capacitor", 12, 346, 90, { capacitance: 10 }),
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
      {
        id: "exp5-s4",
        title: "Step 4: Bridge with 47 uF Capacitor",
        instruction:
          "Use the 47 uF capacitor for the smoothest DC output.",
        observation:
          "PDF Table match: Vavg ~8.3 V with near-zero ripple (< 0.003), closely resembling pure DC.",
        components: [
          BASE_BB,
          { id: "fg1", type: "func-gen", x: 16, y: 24, rotation: 0, props: { waveform: "sine", vpp: 20, freq: 1000 } },
          { id: "sc1", type: "oscilloscope", x: 616, y: 24, rotation: 0, props: {} },
          placeOnBB("d1", "diode", 3, 282, 0, { material: "si" }),
          placeOnBB("d2", "diode", 4, 314, 0, { material: "si" }),
          placeOnBB("d3", "diode", 3, 378, 180, { material: "si" }),
          placeOnBB("d4", "diode", 4, 410, 180, { material: "si" }),
          placeOnBB("c1", "capacitor", 12, 346, 90, { capacitance: 47 }),
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
  // EXP 06: Diode Clipper Circuits (Matches PDF: 19.6 Vpp 1 kHz TRIANGLE Wave)
  // =========================================================================
  {
    id: "exp-6",
    number: "06",
    shortTitle: "Diode Clipper",
    title: "Study of Diode Clipper Circuits",
    objective:
      "Wire biased positive, negative, and dual diode clippers on the breadboard using a 19.6 Vpp 1 kHz Triangular wave (per lab report).",
    steps: [
      {
        id: "exp6-s1",
        title: "Step 1: Forward Biased Positive Clipper (+3.0 V)",
        instruction:
          "Place 1 kOhm resistor (col 3-8) and vertical 1N4007 diode (col 8, Anode up, Cathode down). Connect DC Supply (+2.3 V) to bottom of diode with 19.6 Vpp 1 kHz Triangle input.",
        observation:
          "PDF Table match: Positive peak clips flat near +3.00 V (2.3 V + 0.7 V) while negative peak passes to -9.8 V (Vp-p ~ 12.8 V).",
        components: [
          BASE_BB,
          { id: "fg1", type: "func-gen", x: 16, y: 24, rotation: 0, props: { waveform: "triangle", vpp: 19.6, freq: 1000 } },
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
        title: "Step 2: Reverse Biased Negative Clipper (-3.2 V)",
        instruction:
          "Flip the Diode 180 deg (Cathode up at col 8) and reverse DC Supply terminals so -2.5 V biases the diode anode.",
        observation:
          "PDF Table match: Negative peak clips flat near -3.20 V while the positive peak passes cleanly up to +9.8 V (Vp-p ~ 13.0 V).",
        components: [
          BASE_BB,
          { id: "fg1", type: "func-gen", x: 16, y: 24, rotation: 0, props: { waveform: "triangle", vpp: 19.6, freq: 1000 } },
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
      {
        id: "exp6-s3",
        title: "Step 3: Dual Clipper (+1.7 V / -4.0 V, Q2)",
        instruction:
          "Add a second diode branch at col 11 with +1.0 V and -3.3 V DC biases on a 10 Vpp (5 V amplitude) input (PDF Report Q2).",
        observation:
          "Positive peaks clip at +1.7 V (1.0 + 0.7 V) and negative peaks clip at -4.0 V (-3.3 - 0.7 V).",
        components: [
          BASE_BB,
          { id: "fg1", type: "func-gen", x: 16, y: 24, rotation: 0, props: { waveform: "sine", vpp: 10, freq: 1000 } },
          { id: "dc1", type: "dc-supply", x: 248, y: 38, rotation: 0, props: { voltage: 1.0 } },
          { id: "dc2", type: "dc-supply", x: 424, y: 38, rotation: 0, props: { voltage: 3.3 } },
          { id: "sc1", type: "oscilloscope", x: 616, y: 24, rotation: 0, props: {} },
          placeOnBB("r1", "resistor", 3, 298, 0, { resistance: 1000 }),
          placeOnBB("d1", "diode", 8, 338, 90, { material: "si" }),
          placeOnBB("d2", "diode", 11, 338, 270, { material: "si" }),
        ],
        wires: [
          { id: "w1", from: { compId: "fg1", pinId: "pos" }, to: { compId: "bb1", pinId: "a3" }, color: "#8c4a3c" },
          { id: "w2", from: { compId: "fg1", pinId: "neg" }, to: { compId: "bb1", pinId: "bn_2" }, color: "#27272a" },
          { id: "w3", from: { compId: "bb1", pinId: "b8" }, to: { compId: "bb1", pinId: "b11" }, color: "#4d5d46" },
          { id: "w4", from: { compId: "dc1", pinId: "pos" }, to: { compId: "bb1", pinId: "j8" }, color: "#8c4a3c" },
          { id: "w5", from: { compId: "dc1", pinId: "neg" }, to: { compId: "bb1", pinId: "bn_6" }, color: "#27272a" },
          { id: "w6", from: { compId: "dc2", pinId: "neg" }, to: { compId: "bb1", pinId: "j11" }, color: "#475569" },
          { id: "w7", from: { compId: "dc2", pinId: "pos" }, to: { compId: "bb1", pinId: "bn_10" }, color: "#27272a" },
          { id: "w8", from: { compId: "sc1", pinId: "ch1_pos" }, to: { compId: "bb1", pinId: "b3" }, color: "#475569" },
          { id: "w9", from: { compId: "sc1", pinId: "ch1_neg" }, to: { compId: "bb1", pinId: "bn_14" }, color: "#78716c" },
          { id: "w10", from: { compId: "sc1", pinId: "ch2_pos" }, to: { compId: "bb1", pinId: "a8" }, color: "#4d5d46" },
          { id: "w11", from: { compId: "sc1", pinId: "ch2_neg" }, to: { compId: "bb1", pinId: "bn_16" }, color: "#78716c" },
        ],
      },
    ],
  },

  // =========================================================================
  // EXP 07: Diode Clamper Circuit (Matches PDF: 1 kHz SQUARE Wave, 0.1 uF)
  // =========================================================================
  {
    id: "exp-7",
    number: "07",
    shortTitle: "Diode Clamper",
    title: "Study of Diode Clamper Circuit",
    objective:
      "Shift a 1 kHz Square wave vertically upward or downward without altering its peak-to-peak shape using a 0.1 uF capacitor, 1N4007 diode, and 100 kOhm resistor.",
    steps: [
      {
        id: "exp7-s1",
        title: "Step 1: Positive Clamper (Shift Upward)",
        instruction:
          "Place 0.1 uF Capacitor across col 3-7, vertical 1N4007 Diode at col 7 (Cathode up, Anode to ground), and 100 kOhm Load at col 11. Feed 10 Vpp 1 kHz Square wave.",
        observation:
          "PDF Table match: The 10 Vpp square wave shifts upward without changing shape: Vmin sits near -0.6 V and Vmax reaches +9.4 V.",
        components: [
          BASE_BB,
          { id: "fg1", type: "func-gen", x: 16, y: 24, rotation: 0, props: { waveform: "square", vpp: 10, freq: 1000 } },
          { id: "sc1", type: "oscilloscope", x: 616, y: 24, rotation: 0, props: {} },
          placeOnBB("c1", "capacitor", 3, 298, 0, { capacitance: 0.1 }),
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
          "Flip the 1N4007 Diode 180 deg on col 7 (Anode up, Cathode to ground rail) with the same Square wave input.",
        observation:
          "The square wave shifts downward without distortion: Vmax clamps near +0.6 V and Vmin drops to -9.4 V while Vp-p stays 10 V.",
        components: [
          BASE_BB,
          { id: "fg1", type: "func-gen", x: 16, y: 24, rotation: 0, props: { waveform: "square", vpp: 10, freq: 1000 } },
          { id: "sc1", type: "oscilloscope", x: 616, y: 24, rotation: 0, props: {} },
          placeOnBB("c1", "capacitor", 3, 298, 0, { capacitance: 0.1 }),
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
      {
        id: "exp7-s3",
        title: "Step 3: Biased Positive Clamper (PDF Fig b)",
        instruction:
          "Connect a +2.0 V DC bias battery in series with the diode anode (col 7 bottom) to shift the square wave even further upward.",
        observation:
          "PDF Fig (b) match: Vmin shifts up to +1.4 V and Vmax reaches +11.4 V while Vp-p stays 10 V.",
        components: [
          BASE_BB,
          { id: "fg1", type: "func-gen", x: 16, y: 24, rotation: 0, props: { waveform: "square", vpp: 10, freq: 1000 } },
          { id: "dc1", type: "dc-supply", x: 248, y: 38, rotation: 0, props: { voltage: 2.0 } },
          { id: "sc1", type: "oscilloscope", x: 616, y: 24, rotation: 0, props: {} },
          placeOnBB("c1", "capacitor", 3, 298, 0, { capacitance: 0.1 }),
          placeOnBB("d1", "diode", 7, 338, 270, { material: "si" }),
          placeOnBB("rl", "resistor", 11, 338, 90, { resistance: 100000 }),
        ],
        wires: [
          { id: "w1", from: { compId: "fg1", pinId: "pos" }, to: { compId: "bb1", pinId: "a3" }, color: "#8c4a3c" },
          { id: "w2", from: { compId: "fg1", pinId: "neg" }, to: { compId: "bb1", pinId: "bn_2" }, color: "#27272a" },
          { id: "w3", from: { compId: "bb1", pinId: "b7" }, to: { compId: "bb1", pinId: "b11" }, color: "#4d5d46" },
          { id: "w4", from: { compId: "dc1", pinId: "pos" }, to: { compId: "bb1", pinId: "j7" }, color: "#8c4a3c" },
          { id: "w5", from: { compId: "dc1", pinId: "neg" }, to: { compId: "bb1", pinId: "bn_6" }, color: "#27272a" },
          { id: "w6", from: { compId: "bb1", pinId: "j11" }, to: { compId: "bb1", pinId: "bn_11" }, color: "#27272a" },
          { id: "w7", from: { compId: "sc1", pinId: "ch1_pos" }, to: { compId: "bb1", pinId: "b3" }, color: "#475569" },
          { id: "w8", from: { compId: "sc1", pinId: "ch1_neg" }, to: { compId: "bb1", pinId: "bn_14" }, color: "#78716c" },
          { id: "w9", from: { compId: "sc1", pinId: "ch2_pos" }, to: { compId: "bb1", pinId: "a11" }, color: "#4d5d46" },
          { id: "w10", from: { compId: "sc1", pinId: "ch2_neg" }, to: { compId: "bb1", pinId: "bn_16" }, color: "#78716c" },
        ],
      },
    ],
  },
];
