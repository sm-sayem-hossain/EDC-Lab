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
  // EXP 02: I-V Characteristics of PN Junction Diode (Step-by-Step Build)
  // =========================================================================
  {
    id: "exp-2",
    number: "02",
    shortTitle: "Diode I-V Curve",
    title: "I-V Characteristics of PN Junction Diode",
    objective:
      "Build the forward and reverse bias diode circuits step by step on a breadboard using a 1 kOhm resistor, 1N4007 PN junction diode, DC power supply, and voltmeters to record Vd, VR, and Id = VR / R.",
    steps: [
      {
        id: "exp2-s1",
        title: "Step 1: Gather Components & Instruments",
        instruction:
          "Place the Breadboard, 1 kOhm Resistor, 1N4007 PN Junction Diode, DC Power Supply, and two Multimeters (Voltmeter mode) on the bench.",
        observation:
          "Preparation complete. Next, we will mount the 1 kOhm resistor onto the breadboard.",
        components: [
          BASE_BB,
          { id: "dc1", type: "dc-supply", x: 16, y: 40, rotation: 0, props: { voltage: 0 } },
          { id: "mm_vr", type: "multimeter", x: 204, y: 32, rotation: 0, props: { mode: "voltage" } },
          { id: "mm_vd", type: "multimeter", x: 432, y: 32, rotation: 0, props: { mode: "voltage" } },
          { id: "r1", type: "resistor", x: 40, y: 240, rotation: 0, props: { resistance: 1000 } },
          { id: "d1", type: "diode", x: 40, y: 300, rotation: 0, props: { material: "si" } },
        ],
        wires: [],
      },
      {
        id: "exp2-s2",
        title: "Step 2: Place 1 kOhm Resistor on Breadboard",
        instruction:
          "Insert the 1 kOhm limiting resistor horizontally across breadboard columns 3 to 8 on row C.",
        observation:
          "Terminal 1 sits in column 3 and Terminal 2 sits in column 8.",
        components: [
          BASE_BB,
          { id: "dc1", type: "dc-supply", x: 16, y: 40, rotation: 0, props: { voltage: 0 } },
          { id: "mm_vr", type: "multimeter", x: 204, y: 32, rotation: 0, props: { mode: "voltage" } },
          { id: "mm_vd", type: "multimeter", x: 432, y: 32, rotation: 0, props: { mode: "voltage" } },
          placeOnBB("r1", "resistor", 3, 298, 0, { resistance: 1000 }),
          { id: "d1", type: "diode", x: 40, y: 300, rotation: 0, props: { material: "si" } },
        ],
        wires: [],
      },
      {
        id: "exp2-s3",
        title: "Step 3: Connect PN Junction Diode (Forward Bias)",
        instruction:
          "Insert the 1N4007 Diode across columns 8 to 13 on row C so its Anode (P, plain side) joins the resistor at column 8 and its Cathode (N, banded side) sits at column 13. Run a black wire from e13 to the bottom (-) rail.",
        observation:
          "The resistor and diode are now in series on the breadboard for forward bias.",
        components: [
          BASE_BB,
          { id: "dc1", type: "dc-supply", x: 16, y: 40, rotation: 0, props: { voltage: 0 } },
          { id: "mm_vr", type: "multimeter", x: 204, y: 32, rotation: 0, props: { mode: "voltage" } },
          { id: "mm_vd", type: "multimeter", x: 432, y: 32, rotation: 0, props: { mode: "voltage" } },
          placeOnBB("r1", "resistor", 3, 298, 0, { resistance: 1000 }),
          placeOnBB("d1", "diode", 8, 298, 0, { material: "si" }),
        ],
        wires: [
          { id: "w3", from: { compId: "bb1", pinId: "b13" }, to: { compId: "bb1", pinId: "tn_13" }, color: "#18181b" },
        ],
      },
      {
        id: "exp2-s4",
        title: "Step 4: Wire Supply & Voltmeters (0.1 V Forward)",
        instruction:
          "Connect Power Supply (+) with a red wire to a3, Power Supply (-) with a black wire to the bottom (-) rail, Voltmeter 1 across R (b3 to b8) for VR, and Voltmeter 2 across Diode (a8 to a13) for Vd. Set supply to 0.1 V.",
        observation:
          "At Vdc = 0.1 V (below threshold), Vd ~ 0.10 V and VR = 0.00 V, so Id = VR / R = 0.00 mA.",
        components: [
          BASE_BB,
          { id: "dc1", type: "dc-supply", x: 16, y: 40, rotation: 0, props: { voltage: 0.1 } },
          { id: "mm_vr", type: "multimeter", x: 204, y: 32, rotation: 0, props: { mode: "voltage" } },
          { id: "mm_vd", type: "multimeter", x: 432, y: 32, rotation: 0, props: { mode: "voltage" } },
          placeOnBB("r1", "resistor", 3, 298, 0, { resistance: 1000 }),
          placeOnBB("d1", "diode", 8, 298, 0, { material: "si" }),
        ],
        wires: [
          { id: "w1", from: { compId: "dc1", pinId: "pos" }, to: { compId: "bb1", pinId: "a3" }, color: "#b91c1c" },
          { id: "w2", from: { compId: "dc1", pinId: "neg" }, to: { compId: "bb1", pinId: "tn_2" }, color: "#18181b" },
          { id: "w3", from: { compId: "bb1", pinId: "b13" }, to: { compId: "bb1", pinId: "tn_13" }, color: "#18181b" },
          { id: "w4", from: { compId: "mm_vr", pinId: "pos" }, to: { compId: "bb1", pinId: "b3" }, color: "#b91c1c" },
          { id: "w5", from: { compId: "mm_vr", pinId: "neg" }, to: { compId: "bb1", pinId: "b8" }, color: "#475569" },
          { id: "w6", from: { compId: "mm_vd", pinId: "pos" }, to: { compId: "bb1", pinId: "a8" }, color: "#4d5d46" },
          { id: "w7", from: { compId: "mm_vd", pinId: "neg" }, to: { compId: "bb1", pinId: "a13" }, color: "#18181b" },
        ],
      },
      {
        id: "exp2-s5",
        title: "Step 5: Forward Reading at 0.5 V",
        instruction:
          "Set the DC Power Supply to 0.5 V and measure Vd and VR on the two voltmeters.",
        observation:
          "Table 1 (0.5 V): Vd ~ 0.42 V (PDF: 0.445 V), VR ~ 0.08 V (PDF: 62.4 mV), Id = VR / 1k ~ 0.08 mA.",
        components: [
          BASE_BB,
          { id: "dc1", type: "dc-supply", x: 16, y: 40, rotation: 0, props: { voltage: 0.5 } },
          { id: "mm_vr", type: "multimeter", x: 204, y: 32, rotation: 0, props: { mode: "voltage" } },
          { id: "mm_vd", type: "multimeter", x: 432, y: 32, rotation: 0, props: { mode: "voltage" } },
          placeOnBB("r1", "resistor", 3, 298, 0, { resistance: 1000 }),
          placeOnBB("d1", "diode", 8, 298, 0, { material: "si" }),
        ],
        wires: [
          { id: "w1", from: { compId: "dc1", pinId: "pos" }, to: { compId: "bb1", pinId: "a3" }, color: "#b91c1c" },
          { id: "w2", from: { compId: "dc1", pinId: "neg" }, to: { compId: "bb1", pinId: "tn_2" }, color: "#18181b" },
          { id: "w3", from: { compId: "bb1", pinId: "b13" }, to: { compId: "bb1", pinId: "tn_13" }, color: "#18181b" },
          { id: "w4", from: { compId: "mm_vr", pinId: "pos" }, to: { compId: "bb1", pinId: "b3" }, color: "#b91c1c" },
          { id: "w5", from: { compId: "mm_vr", pinId: "neg" }, to: { compId: "bb1", pinId: "b8" }, color: "#475569" },
          { id: "w6", from: { compId: "mm_vd", pinId: "pos" }, to: { compId: "bb1", pinId: "a8" }, color: "#4d5d46" },
          { id: "w7", from: { compId: "mm_vd", pinId: "neg" }, to: { compId: "bb1", pinId: "a13" }, color: "#18181b" },
        ],
      },
      {
        id: "exp2-s6",
        title: "Step 6: Forward Reading at 1.0 V",
        instruction:
          "Increase DC Power Supply to 1.0 V and record Vd, VR, and Id = VR / R.",
        observation:
          "Table 1 (1.0 V): Vd ~ 0.51 V (PDF: 0.512 V), VR ~ 0.50 V (PDF: 0.533 V), Id ~ 0.50 mA.",
        components: [
          BASE_BB,
          { id: "dc1", type: "dc-supply", x: 16, y: 40, rotation: 0, props: { voltage: 1.0 } },
          { id: "mm_vr", type: "multimeter", x: 204, y: 32, rotation: 0, props: { mode: "voltage" } },
          { id: "mm_vd", type: "multimeter", x: 432, y: 32, rotation: 0, props: { mode: "voltage" } },
          placeOnBB("r1", "resistor", 3, 298, 0, { resistance: 1000 }),
          placeOnBB("d1", "diode", 8, 298, 0, { material: "si" }),
        ],
        wires: [
          { id: "w1", from: { compId: "dc1", pinId: "pos" }, to: { compId: "bb1", pinId: "a3" }, color: "#b91c1c" },
          { id: "w2", from: { compId: "dc1", pinId: "neg" }, to: { compId: "bb1", pinId: "tn_2" }, color: "#18181b" },
          { id: "w3", from: { compId: "bb1", pinId: "b13" }, to: { compId: "bb1", pinId: "tn_13" }, color: "#18181b" },
          { id: "w4", from: { compId: "mm_vr", pinId: "pos" }, to: { compId: "bb1", pinId: "b3" }, color: "#b91c1c" },
          { id: "w5", from: { compId: "mm_vr", pinId: "neg" }, to: { compId: "bb1", pinId: "b8" }, color: "#475569" },
          { id: "w6", from: { compId: "mm_vd", pinId: "pos" }, to: { compId: "bb1", pinId: "a8" }, color: "#4d5d46" },
          { id: "w7", from: { compId: "mm_vd", pinId: "neg" }, to: { compId: "bb1", pinId: "a13" }, color: "#18181b" },
        ],
      },
      {
        id: "exp2-s7",
        title: "Step 7: Forward Reading at 2.0 V",
        instruction:
          "Increase DC Power Supply to 2.0 V and measure Vd and VR.",
        observation:
          "Table 1 (2.0 V): Vd ~ 0.55 V (PDF: 0.524 V), VR ~ 1.45 V (PDF: 1.428 V), Id ~ 1.45 mA.",
        components: [
          BASE_BB,
          { id: "dc1", type: "dc-supply", x: 16, y: 40, rotation: 0, props: { voltage: 2.0 } },
          { id: "mm_vr", type: "multimeter", x: 204, y: 32, rotation: 0, props: { mode: "voltage" } },
          { id: "mm_vd", type: "multimeter", x: 432, y: 32, rotation: 0, props: { mode: "voltage" } },
          placeOnBB("r1", "resistor", 3, 298, 0, { resistance: 1000 }),
          placeOnBB("d1", "diode", 8, 298, 0, { material: "si" }),
        ],
        wires: [
          { id: "w1", from: { compId: "dc1", pinId: "pos" }, to: { compId: "bb1", pinId: "a3" }, color: "#b91c1c" },
          { id: "w2", from: { compId: "dc1", pinId: "neg" }, to: { compId: "bb1", pinId: "tn_2" }, color: "#18181b" },
          { id: "w3", from: { compId: "bb1", pinId: "b13" }, to: { compId: "bb1", pinId: "tn_13" }, color: "#18181b" },
          { id: "w4", from: { compId: "mm_vr", pinId: "pos" }, to: { compId: "bb1", pinId: "b3" }, color: "#b91c1c" },
          { id: "w5", from: { compId: "mm_vr", pinId: "neg" }, to: { compId: "bb1", pinId: "b8" }, color: "#475569" },
          { id: "w6", from: { compId: "mm_vd", pinId: "pos" }, to: { compId: "bb1", pinId: "a8" }, color: "#4d5d46" },
          { id: "w7", from: { compId: "mm_vd", pinId: "neg" }, to: { compId: "bb1", pinId: "a13" }, color: "#18181b" },
        ],
      },
      {
        id: "exp2-s8",
        title: "Step 8: Forward Reading at 3.0 V (Table 1)",
        instruction:
          "Increase DC Power Supply to 3.0 V to complete Table 1. Notice Vd stays near ~0.6 V while VR (and Id) rises linearly.",
        observation:
          "Table 1 (3.0 V): Vd ~ 0.58 V (PDF: 0.602 V), VR ~ 2.42 V (PDF: 2.408 V), Id ~ 2.42 mA.",
        components: [
          BASE_BB,
          { id: "dc1", type: "dc-supply", x: 16, y: 40, rotation: 0, props: { voltage: 3.0 } },
          { id: "mm_vr", type: "multimeter", x: 204, y: 32, rotation: 0, props: { mode: "voltage" } },
          { id: "mm_vd", type: "multimeter", x: 432, y: 32, rotation: 0, props: { mode: "voltage" } },
          placeOnBB("r1", "resistor", 3, 298, 0, { resistance: 1000 }),
          placeOnBB("d1", "diode", 8, 298, 0, { material: "si" }),
        ],
        wires: [
          { id: "w1", from: { compId: "dc1", pinId: "pos" }, to: { compId: "bb1", pinId: "a3" }, color: "#b91c1c" },
          { id: "w2", from: { compId: "dc1", pinId: "neg" }, to: { compId: "bb1", pinId: "tn_2" }, color: "#18181b" },
          { id: "w3", from: { compId: "bb1", pinId: "b13" }, to: { compId: "bb1", pinId: "tn_13" }, color: "#18181b" },
          { id: "w4", from: { compId: "mm_vr", pinId: "pos" }, to: { compId: "bb1", pinId: "b3" }, color: "#b91c1c" },
          { id: "w5", from: { compId: "mm_vr", pinId: "neg" }, to: { compId: "bb1", pinId: "b8" }, color: "#475569" },
          { id: "w6", from: { compId: "mm_vd", pinId: "pos" }, to: { compId: "bb1", pinId: "a8" }, color: "#4d5d46" },
          { id: "w7", from: { compId: "mm_vd", pinId: "neg" }, to: { compId: "bb1", pinId: "a13" }, color: "#18181b" },
        ],
      },
      {
        id: "exp2-s9",
        title: "Step 9: Reverse Bias Circuit (0.1 V)",
        instruction:
          "Flip the 1N4007 Diode 180 degrees so its Cathode (banded side) faces the 1 kOhm resistor at column 8 and its Anode connects to supply (-) at column 13. Set supply to 0.1 V.",
        observation:
          "Table 2 (0.1 V Reverse): Diode blocks current. Vd = 0.10 V, VR = 0.00 V, Id = 0.00 mA.",
        components: [
          BASE_BB,
          { id: "dc1", type: "dc-supply", x: 16, y: 40, rotation: 0, props: { voltage: 0.1 } },
          { id: "mm_vr", type: "multimeter", x: 204, y: 32, rotation: 0, props: { mode: "voltage" } },
          { id: "mm_vd", type: "multimeter", x: 432, y: 32, rotation: 0, props: { mode: "voltage" } },
          placeOnBB("r1", "resistor", 3, 298, 0, { resistance: 1000 }),
          placeOnBB("d1", "diode", 8, 298, 180, { material: "si" }),
        ],
        wires: [
          { id: "w1", from: { compId: "dc1", pinId: "pos" }, to: { compId: "bb1", pinId: "a3" }, color: "#b91c1c" },
          { id: "w2", from: { compId: "dc1", pinId: "neg" }, to: { compId: "bb1", pinId: "tn_2" }, color: "#18181b" },
          { id: "w3", from: { compId: "bb1", pinId: "b13" }, to: { compId: "bb1", pinId: "tn_13" }, color: "#18181b" },
          { id: "w4", from: { compId: "mm_vr", pinId: "pos" }, to: { compId: "bb1", pinId: "b3" }, color: "#b91c1c" },
          { id: "w5", from: { compId: "mm_vr", pinId: "neg" }, to: { compId: "bb1", pinId: "b8" }, color: "#475569" },
          { id: "w6", from: { compId: "mm_vd", pinId: "pos" }, to: { compId: "bb1", pinId: "a8" }, color: "#4d5d46" },
          { id: "w7", from: { compId: "mm_vd", pinId: "neg" }, to: { compId: "bb1", pinId: "a13" }, color: "#18181b" },
        ],
      },
      {
        id: "exp2-s10",
        title: "Step 10: Reverse Reading Sweep up to 3.0 V (Table 2)",
        instruction:
          "Click the DC Power Supply and step through 0.5 V, 1.0 V, 2.0 V, and 3.0 V to complete Table 2.",
        observation:
          "Table 2 (3.0 V Reverse): Full supply voltage drops across the diode (Vd = 3.00 V) while VR = 0.00 V and Id = 0.00 mA.",
        components: [
          BASE_BB,
          { id: "dc1", type: "dc-supply", x: 16, y: 40, rotation: 0, props: { voltage: 3.0 } },
          { id: "mm_vr", type: "multimeter", x: 204, y: 32, rotation: 0, props: { mode: "voltage" } },
          { id: "mm_vd", type: "multimeter", x: 432, y: 32, rotation: 0, props: { mode: "voltage" } },
          placeOnBB("r1", "resistor", 3, 298, 0, { resistance: 1000 }),
          placeOnBB("d1", "diode", 8, 298, 180, { material: "si" }),
        ],
        wires: [
          { id: "w1", from: { compId: "dc1", pinId: "pos" }, to: { compId: "bb1", pinId: "a3" }, color: "#b91c1c" },
          { id: "w2", from: { compId: "dc1", pinId: "neg" }, to: { compId: "bb1", pinId: "tn_2" }, color: "#18181b" },
          { id: "w3", from: { compId: "bb1", pinId: "b13" }, to: { compId: "bb1", pinId: "tn_13" }, color: "#18181b" },
          { id: "w4", from: { compId: "mm_vr", pinId: "pos" }, to: { compId: "bb1", pinId: "b3" }, color: "#b91c1c" },
          { id: "w5", from: { compId: "mm_vr", pinId: "neg" }, to: { compId: "bb1", pinId: "b8" }, color: "#475569" },
          { id: "w6", from: { compId: "mm_vd", pinId: "pos" }, to: { compId: "bb1", pinId: "a8" }, color: "#4d5d46" },
          { id: "w7", from: { compId: "mm_vd", pinId: "neg" }, to: { compId: "bb1", pinId: "a13" }, color: "#18181b" },
        ],
      },
    ],
  },

  // =========================================================================
  // EXP 03: Study of Zener Diode Applications (Granular Step-by-Step Build)
  // =========================================================================
  {
    id: "exp-3",
    number: "03",
    shortTitle: "Zener Regulator",
    title: "Study of Zener Diode Applications",
    objective:
      "Build the reverse-biased 8.92 V Zener diode circuit step by step on a breadboard with R = 456 Ohm to observe breakdown and voltage regulation.",
    steps: [
      {
        id: "exp3-s1",
        title: "Step 1: Gather Components & Instruments",
        instruction:
          "Place the Breadboard, 456 Ohm Resistor, 8.92 V Zener Diode, DC Power Supply, and two Multimeters (Voltmeters for VR and Vz) on the bench.",
        observation:
          "Preparation complete. Proceed to mount the series resistor on the breadboard.",
        components: [
          BASE_BB,
          { id: "dc1", type: "dc-supply", x: 16, y: 36, rotation: 0, props: { voltage: 0 } },
          { id: "mm_vr", type: "multimeter", x: 256, y: 32, rotation: 0, props: { mode: "voltage" } },
          { id: "mm_vz", type: "multimeter", x: 604, y: 212, rotation: 0, props: { mode: "voltage" } },
          { id: "r1", type: "resistor", x: 40, y: 240, rotation: 0, props: { resistance: 456 } },
          { id: "z1", type: "zener", x: 40, y: 300, rotation: 0, props: { vz: 8.92 } },
        ],
        wires: [],
      },
      {
        id: "exp3-s2",
        title: "Step 2: Place 456 Ohm Series Resistor",
        instruction:
          "Insert the 456 Ohm current-limiting resistor horizontally across columns 3 to 8 on row C.",
        observation:
          "Resistor Terminal 1 is at column 3 and Terminal 2 is at column 8.",
        components: [
          BASE_BB,
          { id: "dc1", type: "dc-supply", x: 16, y: 36, rotation: 0, props: { voltage: 0 } },
          { id: "mm_vr", type: "multimeter", x: 256, y: 32, rotation: 0, props: { mode: "voltage" } },
          { id: "mm_vz", type: "multimeter", x: 604, y: 212, rotation: 0, props: { mode: "voltage" } },
          placeOnBB("r1", "resistor", 3, 298, 0, { resistance: 456 }),
          { id: "z1", type: "zener", x: 40, y: 300, rotation: 0, props: { vz: 8.92 } },
        ],
        wires: [],
      },
      {
        id: "exp3-s3",
        title: "Step 3: Mount Reverse-Biased Zener Diode",
        instruction:
          "Insert the 8.92 V Zener diode vertically at column 8 with Cathode (band) at c8 and Anode at g8. Run a black wire from j8 to the bottom (-) rail.",
        observation:
          "Zener Cathode connects to the resistor at column 8; Anode is grounded.",
        components: [
          BASE_BB,
          { id: "dc1", type: "dc-supply", x: 16, y: 36, rotation: 0, props: { voltage: 0 } },
          { id: "mm_vr", type: "multimeter", x: 256, y: 32, rotation: 0, props: { mode: "voltage" } },
          { id: "mm_vz", type: "multimeter", x: 604, y: 212, rotation: 0, props: { mode: "voltage" } },
          placeOnBB("r1", "resistor", 3, 298, 0, { resistance: 456 }),
          placeOnBB("z1", "zener", 8, 338, 270, { vz: 8.92 }),
        ],
        wires: [
          { id: "w1", from: { compId: "bb1", pinId: "j8" }, to: { compId: "bb1", pinId: "bn_8" }, color: "#18181b" },
        ],
      },
      {
        id: "exp3-s4",
        title: "Step 4: Connect DC Power Supply (5.0 V)",
        instruction:
          "Connect DC Supply (+) with a red wire to a3 and DC Supply (-) with a black wire to the bottom (-) rail (bn_1). Set supply to 5.0 V.",
        observation:
          "Power supply is wired cleanly across the series R-Zener loop.",
        components: [
          BASE_BB,
          { id: "dc1", type: "dc-supply", x: 16, y: 36, rotation: 0, props: { voltage: 5.0 } },
          { id: "mm_vr", type: "multimeter", x: 256, y: 32, rotation: 0, props: { mode: "voltage" } },
          { id: "mm_vz", type: "multimeter", x: 604, y: 212, rotation: 0, props: { mode: "voltage" } },
          placeOnBB("r1", "resistor", 3, 298, 0, { resistance: 456 }),
          placeOnBB("z1", "zener", 8, 338, 270, { vz: 8.92 }),
        ],
        wires: [
          { id: "w1", from: { compId: "bb1", pinId: "j8" }, to: { compId: "bb1", pinId: "bn_8" }, color: "#18181b" },
          { id: "w2", from: { compId: "dc1", pinId: "pos" }, to: { compId: "bb1", pinId: "a3" }, color: "#b91c1c" },
          { id: "w3", from: { compId: "dc1", pinId: "neg" }, to: { compId: "bb1", pinId: "bn_1" }, color: "#18181b" },
        ],
      },
      {
        id: "exp3-s5",
        title: "Step 5: Connect Voltmeter 1 Across Resistor (VR)",
        instruction:
          "Connect Voltmeter 1 (+) with a red wire to b3 and (-) with a black wire to b8 to measure VR (Iz = VR / 456 Ohm).",
        observation:
          "At Vin = 5.0 V (below 8.92 V breakdown), VR reads 0.00 V, meaning Iz = 0 mA.",
        components: [
          BASE_BB,
          { id: "dc1", type: "dc-supply", x: 16, y: 36, rotation: 0, props: { voltage: 5.0 } },
          { id: "mm_vr", type: "multimeter", x: 256, y: 32, rotation: 0, props: { mode: "voltage" } },
          { id: "mm_vz", type: "multimeter", x: 604, y: 212, rotation: 0, props: { mode: "voltage" } },
          placeOnBB("r1", "resistor", 3, 298, 0, { resistance: 456 }),
          placeOnBB("z1", "zener", 8, 338, 270, { vz: 8.92 }),
        ],
        wires: [
          { id: "w1", from: { compId: "bb1", pinId: "j8" }, to: { compId: "bb1", pinId: "bn_8" }, color: "#18181b" },
          { id: "w2", from: { compId: "dc1", pinId: "pos" }, to: { compId: "bb1", pinId: "a3" }, color: "#b91c1c" },
          { id: "w3", from: { compId: "dc1", pinId: "neg" }, to: { compId: "bb1", pinId: "bn_1" }, color: "#18181b" },
          { id: "w4", from: { compId: "mm_vr", pinId: "pos" }, to: { compId: "bb1", pinId: "b3" }, color: "#b91c1c" },
          { id: "w5", from: { compId: "mm_vr", pinId: "neg" }, to: { compId: "bb1", pinId: "b8" }, color: "#18181b" },
        ],
      },
      {
        id: "exp3-s6",
        title: "Step 6: Connect Voltmeter 2 Across Zener (5.0 V)",
        instruction:
          "Connect Voltmeter 2 (+) with a red wire to a8 and (-) with a black wire to the ground rail (bn_14).",
        observation:
          "Table reading (Vin = 5.0 V): Vz = 5.00 V, VR = 0.00 V, Iz = 0.00 mA (reverse blocking state).",
        components: [
          BASE_BB,
          { id: "dc1", type: "dc-supply", x: 16, y: 36, rotation: 0, props: { voltage: 5.0 } },
          { id: "mm_vr", type: "multimeter", x: 256, y: 32, rotation: 0, props: { mode: "voltage" } },
          { id: "mm_vz", type: "multimeter", x: 604, y: 212, rotation: 0, props: { mode: "voltage" } },
          placeOnBB("r1", "resistor", 3, 298, 0, { resistance: 456 }),
          placeOnBB("z1", "zener", 8, 338, 270, { vz: 8.92 }),
        ],
        wires: [
          { id: "w1", from: { compId: "bb1", pinId: "j8" }, to: { compId: "bb1", pinId: "bn_8" }, color: "#18181b" },
          { id: "w2", from: { compId: "dc1", pinId: "pos" }, to: { compId: "bb1", pinId: "a3" }, color: "#b91c1c" },
          { id: "w3", from: { compId: "dc1", pinId: "neg" }, to: { compId: "bb1", pinId: "bn_1" }, color: "#18181b" },
          { id: "w4", from: { compId: "mm_vr", pinId: "pos" }, to: { compId: "bb1", pinId: "b3" }, color: "#b91c1c" },
          { id: "w5", from: { compId: "mm_vr", pinId: "neg" }, to: { compId: "bb1", pinId: "b8" }, color: "#18181b" },
          { id: "w6", from: { compId: "mm_vz", pinId: "pos" }, to: { compId: "bb1", pinId: "a8" }, color: "#b91c1c" },
          { id: "w7", from: { compId: "mm_vz", pinId: "neg" }, to: { compId: "bb1", pinId: "bn_14" }, color: "#18181b" },
        ],
      },
      {
        id: "exp3-s7",
        title: "Step 7: Breakdown Threshold (Vin = 9.0 V)",
        instruction:
          "Raise DC Power Supply to 9.0 V and observe both voltmeters as the Zener reaches breakdown.",
        observation:
          "Table reading (9.0 V): Vz clamps near 8.87 V (PDF: 8.92 V) and VR rises to ~0.13 V (Iz ~ 0.28 mA).",
        components: [
          BASE_BB,
          { id: "dc1", type: "dc-supply", x: 16, y: 36, rotation: 0, props: { voltage: 9.0 } },
          { id: "mm_vr", type: "multimeter", x: 256, y: 32, rotation: 0, props: { mode: "voltage" } },
          { id: "mm_vz", type: "multimeter", x: 604, y: 212, rotation: 0, props: { mode: "voltage" } },
          placeOnBB("r1", "resistor", 3, 298, 0, { resistance: 456 }),
          placeOnBB("z1", "zener", 8, 338, 270, { vz: 8.92 }),
        ],
        wires: [
          { id: "w1", from: { compId: "bb1", pinId: "j8" }, to: { compId: "bb1", pinId: "bn_8" }, color: "#18181b" },
          { id: "w2", from: { compId: "dc1", pinId: "pos" }, to: { compId: "bb1", pinId: "a3" }, color: "#b91c1c" },
          { id: "w3", from: { compId: "dc1", pinId: "neg" }, to: { compId: "bb1", pinId: "bn_1" }, color: "#18181b" },
          { id: "w4", from: { compId: "mm_vr", pinId: "pos" }, to: { compId: "bb1", pinId: "b3" }, color: "#b91c1c" },
          { id: "w5", from: { compId: "mm_vr", pinId: "neg" }, to: { compId: "bb1", pinId: "b8" }, color: "#18181b" },
          { id: "w6", from: { compId: "mm_vz", pinId: "pos" }, to: { compId: "bb1", pinId: "a8" }, color: "#b91c1c" },
          { id: "w7", from: { compId: "mm_vz", pinId: "neg" }, to: { compId: "bb1", pinId: "bn_14" }, color: "#18181b" },
        ],
      },
      {
        id: "exp3-s8",
        title: "Step 8: Active Regulation (Vin = 12.0 V)",
        instruction:
          "Increase DC Power Supply to 12.0 V and check VR and Vz.",
        observation:
          "Table reading (12.0 V): Vz remains steady near 8.89 V while VR rises to ~3.11 V (Iz ~ 6.82 mA).",
        components: [
          BASE_BB,
          { id: "dc1", type: "dc-supply", x: 16, y: 36, rotation: 0, props: { voltage: 12.0 } },
          { id: "mm_vr", type: "multimeter", x: 256, y: 32, rotation: 0, props: { mode: "voltage" } },
          { id: "mm_vz", type: "multimeter", x: 604, y: 212, rotation: 0, props: { mode: "voltage" } },
          placeOnBB("r1", "resistor", 3, 298, 0, { resistance: 456 }),
          placeOnBB("z1", "zener", 8, 338, 270, { vz: 8.92 }),
        ],
        wires: [
          { id: "w1", from: { compId: "bb1", pinId: "j8" }, to: { compId: "bb1", pinId: "bn_8" }, color: "#18181b" },
          { id: "w2", from: { compId: "dc1", pinId: "pos" }, to: { compId: "bb1", pinId: "a3" }, color: "#b91c1c" },
          { id: "w3", from: { compId: "dc1", pinId: "neg" }, to: { compId: "bb1", pinId: "bn_1" }, color: "#18181b" },
          { id: "w4", from: { compId: "mm_vr", pinId: "pos" }, to: { compId: "bb1", pinId: "b3" }, color: "#b91c1c" },
          { id: "w5", from: { compId: "mm_vr", pinId: "neg" }, to: { compId: "bb1", pinId: "b8" }, color: "#18181b" },
          { id: "w6", from: { compId: "mm_vz", pinId: "pos" }, to: { compId: "bb1", pinId: "a8" }, color: "#b91c1c" },
          { id: "w7", from: { compId: "mm_vz", pinId: "neg" }, to: { compId: "bb1", pinId: "bn_14" }, color: "#18181b" },
        ],
      },
      {
        id: "exp3-s9",
        title: "Step 9: High Input (Vin = 15.0 V)",
        instruction:
          "Raise DC Power Supply to 15.0 V to complete the Zener I-V table.",
        observation:
          "Table reading (15.0 V): Vz holds at ~8.92 V (PDF: 9.23 V) while VR absorbs the increase (~6.08 V, Iz ~ 13.3 mA).",
        components: [
          BASE_BB,
          { id: "dc1", type: "dc-supply", x: 16, y: 36, rotation: 0, props: { voltage: 15.0 } },
          { id: "mm_vr", type: "multimeter", x: 256, y: 32, rotation: 0, props: { mode: "voltage" } },
          { id: "mm_vz", type: "multimeter", x: 604, y: 212, rotation: 0, props: { mode: "voltage" } },
          placeOnBB("r1", "resistor", 3, 298, 0, { resistance: 456 }),
          placeOnBB("z1", "zener", 8, 338, 270, { vz: 8.92 }),
        ],
        wires: [
          { id: "w1", from: { compId: "bb1", pinId: "j8" }, to: { compId: "bb1", pinId: "bn_8" }, color: "#18181b" },
          { id: "w2", from: { compId: "dc1", pinId: "pos" }, to: { compId: "bb1", pinId: "a3" }, color: "#b91c1c" },
          { id: "w3", from: { compId: "dc1", pinId: "neg" }, to: { compId: "bb1", pinId: "bn_1" }, color: "#18181b" },
          { id: "w4", from: { compId: "mm_vr", pinId: "pos" }, to: { compId: "bb1", pinId: "b3" }, color: "#b91c1c" },
          { id: "w5", from: { compId: "mm_vr", pinId: "neg" }, to: { compId: "bb1", pinId: "b8" }, color: "#18181b" },
          { id: "w6", from: { compId: "mm_vz", pinId: "pos" }, to: { compId: "bb1", pinId: "a8" }, color: "#b91c1c" },
          { id: "w7", from: { compId: "mm_vz", pinId: "neg" }, to: { compId: "bb1", pinId: "bn_14" }, color: "#18181b" },
        ],
      },
      {
        id: "exp3-s10",
        title: "Step 10: Loaded Voltage Regulator (Add 10 kOhm RL)",
        instruction:
          "Place a 10 kOhm load resistor RL vertically at column 11 (`b8 -> b11` red jumper, `j11 -> bn_11` black wire) in parallel with the Zener and measure Vout at a11.",
        observation:
          "Even with RL connected, output voltage across the load stays regulated at ~8.92 V.",
        components: [
          BASE_BB,
          { id: "dc1", type: "dc-supply", x: 16, y: 36, rotation: 0, props: { voltage: 15.0 } },
          { id: "mm_vr", type: "multimeter", x: 256, y: 32, rotation: 0, props: { mode: "voltage" } },
          { id: "mm_vz", type: "multimeter", x: 604, y: 212, rotation: 0, props: { mode: "voltage" } },
          placeOnBB("r1", "resistor", 3, 298, 0, { resistance: 456 }),
          placeOnBB("z1", "zener", 8, 338, 270, { vz: 8.92 }),
          placeOnBB("rl", "resistor", 11, 338, 90, { resistance: 10000 }),
        ],
        wires: [
          { id: "w1", from: { compId: "bb1", pinId: "j8" }, to: { compId: "bb1", pinId: "bn_8" }, color: "#18181b" },
          { id: "w2", from: { compId: "dc1", pinId: "pos" }, to: { compId: "bb1", pinId: "a3" }, color: "#b91c1c" },
          { id: "w3", from: { compId: "dc1", pinId: "neg" }, to: { compId: "bb1", pinId: "bn_1" }, color: "#18181b" },
          { id: "w4", from: { compId: "mm_vr", pinId: "pos" }, to: { compId: "bb1", pinId: "b3" }, color: "#b91c1c" },
          { id: "w5", from: { compId: "mm_vr", pinId: "neg" }, to: { compId: "bb1", pinId: "b8" }, color: "#18181b" },
          { id: "w6", from: { compId: "bb1", pinId: "b8" }, to: { compId: "bb1", pinId: "b11" }, color: "#b91c1c" },
          { id: "w7", from: { compId: "bb1", pinId: "j11" }, to: { compId: "bb1", pinId: "bn_11" }, color: "#18181b" },
          { id: "w8", from: { compId: "mm_vz", pinId: "pos" }, to: { compId: "bb1", pinId: "a11" }, color: "#b91c1c" },
          { id: "w9", from: { compId: "mm_vz", pinId: "neg" }, to: { compId: "bb1", pinId: "bn_14" }, color: "#18181b" },
        ],
      },
    ],
  },

  // =========================================================================
  // EXP 04: Half-Wave Diode Rectifier (Granular Step-by-Step Build)
  // =========================================================================
  {
    id: "exp-4",
    number: "04",
    shortTitle: "Half-Wave Rectifier",
    title: "Study of a Half-Wave Diode Rectifier Circuit",
    objective:
      "Build a 1N4007 half-wave rectifier step by step on the breadboard, wire Function Generator and Oscilloscope probes with clear polarity, and test Unfiltered, 1 uF, 10 uF, and 47 uF filtering.",
    steps: [
      {
        id: "exp4-s1",
        title: "Step 1: Gather Components & Instruments",
        instruction:
          "Place the Breadboard, Function Generator (19 Vpp, 1 kHz Sine), Oscilloscope, 1N4007 Diode, and 1 kOhm Load Resistor on the bench.",
        observation:
          "Preparation complete. Next, mount the diode and load resistor on the breadboard.",
        components: [
          BASE_BB,
          { id: "fg1", type: "func-gen", x: 16, y: 24, rotation: 0, props: { waveform: "sine", vpp: 19, freq: 1000 } },
          { id: "sc1", type: "oscilloscope", x: 608, y: 24, rotation: 0, props: {} },
          { id: "d1", type: "diode", x: 40, y: 240, rotation: 0, props: { material: "si" } },
          { id: "rl", type: "resistor", x: 40, y: 300, rotation: 0, props: { resistance: 1000 } },
        ],
        wires: [],
      },
      {
        id: "exp4-s2",
        title: "Step 2: Mount 1N4007 Diode & 1 kOhm Load",
        instruction:
          "Insert 1N4007 Diode horizontally on row C with Anode (+) at c3 and Cathode (-, silver band) at c8. Place 1 kOhm Load Resistor vertically at column 11 (c11 to g11). Connect b8 to b11 (Red), j11 to bn_11 (Black), and link top (-) rail tn_18 to bottom (-) rail bn_18 (Black).",
        observation:
          "Diode Cathode (-) feeds the top of the 1 kOhm load resistor; bottom of load connects to the shared (-) ground rail.",
        components: [
          BASE_BB,
          { id: "fg1", type: "func-gen", x: 16, y: 24, rotation: 0, props: { waveform: "sine", vpp: 19, freq: 1000 } },
          { id: "sc1", type: "oscilloscope", x: 608, y: 24, rotation: 0, props: {} },
          placeOnBB("d1", "diode", 3, 298, 0, { material: "si" }),
          placeOnBB("rl", "resistor", 11, 338, 90, { resistance: 1000 }),
        ],
        wires: [
          { id: "w1", from: { compId: "bb1", pinId: "b8" }, to: { compId: "bb1", pinId: "b11" }, color: "#b91c1c" },
          { id: "w2", from: { compId: "bb1", pinId: "j11" }, to: { compId: "bb1", pinId: "bn_11" }, color: "#18181b" },
          { id: "w3", from: { compId: "bb1", pinId: "tn_18" }, to: { compId: "bb1", pinId: "bn_18" }, color: "#18181b" },
        ],
      },
      {
        id: "exp4-s3",
        title: "Step 3: Connect Function Generator Wires",
        instruction:
          "Connect Function Generator OUT (+) [Red] to Diode Anode (+) at a3, and OUT (-) [Black] to the top (-) ground rail (tn_2).",
        observation:
          "19 Vpp 1 kHz AC input is now applied across the diode and load resistor.",
        components: [
          BASE_BB,
          { id: "fg1", type: "func-gen", x: 16, y: 24, rotation: 0, props: { waveform: "sine", vpp: 19, freq: 1000 } },
          { id: "sc1", type: "oscilloscope", x: 608, y: 24, rotation: 0, props: {} },
          placeOnBB("d1", "diode", 3, 298, 0, { material: "si" }),
          placeOnBB("rl", "resistor", 11, 338, 90, { resistance: 1000 }),
        ],
        wires: [
          { id: "w1", from: { compId: "bb1", pinId: "b8" }, to: { compId: "bb1", pinId: "b11" }, color: "#b91c1c" },
          { id: "w2", from: { compId: "bb1", pinId: "j11" }, to: { compId: "bb1", pinId: "bn_11" }, color: "#18181b" },
          { id: "w3", from: { compId: "bb1", pinId: "tn_18" }, to: { compId: "bb1", pinId: "bn_18" }, color: "#18181b" },
          { id: "w4", from: { compId: "fg1", pinId: "pos" }, to: { compId: "bb1", pinId: "a3" }, color: "#b91c1c" },
          { id: "w5", from: { compId: "fg1", pinId: "neg" }, to: { compId: "bb1", pinId: "tn_2" }, color: "#18181b" },
        ],
      },
      {
        id: "exp4-s4",
        title: "Step 4: Connect Oscilloscope CH1 (Input Vin)",
        instruction:
          "Connect Oscilloscope CH1 (+) [Red] to Diode Anode (+) at b3, and CH1 GND (-) [Black] to the top (-) rail (tn_14).",
        observation:
          "CH1 now monitors the 19 Vpp (9.5 V peak) input sine wave.",
        components: [
          BASE_BB,
          { id: "fg1", type: "func-gen", x: 16, y: 24, rotation: 0, props: { waveform: "sine", vpp: 19, freq: 1000 } },
          { id: "sc1", type: "oscilloscope", x: 608, y: 24, rotation: 0, props: {} },
          placeOnBB("d1", "diode", 3, 298, 0, { material: "si" }),
          placeOnBB("rl", "resistor", 11, 338, 90, { resistance: 1000 }),
        ],
        wires: [
          { id: "w1", from: { compId: "bb1", pinId: "b8" }, to: { compId: "bb1", pinId: "b11" }, color: "#b91c1c" },
          { id: "w2", from: { compId: "bb1", pinId: "j11" }, to: { compId: "bb1", pinId: "bn_11" }, color: "#18181b" },
          { id: "w3", from: { compId: "bb1", pinId: "tn_18" }, to: { compId: "bb1", pinId: "bn_18" }, color: "#18181b" },
          { id: "w4", from: { compId: "fg1", pinId: "pos" }, to: { compId: "bb1", pinId: "a3" }, color: "#b91c1c" },
          { id: "w5", from: { compId: "fg1", pinId: "neg" }, to: { compId: "bb1", pinId: "tn_2" }, color: "#18181b" },
          { id: "w6", from: { compId: "sc1", pinId: "ch1_pos" }, to: { compId: "bb1", pinId: "b3" }, color: "#b91c1c" },
          { id: "w7", from: { compId: "sc1", pinId: "ch1_neg" }, to: { compId: "bb1", pinId: "tn_14" }, color: "#18181b" },
        ],
      },
      {
        id: "exp4-s5",
        title: "Step 5: Connect Oscilloscope CH2 (Unfiltered Output)",
        instruction:
          "Connect Oscilloscope CH2 (+) [Red] to Load top at a11, and CH2 GND (-) [Black] to the top (-) rail (tn_16). Click 'Open Scope' in the toolbar to view waveforms.",
        observation:
          "Unfiltered output: Only positive half-cycles conduct (Vmax ~ 8.86 V, Vmin = 0 V, Vavg ~ 2.64 V, Ripple ~ 1.28).",
        components: [
          BASE_BB,
          { id: "fg1", type: "func-gen", x: 16, y: 24, rotation: 0, props: { waveform: "sine", vpp: 19, freq: 1000 } },
          { id: "sc1", type: "oscilloscope", x: 608, y: 24, rotation: 0, props: {} },
          placeOnBB("d1", "diode", 3, 298, 0, { material: "si" }),
          placeOnBB("rl", "resistor", 11, 338, 90, { resistance: 1000 }),
        ],
        wires: [
          { id: "w1", from: { compId: "bb1", pinId: "b8" }, to: { compId: "bb1", pinId: "b11" }, color: "#b91c1c" },
          { id: "w2", from: { compId: "bb1", pinId: "j11" }, to: { compId: "bb1", pinId: "bn_11" }, color: "#18181b" },
          { id: "w3", from: { compId: "bb1", pinId: "tn_18" }, to: { compId: "bb1", pinId: "bn_18" }, color: "#18181b" },
          { id: "w4", from: { compId: "fg1", pinId: "pos" }, to: { compId: "bb1", pinId: "a3" }, color: "#b91c1c" },
          { id: "w5", from: { compId: "fg1", pinId: "neg" }, to: { compId: "bb1", pinId: "tn_2" }, color: "#18181b" },
          { id: "w6", from: { compId: "sc1", pinId: "ch1_pos" }, to: { compId: "bb1", pinId: "b3" }, color: "#b91c1c" },
          { id: "w7", from: { compId: "sc1", pinId: "ch1_neg" }, to: { compId: "bb1", pinId: "tn_14" }, color: "#18181b" },
          { id: "w8", from: { compId: "sc1", pinId: "ch2_pos" }, to: { compId: "bb1", pinId: "a11" }, color: "#b91c1c" },
          { id: "w9", from: { compId: "sc1", pinId: "ch2_neg" }, to: { compId: "bb1", pinId: "tn_16" }, color: "#18181b" },
        ],
      },
      {
        id: "exp4-s6",
        title: "Step 6: Add 1 uF Filter Capacitor",
        instruction:
          "Insert a 1 uF Capacitor vertically at column 8 with (+) lead at d8 (Diode Cathode node) and (-) lead at g8. Connect j8 to bn_8 (Black).",
        observation:
          "Sawtooth ripple appears on CH2: Vmin rises to ~4.0 V, Vavg jumps to ~6.26 V, and Ripple drops to ~0.24.",
        components: [
          BASE_BB,
          { id: "fg1", type: "func-gen", x: 16, y: 24, rotation: 0, props: { waveform: "sine", vpp: 19, freq: 1000 } },
          { id: "sc1", type: "oscilloscope", x: 608, y: 24, rotation: 0, props: {} },
          placeOnBB("d1", "diode", 3, 298, 0, { material: "si" }),
          placeOnBB("c1", "capacitor", 8, 346, 90, { capacitance: 1 }),
          placeOnBB("rl", "resistor", 11, 338, 90, { resistance: 1000 }),
        ],
        wires: [
          { id: "w1", from: { compId: "bb1", pinId: "b8" }, to: { compId: "bb1", pinId: "b11" }, color: "#b91c1c" },
          { id: "w2", from: { compId: "bb1", pinId: "j8" }, to: { compId: "bb1", pinId: "bn_8" }, color: "#18181b" },
          { id: "w3", from: { compId: "bb1", pinId: "j11" }, to: { compId: "bb1", pinId: "bn_11" }, color: "#18181b" },
          { id: "w4", from: { compId: "bb1", pinId: "tn_18" }, to: { compId: "bb1", pinId: "bn_18" }, color: "#18181b" },
          { id: "w5", from: { compId: "fg1", pinId: "pos" }, to: { compId: "bb1", pinId: "a3" }, color: "#b91c1c" },
          { id: "w6", from: { compId: "fg1", pinId: "neg" }, to: { compId: "bb1", pinId: "tn_2" }, color: "#18181b" },
          { id: "w7", from: { compId: "sc1", pinId: "ch1_pos" }, to: { compId: "bb1", pinId: "b3" }, color: "#b91c1c" },
          { id: "w8", from: { compId: "sc1", pinId: "ch1_neg" }, to: { compId: "bb1", pinId: "tn_14" }, color: "#18181b" },
          { id: "w9", from: { compId: "sc1", pinId: "ch2_pos" }, to: { compId: "bb1", pinId: "a11" }, color: "#b91c1c" },
          { id: "w10", from: { compId: "sc1", pinId: "ch2_neg" }, to: { compId: "bb1", pinId: "tn_16" }, color: "#18181b" },
        ],
      },
      {
        id: "exp4-s7",
        title: "Step 7: Smooth DC with 10 uF Capacitor",
        instruction:
          "Replace the capacitor at column 8 with a 10 uF Capacitor (+ at d8, - at g8) and check CH2 in the Scope.",
        observation:
          "PDF Table match: Vmax ~ 8.82 V, Vmin ~ 8.06 V, Vavg ~ 8.44 V, Ripple ~ 0.027.",
        components: [
          BASE_BB,
          { id: "fg1", type: "func-gen", x: 16, y: 24, rotation: 0, props: { waveform: "sine", vpp: 19, freq: 1000 } },
          { id: "sc1", type: "oscilloscope", x: 608, y: 24, rotation: 0, props: {} },
          placeOnBB("d1", "diode", 3, 298, 0, { material: "si" }),
          placeOnBB("c1", "capacitor", 8, 346, 90, { capacitance: 10 }),
          placeOnBB("rl", "resistor", 11, 338, 90, { resistance: 1000 }),
        ],
        wires: [
          { id: "w1", from: { compId: "bb1", pinId: "b8" }, to: { compId: "bb1", pinId: "b11" }, color: "#b91c1c" },
          { id: "w2", from: { compId: "bb1", pinId: "j8" }, to: { compId: "bb1", pinId: "bn_8" }, color: "#18181b" },
          { id: "w3", from: { compId: "bb1", pinId: "j11" }, to: { compId: "bb1", pinId: "bn_11" }, color: "#18181b" },
          { id: "w4", from: { compId: "bb1", pinId: "tn_18" }, to: { compId: "bb1", pinId: "bn_18" }, color: "#18181b" },
          { id: "w5", from: { compId: "fg1", pinId: "pos" }, to: { compId: "bb1", pinId: "a3" }, color: "#b91c1c" },
          { id: "w6", from: { compId: "fg1", pinId: "neg" }, to: { compId: "bb1", pinId: "tn_2" }, color: "#18181b" },
          { id: "w7", from: { compId: "sc1", pinId: "ch1_pos" }, to: { compId: "bb1", pinId: "b3" }, color: "#b91c1c" },
          { id: "w8", from: { compId: "sc1", pinId: "ch1_neg" }, to: { compId: "bb1", pinId: "tn_14" }, color: "#18181b" },
          { id: "w9", from: { compId: "sc1", pinId: "ch2_pos" }, to: { compId: "bb1", pinId: "a11" }, color: "#b91c1c" },
          { id: "w10", from: { compId: "sc1", pinId: "ch2_neg" }, to: { compId: "bb1", pinId: "tn_16" }, color: "#18181b" },
        ],
      },
      {
        id: "exp4-s8",
        title: "Step 8: Ultra-Smooth DC with 47 uF Capacitor",
        instruction:
          "Swap to a 47 uF Capacitor (+ at d8, - at g8) for maximum smoothing across the 1 kOhm load.",
        observation:
          "Nearly pure DC output (~8.67 V) with minimal ripple (< 0.01).",
        components: [
          BASE_BB,
          { id: "fg1", type: "func-gen", x: 16, y: 24, rotation: 0, props: { waveform: "sine", vpp: 19, freq: 1000 } },
          { id: "sc1", type: "oscilloscope", x: 608, y: 24, rotation: 0, props: {} },
          placeOnBB("d1", "diode", 3, 298, 0, { material: "si" }),
          placeOnBB("c1", "capacitor", 8, 346, 90, { capacitance: 47 }),
          placeOnBB("rl", "resistor", 11, 338, 90, { resistance: 1000 }),
        ],
        wires: [
          { id: "w1", from: { compId: "bb1", pinId: "b8" }, to: { compId: "bb1", pinId: "b11" }, color: "#b91c1c" },
          { id: "w2", from: { compId: "bb1", pinId: "j8" }, to: { compId: "bb1", pinId: "bn_8" }, color: "#18181b" },
          { id: "w3", from: { compId: "bb1", pinId: "j11" }, to: { compId: "bb1", pinId: "bn_11" }, color: "#18181b" },
          { id: "w4", from: { compId: "bb1", pinId: "tn_18" }, to: { compId: "bb1", pinId: "bn_18" }, color: "#18181b" },
          { id: "w5", from: { compId: "fg1", pinId: "pos" }, to: { compId: "bb1", pinId: "a3" }, color: "#b91c1c" },
          { id: "w6", from: { compId: "fg1", pinId: "neg" }, to: { compId: "bb1", pinId: "tn_2" }, color: "#18181b" },
          { id: "w7", from: { compId: "sc1", pinId: "ch1_pos" }, to: { compId: "bb1", pinId: "b3" }, color: "#b91c1c" },
          { id: "w8", from: { compId: "sc1", pinId: "ch1_neg" }, to: { compId: "bb1", pinId: "tn_14" }, color: "#18181b" },
          { id: "w9", from: { compId: "sc1", pinId: "ch2_pos" }, to: { compId: "bb1", pinId: "a11" }, color: "#b91c1c" },
          { id: "w10", from: { compId: "sc1", pinId: "ch2_neg" }, to: { compId: "bb1", pinId: "tn_16" }, color: "#18181b" },
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
      "Build a 4-diode 1N4007 Bridge Rectifier on the breadboard step by step and compare unfiltered output with 0.47 uF, 10 uF, and 47 uF filter capacitors.",
    steps: [
      // --- Step 1: Gather ---
      {
        id: "exp5-s1",
        title: "Step 1: Gather Components and Instruments",
        instruction:
          "Gather: 4 x 1N4007 diodes (D1-D4), 1 x 1 kOhm resistor, 1 x Function Generator, 1 x Oscilloscope, and connecting wires.",
        observation:
          "All components and instruments are on the bench. The breadboard is empty and ready.",
        components: [
          BASE_BB,
          { id: "fg1", type: "func-gen", x: 16, y: 24, rotation: 0, props: { waveform: "sine", vpp: 20, freq: 1000 } },
          { id: "sc1", type: "oscilloscope", x: 616, y: 24, rotation: 0, props: {} },
        ],
        wires: [],
      },
      // --- Step 2: Place D1 ---
      {
        id: "exp5-s2",
        title: "Step 2: Place D1 (Anode at c3, Cathode at c8)",
        instruction:
          "Insert D1 horizontally across row c, Anode (+) at c3, Cathode (-) at c8. This diode conducts during the positive half-cycle of input A.",
        observation:
          "D1 sits in row c, spanning columns 3 to 8.",
        components: [
          BASE_BB,
          { id: "fg1", type: "func-gen", x: 16, y: 24, rotation: 0, props: { waveform: "sine", vpp: 20, freq: 1000 } },
          { id: "sc1", type: "oscilloscope", x: 616, y: 24, rotation: 0, props: {} },
          placeOnBB("d1", "diode", 3, 298, 0, { material: "si" }),
        ],
        wires: [],
      },
      // --- Step 3: Place D2 ---
      {
        id: "exp5-s3",
        title: "Step 3: Place D2 (Anode at d4, Cathode at d9)",
        instruction:
          "Insert D2 horizontally across row d, Anode (+) at d4, Cathode (-) at d9. This diode conducts during the positive half-cycle of input B.",
        observation:
          "D2 sits in row d, spanning columns 4 to 9.",
        components: [
          BASE_BB,
          { id: "fg1", type: "func-gen", x: 16, y: 24, rotation: 0, props: { waveform: "sine", vpp: 20, freq: 1000 } },
          { id: "sc1", type: "oscilloscope", x: 616, y: 24, rotation: 0, props: {} },
          placeOnBB("d1", "diode", 3, 298, 0, { material: "si" }),
          placeOnBB("d2", "diode", 4, 314, 0, { material: "si" }),
        ],
        wires: [],
      },
      // --- Step 4: Place D3 (reversed) ---
      {
        id: "exp5-s4",
        title: "Step 4: Place D3 Reversed (Cathode at g3, Anode at g8)",
        instruction:
          "Insert D3 horizontally reversed across row g, Cathode (-) at g3, Anode (+) at g8. This diode conducts during the negative half-cycle, routing current upward through the load.",
        observation:
          "D3 sits in row g, facing the opposite direction of D1.",
        components: [
          BASE_BB,
          { id: "fg1", type: "func-gen", x: 16, y: 24, rotation: 0, props: { waveform: "sine", vpp: 20, freq: 1000 } },
          { id: "sc1", type: "oscilloscope", x: 616, y: 24, rotation: 0, props: {} },
          placeOnBB("d1", "diode", 3, 298, 0, { material: "si" }),
          placeOnBB("d2", "diode", 4, 314, 0, { material: "si" }),
          placeOnBB("d3", "diode", 3, 378, 180, { material: "si" }),
        ],
        wires: [],
      },
      // --- Step 5: Place D4 (reversed) ---
      {
        id: "exp5-s5",
        title: "Step 5: Place D4 Reversed (Cathode at i4, Anode at i9)",
        instruction:
          "Insert D4 horizontally reversed across row i, Cathode (-) at i4, Anode (+) at i9. This completes the 4-diode bridge arrangement.",
        observation:
          "D4 sits in row i, facing the opposite direction of D2. The bridge diamond pattern is now formed.",
        components: [
          BASE_BB,
          { id: "fg1", type: "func-gen", x: 16, y: 24, rotation: 0, props: { waveform: "sine", vpp: 20, freq: 1000 } },
          { id: "sc1", type: "oscilloscope", x: 616, y: 24, rotation: 0, props: {} },
          placeOnBB("d1", "diode", 3, 298, 0, { material: "si" }),
          placeOnBB("d2", "diode", 4, 314, 0, { material: "si" }),
          placeOnBB("d3", "diode", 3, 378, 180, { material: "si" }),
          placeOnBB("d4", "diode", 4, 410, 180, { material: "si" }),
        ],
        wires: [],
      },
      // --- Step 6: Place Load Resistor ---
      {
        id: "exp5-s6",
        title: "Step 6: Place 1 kOhm Load Resistor",
        instruction:
          "Insert the 1 kOhm resistor vertically at column 14. Its top pin (+) is at d14 (output positive node) and its bottom pin (-) is at g14 (output negative node).",
        observation:
          "The load resistor is now in place at column 14. The bridge output will appear across it.",
        components: [
          BASE_BB,
          { id: "fg1", type: "func-gen", x: 16, y: 24, rotation: 0, props: { waveform: "sine", vpp: 20, freq: 1000 } },
          { id: "sc1", type: "oscilloscope", x: 616, y: 24, rotation: 0, props: {} },
          placeOnBB("d1", "diode", 3, 298, 0, { material: "si" }),
          placeOnBB("d2", "diode", 4, 314, 0, { material: "si" }),
          placeOnBB("d3", "diode", 3, 378, 180, { material: "si" }),
          placeOnBB("d4", "diode", 4, 410, 180, { material: "si" }),
          placeOnBB("rl", "resistor", 14, 338, 90, { resistance: 1000 }),
        ],
        wires: [],
      },
      // --- Step 7: Connect bridge internal nodes ---
      {
        id: "exp5-s7",
        title: "Step 7: Join Top Bridge Node and Load Top (Red)",
        instruction:
          "Connect a Red wire from a8 to a9 (joining D1 Cathode and D2 Cathode). Connect another Red wire from b9 to b14 (bringing the positive output node to the load top). These are the positive (+) output rails.",
        observation:
          "The cathodes of D1 and D2 are now shorted together and connected to the top of the load resistor.",
        components: [
          BASE_BB,
          { id: "fg1", type: "func-gen", x: 16, y: 24, rotation: 0, props: { waveform: "sine", vpp: 20, freq: 1000 } },
          { id: "sc1", type: "oscilloscope", x: 616, y: 24, rotation: 0, props: {} },
          placeOnBB("d1", "diode", 3, 298, 0, { material: "si" }),
          placeOnBB("d2", "diode", 4, 314, 0, { material: "si" }),
          placeOnBB("d3", "diode", 3, 378, 180, { material: "si" }),
          placeOnBB("d4", "diode", 4, 410, 180, { material: "si" }),
          placeOnBB("rl", "resistor", 14, 338, 90, { resistance: 1000 }),
        ],
        wires: [
          { id: "w1", from: { compId: "bb1", pinId: "a8" }, to: { compId: "bb1", pinId: "a9" }, color: "#b91c1c" },
          { id: "w2", from: { compId: "bb1", pinId: "b9" }, to: { compId: "bb1", pinId: "b14" }, color: "#b91c1c" },
        ],
      },
      // --- Step 8: Ground bottom nodes ---
      {
        id: "exp5-s8",
        title: "Step 8: Ground Bottom Bridge Nodes and Load (Black)",
        instruction:
          "Connect Black wires: j8 to bn_8 (D3 Cathode to ground), j9 to bn_9 (D4 Cathode to ground), j14 to bn_14 (Load bottom to ground). These are the negative (-) output rails.",
        observation:
          "The cathodes of D3 and D4 and the bottom of the load resistor are all grounded to the bottom (-) rail.",
        components: [
          BASE_BB,
          { id: "fg1", type: "func-gen", x: 16, y: 24, rotation: 0, props: { waveform: "sine", vpp: 20, freq: 1000 } },
          { id: "sc1", type: "oscilloscope", x: 616, y: 24, rotation: 0, props: {} },
          placeOnBB("d1", "diode", 3, 298, 0, { material: "si" }),
          placeOnBB("d2", "diode", 4, 314, 0, { material: "si" }),
          placeOnBB("d3", "diode", 3, 378, 180, { material: "si" }),
          placeOnBB("d4", "diode", 4, 410, 180, { material: "si" }),
          placeOnBB("rl", "resistor", 14, 338, 90, { resistance: 1000 }),
        ],
        wires: [
          { id: "w1", from: { compId: "bb1", pinId: "a8" }, to: { compId: "bb1", pinId: "a9" }, color: "#b91c1c" },
          { id: "w2", from: { compId: "bb1", pinId: "b9" }, to: { compId: "bb1", pinId: "b14" }, color: "#b91c1c" },
          { id: "w3", from: { compId: "bb1", pinId: "j8" }, to: { compId: "bb1", pinId: "bn_8" }, color: "#18181b" },
          { id: "w4", from: { compId: "bb1", pinId: "j9" }, to: { compId: "bb1", pinId: "bn_9" }, color: "#18181b" },
          { id: "w5", from: { compId: "bb1", pinId: "j14" }, to: { compId: "bb1", pinId: "bn_14" }, color: "#18181b" },
        ],
      },
      // --- Step 9: Connect Function Generator ---
      {
        id: "exp5-s9",
        title: "Step 9: Connect Function Generator (AC Input)",
        instruction:
          "Connect Function Generator (+) [Red] to a3 (D1 Anode, input node A). Connect Function Generator (-) [Black] to a4 (D2 Anode, input node B). The bridge receives a 20 Vpp 1 kHz sine wave across these two nodes.",
        observation:
          "The AC input is now fed into the bridge. Node a3 is input A (+) and a4 is input B (-).",
        components: [
          BASE_BB,
          { id: "fg1", type: "func-gen", x: 16, y: 24, rotation: 0, props: { waveform: "sine", vpp: 20, freq: 1000 } },
          { id: "sc1", type: "oscilloscope", x: 616, y: 24, rotation: 0, props: {} },
          placeOnBB("d1", "diode", 3, 298, 0, { material: "si" }),
          placeOnBB("d2", "diode", 4, 314, 0, { material: "si" }),
          placeOnBB("d3", "diode", 3, 378, 180, { material: "si" }),
          placeOnBB("d4", "diode", 4, 410, 180, { material: "si" }),
          placeOnBB("rl", "resistor", 14, 338, 90, { resistance: 1000 }),
        ],
        wires: [
          { id: "w1", from: { compId: "bb1", pinId: "a8" }, to: { compId: "bb1", pinId: "a9" }, color: "#b91c1c" },
          { id: "w2", from: { compId: "bb1", pinId: "b9" }, to: { compId: "bb1", pinId: "b14" }, color: "#b91c1c" },
          { id: "w3", from: { compId: "bb1", pinId: "j8" }, to: { compId: "bb1", pinId: "bn_8" }, color: "#18181b" },
          { id: "w4", from: { compId: "bb1", pinId: "j9" }, to: { compId: "bb1", pinId: "bn_9" }, color: "#18181b" },
          { id: "w5", from: { compId: "bb1", pinId: "j14" }, to: { compId: "bb1", pinId: "bn_14" }, color: "#18181b" },
          { id: "w6", from: { compId: "fg1", pinId: "pos" }, to: { compId: "bb1", pinId: "a3" }, color: "#b91c1c" },
          { id: "w7", from: { compId: "fg1", pinId: "neg" }, to: { compId: "bb1", pinId: "a4" }, color: "#18181b" },
        ],
      },
      // --- Step 10: Connect bridge mid-to-mid jumpers ---
      {
        id: "exp5-s10",
        title: "Step 10: Join Top-to-Bottom Input Nodes (e3 to f3, e4 to f4)",
        instruction:
          "Connect Red wire e3 to f3 (bridging input A across the gap). Connect Black wire e4 to f4 (bridging input B across the gap). This links the top and bottom halves of the bridge for each input node.",
        observation:
          "The AC input now reaches both the top diodes (D1, D2) and the bottom diodes (D3, D4) through the breadboard gap jumpers.",
        components: [
          BASE_BB,
          { id: "fg1", type: "func-gen", x: 16, y: 24, rotation: 0, props: { waveform: "sine", vpp: 20, freq: 1000 } },
          { id: "sc1", type: "oscilloscope", x: 616, y: 24, rotation: 0, props: {} },
          placeOnBB("d1", "diode", 3, 298, 0, { material: "si" }),
          placeOnBB("d2", "diode", 4, 314, 0, { material: "si" }),
          placeOnBB("d3", "diode", 3, 378, 180, { material: "si" }),
          placeOnBB("d4", "diode", 4, 410, 180, { material: "si" }),
          placeOnBB("rl", "resistor", 14, 338, 90, { resistance: 1000 }),
        ],
        wires: [
          { id: "w1", from: { compId: "bb1", pinId: "a8" }, to: { compId: "bb1", pinId: "a9" }, color: "#b91c1c" },
          { id: "w2", from: { compId: "bb1", pinId: "b9" }, to: { compId: "bb1", pinId: "b14" }, color: "#b91c1c" },
          { id: "w3", from: { compId: "bb1", pinId: "j8" }, to: { compId: "bb1", pinId: "bn_8" }, color: "#18181b" },
          { id: "w4", from: { compId: "bb1", pinId: "j9" }, to: { compId: "bb1", pinId: "bn_9" }, color: "#18181b" },
          { id: "w5", from: { compId: "bb1", pinId: "j14" }, to: { compId: "bb1", pinId: "bn_14" }, color: "#18181b" },
          { id: "w6", from: { compId: "fg1", pinId: "pos" }, to: { compId: "bb1", pinId: "a3" }, color: "#b91c1c" },
          { id: "w7", from: { compId: "fg1", pinId: "neg" }, to: { compId: "bb1", pinId: "a4" }, color: "#18181b" },
          { id: "w8", from: { compId: "bb1", pinId: "e3" }, to: { compId: "bb1", pinId: "f3" }, color: "#b91c1c" },
          { id: "w9", from: { compId: "bb1", pinId: "e4" }, to: { compId: "bb1", pinId: "f4" }, color: "#18181b" },
        ],
      },
      // --- Step 11: Connect Oscilloscope CH1 (input) ---
      {
        id: "exp5-s11",
        title: "Step 11: Connect Oscilloscope CH1 (AC Input Monitor)",
        instruction:
          "Connect Oscilloscope CH1 (+) [Red] to c3 (input node A) and CH1 GND (-) [Black] to c4 (input node B). CH1 will show the raw 20 Vpp sine wave input.",
        observation:
          "CH1 now monitors the AC input waveform entering the bridge.",
        components: [
          BASE_BB,
          { id: "fg1", type: "func-gen", x: 16, y: 24, rotation: 0, props: { waveform: "sine", vpp: 20, freq: 1000 } },
          { id: "sc1", type: "oscilloscope", x: 616, y: 24, rotation: 0, props: {} },
          placeOnBB("d1", "diode", 3, 298, 0, { material: "si" }),
          placeOnBB("d2", "diode", 4, 314, 0, { material: "si" }),
          placeOnBB("d3", "diode", 3, 378, 180, { material: "si" }),
          placeOnBB("d4", "diode", 4, 410, 180, { material: "si" }),
          placeOnBB("rl", "resistor", 14, 338, 90, { resistance: 1000 }),
        ],
        wires: [
          { id: "w1", from: { compId: "bb1", pinId: "a8" }, to: { compId: "bb1", pinId: "a9" }, color: "#b91c1c" },
          { id: "w2", from: { compId: "bb1", pinId: "b9" }, to: { compId: "bb1", pinId: "b14" }, color: "#b91c1c" },
          { id: "w3", from: { compId: "bb1", pinId: "j8" }, to: { compId: "bb1", pinId: "bn_8" }, color: "#18181b" },
          { id: "w4", from: { compId: "bb1", pinId: "j9" }, to: { compId: "bb1", pinId: "bn_9" }, color: "#18181b" },
          { id: "w5", from: { compId: "bb1", pinId: "j14" }, to: { compId: "bb1", pinId: "bn_14" }, color: "#18181b" },
          { id: "w6", from: { compId: "fg1", pinId: "pos" }, to: { compId: "bb1", pinId: "a3" }, color: "#b91c1c" },
          { id: "w7", from: { compId: "fg1", pinId: "neg" }, to: { compId: "bb1", pinId: "a4" }, color: "#18181b" },
          { id: "w8", from: { compId: "bb1", pinId: "e3" }, to: { compId: "bb1", pinId: "f3" }, color: "#b91c1c" },
          { id: "w9", from: { compId: "bb1", pinId: "e4" }, to: { compId: "bb1", pinId: "f4" }, color: "#18181b" },
          { id: "w10", from: { compId: "sc1", pinId: "ch1_pos" }, to: { compId: "bb1", pinId: "c3" }, color: "#b91c1c" },
          { id: "w11", from: { compId: "sc1", pinId: "ch1_neg" }, to: { compId: "bb1", pinId: "c4" }, color: "#18181b" },
        ],
      },
      // --- Step 12: Connect Oscilloscope CH2 (output) --- unfiltered reading
      {
        id: "exp5-s12",
        title: "Step 12: Connect Oscilloscope CH2 (Output) - Unfiltered Reading",
        instruction:
          "Connect Oscilloscope CH2 (+) [Red] to a14 (Load top, rectified output +) and CH2 GND (-) [Black] to bn_16 (ground rail). Click 'Open Scope' to observe. Expected: Vmax ~8.6 V, Vavg ~5.0 V, Ripple ~0.55.",
        observation:
          "Both half-cycles now appear on CH2, confirming full-wave rectification. The output frequency is 2 kHz (double the input).",
        components: [
          BASE_BB,
          { id: "fg1", type: "func-gen", x: 16, y: 24, rotation: 0, props: { waveform: "sine", vpp: 20, freq: 1000 } },
          { id: "sc1", type: "oscilloscope", x: 616, y: 24, rotation: 0, props: {} },
          placeOnBB("d1", "diode", 3, 298, 0, { material: "si" }),
          placeOnBB("d2", "diode", 4, 314, 0, { material: "si" }),
          placeOnBB("d3", "diode", 3, 378, 180, { material: "si" }),
          placeOnBB("d4", "diode", 4, 410, 180, { material: "si" }),
          placeOnBB("rl", "resistor", 14, 338, 90, { resistance: 1000 }),
        ],
        wires: [
          { id: "w1", from: { compId: "bb1", pinId: "a8" }, to: { compId: "bb1", pinId: "a9" }, color: "#b91c1c" },
          { id: "w2", from: { compId: "bb1", pinId: "b9" }, to: { compId: "bb1", pinId: "b14" }, color: "#b91c1c" },
          { id: "w3", from: { compId: "bb1", pinId: "j8" }, to: { compId: "bb1", pinId: "bn_8" }, color: "#18181b" },
          { id: "w4", from: { compId: "bb1", pinId: "j9" }, to: { compId: "bb1", pinId: "bn_9" }, color: "#18181b" },
          { id: "w5", from: { compId: "bb1", pinId: "j14" }, to: { compId: "bb1", pinId: "bn_14" }, color: "#18181b" },
          { id: "w6", from: { compId: "fg1", pinId: "pos" }, to: { compId: "bb1", pinId: "a3" }, color: "#b91c1c" },
          { id: "w7", from: { compId: "fg1", pinId: "neg" }, to: { compId: "bb1", pinId: "a4" }, color: "#18181b" },
          { id: "w8", from: { compId: "bb1", pinId: "e3" }, to: { compId: "bb1", pinId: "f3" }, color: "#b91c1c" },
          { id: "w9", from: { compId: "bb1", pinId: "e4" }, to: { compId: "bb1", pinId: "f4" }, color: "#18181b" },
          { id: "w10", from: { compId: "sc1", pinId: "ch1_pos" }, to: { compId: "bb1", pinId: "c3" }, color: "#b91c1c" },
          { id: "w11", from: { compId: "sc1", pinId: "ch1_neg" }, to: { compId: "bb1", pinId: "c4" }, color: "#18181b" },
          { id: "w12", from: { compId: "sc1", pinId: "ch2_pos" }, to: { compId: "bb1", pinId: "a14" }, color: "#b91c1c" },
          { id: "w13", from: { compId: "sc1", pinId: "ch2_neg" }, to: { compId: "bb1", pinId: "bn_16" }, color: "#18181b" },
        ],
      },
      // --- Step 13: Add 0.47 uF cap ---
      {
        id: "exp5-s13",
        title: "Step 13: Add 0.47 uF Filter Capacitor",
        instruction:
          "Insert a 0.47 uF capacitor vertically at column 12. Its (+) lead is at d12 (connected to positive output node) and its (-) lead is at g12. Connect j12 to bn_12 [Black] to ground the negative lead.",
        observation:
          "Vavg rises and ripple drops compared to the unfiltered output. The cap charges and partially holds the voltage between cycles.",
        components: [
          BASE_BB,
          { id: "fg1", type: "func-gen", x: 16, y: 24, rotation: 0, props: { waveform: "sine", vpp: 20, freq: 1000 } },
          { id: "sc1", type: "oscilloscope", x: 616, y: 24, rotation: 0, props: {} },
          placeOnBB("d1", "diode", 3, 298, 0, { material: "si" }),
          placeOnBB("d2", "diode", 4, 314, 0, { material: "si" }),
          placeOnBB("d3", "diode", 3, 378, 180, { material: "si" }),
          placeOnBB("d4", "diode", 4, 410, 180, { material: "si" }),
          placeOnBB("c1", "capacitor", 12, 346, 90, { capacitance: 0.47 }),
          placeOnBB("rl", "resistor", 14, 338, 90, { resistance: 1000 }),
        ],
        wires: [
          { id: "w1", from: { compId: "bb1", pinId: "a8" }, to: { compId: "bb1", pinId: "a9" }, color: "#b91c1c" },
          { id: "w2", from: { compId: "bb1", pinId: "b9" }, to: { compId: "bb1", pinId: "b12" }, color: "#b91c1c" },
          { id: "w3", from: { compId: "bb1", pinId: "b12" }, to: { compId: "bb1", pinId: "b14" }, color: "#b91c1c" },
          { id: "w4", from: { compId: "bb1", pinId: "j8" }, to: { compId: "bb1", pinId: "bn_8" }, color: "#18181b" },
          { id: "w5", from: { compId: "bb1", pinId: "j9" }, to: { compId: "bb1", pinId: "bn_9" }, color: "#18181b" },
          { id: "w6", from: { compId: "bb1", pinId: "j12" }, to: { compId: "bb1", pinId: "bn_12" }, color: "#18181b" },
          { id: "w7", from: { compId: "bb1", pinId: "j14" }, to: { compId: "bb1", pinId: "bn_14" }, color: "#18181b" },
          { id: "w8", from: { compId: "fg1", pinId: "pos" }, to: { compId: "bb1", pinId: "a3" }, color: "#b91c1c" },
          { id: "w9", from: { compId: "fg1", pinId: "neg" }, to: { compId: "bb1", pinId: "a4" }, color: "#18181b" },
          { id: "w10", from: { compId: "bb1", pinId: "e3" }, to: { compId: "bb1", pinId: "f3" }, color: "#b91c1c" },
          { id: "w11", from: { compId: "bb1", pinId: "e4" }, to: { compId: "bb1", pinId: "f4" }, color: "#18181b" },
          { id: "w12", from: { compId: "sc1", pinId: "ch1_pos" }, to: { compId: "bb1", pinId: "c3" }, color: "#b91c1c" },
          { id: "w13", from: { compId: "sc1", pinId: "ch1_neg" }, to: { compId: "bb1", pinId: "c4" }, color: "#18181b" },
          { id: "w14", from: { compId: "sc1", pinId: "ch2_pos" }, to: { compId: "bb1", pinId: "a14" }, color: "#b91c1c" },
          { id: "w15", from: { compId: "sc1", pinId: "ch2_neg" }, to: { compId: "bb1", pinId: "bn_16" }, color: "#18181b" },
        ],
      },
      // --- Step 14: Swap to 10 uF ---
      {
        id: "exp5-s14",
        title: "Step 14: Swap to 10 uF Capacitor",
        instruction:
          "Remove the 0.47 uF capacitor and insert a 10 uF capacitor at the same column 12 position. Keep all wires unchanged. Check CH2 in the Scope.",
        observation:
          "Ripple collapses further. Expected: Vavg ~8.2 V, Ripple ~0.01.",
        components: [
          BASE_BB,
          { id: "fg1", type: "func-gen", x: 16, y: 24, rotation: 0, props: { waveform: "sine", vpp: 20, freq: 1000 } },
          { id: "sc1", type: "oscilloscope", x: 616, y: 24, rotation: 0, props: {} },
          placeOnBB("d1", "diode", 3, 298, 0, { material: "si" }),
          placeOnBB("d2", "diode", 4, 314, 0, { material: "si" }),
          placeOnBB("d3", "diode", 3, 378, 180, { material: "si" }),
          placeOnBB("d4", "diode", 4, 410, 180, { material: "si" }),
          placeOnBB("c1", "capacitor", 12, 346, 90, { capacitance: 10 }),
          placeOnBB("rl", "resistor", 14, 338, 90, { resistance: 1000 }),
        ],
        wires: [
          { id: "w1", from: { compId: "bb1", pinId: "a8" }, to: { compId: "bb1", pinId: "a9" }, color: "#b91c1c" },
          { id: "w2", from: { compId: "bb1", pinId: "b9" }, to: { compId: "bb1", pinId: "b12" }, color: "#b91c1c" },
          { id: "w3", from: { compId: "bb1", pinId: "b12" }, to: { compId: "bb1", pinId: "b14" }, color: "#b91c1c" },
          { id: "w4", from: { compId: "bb1", pinId: "j8" }, to: { compId: "bb1", pinId: "bn_8" }, color: "#18181b" },
          { id: "w5", from: { compId: "bb1", pinId: "j9" }, to: { compId: "bb1", pinId: "bn_9" }, color: "#18181b" },
          { id: "w6", from: { compId: "bb1", pinId: "j12" }, to: { compId: "bb1", pinId: "bn_12" }, color: "#18181b" },
          { id: "w7", from: { compId: "bb1", pinId: "j14" }, to: { compId: "bb1", pinId: "bn_14" }, color: "#18181b" },
          { id: "w8", from: { compId: "fg1", pinId: "pos" }, to: { compId: "bb1", pinId: "a3" }, color: "#b91c1c" },
          { id: "w9", from: { compId: "fg1", pinId: "neg" }, to: { compId: "bb1", pinId: "a4" }, color: "#18181b" },
          { id: "w10", from: { compId: "bb1", pinId: "e3" }, to: { compId: "bb1", pinId: "f3" }, color: "#b91c1c" },
          { id: "w11", from: { compId: "bb1", pinId: "e4" }, to: { compId: "bb1", pinId: "f4" }, color: "#18181b" },
          { id: "w12", from: { compId: "sc1", pinId: "ch1_pos" }, to: { compId: "bb1", pinId: "c3" }, color: "#b91c1c" },
          { id: "w13", from: { compId: "sc1", pinId: "ch1_neg" }, to: { compId: "bb1", pinId: "c4" }, color: "#18181b" },
          { id: "w14", from: { compId: "sc1", pinId: "ch2_pos" }, to: { compId: "bb1", pinId: "a14" }, color: "#b91c1c" },
          { id: "w15", from: { compId: "sc1", pinId: "ch2_neg" }, to: { compId: "bb1", pinId: "bn_16" }, color: "#18181b" },
        ],
      },
      // --- Step 15: Swap to 47 uF ---
      {
        id: "exp5-s15",
        title: "Step 15: Swap to 47 uF Capacitor - Final Reading",
        instruction:
          "Remove the 10 uF capacitor and insert a 47 uF capacitor at column 12. Keep all wires unchanged. Check CH2 in the Scope for the final PDF table reading.",
        observation:
          "Output is nearly pure DC. Expected: Vavg ~8.3 V, Ripple < 0.003.",
        components: [
          BASE_BB,
          { id: "fg1", type: "func-gen", x: 16, y: 24, rotation: 0, props: { waveform: "sine", vpp: 20, freq: 1000 } },
          { id: "sc1", type: "oscilloscope", x: 616, y: 24, rotation: 0, props: {} },
          placeOnBB("d1", "diode", 3, 298, 0, { material: "si" }),
          placeOnBB("d2", "diode", 4, 314, 0, { material: "si" }),
          placeOnBB("d3", "diode", 3, 378, 180, { material: "si" }),
          placeOnBB("d4", "diode", 4, 410, 180, { material: "si" }),
          placeOnBB("c1", "capacitor", 12, 346, 90, { capacitance: 47 }),
          placeOnBB("rl", "resistor", 14, 338, 90, { resistance: 1000 }),
        ],
        wires: [
          { id: "w1", from: { compId: "bb1", pinId: "a8" }, to: { compId: "bb1", pinId: "a9" }, color: "#b91c1c" },
          { id: "w2", from: { compId: "bb1", pinId: "b9" }, to: { compId: "bb1", pinId: "b12" }, color: "#b91c1c" },
          { id: "w3", from: { compId: "bb1", pinId: "b12" }, to: { compId: "bb1", pinId: "b14" }, color: "#b91c1c" },
          { id: "w4", from: { compId: "bb1", pinId: "j8" }, to: { compId: "bb1", pinId: "bn_8" }, color: "#18181b" },
          { id: "w5", from: { compId: "bb1", pinId: "j9" }, to: { compId: "bb1", pinId: "bn_9" }, color: "#18181b" },
          { id: "w6", from: { compId: "bb1", pinId: "j12" }, to: { compId: "bb1", pinId: "bn_12" }, color: "#18181b" },
          { id: "w7", from: { compId: "bb1", pinId: "j14" }, to: { compId: "bb1", pinId: "bn_14" }, color: "#18181b" },
          { id: "w8", from: { compId: "fg1", pinId: "pos" }, to: { compId: "bb1", pinId: "a3" }, color: "#b91c1c" },
          { id: "w9", from: { compId: "fg1", pinId: "neg" }, to: { compId: "bb1", pinId: "a4" }, color: "#18181b" },
          { id: "w10", from: { compId: "bb1", pinId: "e3" }, to: { compId: "bb1", pinId: "f3" }, color: "#b91c1c" },
          { id: "w11", from: { compId: "bb1", pinId: "e4" }, to: { compId: "bb1", pinId: "f4" }, color: "#18181b" },
          { id: "w12", from: { compId: "sc1", pinId: "ch1_pos" }, to: { compId: "bb1", pinId: "c3" }, color: "#b91c1c" },
          { id: "w13", from: { compId: "sc1", pinId: "ch1_neg" }, to: { compId: "bb1", pinId: "c4" }, color: "#18181b" },
          { id: "w14", from: { compId: "sc1", pinId: "ch2_pos" }, to: { compId: "bb1", pinId: "a14" }, color: "#b91c1c" },
          { id: "w15", from: { compId: "sc1", pinId: "ch2_neg" }, to: { compId: "bb1", pinId: "bn_16" }, color: "#18181b" },
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
      "Wire a positive clipper, then a negative clipper, then a dual clipper on the breadboard using a 19.6 Vpp 1 kHz Triangular wave input.",
    steps: [
      // --- Step 1: Gather ---
      {
        id: "exp6-s1",
        title: "Step 1: Gather Components and Instruments",
        instruction:
          "Gather: 1 x 1 kOhm resistor, 1 x 1N4007 diode, 1 x DC power supply, 1 x Function Generator, 1 x Oscilloscope, and connecting wires.",
        observation:
          "All components are ready. The breadboard is empty.",
        components: [
          BASE_BB,
          { id: "fg1", type: "func-gen", x: 16, y: 24, rotation: 0, props: { waveform: "triangle", vpp: 19.6, freq: 1000 } },
          { id: "dc1", type: "dc-supply", x: 248, y: 38, rotation: 0, props: { voltage: 2.3 } },
          { id: "sc1", type: "oscilloscope", x: 616, y: 24, rotation: 0, props: {} },
        ],
        wires: [],
      },
      // --- Step 2: Place Resistor ---
      {
        id: "exp6-s2",
        title: "Step 2: Place 1 kOhm Resistor (c3 to c8)",
        instruction:
          "Insert the 1 kOhm resistor horizontally in row c, with its left pin (+) at c3 and right pin (-) at c8. This is the series resistor in the clipper circuit.",
        observation:
          "The resistor occupies row c from column 3 to column 8.",
        components: [
          BASE_BB,
          { id: "fg1", type: "func-gen", x: 16, y: 24, rotation: 0, props: { waveform: "triangle", vpp: 19.6, freq: 1000 } },
          { id: "dc1", type: "dc-supply", x: 248, y: 38, rotation: 0, props: { voltage: 2.3 } },
          { id: "sc1", type: "oscilloscope", x: 616, y: 24, rotation: 0, props: {} },
          placeOnBB("r1", "resistor", 3, 298, 0, { resistance: 1000 }),
        ],
        wires: [],
      },
      // --- Step 3: Place Diode (Anode up = positive clipper) ---
      {
        id: "exp6-s3",
        title: "Step 3: Place Diode Vertically at Column 8 (Anode at d8, Cathode at g8)",
        instruction:
          "Insert the 1N4007 diode vertically at column 8, with Anode (+) at d8 (connected to resistor right end) and Cathode (-) at g8 (pointing down toward ground). This is the positive clipper orientation.",
        observation:
          "The diode stands vertically at column 8. When input exceeds the bias voltage, the diode conducts and clips the positive peak.",
        components: [
          BASE_BB,
          { id: "fg1", type: "func-gen", x: 16, y: 24, rotation: 0, props: { waveform: "triangle", vpp: 19.6, freq: 1000 } },
          { id: "dc1", type: "dc-supply", x: 248, y: 38, rotation: 0, props: { voltage: 2.3 } },
          { id: "sc1", type: "oscilloscope", x: 616, y: 24, rotation: 0, props: {} },
          placeOnBB("r1", "resistor", 3, 298, 0, { resistance: 1000 }),
          placeOnBB("d1", "diode", 8, 338, 90, { material: "si" }),
        ],
        wires: [],
      },
      // --- Step 4: Connect DC Supply (+) to Diode Cathode ---
      {
        id: "exp6-s4",
        title: "Step 4: Connect DC Supply (+) to Diode Cathode at j8 (Red)",
        instruction:
          "Connect DC Supply (+) [Red] to j8 (bottom of diode, Cathode side). The DC supply sets the clipping level: 2.3 V + 0.7 V diode drop = 3.0 V clip level.",
        observation:
          "The DC bias is now connected to the diode cathode. No circuit is yet complete.",
        components: [
          BASE_BB,
          { id: "fg1", type: "func-gen", x: 16, y: 24, rotation: 0, props: { waveform: "triangle", vpp: 19.6, freq: 1000 } },
          { id: "dc1", type: "dc-supply", x: 248, y: 38, rotation: 0, props: { voltage: 2.3 } },
          { id: "sc1", type: "oscilloscope", x: 616, y: 24, rotation: 0, props: {} },
          placeOnBB("r1", "resistor", 3, 298, 0, { resistance: 1000 }),
          placeOnBB("d1", "diode", 8, 338, 90, { material: "si" }),
        ],
        wires: [
          { id: "w1", from: { compId: "dc1", pinId: "pos" }, to: { compId: "bb1", pinId: "j8" }, color: "#b91c1c" },
        ],
      },
      // --- Step 5: Connect DC Supply (-) to Ground ---
      {
        id: "exp6-s5",
        title: "Step 5: Connect DC Supply (-) to Ground Rail at bn_6 (Black)",
        instruction:
          "Connect DC Supply (-) [Black] to bn_6 (bottom ground rail). This completes the DC bias reference loop.",
        observation:
          "The DC supply is now fully connected. Its positive terminal biases the diode cathode and its negative returns to ground.",
        components: [
          BASE_BB,
          { id: "fg1", type: "func-gen", x: 16, y: 24, rotation: 0, props: { waveform: "triangle", vpp: 19.6, freq: 1000 } },
          { id: "dc1", type: "dc-supply", x: 248, y: 38, rotation: 0, props: { voltage: 2.3 } },
          { id: "sc1", type: "oscilloscope", x: 616, y: 24, rotation: 0, props: {} },
          placeOnBB("r1", "resistor", 3, 298, 0, { resistance: 1000 }),
          placeOnBB("d1", "diode", 8, 338, 90, { material: "si" }),
        ],
        wires: [
          { id: "w1", from: { compId: "dc1", pinId: "pos" }, to: { compId: "bb1", pinId: "j8" }, color: "#b91c1c" },
          { id: "w2", from: { compId: "dc1", pinId: "neg" }, to: { compId: "bb1", pinId: "bn_6" }, color: "#18181b" },
        ],
      },
      // --- Step 6: Connect Function Generator (+) ---
      {
        id: "exp6-s6",
        title: "Step 6: Connect Function Generator (+) to a3 (Red)",
        instruction:
          "Connect Function Generator (+) [Red] to a3 (left end of resistor, input node). The 19.6 Vpp triangle wave enters the circuit from this point.",
        observation:
          "The input signal is now connected to the resistor input.",
        components: [
          BASE_BB,
          { id: "fg1", type: "func-gen", x: 16, y: 24, rotation: 0, props: { waveform: "triangle", vpp: 19.6, freq: 1000 } },
          { id: "dc1", type: "dc-supply", x: 248, y: 38, rotation: 0, props: { voltage: 2.3 } },
          { id: "sc1", type: "oscilloscope", x: 616, y: 24, rotation: 0, props: {} },
          placeOnBB("r1", "resistor", 3, 298, 0, { resistance: 1000 }),
          placeOnBB("d1", "diode", 8, 338, 90, { material: "si" }),
        ],
        wires: [
          { id: "w1", from: { compId: "dc1", pinId: "pos" }, to: { compId: "bb1", pinId: "j8" }, color: "#b91c1c" },
          { id: "w2", from: { compId: "dc1", pinId: "neg" }, to: { compId: "bb1", pinId: "bn_6" }, color: "#18181b" },
          { id: "w3", from: { compId: "fg1", pinId: "pos" }, to: { compId: "bb1", pinId: "a3" }, color: "#b91c1c" },
        ],
      },
      // --- Step 7: Connect Function Generator (-) ---
      {
        id: "exp6-s7",
        title: "Step 7: Connect Function Generator (-) to Ground Rail at bn_2 (Black)",
        instruction:
          "Connect Function Generator (-) [Black] to bn_2 (bottom ground rail). This completes the input signal return path.",
        observation:
          "The function generator is fully wired. The triangle wave now drives the clipper circuit.",
        components: [
          BASE_BB,
          { id: "fg1", type: "func-gen", x: 16, y: 24, rotation: 0, props: { waveform: "triangle", vpp: 19.6, freq: 1000 } },
          { id: "dc1", type: "dc-supply", x: 248, y: 38, rotation: 0, props: { voltage: 2.3 } },
          { id: "sc1", type: "oscilloscope", x: 616, y: 24, rotation: 0, props: {} },
          placeOnBB("r1", "resistor", 3, 298, 0, { resistance: 1000 }),
          placeOnBB("d1", "diode", 8, 338, 90, { material: "si" }),
        ],
        wires: [
          { id: "w1", from: { compId: "dc1", pinId: "pos" }, to: { compId: "bb1", pinId: "j8" }, color: "#b91c1c" },
          { id: "w2", from: { compId: "dc1", pinId: "neg" }, to: { compId: "bb1", pinId: "bn_6" }, color: "#18181b" },
          { id: "w3", from: { compId: "fg1", pinId: "pos" }, to: { compId: "bb1", pinId: "a3" }, color: "#b91c1c" },
          { id: "w4", from: { compId: "fg1", pinId: "neg" }, to: { compId: "bb1", pinId: "bn_2" }, color: "#18181b" },
        ],
      },
      // --- Step 8: Connect Oscilloscope CH1 (+) ---
      {
        id: "exp6-s8",
        title: "Step 8: Connect Oscilloscope CH1 (+) to b3 (Red) - Input Monitor",
        instruction:
          "Connect Oscilloscope CH1 (+) [Red] to b3 (input node, before resistor). CH1 will display the original unclipped triangle waveform.",
        observation:
          "CH1 probe is now on the input node. The full 19.6 Vpp triangle wave will appear on CH1.",
        components: [
          BASE_BB,
          { id: "fg1", type: "func-gen", x: 16, y: 24, rotation: 0, props: { waveform: "triangle", vpp: 19.6, freq: 1000 } },
          { id: "dc1", type: "dc-supply", x: 248, y: 38, rotation: 0, props: { voltage: 2.3 } },
          { id: "sc1", type: "oscilloscope", x: 616, y: 24, rotation: 0, props: {} },
          placeOnBB("r1", "resistor", 3, 298, 0, { resistance: 1000 }),
          placeOnBB("d1", "diode", 8, 338, 90, { material: "si" }),
        ],
        wires: [
          { id: "w1", from: { compId: "dc1", pinId: "pos" }, to: { compId: "bb1", pinId: "j8" }, color: "#b91c1c" },
          { id: "w2", from: { compId: "dc1", pinId: "neg" }, to: { compId: "bb1", pinId: "bn_6" }, color: "#18181b" },
          { id: "w3", from: { compId: "fg1", pinId: "pos" }, to: { compId: "bb1", pinId: "a3" }, color: "#b91c1c" },
          { id: "w4", from: { compId: "fg1", pinId: "neg" }, to: { compId: "bb1", pinId: "bn_2" }, color: "#18181b" },
          { id: "w5", from: { compId: "sc1", pinId: "ch1_pos" }, to: { compId: "bb1", pinId: "b3" }, color: "#b91c1c" },
        ],
      },
      // --- Step 9: Connect Oscilloscope CH1 (-) ---
      {
        id: "exp6-s9",
        title: "Step 9: Connect Oscilloscope CH1 (-) to Ground at bn_14 (Black)",
        instruction:
          "Connect Oscilloscope CH1 (-) [Black] to bn_14 (ground rail). CH1 is now fully wired to monitor the input.",
        observation:
          "CH1 is completely connected. CH1 GND shares the common ground reference.",
        components: [
          BASE_BB,
          { id: "fg1", type: "func-gen", x: 16, y: 24, rotation: 0, props: { waveform: "triangle", vpp: 19.6, freq: 1000 } },
          { id: "dc1", type: "dc-supply", x: 248, y: 38, rotation: 0, props: { voltage: 2.3 } },
          { id: "sc1", type: "oscilloscope", x: 616, y: 24, rotation: 0, props: {} },
          placeOnBB("r1", "resistor", 3, 298, 0, { resistance: 1000 }),
          placeOnBB("d1", "diode", 8, 338, 90, { material: "si" }),
        ],
        wires: [
          { id: "w1", from: { compId: "dc1", pinId: "pos" }, to: { compId: "bb1", pinId: "j8" }, color: "#b91c1c" },
          { id: "w2", from: { compId: "dc1", pinId: "neg" }, to: { compId: "bb1", pinId: "bn_6" }, color: "#18181b" },
          { id: "w3", from: { compId: "fg1", pinId: "pos" }, to: { compId: "bb1", pinId: "a3" }, color: "#b91c1c" },
          { id: "w4", from: { compId: "fg1", pinId: "neg" }, to: { compId: "bb1", pinId: "bn_2" }, color: "#18181b" },
          { id: "w5", from: { compId: "sc1", pinId: "ch1_pos" }, to: { compId: "bb1", pinId: "b3" }, color: "#b91c1c" },
          { id: "w6", from: { compId: "sc1", pinId: "ch1_neg" }, to: { compId: "bb1", pinId: "bn_14" }, color: "#18181b" },
        ],
      },
      // --- Step 10: Connect Oscilloscope CH2 (+) ---
      {
        id: "exp6-s10",
        title: "Step 10: Connect Oscilloscope CH2 (+) to a8 (Red) - Output Monitor",
        instruction:
          "Connect Oscilloscope CH2 (+) [Red] to a8 (output node, after resistor and at diode anode). CH2 will display the clipped output waveform.",
        observation:
          "CH2 probe is on the output node. The clipped signal will appear on CH2.",
        components: [
          BASE_BB,
          { id: "fg1", type: "func-gen", x: 16, y: 24, rotation: 0, props: { waveform: "triangle", vpp: 19.6, freq: 1000 } },
          { id: "dc1", type: "dc-supply", x: 248, y: 38, rotation: 0, props: { voltage: 2.3 } },
          { id: "sc1", type: "oscilloscope", x: 616, y: 24, rotation: 0, props: {} },
          placeOnBB("r1", "resistor", 3, 298, 0, { resistance: 1000 }),
          placeOnBB("d1", "diode", 8, 338, 90, { material: "si" }),
        ],
        wires: [
          { id: "w1", from: { compId: "dc1", pinId: "pos" }, to: { compId: "bb1", pinId: "j8" }, color: "#b91c1c" },
          { id: "w2", from: { compId: "dc1", pinId: "neg" }, to: { compId: "bb1", pinId: "bn_6" }, color: "#18181b" },
          { id: "w3", from: { compId: "fg1", pinId: "pos" }, to: { compId: "bb1", pinId: "a3" }, color: "#b91c1c" },
          { id: "w4", from: { compId: "fg1", pinId: "neg" }, to: { compId: "bb1", pinId: "bn_2" }, color: "#18181b" },
          { id: "w5", from: { compId: "sc1", pinId: "ch1_pos" }, to: { compId: "bb1", pinId: "b3" }, color: "#b91c1c" },
          { id: "w6", from: { compId: "sc1", pinId: "ch1_neg" }, to: { compId: "bb1", pinId: "bn_14" }, color: "#18181b" },
          { id: "w7", from: { compId: "sc1", pinId: "ch2_pos" }, to: { compId: "bb1", pinId: "a8" }, color: "#b91c1c" },
        ],
      },
      // --- Step 11: Connect Oscilloscope CH2 (-) --- Positive clipper complete
      {
        id: "exp6-s11",
        title: "Step 11: Connect Oscilloscope CH2 (-) to Ground at bn_16 (Black) - Positive Clipper Reading",
        instruction:
          "Connect Oscilloscope CH2 (-) [Black] to bn_16 (ground rail). Click 'Open Scope' to compare CH1 (input) and CH2 (output). Expected: positive peak clipped at +3.0 V, negative peak intact at -9.8 V.",
        observation:
          "PDF Table match for positive clipper: Vclip = +3.0 V (2.3 V bias + 0.7 V diode drop). Vp-p output ~12.8 V.",
        components: [
          BASE_BB,
          { id: "fg1", type: "func-gen", x: 16, y: 24, rotation: 0, props: { waveform: "triangle", vpp: 19.6, freq: 1000 } },
          { id: "dc1", type: "dc-supply", x: 248, y: 38, rotation: 0, props: { voltage: 2.3 } },
          { id: "sc1", type: "oscilloscope", x: 616, y: 24, rotation: 0, props: {} },
          placeOnBB("r1", "resistor", 3, 298, 0, { resistance: 1000 }),
          placeOnBB("d1", "diode", 8, 338, 90, { material: "si" }),
        ],
        wires: [
          { id: "w1", from: { compId: "dc1", pinId: "pos" }, to: { compId: "bb1", pinId: "j8" }, color: "#b91c1c" },
          { id: "w2", from: { compId: "dc1", pinId: "neg" }, to: { compId: "bb1", pinId: "bn_6" }, color: "#18181b" },
          { id: "w3", from: { compId: "fg1", pinId: "pos" }, to: { compId: "bb1", pinId: "a3" }, color: "#b91c1c" },
          { id: "w4", from: { compId: "fg1", pinId: "neg" }, to: { compId: "bb1", pinId: "bn_2" }, color: "#18181b" },
          { id: "w5", from: { compId: "sc1", pinId: "ch1_pos" }, to: { compId: "bb1", pinId: "b3" }, color: "#b91c1c" },
          { id: "w6", from: { compId: "sc1", pinId: "ch1_neg" }, to: { compId: "bb1", pinId: "bn_14" }, color: "#18181b" },
          { id: "w7", from: { compId: "sc1", pinId: "ch2_pos" }, to: { compId: "bb1", pinId: "a8" }, color: "#b91c1c" },
          { id: "w8", from: { compId: "sc1", pinId: "ch2_neg" }, to: { compId: "bb1", pinId: "bn_16" }, color: "#18181b" },
        ],
      },
      // --- Step 12: Flip diode for negative clipper ---
      {
        id: "exp6-s12",
        title: "Step 12: Flip Diode 180 deg for Negative Clipper (Cathode at d8, Anode at g8)",
        instruction:
          "Remove the diode from column 8 and re-insert it reversed: Cathode (-) at d8 (top, toward resistor) and Anode (+) at g8 (bottom). Change DC Supply voltage to 2.5 V. Connect DC Supply (-) [Black] to j8 and DC Supply (+) [Red] to bn_6 (reversed polarity to apply negative bias).",
        observation:
          "The diode now faces the opposite direction. Negative half-cycles will now be clipped at -3.2 V.",
        components: [
          BASE_BB,
          { id: "fg1", type: "func-gen", x: 16, y: 24, rotation: 0, props: { waveform: "triangle", vpp: 19.6, freq: 1000 } },
          { id: "dc1", type: "dc-supply", x: 248, y: 38, rotation: 0, props: { voltage: 2.5 } },
          { id: "sc1", type: "oscilloscope", x: 616, y: 24, rotation: 0, props: {} },
          placeOnBB("r1", "resistor", 3, 298, 0, { resistance: 1000 }),
          placeOnBB("d1", "diode", 8, 338, 270, { material: "si" }),
        ],
        wires: [
          { id: "w1", from: { compId: "dc1", pinId: "neg" }, to: { compId: "bb1", pinId: "j8" }, color: "#18181b" },
          { id: "w2", from: { compId: "dc1", pinId: "pos" }, to: { compId: "bb1", pinId: "bn_6" }, color: "#b91c1c" },
          { id: "w3", from: { compId: "fg1", pinId: "pos" }, to: { compId: "bb1", pinId: "a3" }, color: "#b91c1c" },
          { id: "w4", from: { compId: "fg1", pinId: "neg" }, to: { compId: "bb1", pinId: "bn_2" }, color: "#18181b" },
          { id: "w5", from: { compId: "sc1", pinId: "ch1_pos" }, to: { compId: "bb1", pinId: "b3" }, color: "#b91c1c" },
          { id: "w6", from: { compId: "sc1", pinId: "ch1_neg" }, to: { compId: "bb1", pinId: "bn_14" }, color: "#18181b" },
          { id: "w7", from: { compId: "sc1", pinId: "ch2_pos" }, to: { compId: "bb1", pinId: "a8" }, color: "#b91c1c" },
          { id: "w8", from: { compId: "sc1", pinId: "ch2_neg" }, to: { compId: "bb1", pinId: "bn_16" }, color: "#18181b" },
        ],
      },
      // --- Step 13: Dual clipper ---
      {
        id: "exp6-s13",
        title: "Step 13: Dual Clipper - Add Second Diode at Column 11",
        instruction:
          "Keep D1 in place (Cathode at d8, Anode at g8). Add D2 vertically at column 11 with Anode (+) at d11 and Cathode (-) at g11 (forward orientation). Connect a jumper Red wire from b8 to b11 (linking the two diode nodes). Set FG to 10 Vpp Sine. Connect DC1 (+) [Red] to j8 (bias = +1.0 V) and DC1 (-) [Black] to bn_6.",
        observation:
          "The output node between the two diodes is shared. Positive peaks clip at +1.7 V and negative peaks clip at -3.2 V.",
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
          { id: "w1", from: { compId: "fg1", pinId: "pos" }, to: { compId: "bb1", pinId: "a3" }, color: "#b91c1c" },
          { id: "w2", from: { compId: "fg1", pinId: "neg" }, to: { compId: "bb1", pinId: "bn_2" }, color: "#18181b" },
          { id: "w3", from: { compId: "bb1", pinId: "b8" }, to: { compId: "bb1", pinId: "b11" }, color: "#b91c1c" },
          { id: "w4", from: { compId: "dc1", pinId: "pos" }, to: { compId: "bb1", pinId: "j8" }, color: "#b91c1c" },
          { id: "w5", from: { compId: "dc1", pinId: "neg" }, to: { compId: "bb1", pinId: "bn_6" }, color: "#18181b" },
          { id: "w6", from: { compId: "dc2", pinId: "neg" }, to: { compId: "bb1", pinId: "j11" }, color: "#18181b" },
          { id: "w7", from: { compId: "dc2", pinId: "pos" }, to: { compId: "bb1", pinId: "bn_10" }, color: "#b91c1c" },
          { id: "w8", from: { compId: "sc1", pinId: "ch1_pos" }, to: { compId: "bb1", pinId: "b3" }, color: "#b91c1c" },
          { id: "w9", from: { compId: "sc1", pinId: "ch1_neg" }, to: { compId: "bb1", pinId: "bn_14" }, color: "#18181b" },
          { id: "w10", from: { compId: "sc1", pinId: "ch2_pos" }, to: { compId: "bb1", pinId: "a8" }, color: "#b91c1c" },
          { id: "w11", from: { compId: "sc1", pinId: "ch2_neg" }, to: { compId: "bb1", pinId: "bn_16" }, color: "#18181b" },
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
      // --- Step 1: Gather ---
      {
        id: "exp7-s1",
        title: "Step 1: Gather Components and Instruments",
        instruction:
          "Gather: 1 x 0.1 uF capacitor, 1 x 1N4007 diode, 1 x 100 kOhm resistor, 1 x Function Generator, 1 x Oscilloscope, and connecting wires.",
        observation:
          "All components are ready. The breadboard is empty.",
        components: [
          BASE_BB,
          { id: "fg1", type: "func-gen", x: 16, y: 24, rotation: 0, props: { waveform: "square", vpp: 10, freq: 1000 } },
          { id: "sc1", type: "oscilloscope", x: 616, y: 24, rotation: 0, props: {} },
        ],
        wires: [],
      },
      // --- Step 2: Place Capacitor ---
      {
        id: "exp7-s2",
        title: "Step 2: Place 0.1 uF Capacitor (c3 to c7)",
        instruction:
          "Insert the 0.1 uF capacitor horizontally in row c, with its left pin (+) at c3 and right pin (-) at c7. This series capacitor blocks DC and passes the AC square wave.",
        observation:
          "The capacitor occupies row c from column 3 to column 7.",
        components: [
          BASE_BB,
          { id: "fg1", type: "func-gen", x: 16, y: 24, rotation: 0, props: { waveform: "square", vpp: 10, freq: 1000 } },
          { id: "sc1", type: "oscilloscope", x: 616, y: 24, rotation: 0, props: {} },
          placeOnBB("c1", "capacitor", 3, 298, 0, { capacitance: 0.1 }),
        ],
        wires: [],
      },
      // --- Step 3: Place Diode (Positive Clamper: Cathode at d7, Anode at g7) ---
      {
        id: "exp7-s3",
        title: "Step 3: Place Diode Vertically at Column 7 (Cathode at d7, Anode at g7)",
        instruction:
          "Insert the 1N4007 diode vertically at column 7 with Cathode (-) at d7 (top, connected to capacitor output) and Anode (+) at g7 (bottom, toward ground). This is the positive clamper orientation.",
        observation:
          "The diode stands at column 7. Its cathode is at the top (output side of capacitor) and anode points to ground.",
        components: [
          BASE_BB,
          { id: "fg1", type: "func-gen", x: 16, y: 24, rotation: 0, props: { waveform: "square", vpp: 10, freq: 1000 } },
          { id: "sc1", type: "oscilloscope", x: 616, y: 24, rotation: 0, props: {} },
          placeOnBB("c1", "capacitor", 3, 298, 0, { capacitance: 0.1 }),
          placeOnBB("d1", "diode", 7, 338, 270, { material: "si" }),
        ],
        wires: [],
      },
      // --- Step 4: Place 100 kOhm Load Resistor ---
      {
        id: "exp7-s4",
        title: "Step 4: Place 100 kOhm Load Resistor at Column 11",
        instruction:
          "Insert the 100 kOhm resistor vertically at column 11. Its top pin (+) is at d11 (output positive node) and bottom pin (-) is at g11. The large resistance ensures the capacitor does not discharge quickly between cycles.",
        observation:
          "The load resistor is placed at column 11. It will appear in parallel with the output.",
        components: [
          BASE_BB,
          { id: "fg1", type: "func-gen", x: 16, y: 24, rotation: 0, props: { waveform: "square", vpp: 10, freq: 1000 } },
          { id: "sc1", type: "oscilloscope", x: 616, y: 24, rotation: 0, props: {} },
          placeOnBB("c1", "capacitor", 3, 298, 0, { capacitance: 0.1 }),
          placeOnBB("d1", "diode", 7, 338, 270, { material: "si" }),
          placeOnBB("rl", "resistor", 11, 338, 90, { resistance: 100000 }),
        ],
        wires: [],
      },
      // --- Step 5: Connect b7 to b11 (output node jumper) ---
      {
        id: "exp7-s5",
        title: "Step 5: Join Diode Output to Load Top (b7 to b11) [Red]",
        instruction:
          "Connect a Red wire from b7 (capacitor output / diode cathode node) to b11 (top of load resistor). This connects the clamper output to the load.",
        observation:
          "The diode cathode node is now linked to the top of the load resistor.",
        components: [
          BASE_BB,
          { id: "fg1", type: "func-gen", x: 16, y: 24, rotation: 0, props: { waveform: "square", vpp: 10, freq: 1000 } },
          { id: "sc1", type: "oscilloscope", x: 616, y: 24, rotation: 0, props: {} },
          placeOnBB("c1", "capacitor", 3, 298, 0, { capacitance: 0.1 }),
          placeOnBB("d1", "diode", 7, 338, 270, { material: "si" }),
          placeOnBB("rl", "resistor", 11, 338, 90, { resistance: 100000 }),
        ],
        wires: [
          { id: "w1", from: { compId: "bb1", pinId: "b7" }, to: { compId: "bb1", pinId: "b11" }, color: "#b91c1c" },
        ],
      },
      // --- Step 6: Ground diode anode and load bottom ---
      {
        id: "exp7-s6",
        title: "Step 6: Ground Diode Anode at j7 and Load Bottom at j11 (Black)",
        instruction:
          "Connect Black wire from j7 to bn_7 (Diode Anode bottom to ground rail). Connect Black wire from j11 to bn_11 (Load bottom to ground rail). These are the negative (-) returns.",
        observation:
          "The diode anode and the load bottom are both grounded. The circuit now has a complete path.",
        components: [
          BASE_BB,
          { id: "fg1", type: "func-gen", x: 16, y: 24, rotation: 0, props: { waveform: "square", vpp: 10, freq: 1000 } },
          { id: "sc1", type: "oscilloscope", x: 616, y: 24, rotation: 0, props: {} },
          placeOnBB("c1", "capacitor", 3, 298, 0, { capacitance: 0.1 }),
          placeOnBB("d1", "diode", 7, 338, 270, { material: "si" }),
          placeOnBB("rl", "resistor", 11, 338, 90, { resistance: 100000 }),
        ],
        wires: [
          { id: "w1", from: { compId: "bb1", pinId: "b7" }, to: { compId: "bb1", pinId: "b11" }, color: "#b91c1c" },
          { id: "w2", from: { compId: "bb1", pinId: "j7" }, to: { compId: "bb1", pinId: "bn_7" }, color: "#18181b" },
          { id: "w3", from: { compId: "bb1", pinId: "j11" }, to: { compId: "bb1", pinId: "bn_11" }, color: "#18181b" },
        ],
      },
      // --- Step 7: Connect FG (+) ---
      {
        id: "exp7-s7",
        title: "Step 7: Connect Function Generator (+) to a3 (Red)",
        instruction:
          "Connect Function Generator (+) [Red] to a3 (left end of capacitor, input node). The 10 Vpp 1 kHz square wave enters the clamper through the series capacitor.",
        observation:
          "The input signal is now connected to the capacitor input.",
        components: [
          BASE_BB,
          { id: "fg1", type: "func-gen", x: 16, y: 24, rotation: 0, props: { waveform: "square", vpp: 10, freq: 1000 } },
          { id: "sc1", type: "oscilloscope", x: 616, y: 24, rotation: 0, props: {} },
          placeOnBB("c1", "capacitor", 3, 298, 0, { capacitance: 0.1 }),
          placeOnBB("d1", "diode", 7, 338, 270, { material: "si" }),
          placeOnBB("rl", "resistor", 11, 338, 90, { resistance: 100000 }),
        ],
        wires: [
          { id: "w1", from: { compId: "bb1", pinId: "b7" }, to: { compId: "bb1", pinId: "b11" }, color: "#b91c1c" },
          { id: "w2", from: { compId: "bb1", pinId: "j7" }, to: { compId: "bb1", pinId: "bn_7" }, color: "#18181b" },
          { id: "w3", from: { compId: "bb1", pinId: "j11" }, to: { compId: "bb1", pinId: "bn_11" }, color: "#18181b" },
          { id: "w4", from: { compId: "fg1", pinId: "pos" }, to: { compId: "bb1", pinId: "a3" }, color: "#b91c1c" },
        ],
      },
      // --- Step 8: Connect FG (-) ---
      {
        id: "exp7-s8",
        title: "Step 8: Connect Function Generator (-) to Ground at bn_2 (Black)",
        instruction:
          "Connect Function Generator (-) [Black] to bn_2 (bottom ground rail). The input signal return path is now complete.",
        observation:
          "The function generator is fully wired. The 10 Vpp square wave now drives the clamper input.",
        components: [
          BASE_BB,
          { id: "fg1", type: "func-gen", x: 16, y: 24, rotation: 0, props: { waveform: "square", vpp: 10, freq: 1000 } },
          { id: "sc1", type: "oscilloscope", x: 616, y: 24, rotation: 0, props: {} },
          placeOnBB("c1", "capacitor", 3, 298, 0, { capacitance: 0.1 }),
          placeOnBB("d1", "diode", 7, 338, 270, { material: "si" }),
          placeOnBB("rl", "resistor", 11, 338, 90, { resistance: 100000 }),
        ],
        wires: [
          { id: "w1", from: { compId: "bb1", pinId: "b7" }, to: { compId: "bb1", pinId: "b11" }, color: "#b91c1c" },
          { id: "w2", from: { compId: "bb1", pinId: "j7" }, to: { compId: "bb1", pinId: "bn_7" }, color: "#18181b" },
          { id: "w3", from: { compId: "bb1", pinId: "j11" }, to: { compId: "bb1", pinId: "bn_11" }, color: "#18181b" },
          { id: "w4", from: { compId: "fg1", pinId: "pos" }, to: { compId: "bb1", pinId: "a3" }, color: "#b91c1c" },
          { id: "w5", from: { compId: "fg1", pinId: "neg" }, to: { compId: "bb1", pinId: "bn_2" }, color: "#18181b" },
        ],
      },
      // --- Step 9: Connect Scope CH1 (+) to Input ---
      {
        id: "exp7-s9",
        title: "Step 9: Connect Oscilloscope (+) to Input at b3 (Red)",
        instruction:
          "Connect Oscilloscope CH1 (+) [Red] to b3 (input node, left of capacitor). We will monitor the input signal first using just 2 oscilloscope wires.",
        observation:
          "The oscilloscope positive probe is now on the input node.",
        components: [
          BASE_BB,
          { id: "fg1", type: "func-gen", x: 16, y: 24, rotation: 0, props: { waveform: "square", vpp: 10, freq: 1000 } },
          { id: "sc1", type: "oscilloscope", x: 616, y: 24, rotation: 0, props: {} },
          placeOnBB("c1", "capacitor", 3, 298, 0, { capacitance: 0.1 }),
          placeOnBB("d1", "diode", 7, 338, 270, { material: "si" }),
          placeOnBB("rl", "resistor", 11, 338, 90, { resistance: 100000 }),
        ],
        wires: [
          { id: "w1", from: { compId: "bb1", pinId: "b7" }, to: { compId: "bb1", pinId: "b11" }, color: "#b91c1c" },
          { id: "w2", from: { compId: "bb1", pinId: "j7" }, to: { compId: "bb1", pinId: "bn_7" }, color: "#18181b" },
          { id: "w3", from: { compId: "bb1", pinId: "j11" }, to: { compId: "bb1", pinId: "bn_11" }, color: "#18181b" },
          { id: "w4", from: { compId: "fg1", pinId: "pos" }, to: { compId: "bb1", pinId: "a3" }, color: "#b91c1c" },
          { id: "w5", from: { compId: "fg1", pinId: "neg" }, to: { compId: "bb1", pinId: "bn_2" }, color: "#18181b" },
          { id: "w6", from: { compId: "sc1", pinId: "ch1_pos" }, to: { compId: "bb1", pinId: "b3" }, color: "#b91c1c" },
        ],
      },
      // --- Step 10: Connect Scope CH1 (-) to Ground --- Positive Clamper Input Reading
      {
        id: "exp7-s10",
        title: "Step 10: Connect Oscilloscope (-) to Ground at bn_14 (Black) - Read Input",
        instruction:
          "Connect Oscilloscope CH1 (-) [Black] to bn_14 (ground rail). Click 'Open Scope' to observe the input square wave before clamping. Expected: 10 Vpp square wave (-5 V to +5 V).",
        observation:
          "Input verified: symmetric 10 Vpp 1 kHz square wave centered around 0 V.",
        components: [
          BASE_BB,
          { id: "fg1", type: "func-gen", x: 16, y: 24, rotation: 0, props: { waveform: "square", vpp: 10, freq: 1000 } },
          { id: "sc1", type: "oscilloscope", x: 616, y: 24, rotation: 0, props: {} },
          placeOnBB("c1", "capacitor", 3, 298, 0, { capacitance: 0.1 }),
          placeOnBB("d1", "diode", 7, 338, 270, { material: "si" }),
          placeOnBB("rl", "resistor", 11, 338, 90, { resistance: 100000 }),
        ],
        wires: [
          { id: "w1", from: { compId: "bb1", pinId: "b7" }, to: { compId: "bb1", pinId: "b11" }, color: "#b91c1c" },
          { id: "w2", from: { compId: "bb1", pinId: "j7" }, to: { compId: "bb1", pinId: "bn_7" }, color: "#18181b" },
          { id: "w3", from: { compId: "bb1", pinId: "j11" }, to: { compId: "bb1", pinId: "bn_11" }, color: "#18181b" },
          { id: "w4", from: { compId: "fg1", pinId: "pos" }, to: { compId: "bb1", pinId: "a3" }, color: "#b91c1c" },
          { id: "w5", from: { compId: "fg1", pinId: "neg" }, to: { compId: "bb1", pinId: "bn_2" }, color: "#18181b" },
          { id: "w6", from: { compId: "sc1", pinId: "ch1_pos" }, to: { compId: "bb1", pinId: "b3" }, color: "#b91c1c" },
          { id: "w7", from: { compId: "sc1", pinId: "ch1_neg" }, to: { compId: "bb1", pinId: "bn_14" }, color: "#18181b" },
        ],
      },
      // --- Step 11: Move Scope to Output --- Positive Clamper Output Reading
      {
        id: "exp7-s11",
        title: "Step 11: Move Oscilloscope to Output (a11 / bn_16) - Positive Clamper Reading",
        instruction:
          "Move the 2 Oscilloscope wires from the input to the output: connect CH1 (+) [Red] to a11 (top of 100 kOhm load resistor) and CH1 (-) [Black] to bn_16 (ground rail). Click 'Open Scope' to read. Expected: Vmin near -0.6 V, Vmax near +9.4 V.",
        observation:
          "PDF Table match for positive clamper: The 10 Vpp square wave shifts upward so its minimum sits near -0.6 V and maximum reaches +9.4 V.",
        components: [
          BASE_BB,
          { id: "fg1", type: "func-gen", x: 16, y: 24, rotation: 0, props: { waveform: "square", vpp: 10, freq: 1000 } },
          { id: "sc1", type: "oscilloscope", x: 616, y: 24, rotation: 0, props: {} },
          placeOnBB("c1", "capacitor", 3, 298, 0, { capacitance: 0.1 }),
          placeOnBB("d1", "diode", 7, 338, 270, { material: "si" }),
          placeOnBB("rl", "resistor", 11, 338, 90, { resistance: 100000 }),
        ],
        wires: [
          { id: "w1", from: { compId: "bb1", pinId: "b7" }, to: { compId: "bb1", pinId: "b11" }, color: "#b91c1c" },
          { id: "w2", from: { compId: "bb1", pinId: "j7" }, to: { compId: "bb1", pinId: "bn_7" }, color: "#18181b" },
          { id: "w3", from: { compId: "bb1", pinId: "j11" }, to: { compId: "bb1", pinId: "bn_11" }, color: "#18181b" },
          { id: "w4", from: { compId: "fg1", pinId: "pos" }, to: { compId: "bb1", pinId: "a3" }, color: "#b91c1c" },
          { id: "w5", from: { compId: "fg1", pinId: "neg" }, to: { compId: "bb1", pinId: "bn_2" }, color: "#18181b" },
          { id: "w6", from: { compId: "sc1", pinId: "ch1_pos" }, to: { compId: "bb1", pinId: "a11" }, color: "#b91c1c" },
          { id: "w7", from: { compId: "sc1", pinId: "ch1_neg" }, to: { compId: "bb1", pinId: "bn_16" }, color: "#18181b" },
        ],
      },
      // --- Step 12: Flip diode for negative clamper & monitor Input ---
      {
        id: "exp7-s12",
        title: "Step 12: Flip Diode for Negative Clamper & Monitor Input (b3 / bn_14)",
        instruction:
          "Remove the diode from column 7 and re-insert it reversed: Anode (+) at d7 (top, toward capacitor) and Cathode (-) at g7 (bottom, toward ground). Move the 2 Oscilloscope wires back to the input: CH1 (+) [Red] to b3 and CH1 (-) [Black] to bn_14.",
        observation:
          "The diode is reversed for negative clamping. The input on the scope remains an unshifted 10 Vpp square wave (-5 V to +5 V).",
        components: [
          BASE_BB,
          { id: "fg1", type: "func-gen", x: 16, y: 24, rotation: 0, props: { waveform: "square", vpp: 10, freq: 1000 } },
          { id: "sc1", type: "oscilloscope", x: 616, y: 24, rotation: 0, props: {} },
          placeOnBB("c1", "capacitor", 3, 298, 0, { capacitance: 0.1 }),
          placeOnBB("d1", "diode", 7, 338, 90, { material: "si" }),
          placeOnBB("rl", "resistor", 11, 338, 90, { resistance: 100000 }),
        ],
        wires: [
          { id: "w1", from: { compId: "bb1", pinId: "b7" }, to: { compId: "bb1", pinId: "b11" }, color: "#b91c1c" },
          { id: "w2", from: { compId: "bb1", pinId: "j7" }, to: { compId: "bb1", pinId: "bn_7" }, color: "#18181b" },
          { id: "w3", from: { compId: "bb1", pinId: "j11" }, to: { compId: "bb1", pinId: "bn_11" }, color: "#18181b" },
          { id: "w4", from: { compId: "fg1", pinId: "pos" }, to: { compId: "bb1", pinId: "a3" }, color: "#b91c1c" },
          { id: "w5", from: { compId: "fg1", pinId: "neg" }, to: { compId: "bb1", pinId: "bn_2" }, color: "#18181b" },
          { id: "w6", from: { compId: "sc1", pinId: "ch1_pos" }, to: { compId: "bb1", pinId: "b3" }, color: "#b91c1c" },
          { id: "w7", from: { compId: "sc1", pinId: "ch1_neg" }, to: { compId: "bb1", pinId: "bn_14" }, color: "#18181b" },
        ],
      },
      // --- Step 13: Move Scope to Output --- Negative Clamper Output Reading
      {
        id: "exp7-s13",
        title: "Step 13: Move Oscilloscope to Output (a11 / bn_16) - Negative Clamper Reading",
        instruction:
          "Move the 2 Oscilloscope wires from the input to the output: CH1 (+) [Red] to a11 (load top) and CH1 (-) [Black] to bn_16 (ground rail). Click 'Open Scope' to read. Expected: Vmax near +0.6 V, Vmin near -9.4 V.",
        observation:
          "The square wave shifts downward without changing shape: Vmax clamps near +0.6 V and Vmin drops to -9.4 V while Vp-p stays 10 V.",
        components: [
          BASE_BB,
          { id: "fg1", type: "func-gen", x: 16, y: 24, rotation: 0, props: { waveform: "square", vpp: 10, freq: 1000 } },
          { id: "sc1", type: "oscilloscope", x: 616, y: 24, rotation: 0, props: {} },
          placeOnBB("c1", "capacitor", 3, 298, 0, { capacitance: 0.1 }),
          placeOnBB("d1", "diode", 7, 338, 90, { material: "si" }),
          placeOnBB("rl", "resistor", 11, 338, 90, { resistance: 100000 }),
        ],
        wires: [
          { id: "w1", from: { compId: "bb1", pinId: "b7" }, to: { compId: "bb1", pinId: "b11" }, color: "#b91c1c" },
          { id: "w2", from: { compId: "bb1", pinId: "j7" }, to: { compId: "bb1", pinId: "bn_7" }, color: "#18181b" },
          { id: "w3", from: { compId: "bb1", pinId: "j11" }, to: { compId: "bb1", pinId: "bn_11" }, color: "#18181b" },
          { id: "w4", from: { compId: "fg1", pinId: "pos" }, to: { compId: "bb1", pinId: "a3" }, color: "#b91c1c" },
          { id: "w5", from: { compId: "fg1", pinId: "neg" }, to: { compId: "bb1", pinId: "bn_2" }, color: "#18181b" },
          { id: "w6", from: { compId: "sc1", pinId: "ch1_pos" }, to: { compId: "bb1", pinId: "a11" }, color: "#b91c1c" },
          { id: "w7", from: { compId: "sc1", pinId: "ch1_neg" }, to: { compId: "bb1", pinId: "bn_16" }, color: "#18181b" },
        ],
      },
      // --- Step 14: Biased Positive Clamper (Add DC Supply +) ---
      {
        id: "exp7-s14",
        title: "Step 14: Biased Positive Clamper - Flip Diode & Connect DC Supply (+)",
        instruction:
          "Flip the diode back to Positive Clamper (Cathode at d7, Anode at g7). Remove the ground wire from j7, and connect DC Supply (+) [Red] (+2.0 V) to j7 (diode anode bottom).",
        observation:
          "The DC bias source is now connected in series with the diode anode.",
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
          { id: "w1", from: { compId: "bb1", pinId: "b7" }, to: { compId: "bb1", pinId: "b11" }, color: "#b91c1c" },
          { id: "w2", from: { compId: "dc1", pinId: "pos" }, to: { compId: "bb1", pinId: "j7" }, color: "#b91c1c" },
          { id: "w3", from: { compId: "bb1", pinId: "j11" }, to: { compId: "bb1", pinId: "bn_11" }, color: "#18181b" },
          { id: "w4", from: { compId: "fg1", pinId: "pos" }, to: { compId: "bb1", pinId: "a3" }, color: "#b91c1c" },
          { id: "w5", from: { compId: "fg1", pinId: "neg" }, to: { compId: "bb1", pinId: "bn_2" }, color: "#18181b" },
          { id: "w6", from: { compId: "sc1", pinId: "ch1_pos" }, to: { compId: "bb1", pinId: "a11" }, color: "#b91c1c" },
          { id: "w7", from: { compId: "sc1", pinId: "ch1_neg" }, to: { compId: "bb1", pinId: "bn_16" }, color: "#18181b" },
        ],
      },
      // --- Step 15: Biased Positive Clamper (Connect DC Supply -) ---
      {
        id: "exp7-s15",
        title: "Step 15: Connect DC Supply (-) to Ground at bn_6 (Black) - Biased Clamper Reading",
        instruction:
          "Connect DC Supply (-) [Black] to bn_6 (ground rail). Keep the 2 Oscilloscope wires on the output (a11 / bn_16). Click 'Open Scope' to read. Expected: Vmin shifts up to +1.4 V and Vmax reaches +11.4 V.",
        observation:
          "PDF Fig (b) match: Adding +2.0 V bias shifts the clamped square wave upward by an additional 2 V (Vmin ~ +1.4 V, Vmax ~ +11.4 V, Vp-p = 10 V).",
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
          { id: "w1", from: { compId: "bb1", pinId: "b7" }, to: { compId: "bb1", pinId: "b11" }, color: "#b91c1c" },
          { id: "w2", from: { compId: "dc1", pinId: "pos" }, to: { compId: "bb1", pinId: "j7" }, color: "#b91c1c" },
          { id: "w3", from: { compId: "dc1", pinId: "neg" }, to: { compId: "bb1", pinId: "bn_6" }, color: "#18181b" },
          { id: "w4", from: { compId: "bb1", pinId: "j11" }, to: { compId: "bb1", pinId: "bn_11" }, color: "#18181b" },
          { id: "w5", from: { compId: "fg1", pinId: "pos" }, to: { compId: "bb1", pinId: "a3" }, color: "#b91c1c" },
          { id: "w6", from: { compId: "fg1", pinId: "neg" }, to: { compId: "bb1", pinId: "bn_2" }, color: "#18181b" },
          { id: "w7", from: { compId: "sc1", pinId: "ch1_pos" }, to: { compId: "bb1", pinId: "a11" }, color: "#b91c1c" },
          { id: "w8", from: { compId: "sc1", pinId: "ch1_neg" }, to: { compId: "bb1", pinId: "bn_16" }, color: "#18181b" },
        ],
      },
    ],
  },
];
