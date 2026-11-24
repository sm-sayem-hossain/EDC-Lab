import type { ExperimentId, SimulationMetrics, SimulationOutput, SimulationPoint } from "@/types/lab";

// Lazy singleton for eecircuit-engine (ngspice WASM)
type SimInstance = {
  start: () => Promise<void>;
  setNetList: (input: string) => void;
  runSim: () => Promise<{
    variableNames: string[];
    numPoints: number;
    dataType: string;
    data: Array<{ name: string; type: string; values: number[] }>;
  }>;
  getError: () => string[];
};

let simPromise: Promise<SimInstance> | null = null;
let simQueue: Promise<unknown> = Promise.resolve();

async function getSimulator(): Promise<SimInstance> {
  if (!simPromise) {
    simPromise = (async () => {
      const mod = await import("eecircuit-engine");
      const sim = new mod.Simulation() as unknown as SimInstance;
      await sim.start();
      return sim;
    })();
  }
  return simPromise;
}

export function buildNetlist(
  expId: ExperimentId,
  params: Record<string, number | string>
): { netlist: string; mode: "dc" | "tran"; tranSkipRatio: number } {
  switch (expId) {
    case "exp-1": {
      const wave = String(params.waveform ?? "sine");
      const amp = Number(params.vpp ?? 10) / 2;
      const freq = Number(params.freq ?? 1000);
      const comp = String(params.component ?? "rc");
      const rVal = Number(params.resistor ?? 1000);
      const cUf = Number(params.capacitor ?? 0.1);
      const lMh = Number(params.inductor ?? 100);
      const period = 1 / freq;
      const tStop = period * 3;
      const tStep = period / 120;

      let sourceLine = `Vin in 0 SIN(0 ${amp} ${freq})`;
      if (wave === "square") {
        sourceLine = `Vin in 0 PULSE(${-amp} ${amp} 0 ${period * 0.01} ${period * 0.01} ${period * 0.48} ${period})`;
      } else if (wave === "triangle") {
        sourceLine = `Vin in 0 PULSE(${-amp} ${amp} 0 ${period * 0.49} ${period * 0.49} ${period * 0.01} ${period})`;
      }

      let loadLines = `R1 in out ${rVal}\nRload out 0 100k`;
      if (comp === "rc") {
        loadLines = `R1 in out ${rVal}\nC1 out 0 ${cUf}u`;
      } else if (comp === "rl") {
        loadLines = `R1 in out ${rVal}\nL1 out 0 ${lMh}m`;
      }

      return {
        netlist: `Exp 1 Passive Components
${sourceLine}
${loadLines}
.tran ${tStep.toExponential(4)} ${tStop.toExponential(4)}
.end`,
        mode: "tran",
        tranSkipRatio: 1 / 3,
      };
    }

    case "exp-2": {
      const bias = String(params.bias ?? "forward");
      const material = String(params.material ?? "si");
      const rVal = Number(params.resistor ?? 1000);
      const model =
        material === "ge"
          ? `.model DMOD D(IS=1.5e-5 N=1.2 RS=0.5 BV=60 IBV=1e-4)`
          : `.model DMOD D(IS=2.5e-9 N=1.75 RS=0.05 BV=1000 IBV=5e-6)`;

      const diodeLine = bias === "forward" ? `D1 out 0 DMOD` : `D1 0 out DMOD`;
      return {
        netlist: `Exp 2 Diode IV Characteristics
${model}
V1 in 0 DC 0
R1 in out ${rVal}
${diodeLine}
.dc V1 0 10 0.1
.end`,
        mode: "dc",
        tranSkipRatio: 0,
      };
    }

    case "exp-3": {
      const vzTarget = Number(params.zenerVoltage ?? 5.1);
      const rVal = Number(params.resistor ?? 470);
      const rLoad = Number(params.loadResistor ?? 10000);
      // Model Zener diode with exact breakdown voltage BV
      const bv = Math.max(2.4, vzTarget - 0.05);
      return {
        netlist: `Exp 3 Zener Diode Regulator
.model DZMOD D(IS=1e-9 N=1.5 RS=1.2 BV=${bv} IBV=5e-3)
V1 in 0 DC 0
R1 in out ${rVal}
Dz 0 out DZMOD
Rload out 0 ${rLoad}
.dc V1 0 15 0.25
.end`,
        mode: "dc",
        tranSkipRatio: 0,
      };
    }

    case "exp-4": {
      const vpp = Number(params.vpp ?? 10);
      const amp = vpp / 2;
      const freq = Number(params.freq ?? 1000);
      const capUf = Number(params.capacitor ?? 0);
      const rLoad = Number(params.loadResistor ?? 1000);
      const period = 1 / freq;
      const cycles = capUf > 0 ? 12 : 4;
      const tStop = period * cycles;
      const tStep = period / 100;
      const capLine = capUf > 0 ? `C1 out 0 ${capUf}u` : `* no filter capacitor`;

      return {
        netlist: `Exp 4 Half-Wave Rectifier
.model D1N4007 D(IS=7.02e-9 N=1.75 RS=0.034 BV=1000 IBV=5e-6)
Vin in 0 SIN(0 ${amp} ${freq})
D1 in out D1N4007
Rload out 0 ${rLoad}
${capLine}
.tran ${tStep.toExponential(4)} ${tStop.toExponential(4)}
.end`,
        mode: "tran",
        tranSkipRatio: capUf > 0 ? 9 / 12 : 1 / 4,
      };
    }

    case "exp-5": {
      const vpp = Number(params.vpp ?? 10);
      const amp = vpp / 2;
      const freq = Number(params.freq ?? 1000);
      const capUf = Number(params.capacitor ?? 0);
      const rLoad = Number(params.loadResistor ?? 1000);
      const period = 1 / freq;
      const cycles = capUf > 0 ? 12 : 4;
      const tStop = period * cycles;
      const tStep = period / 100;
      const capLine = capUf > 0 ? `C1 out 0 ${capUf}u` : `* no filter capacitor`;

      // Bridge rectifier with differential AC source between in_p and in_n
      return {
        netlist: `Exp 5 Full-Wave Bridge Rectifier
.model D1N4007 D(IS=7.02e-9 N=1.75 RS=0.034 BV=1000 IBV=5e-6)
Vin in_p in_n SIN(0 ${amp} ${freq})
Rref in_n 0 100k
D1 in_p out D1N4007
D2 in_n out D1N4007
D3 0 in_p D1N4007
D4 0 in_n D1N4007
Rload out 0 ${rLoad}
${capLine}
.tran ${tStep.toExponential(4)} ${tStop.toExponential(4)}
.end`,
        mode: "tran",
        tranSkipRatio: capUf > 0 ? 9 / 12 : 1 / 4,
      };
    }

    case "exp-6": {
      const mode = String(params.clipMode ?? "biased-pos");
      const vpp = Number(params.vpp ?? 19.6);
      const amp = vpp / 2;
      const freq = Number(params.freq ?? 1000);
      const vBias = Number(params.biasVoltage ?? 2.3);
      const rVal = Number(params.resistor ?? 1000);
      const period = 1 / freq;
      const tStop = period * 4;
      const tStep = period / 120;

      let clipperLines = "";
      if (mode === "pos") {
        clipperLines = `D1 out 0 D1N4007`;
      } else if (mode === "neg") {
        clipperLines = `D1 0 out D1N4007`;
      } else if (mode === "biased-pos") {
        clipperLines = `Vbias b1 0 DC ${vBias}\nD1 out b1 D1N4007`;
      } else if (mode === "biased-neg") {
        clipperLines = `Vbias b1 0 DC ${-Math.abs(vBias)}\nD1 b1 out D1N4007`;
      } else {
        // dual clipper
        clipperLines = `Vbias1 b1 0 DC ${Math.abs(vBias)}\nD1 out b1 D1N4007\nVbias2 b2 0 DC ${-Math.abs(vBias)}\nD2 b2 out D1N4007`;
      }

      return {
        netlist: `Exp 6 Diode Clipper Circuit
.model D1N4007 D(IS=7.02e-9 N=1.75 RS=0.034 BV=1000 IBV=5e-6)
Vin in 0 SIN(0 ${amp} ${freq})
R1 in out ${rVal}
${clipperLines}
.tran ${tStep.toExponential(4)} ${tStop.toExponential(4)}
.end`,
        mode: "tran",
        tranSkipRatio: 1 / 4,
      };
    }

    case "exp-7": {
      const mode = String(params.clampMode ?? "positive");
      const vpp = Number(params.vpp ?? 10);
      const amp = vpp / 2;
      const freq = Number(params.freq ?? 1000);
      const capUf = Number(params.capacitor ?? 10);
      const rLoad = Number(params.loadResistor ?? 100000);
      const vBias = Number(params.biasVoltage ?? 0);
      const period = 1 / freq;
      const cycles = 14;
      const tStop = period * cycles;
      const tStep = period / 80;

      const diodeLine =
        mode === "positive"
          ? `Vbias b1 0 DC ${vBias}\nD1 b1 out D1N4007`
          : `Vbias b1 0 DC ${vBias}\nD1 out b1 D1N4007`;

      return {
        netlist: `Exp 7 Diode Clamper Circuit
.model D1N4007 D(IS=7.02e-9 N=1.75 RS=0.034 BV=1000 IBV=5e-6)
Vin in 0 SIN(0 ${amp} ${freq})
C1 in out ${capUf}u
Rload out 0 ${rLoad}
${diodeLine}
.tran ${tStep.toExponential(4)} ${tStop.toExponential(4)}
.end`,
        mode: "tran",
        tranSkipRatio: 11 / 14,
      };
    }
  }
}

