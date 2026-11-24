import type { ExperimentMeta } from "@/types/lab";

export const EXPERIMENTS: ExperimentMeta[] = [
  {
    id: "exp-1",
    number: "01",
    shortTitle: "Lab Instruments & RLC",
    title: "Introduction to Electronic Devices and Circuits Lab",
    objective:
      "Operate the Trainer Board, Function Generator, and Dual-Channel Oscilloscope while observing voltage-current phase behavior across resistors, capacitors, and inductors.",
    apparatus: [
      "Trainer Board (Breadboard + Built-in DC Supply)",
      "Function / Signal Generator (SFG-1002)",
      "Dual-Channel Digital Oscilloscope (RIGOL DS1052D / GW Instek)",
      "Resistor (1 kOhm), Capacitor (0.1 uF), Inductor (100 mH)",
    ],
    formulas: [
      { label: "Ohm's Law", expression: "V = I * R (0 deg phase)" },
      { label: "Capacitive Reactance", expression: "Xc = 1 / (2 * pi * f * C)" },
      { label: "Inductive Reactance", expression: "XL = 2 * pi * f * L" },
    ],
    plotMode: "transient",
    xLabel: "Time (ms)",
    yLabel: "Voltage (V)",
    referenceNote:
      "Resistors keep voltage and current in phase. Capacitors cause current to lead voltage; inductors cause voltage to lead current.",
    controls: [
      {
        key: "waveform",
        label: "Input Waveform",
        type: "select",
        options: [
          { label: "Sine Wave", value: "sine" },
          { label: "Square Wave", value: "square" },
          { label: "Triangular Wave", value: "triangle" },
        ],
        defaultValue: "sine",
      },
      {
        key: "component",
        label: "Load Configuration",
        type: "select",
        options: [
          { label: "Pure Resistor (R)", value: "r" },
          { label: "RC Network (R + C)", value: "rc" },
          { label: "RL Network (R + L)", value: "rl" },
        ],
        defaultValue: "rc",
      },
      {
        key: "vpp",
        label: "Generator Amplitude",
        unit: "Vpp",
        type: "slider",
        min: 2,
        max: 20,
        step: 1,
        defaultValue: 10,
      },
      {
        key: "freq",
        label: "Generator Frequency",
        unit: "Hz",
        type: "slider",
        min: 200,
        max: 5000,
        step: 100,
        defaultValue: 1000,
      },
      {
        key: "resistor",
        label: "Series Resistor R",
        unit: "Ohm",
        type: "slider",
        min: 220,
        max: 4700,
        step: 100,
        defaultValue: 1000,
      },
      {
        key: "capacitor",
        label: "Capacitor C",
        unit: "uF",
        type: "slider",
        min: 0.05,
        max: 1,
        step: 0.05,
        defaultValue: 0.1,
      },
    ],
    steps: [
      {
        id: "e1-s1",
        title: "Verify Signal Generator Output",
        instruction:
          "Set the Function Generator to Sine Wave at 10 Vpp and 1000 Hz. Connect CH1 to the generator output.",
        hint: "Use 10 Vpp and 1000 Hz as your baseline test signal.",
        checkLabel: "Sine wave 10 Vpp at 1000 Hz active",
        verify: (p) => p.waveform === "sine" && Number(p.vpp) === 10 && Number(p.freq) === 1000,
      },
      {
        id: "e1-s2",
        title: "Observe Pure Resistive Response",
        instruction:
          "Select Pure Resistor (R) and observe CH1 (Vin) and CH2 (Vout). Notice zero phase shift between input and output.",
        hint: "In a pure resistive divider, output stays in phase with input.",
        checkLabel: "Pure resistor phase shift is 0 deg",
        verify: (p) => p.component === "r",
      },
      {
        id: "e1-s3",
        title: "Measure Capacitive Phase Shift",
        instruction:
          "Switch to RC Network (R + C) with R = 1000 Ohm and C = 0.1 uF. Observe how CH2 lags CH1 due to capacitive reactance.",
        hint: "Increasing frequency lowers Xc and attenuates high frequencies.",
        checkLabel: "RC phase lag observed on CH2",
        verify: (p, m) => p.component === "rc" && Math.abs(m.phaseShiftDeg ?? 0) > 10,
      },
      {
        id: "e1-s4",
        title: "Test Square Wave Response",
        instruction:
          "Switch Input Waveform to Square Wave on the RC network to observe exponential charging and discharging curves.",
        hint: "This RC charging curve is the foundation for filter and clamper circuits.",
        checkLabel: "Square wave RC transient observed",
        verify: (p) => p.waveform === "square" && p.component === "rc",
      },
    ],
    challenge: {
      title: "Sir's Lab Final Check",
      prompt:
        "Configure an RC circuit with a 10 Vpp Sine input so that the output amplitude (Vpp) drops below 5.0 V at 2000 Hz.",
      targetDescription: "Sine, RC mode, Vin = 10 Vpp, f >= 2000 Hz, Output Vpp < 5.0 V",
      verify: (p, m) =>
        p.waveform === "sine" &&
        p.component === "rc" &&
        Number(p.vpp) === 10 &&
        Number(p.freq) >= 2000 &&
        (m.vpp ?? 99) < 5.0,
    },
  },
  {
    id: "exp-2",
    number: "02",
    shortTitle: "Diode I-V Curve",
    title: "I-V Characteristics of PN Junction Diode",
    objective:
      "Measure forward and reverse bias current-voltage characteristics of a PN junction diode and identify its threshold (cut-in) voltage.",
    apparatus: [
      "PN Junction Diode (1N4007 Silicon / 1N34A Germanium)",
      "Variable DC Power Supply (0 to 10 V)",
      "Series Resistor (1 kOhm)",
      "Digital Multimeter (Voltmeter & Ammeter)",
      "Breadboard and Connecting Wires",
    ],
    formulas: [
      { label: "Diode Current", expression: "Id = (Vdc - Vd) / R = Vr / R" },
      { label: "Silicon Knee Voltage", expression: "Vk ~ 0.6 V to 0.7 V" },
      { label: "Germanium Knee Voltage", expression: "Vk ~ 0.2 V to 0.3 V" },
    ],
    plotMode: "iv-curve",
    xLabel: "Diode Voltage Vd (V)",
    yLabel: "Diode Current Id (mA)",
    referenceNote:
      "Lab report reference (R = 1 kOhm, Forward): at Vdc = 0.5V -> Vd = 0.445V, Id = 0.062 mA; at Vdc = 3V -> Vd = 0.602V, Id = 2.408 mA.",
    controls: [
      {
        key: "bias",
        label: "Bias Configuration",
        type: "select",
        options: [
          { label: "Forward Bias (P to +, N to -)", value: "forward" },
          { label: "Reverse Bias (N to +, P to -)", value: "reverse" },
        ],
        defaultValue: "forward",
      },
      {
        key: "material",
        label: "Semiconductor Type",
        type: "select",
        options: [
          { label: "Silicon (1N4007)", value: "si" },
          { label: "Germanium (1N34A)", value: "ge" },
        ],
        defaultValue: "si",
      },
      {
        key: "vin",
        label: "DC Supply Vdc",
        unit: "V",
        type: "slider",
        min: 0,
        max: 10,
        step: 0.25,
        defaultValue: 3,
      },
      {
        key: "resistor",
        label: "Limiting Resistor R",
        unit: "Ohm",
        type: "slider",
        min: 220,
        max: 2200,
        step: 100,
        defaultValue: 1000,
      },
    ],
    steps: [
      {
        id: "e2-s1",
        title: "Connect Forward Bias Circuit",
        instruction:
          "Set Bias Configuration to Forward Bias with Silicon (1N4007) and R = 1000 Ohm.",
        hint: "Anode (P-side) connects toward the positive terminal through R.",
        checkLabel: "Forward bias Silicon circuit ready",
        verify: (p) => p.bias === "forward" && p.material === "si" && Number(p.resistor) === 1000,
      },
      {
        id: "e2-s2",
        title: "Sweep Below Threshold Voltage",
        instruction:
          "Set Vdc = 0.25 V or 0.5 V and inspect Vd and Id. Notice current stays tiny before the 0.6-0.7 V barrier is overcome.",
        hint: "Depletion region narrows but conduction is minimal below 0.5 V.",
        checkLabel: "Sub-threshold region measured",
        verify: (p, m) => p.bias === "forward" && Number(p.vin) <= 0.5 && (m.idMa ?? 99) < 0.2,
      },
      {
        id: "e2-s3",
        title: "Sweep Above Threshold and Log Data",
        instruction:
          "Increase Vdc to 3 V or higher and click Record Reading to save points into your Lab Data Table.",
        hint: "Above 0.6 V, Vd stays nearly flat (~0.6-0.7 V) while Id rises sharply.",
        checkLabel: "Forward conduction > 2 mA verified",
        verify: (p, m) => p.bias === "forward" && Number(p.vin) >= 3 && (m.idMa ?? 0) > 2,
      },
      {
        id: "e2-s4",
        title: "Verify Reverse Bias Blocking",
        instruction:
          "Switch to Reverse Bias and sweep Vdc to 5 V. Confirm Vd equals Vdc and Id stays near 0 mA.",
        hint: "Widened depletion layer blocks majority carriers.",
        checkLabel: "Reverse blocking confirmed",
        verify: (p, m) => p.bias === "reverse" && Number(p.vin) >= 3 && (m.idMa ?? 99) < 0.05,
      },
    ],
    challenge: {
      title: "Sir's Lab Final Check",
      prompt:
        "Using a Silicon diode in Forward Bias with R = 1000 Ohm, adjust Vdc so the diode current Id is between 4.0 mA and 5.0 mA.",
      targetDescription: "Forward Bias, Silicon, R = 1000 Ohm, 4.0 mA <= Id <= 5.0 mA",
      verify: (p, m) =>
        p.bias === "forward" &&
        p.material === "si" &&
        Number(p.resistor) === 1000 &&
        (m.idMa ?? 0) >= 4.0 &&
        (m.idMa ?? 0) <= 5.0,
    },
  },
  {
    id: "exp-3",
    number: "03",
    shortTitle: "Zener Regulator",
    title: "Study of Zener Diode Applications",
    objective:
      "Analyze Zener diode reverse breakdown characteristics and verify its voltage regulation behavior across a load resistor.",
    apparatus: [
      "Zener Diode (5.1 V or 8.9 V breakdown)",
      "Series Current-Limiting Resistor (470 Ohm / 976 Ohm)",
      "Load Resistor (10 kOhm)",
      "Variable DC Supply (0 to 15 V)",
      "Voltmeter and Ammeter",
    ],
    formulas: [
      { label: "Series Resistor Drop", expression: "Vr = Vin - Vz" },
      { label: "Zener / Total Current", expression: "I = (Vin - Vz) / R" },
      { label: "Regulation Condition", expression: "Vin > Vz (Zener conducts in reverse)" },
    ],
    plotMode: "iv-curve",
    xLabel: "Input Supply Vin (V)",
    yLabel: "Regulated Voltage Vz (V)",
    referenceNote:
      "Below Vz, the Zener diode blocks current and Vout follows Vin. Once Vin exceeds Vz, output voltage clamps near Vz.",
    controls: [
      {
        key: "zenerVoltage",
        label: "Zener Breakdown Vz",
        type: "select",
        options: [
          { label: "5.1 V Zener (1N4733A)", value: 5.1 },
          { label: "8.9 V Zener (Lab Kit)", value: 8.9 },
        ],
        defaultValue: 5.1,
      },
      {
        key: "vin",
        label: "Input Voltage Vin",
        unit: "V",
        type: "slider",
        min: 0,
        max: 15,
        step: 0.5,
        defaultValue: 10,
      },
      {
        key: "resistor",
        label: "Series Resistor R",
        unit: "Ohm",
        type: "slider",
        min: 220,
        max: 1500,
        step: 50,
        defaultValue: 470,
      },
      {
        key: "loadResistor",
        label: "Load Resistor RL",
        unit: "Ohm",
        type: "slider",
        min: 1000,
        max: 20000,
        step: 1000,
        defaultValue: 10000,
      },
    ],
    steps: [
      {
        id: "e3-s1",
        title: "Configure 5.1 V Zener Regulator",
        instruction:
          "Select the 5.1 V Zener diode with R = 470 Ohm and RL = 10000 Ohm.",
        hint: "The Zener diode is connected in reverse bias parallel to the load.",
        checkLabel: "5.1 V Zener regulator configured",
        verify: (p) => Number(p.zenerVoltage) === 5.1 && Number(p.resistor) <= 520,
      },
      {
        id: "e3-s2",
        title: "Test Pre-Breakdown Region",
        instruction:
          "Lower Vin to 3.0 V (below Vz). Verify that Zener current Iz is near zero and Vout rises linearly with Vin.",
        hint: "Before breakdown, the Zener acts as an open circuit.",
        checkLabel: "Pre-breakdown blocking verified",
        verify: (p, m) => Number(p.vin) <= 3.5 && (m.vz ?? 99) < 4.0,
      },
      {
        id: "e3-s3",
        title: "Verify Voltage Regulation",
        instruction:
          "Raise Vin to 10 V and then 14 V. Observe that Vz stays regulated near 5.1 V while excess voltage drops across R.",
        hint: "Notice Vr increases directly with Vin while Vz remains steady.",
        checkLabel: "Output regulated near Vz",
        verify: (p, m) =>
          Number(p.zenerVoltage) === 5.1 &&
          Number(p.vin) >= 10 &&
          (m.vz ?? 0) >= 4.8 &&
          (m.vz ?? 0) <= 5.5,
      },
    ],
    challenge: {
      title: "Sir's Lab Final Check",
      prompt:
        "Use the 8.9 V Zener diode with R = 470 Ohm and adjust Vin so the regulated output Vz is between 8.5 V and 9.3 V with current above 5 mA.",
      targetDescription: "Vz = 8.9 V, R = 470 Ohm, 8.5 V <= Vout <= 9.3 V, I > 5 mA",
      verify: (p, m) =>
        Number(p.zenerVoltage) === 8.9 &&
        Number(p.resistor) === 470 &&
        (m.vz ?? 0) >= 8.5 &&
        (m.vz ?? 0) <= 9.3 &&
        (m.izMa ?? 0) > 5,
    },
  },
  {
    id: "exp-4",
    number: "04",
    shortTitle: "Half-Wave Rectifier",
    title: "Study of a Half-Wave Diode Rectifier Circuit",
    objective:
      "Convert AC into pulsating DC using a single diode, measure Vdc and ripple factor, and observe smoothing with filter capacitors.",
    apparatus: [
      "Silicon Diode (1N4007)",
      "Function Generator (10 Vpp, 1 kHz Sine)",
      "Load Resistor (1 kOhm)",
      "Filter Capacitors (0.47 uF, 1 uF, 10 uF, 47 uF)",
      "Dual-Channel Oscilloscope",
    ],
    formulas: [
      { label: "Peak Output", expression: "Vmax = Vp - 0.7 V" },
      { label: "Unfiltered Average DC", expression: "Vdc = Vmax / pi" },
      { label: "Ripple Factor", expression: "gamma = Vr(rms) / Vdc" },
    ],
    plotMode: "transient",
    xLabel: "Time (ms)",
    yLabel: "Voltage (V)",
    referenceNote:
      "Lab report (10 Vpp, 1 kHz): Unfiltered ripple ~1.21; 1 uF reduces ripple; 10 uF and 47 uF produce smooth DC.",
    controls: [
      {
        key: "capacitor",
        label: "Filter Capacitor",
        type: "select",
        options: [
          { label: "Unfiltered (0 uF)", value: 0 },
          { label: "0.47 uF", value: 0.47 },
          { label: "1 uF", value: 1 },
          { label: "10 uF", value: 10 },
          { label: "47 uF", value: 47 },
        ],
        defaultValue: 0,
      },
      {
        key: "vpp",
        label: "Input Sine Vpp",
        unit: "Vpp",
        type: "slider",
        min: 4,
        max: 20,
        step: 1,
        defaultValue: 10,
      },
      {
        key: "freq",
        label: "Input Frequency",
        unit: "Hz",
        type: "slider",
        min: 200,
        max: 2000,
        step: 100,
        defaultValue: 1000,
      },
      {
        key: "loadResistor",
        label: "Load Resistor RL",
        unit: "Ohm",
        type: "slider",
        min: 500,
        max: 5000,
        step: 500,
        defaultValue: 1000,
      },
    ],
    steps: [
      {
        id: "e4-s1",
        title: "Observe Unfiltered Half-Wave Output",
        instruction:
          "Set Capacitor to Unfiltered (0 uF) with 10 Vpp, 1000 Hz Sine input. Observe positive half conduction and negative half blocking.",
        hint: "Without a capacitor, Vout drops to 0 V during the entire negative half cycle.",
        checkLabel: "Unfiltered pulsating output observed",
        verify: (p, m) => Number(p.capacitor) === 0 && (m.rippleFactor ?? 0) > 1.0,
      },
      {
        id: "e4-s2",
        title: "Add 1 uF Filter Capacitor",
        instruction:
          "Select 1 uF capacitor and watch the sawtooth ripple waveform appear as the capacitor discharges through RL.",
        hint: "Notice Vmin rises from 0 V and ripple factor drops sharply.",
        checkLabel: "1 uF capacitive filtering observed",
        verify: (p, m) => Number(p.capacitor) === 1 && (m.rippleFactor ?? 99) < 0.5,
      },
      {
        id: "e4-s3",
        title: "Achieve Smooth DC with 10 uF / 47 uF",
        instruction:
          "Switch to 10 uF and then 47 uF. Record Vp-p, Vmax, Vmin, Vavg, and Ripple Factor into your Data Table.",
        hint: "Larger RC time constant keeps the capacitor charged between peaks.",
        checkLabel: "Low-ripple DC output verified",
        verify: (p, m) => Number(p.capacitor) >= 10 && (m.rippleFactor ?? 99) < 0.08,
      },
    ],
    challenge: {
      title: "Sir's Lab Final Check",
      prompt:
        "With 10 Vpp, 1000 Hz input and RL = 1000 Ohm, select a filter capacitor so that output ripple factor is below 0.05 and Vavg is above 4.0 V.",
      targetDescription: "Vin = 10 Vpp, 1 kHz, RL = 1000 Ohm, Ripple < 0.05, Vavg > 4.0 V",
      verify: (p, m) =>
        Number(p.vpp) === 10 &&
        Number(p.freq) === 1000 &&
        Number(p.loadResistor) === 1000 &&
        (m.rippleFactor ?? 99) < 0.05 &&
        (m.vavg ?? 0) > 4.0,
    },
  },
  {
    id: "exp-5",
    number: "05",
    shortTitle: "Full-Wave Rectifier",
    title: "Study of Full-Wave Bridge Diode Rectifier Circuit",
    objective:
      "Analyze a 4-diode full-wave bridge rectifier with different filter capacitors and compare ripple reduction against the half-wave rectifier.",
    apparatus: [
      "Four Silicon Diodes (1N4007 Bridge)",
      "Function Generator (10 Vpp, 1 kHz Sine)",
      "Load Resistor (1 kOhm)",
      "Filter Capacitors (0.47 uF, 10 uF, 47 uF)",
      "Dual-Channel Oscilloscope",
    ],
    formulas: [
      { label: "Bridge Peak Output", expression: "Vmax = Vp - 2 * 0.7 V" },
      { label: "Unfiltered Average DC", expression: "Vdc = 2 * Vmax / pi" },
      { label: "Output Ripple Frequency", expression: "f_ripple = 2 * f_in" },
    ],
    plotMode: "transient",
    xLabel: "Time (ms)",
    yLabel: "Voltage (V)",
    referenceNote:
      "Two diodes conduct per half cycle, giving Vp - 1.4V peak and doubling ripple frequency (2 kHz for 1 kHz input).",
    controls: [
      {
        key: "capacitor",
        label: "Filter Capacitor",
        type: "select",
        options: [
          { label: "Unfiltered (0 uF)", value: 0 },
          { label: "0.47 uF", value: 0.47 },
          { label: "10 uF", value: 10 },
          { label: "47 uF", value: 47 },
        ],
        defaultValue: 0,
      },
      {
        key: "vpp",
        label: "Input Sine Vpp",
        unit: "Vpp",
        type: "slider",
        min: 6,
        max: 24,
        step: 1,
        defaultValue: 10,
      },
      {
        key: "freq",
        label: "Input Frequency",
        unit: "Hz",
        type: "slider",
        min: 200,
        max: 2000,
        step: 100,
        defaultValue: 1000,
      },
      {
        key: "loadResistor",
        label: "Load Resistor RL",
        unit: "Ohm",
        type: "slider",
        min: 500,
        max: 5000,
        step: 500,
        defaultValue: 1000,
      },
    ],
    steps: [
      {
        id: "e5-s1",
        title: "Verify Unfiltered Full-Wave Pulses",
        instruction:
          "Run with Unfiltered (0 uF) at 10 Vpp, 1000 Hz. Observe that both positive and negative half-cycles appear positive at the output.",
        hint: "Unfiltered ripple factor is ~0.48, much lower than half-wave (~1.21).",
        checkLabel: "Both half-cycles rectified",
        verify: (p, m) => Number(p.capacitor) === 0 && (m.rippleFactor ?? 0) > 0.35 && (m.rippleFactor ?? 99) < 0.7,
      },
      {
        id: "e5-s2",
        title: "Observe 0.47 uF Intermediate Filtering",
        instruction:
          "Select 0.47 uF and note how quickly the capacitor recharges every half cycle (twice as often as half-wave).",
        hint: "Shorter discharge time means smaller ripple for the same capacitor.",
        checkLabel: "0.47 uF bridge ripple measured",
        verify: (p, m) => Number(p.capacitor) === 0.47 && (m.rippleFactor ?? 99) < 0.3,
      },
      {
        id: "e5-s3",
        title: "Compare 10 uF and 47 uF Smoothing",
        instruction:
          "Switch to 10 uF and 47 uF to achieve near-flat DC output, and log each condition in your Data Table.",
        hint: "Notice Vmax is Vp - 1.4V because two bridge diodes conduct in series.",
        checkLabel: "Flat DC output achieved",
        verify: (p, m) => Number(p.capacitor) >= 10 && (m.rippleFactor ?? 99) < 0.03,
      },
    ],
    challenge: {
      title: "Sir's Lab Final Check",
      prompt:
        "Configure the Bridge Rectifier with 16 Vpp input at 1000 Hz so that Vavg exceeds 6.0 V and ripple factor is below 0.02.",
      targetDescription: "Vin = 16 Vpp, 1 kHz, Vavg > 6.0 V, Ripple < 0.02",
      verify: (p, m) =>
        Number(p.vpp) === 16 &&
        Number(p.freq) === 1000 &&
        (m.vavg ?? 0) > 6.0 &&
        (m.rippleFactor ?? 99) < 0.02,
    },
  },
  {
    id: "exp-6",
    number: "06",
    shortTitle: "Diode Clipper",
    title: "Study of Diode Clipper Circuits",
    objective:
      "Limit or clip positive and negative portions of an AC waveform at controlled voltage levels using biased and unbiased diode clippers.",
    apparatus: [
      "Silicon Diode (1N4007)",
      "Series Resistor (1 kOhm)",
      "DC Bias Supply (0 to 5 V)",
      "Function Generator (19.6 Vpp, 1 kHz Sine)",
      "Dual-Channel Oscilloscope",
    ],
    formulas: [
      { label: "Biased Positive Clip", expression: "Vclip(+) = Vbias + 0.7 V" },
      { label: "Biased Negative Clip", expression: "Vclip(-) = -(Vbias + 0.7 V)" },
      { label: "Unbiased Clip", expression: "Vclip = +/- 0.7 V" },
    ],
    plotMode: "transient",
    xLabel: "Time (ms)",
    yLabel: "Voltage (V)",
    referenceNote:
      "Lab report (19.6 Vpp, 1 kHz): Biased forward clipper clips Vmax near +3.0V while negative half passes to -9.0V; reverse clips Vmin near -3.2V.",
    controls: [
      {
        key: "clipMode",
        label: "Clipper Topology",
        type: "select",
        options: [
          { label: "Biased Positive Clipper", value: "biased-pos" },
          { label: "Biased Negative Clipper", value: "biased-neg" },
          { label: "Unbiased Positive Clipper", value: "pos" },
          { label: "Unbiased Negative Clipper", value: "neg" },
          { label: "Dual Symmetrical Clipper", value: "dual" },
        ],
        defaultValue: "biased-pos",
      },
      {
        key: "vpp",
        label: "Input Signal Vpp",
        unit: "Vpp",
        type: "slider",
        min: 6,
        max: 24,
        step: 0.4,
        defaultValue: 19.6,
      },
      {
        key: "biasVoltage",
        label: "DC Bias Battery Vbias",
        unit: "V",
        type: "slider",
        min: 0,
        max: 6,
        step: 0.1,
        defaultValue: 2.3,
      },
      {
        key: "freq",
        label: "Input Frequency",
        unit: "Hz",
        type: "slider",
        min: 200,
        max: 2000,
        step: 100,
        defaultValue: 1000,
      },
    ],
    steps: [
      {
        id: "e6-s1",
        title: "Test Biased Positive Clipper",
        instruction:
          "Select Biased Positive Clipper with Vin = 19.6 Vpp and Vbias = 2.3 V. Verify Vmax clips near +3.0 V (2.3 V + 0.7 V).",
        hint: "When Vin exceeds Vbias + 0.7 V, the diode conducts and clamps Vout.",
        checkLabel: "Positive peak clipped near +3.0 V",
        verify: (p, m) =>
          p.clipMode === "biased-pos" &&
          (m.vmax ?? 99) >= 2.7 &&
          (m.vmax ?? 99) <= 3.3,
      },
      {
        id: "e6-s2",
        title: "Test Biased Negative Clipper",
        instruction:
          "Switch to Biased Negative Clipper with Vbias = 2.5 V. Confirm Vmin is clipped around -3.2 V while positive peaks pass.",
        hint: "Reversing diode and battery polarity clips the negative half cycle.",
        checkLabel: "Negative peak clipped near -3.2 V",
        verify: (p, m) =>
          p.clipMode === "biased-neg" &&
          (m.vmin ?? -99) <= -2.8 &&
          (m.vmin ?? -99) >= -3.6,
      },
      {
        id: "e6-s3",
        title: "Build Dual Symmetrical Clipper",
        instruction:
          "Select Dual Symmetrical Clipper to flatten both positive and negative peaks simultaneously.",
        hint: "Used in signal protection and square-wave shaping.",
        checkLabel: "Both peaks clipped symmetrically",
        verify: (p, m) =>
          p.clipMode === "dual" && (m.vmax ?? 99) < 7 && (m.vmin ?? -99) > -7,
      },
    ],
    challenge: {
      title: "Sir's Lab Final Check",
      prompt:
        "Configure a Dual Symmetrical Clipper with 19.6 Vpp input so that output Vmax is between 3.8 V and 4.3 V and Vmin is between -4.3 V and -3.8 V.",
      targetDescription: "Dual Clipper, Vin = 19.6 Vpp, Vout clipped to approx +/- 4.0 V",
      verify: (p, m) =>
        p.clipMode === "dual" &&
        Number(p.vpp) >= 19 &&
        (m.vmax ?? 0) >= 3.8 &&
        (m.vmax ?? 99) <= 4.3 &&
        (m.vmin ?? -99) <= -3.8 &&
        (m.vmin ?? 0) >= -4.3,
    },
  },
  {
    id: "exp-7",
    number: "07",
    shortTitle: "Diode Clamper",
    title: "Study of Diode Clamper Circuit",
    objective:
      "Shift an AC waveform vertically to a positive or negative DC level without distorting its peak-to-peak shape.",
    apparatus: [
      "Silicon Diode (1N4007)",
      "Coupling Capacitor (10 uF)",
      "Load Resistor (100 kOhm)",
      "Function Generator (10 Vpp, 1 kHz Sine)",
      "Dual-Channel Oscilloscope (DC Coupled)",
    ],
    formulas: [
      { label: "Positive Clamper", expression: "Vout = Vin + (Vp - 0.7 V)" },
      { label: "Negative Clamper", expression: "Vout = Vin - (Vp - 0.7 V)" },
      { label: "Time Constant Rule", expression: "R * C >> T (period of input)" },
    ],
    plotMode: "transient",
    xLabel: "Time (ms)",
    yLabel: "Voltage (V)",
    referenceNote:
      "Positive clamper shifts the negative peak near -0.7V so almost the entire waveform sits above 0V. Peak-to-peak voltage remains unchanged.",
    controls: [
      {
        key: "clampMode",
        label: "Clamper Polarity",
        type: "select",
        options: [
          { label: "Positive Clamper (Shift Up)", value: "positive" },
          { label: "Negative Clamper (Shift Down)", value: "negative" },
        ],
        defaultValue: "positive",
      },
      {
        key: "vpp",
        label: "Input Signal Vpp",
        unit: "Vpp",
        type: "slider",
        min: 2,
        max: 20,
        step: 1,
        defaultValue: 10,
      },
      {
        key: "capacitor",
        label: "Clamping Capacitor C",
        unit: "uF",
        type: "slider",
        min: 0.1,
        max: 47,
        step: 0.5,
        defaultValue: 10,
      },
      {
        key: "loadResistor",
        label: "Load Resistor R",
        unit: "Ohm",
        type: "slider",
        min: 1000,
        max: 100000,
        step: 5000,
        defaultValue: 100000,
      },
      {
        key: "biasVoltage",
        label: "Optional DC Bias",
        unit: "V",
        type: "slider",
        min: -3,
        max: 3,
        step: 0.5,
        defaultValue: 0,
      },
    ],
    steps: [
      {
        id: "e7-s1",
        title: "Verify Positive Clamping",
        instruction:
          "Select Positive Clamper with Vin = 10 Vpp, C = 10 uF, R = 100 kOhm, Bias = 0 V. Observe Vmin near -0.7 V and Vmax near +9.3 V.",
        hint: "Output Vp-p stays ~10 V while the DC average shifts upward.",
        checkLabel: "Positive DC shift without distortion",
        verify: (p, m) =>
          p.clampMode === "positive" &&
          Number(p.biasVoltage) === 0 &&
          (m.vmax ?? 0) > 8.5 &&
          (m.vmin ?? -99) > -1.2,
      },
      {
        id: "e7-s2",
        title: "Verify Negative Clamping",
        instruction:
          "Switch to Negative Clamper. Confirm the waveform shifts downward so Vmax sits near +0.7 V and Vmin near -9.3 V.",
        hint: "Reversing the diode reverses the capacitor charging polarity.",
        checkLabel: "Negative DC shift verified",
        verify: (p, m) =>
          p.clampMode === "negative" &&
          Number(p.biasVoltage) === 0 &&
          (m.vmin ?? 0) < -8.5 &&
          (m.vmax ?? 99) < 1.2,
      },
      {
        id: "e7-s3",
        title: "Observe Small RC Time Constant Distortion",
        instruction:
          "Temporarily lower R to 1000 Ohm and C to 0.1 uF to see why R*C >> T is required for a clamper.",
        hint: "If R*C is too small, the capacitor discharges during each cycle and clamping fails.",
        checkLabel: "RC time constant effect observed",
        verify: (p) => Number(p.loadResistor) <= 5000 && Number(p.capacitor) <= 1,
      },
    ],
    challenge: {
      title: "Sir's Lab Final Check",
      prompt:
        "Clamp a 12 Vpp sine wave upward using a Positive Clamper with Bias = +2.0 V so that output Vmax exceeds +13.0 V while keeping Vp-p preserved.",
      targetDescription: "Positive Clamper, Vin = 12 Vpp, Bias = +2.0 V, Vmax > 13.0 V",
      verify: (p, m) =>
        p.clampMode === "positive" &&
        Number(p.vpp) === 12 &&
        Number(p.biasVoltage) === 2 &&
        (m.vmax ?? 0) > 13.0 &&
        (m.vpp ?? 0) >= 11.5,
    },
  },
];
