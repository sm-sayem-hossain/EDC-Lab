import type { VivaItem } from "@/types/lab";

export const VIVA_ITEMS: VivaItem[] = [
  {
    id: "v-gen-1",
    experimentId: "general",
    experimentLabel: "Lab Instruments",
    question: "What is the difference between AC coupling and DC coupling on an Oscilloscope?",
    answerBangla:
      "DC coupling-e signal-er DC ebong AC duto component-i dekha jay (jemon Clamper ba Rectifier-er DC shift dekhar jonno DC coupling lagbe). AC coupling-e series capacitor diye DC component block hoye jay, shudhu AC ripple ba pure AC part dekha jay.",
    keyTipBangla:
      "Clamper ba Rectifier experiment-e obosshoi DC coupling select korte hoy, nahole DC level shift bojha jabe na.",
  },
  {
    id: "v-gen-2",
    experimentId: "general",
    experimentLabel: "Lab Instruments",
    question: "How does a Breadboard (Trainer Board) internal connection work?",
    answerBangla:
      "Breadboard-er majher ongsher vertical column-e 5ta kore hole bhetor theke connected thake (kintu majher groove-er duipashe alada). Upore ebong nicher horizontal power rail-gulo lamba-lambi connected thake.",
    keyTipBangla:
      "IC ba diode-er duita leg ek-i 5-hole vertical column-e lagale short circuit hoye jabe.",
  },
  {
    id: "v-1-1",
    experimentId: "exp-1",
    experimentLabel: "Exp 01: Lab Instruments & RLC",
    question: "What is the phase relationship between Voltage and Current in R, L, and C?",
    answerBangla:
      "Resistor-e voltage ebong current in-phase (0 degree phase difference) thake. Capacitor-e current voltage-er cheye 90 degree aage thake (leads), ar Inductor-e voltage current-er cheye 90 degree aage thake (current lags).",
    keyTipBangla:
      "Mone rakhar shortcut: CIVIL — C-te I age V-er cheye, L-e V age I-er cheye.",
  },
  {
    id: "v-1-2",
    experimentId: "exp-1",
    experimentLabel: "Exp 01: Lab Instruments & RLC",
    question: "What is the difference between a Function Generator and a DC Power Supply?",
    answerBangla:
      "DC Power Supply constant steady voltage (jemon 5V, 12V) dey. Function Generator time-varying AC signal (Sine, Square, Triangular wave) toiri kore jar frequency o amplitude change kora jay.",
    keyTipBangla:
      "Rectifier, Clipper, Clamper-e input signal dite Function Generator use hoy.",
  },
  {
    id: "v-2-1",
    experimentId: "exp-2",
    experimentLabel: "Exp 02: Diode I-V Curve",
    question: "What is Knee Voltage (Threshold Voltage) of Silicon and Germanium diodes?",
    answerBangla:
      "Forward bias-e je minimum voltage-er por diode-er current hotat kore barhte shuru kore take Knee ba Threshold voltage bole. Silicon diode-er jonno eta pray 0.7 V ebong Germanium diode-er jonno pray 0.3 V.",
    keyTipBangla:
      "Lab-e Silicon 1N4007 use korle practical-e 0.55V theke 0.7V-er moddhe conduction shuru hoy.",
  },
  {
    id: "v-2-2",
    experimentId: "exp-2",
    experimentLabel: "Exp 02: Diode I-V Curve",
    question: "Why do we connect a series resistor in the Diode I-V circuit?",
    answerBangla:
      "Knee voltage par howar por diode-er resistance onek kome jay ebong current khub druto bare. Series resistor na thakle excessive current flow hoye diode pure (burn) jete pare.",
    keyTipBangla:
      "Current ber korar formula: Id = VR / R = (Vdc - Vd) / R.",
  },
  {
    id: "v-3-1",
    experimentId: "exp-3",
    experimentLabel: "Exp 03: Zener Regulator",
    question: "How is a Zener diode different from a normal PN junction diode?",
    answerBangla:
      "Normal diode shudhu forward bias-e kaj kore ebong reverse breakdown-e nosto hoye jay. Zener diode specially doped thake jate reverse bias-e specific Zener breakdown voltage (Vz)-e nosto na hoye constant voltage maintain korte pare.",
    keyTipBangla:
      "Voltage regulator hishebe Zener diode shobshomoy Reverse Bias-e parallel to load lagano hoy.",
  },
  {
    id: "v-3-2",
    experimentId: "exp-3",
    experimentLabel: "Exp 03: Zener Regulator",
    question: "What happens if input voltage Vin is less than Zener voltage Vz?",
    answerBangla:
      "Vin jodi Vz-er cheye kom hoy, tahole Zener diode breakdown region-e dhuke na ebong open circuit-er moto kaj kore. Tokhon output voltage input voltage-er soman hoye jay, kono regulation hoy na.",
    keyTipBangla:
      "Regulation pete hole obosshoi Vin > Vz hote hobe.",
  },
  {
    id: "v-4-1",
    experimentId: "exp-4",
    experimentLabel: "Exp 04: Half-Wave Rectifier",
    question: "What is Ripple Factor and how does a filter capacitor affect it?",
    answerBangla:
      "Rectifier-er output-e DC-er sathe joto-tuku AC fluctuation (ripple) theke jay tar ratio-kei Ripple Factor bole (gamma = Vr_rms / Vdc). Filter capacitor lagale peak-e charge store kore ebong valley-te aste discharge kore, fole ripple onek kome jay ar Vdc bare.",
    keyTipBangla:
      "Unfiltered half-wave rectifier-er theoretical ripple factor 1.21 ebong efficiency 40.6%.",
  },
  {
    id: "v-4-2",
    experimentId: "exp-4",
    experimentLabel: "Exp 04: Half-Wave Rectifier",
    question: "Why is Vmax at the output slightly less than the input peak Vp?",
    answerBangla:
      "Positive half cycle-e Silicon diode forward bias hole tar across-e pray 0.7 V potential drop hoy. Tai load-er output peak hoy Vmax = Vp - 0.7 V.",
    keyTipBangla:
      "Bridge rectifier-e ekshathe 2ta diode conduct kore bole 1.4 V drop hoy.",
  },
  {
    id: "v-5-1",
    experimentId: "exp-5",
    experimentLabel: "Exp 05: Full-Wave Rectifier",
    question: "Why is a Full-Wave Bridge Rectifier better than a Half-Wave Rectifier?",
    answerBangla:
      "Bridge rectifier input AC-er positive ebong negative duto half cycle-kei DC-te convert kore. Er fole average DC voltage double hoy, ripple frequency 2x hoy (filtering shohoj hoy), ebong unfiltered ripple factor kome 0.48 hoye jay.",
    keyTipBangla:
      "1 kHz input dile half-wave-er ripple frequency 1 kHz, kintu full-wave-er ripple frequency 2 kHz hoy.",
  },
  {
    id: "v-5-2",
    experimentId: "exp-5",
    experimentLabel: "Exp 05: Full-Wave Rectifier",
    question: "How many diodes conduct during each half cycle in a Bridge Rectifier?",
    answerBangla:
      "Total 4ta diode thakleo protiti half cycle-e opposite pair-er 2ta kore diode forward biased hoye conduct kore ebong baki 2ta reverse biased thake.",
    keyTipBangla:
      "Ei jonno peak output drop hoy 2 * 0.7 V = 1.4 V.",
  },
  {
    id: "v-6-1",
    experimentId: "exp-6",
    experimentLabel: "Exp 06: Diode Clipper",
    question: "What is the main function of a Clipper circuit and what does the DC bias battery do?",
    answerBangla:
      "Clipper circuit input waveform-er kono nirdishto positive ba negative ongsho kete (clip kore) fele baki signal thik rekhe. DC bias battery add korle clipping level 0.7 V theke shoriye Vbias +/- 0.7 V-e set kora jay.",
    keyTipBangla:
      "Clipper-e diode parallel-e thakle shunt clipper ar series-e thakle series clipper bole.",
  },
  {
    id: "v-7-1",
    experimentId: "exp-7",
    experimentLabel: "Exp 07: Diode Clamper",
    question: "What is the key difference between a Clipper and a Clamper?",
    answerBangla:
      "Clipper waveform-er shape kete choto kore dey (Vp-p kome jay). Kintu Clamper waveform-er shape ba peak-to-peak voltage change na kore puro signal-take upore (positive) ba niche (negative) DC level-e shift kore.",
    keyTipBangla:
      "Clamper-e obosshoi capacitor input-er sathe series-e thake ebong R*C time constant signal period T-er cheye onek boro (R*C >> T) hote hoy.",
  },
];