export function runCircuitSimulation(
  expId: ExperimentId,
  params: Record<string, number | string>
): Promise<SimulationOutput> {
  const job = async (): Promise<SimulationOutput> => {
    const sim = await getSimulator();
    const { netlist, mode, tranSkipRatio } = buildNetlist(expId, params);
    sim.setNetList(netlist);
    const res = await sim.runSim();
    const errors = sim.getError();

    const findVar = (candidates: string[]) =>
      res.data.find((d) => candidates.includes(d.name.toLowerCase()));

    if (mode === "dc") {
      const vInArr = findVar(["v(in)", "v(v-sweep)"])?.values ?? [];
      const vOutArr = findVar(["v(out)"])?.values ?? [];
      const iV1Arr = findVar(["i(v1)"])?.values ?? [];

      const points: SimulationPoint[] = [];
      for (let idx = 0; idx < vInArr.length; idx++) {
        const vin = vInArr[idx] ?? 0;
        const vout = vOutArr[idx] ?? 0;
        // ngspice reports i(v1) as current leaving positive terminal (negative)
        const currentMa = Math.abs(iV1Arr[idx] ?? 0) * 1000;
        if (expId === "exp-2") {
          points.push({
            x: Number(vout.toFixed(3)),
            ch1: Number(currentMa.toFixed(3)),
            ch2: Number(vin.toFixed(2)),
            currentMa: Number(currentMa.toFixed(3)),
          });
        } else {
          points.push({
            x: Number(vin.toFixed(2)),
            ch1: Number(vout.toFixed(3)),
            ch2: Number(currentMa.toFixed(3)),
            currentMa: Number(currentMa.toFixed(3)),
          });
        }
      }

      // Compute operating point at the user's selected Vin slider
      const selectedVin = Number(params.vin ?? (expId === "exp-2" ? 3 : 10));
      let closestIdx = 0;
      let minDiff = Infinity;
      for (let i = 0; i < vInArr.length; i++) {
        const d = Math.abs((vInArr[i] ?? 0) - selectedVin);
        if (d < minDiff) {
          minDiff = d;
          closestIdx = i;
        }
      }

      const opVin = vInArr[closestIdx] ?? 0;
      const opVout = vOutArr[closestIdx] ?? 0;
      const opVr = Math.max(0, opVin - opVout);
      const opIdMa = Math.abs(iV1Arr[closestIdx] ?? 0) * 1000;

      const metrics: SimulationMetrics =
        expId === "exp-2"
          ? {
              vd: Number(opVout.toFixed(3)),
              vr: Number(opVr.toFixed(3)),
              idMa: Number(opIdMa.toFixed(3)),
            }
          : {
              vz: Number(opVout.toFixed(3)),
              vr: Number(opVr.toFixed(3)),
              izMa: Number(opIdMa.toFixed(3)),
            };

      return { points, metrics, netlist, errors };
    }

    // Transient mode
    const timeArr = findVar(["time"])?.values ?? [];
    const vInArr =
      expId === "exp-5"
        ? (() => {
            const vp = findVar(["v(in_p)"])?.values ?? [];
            const vn = findVar(["v(in_n)"])?.values ?? [];
            return vp.map((v, i) => v - (vn[i] ?? 0));
          })()
        : (findVar(["v(in)"])?.values ?? []);
    const vOutArr = findVar(["v(out)"])?.values ?? [];

    const startIdx = Math.floor(timeArr.length * tranSkipRatio);
    const t0 = timeArr[startIdx] ?? 0;

    const slicedIn = vInArr.slice(startIdx);
    const slicedOut = vOutArr.slice(startIdx);
    const slicedTime = timeArr.slice(startIdx);

    // Downsample to ~220 points for crisp, fast rendering
    const maxPts = 220;
    const step = Math.max(1, Math.floor(slicedTime.length / maxPts));
    const points: SimulationPoint[] = [];
    for (let i = 0; i < slicedTime.length; i += step) {
      points.push({
        x: Number((((slicedTime[i] ?? 0) - t0) * 1000).toFixed(3)), // ms
        ch1: Number((slicedIn[i] ?? 0).toFixed(3)),
        ch2: Number((slicedOut[i] ?? 0).toFixed(3)),
      });
    }

    const vmax = slicedOut.length ? Math.max(...slicedOut) : 0;
    const vmin = slicedOut.length ? Math.min(...slicedOut) : 0;
    const vpp = vmax - vmin;

    const vinMax = slicedIn.length ? Math.max(...slicedIn) : 0;
    const vinMin = slicedIn.length ? Math.min(...slicedIn) : 0;
    const vinPp = vinMax - vinMin;

    const n = slicedOut.length || 1;
    const vavg = slicedOut.reduce((a, b) => a + b, 0) / n;
    const vrms = Math.sqrt(slicedOut.reduce((a, b) => a + b * b, 0) / n);
    const rippleRms = Math.sqrt(Math.max(0, vrms * vrms - vavg * vavg));
    const rippleFactor = Math.abs(vavg) > 1e-4 ? rippleRms / Math.abs(vavg) : 0;

    // Approximate phase shift for Exp 1
    let phaseShiftDeg = 0;
    if (expId === "exp-1") {
      const freq = Number(params.freq ?? 1000);
      const rVal = Number(params.resistor ?? 1000);
      const comp = String(params.component ?? "rc");
      if (comp === "rc") {
        const c = Number(params.capacitor ?? 0.1) * 1e-6;
        const xc = 1 / (2 * Math.PI * freq * c);
        phaseShiftDeg = -((Math.atan(xc / rVal) * 180) / Math.PI);
      } else if (comp === "rl") {
        const l = Number(params.inductor ?? 100) * 1e-3;
        const xl = 2 * Math.PI * freq * l;
        phaseShiftDeg = (Math.atan(xl / rVal) * 180) / Math.PI;
      }
    }

    const metrics: SimulationMetrics = {
      vinPp: Number(vinPp.toFixed(2)),
      vmax: Number(vmax.toFixed(2)),
      vmin: Number(vmin.toFixed(2)),
      vpp: Number(vpp.toFixed(2)),
      vrms: Number(vrms.toFixed(2)),
      vavg: Number(vavg.toFixed(2)),
      rippleFactor: Number(rippleFactor.toFixed(3)),
      phaseShiftDeg: Number(phaseShiftDeg.toFixed(1)),
      dcShift: Number(((vmax + vmin) / 2).toFixed(2)),
    };

    return { points, metrics, netlist, errors };
  };

  const next = simQueue.then(job, job);
  simQueue = next.catch(() => undefined);
  return next;
}
