import { BB_COLS, COMPONENT_CATALOG, getPinWorldPos } from "./componentCatalog";
import type {
  MultimeterReading,
  OscilloscopeData,
  PlacedComponent,
  Wire,
  WorkbenchSimResult,
} from "./workbenchTypes";

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

class UnionFind {
  parent = new Map<string, string>();
  find(x: string): string {
    if (!this.parent.has(x)) this.parent.set(x, x);
    let root = x;
    while (this.parent.get(root) !== root) {
      root = this.parent.get(root)!;
    }
    let cur = x;
    while (cur !== root) {
      const next = this.parent.get(cur)!;
      this.parent.set(cur, root);
      cur = next;
    }
    return root;
  }
  union(a: string, b: string) {
    const ra = this.find(a);
    const rb = this.find(b);
    if (ra !== rb) this.parent.set(ra, rb);
  }
}

function pinKey(compId: string, pinId: string) {
  return `${compId}::${pinId}`;
}

export function compileWorkbenchNetlist(
  components: PlacedComponent[],
  wires: Wire[]
): {
  netlist: string;
  pinToNode: Map<string, string>;
  hasTransient: boolean;
  tranSkipRatio: number;
  ammeterNames: Map<string, string>;
  ledSenseNames: Map<string, string>;
  warnings: string[];
} {
  const uf = new UnionFind();
  const warnings: string[] = [];

  // 1. Register all pins
  for (const c of components) {
    const def = COMPONENT_CATALOG[c.type];
    for (const p of def.pins) {
      uf.find(pinKey(c.id, p.id));
    }
  }

  // 2. Internal breadboard strip connectivity
  const breadboards = components.filter((c) => c.type === "breadboard");
  for (const bb of breadboards) {
    // Horizontal rails
    for (let c = 2; c <= BB_COLS; c++) {
      uf.union(pinKey(bb.id, "tp_1"), pinKey(bb.id, `tp_${c}`));
      uf.union(pinKey(bb.id, "tn_1"), pinKey(bb.id, `tn_${c}`));
      uf.union(pinKey(bb.id, "bp_1"), pinKey(bb.id, `bp_${c}`));
      uf.union(pinKey(bb.id, "bn_1"), pinKey(bb.id, `bn_${c}`));
    }
    // Vertical 5-hole strips a-e and f-j
    const topRows = ["a", "b", "c", "d", "e"];
    const botRows = ["f", "g", "h", "i", "j"];
    for (let c = 1; c <= BB_COLS; c++) {
      for (let i = 1; i < topRows.length; i++) {
        uf.union(pinKey(bb.id, `${topRows[0]}${c}`), pinKey(bb.id, `${topRows[i]}${c}`));
      }
      for (let i = 1; i < botRows.length; i++) {
        uf.union(pinKey(bb.id, `${botRows[0]}${c}`), pinKey(bb.id, `${botRows[i]}${c}`));
      }
    }
  }

  // 3. Auto-plug pins that sit directly on top of breadboard holes (within 8px)
  if (breadboards.length > 0) {
    const bbHoles: { key: string; x: number; y: number }[] = [];
    for (const bb of breadboards) {
      const def = COMPONENT_CATALOG.breadboard;
      for (const p of def.pins) {
        const pos = getPinWorldPos(bb, p.id);
        bbHoles.push({ key: pinKey(bb.id, p.id), x: pos.x, y: pos.y });
      }
    }
    for (const comp of components) {
      if (comp.type === "breadboard") continue;
      const def = COMPONENT_CATALOG[comp.type];
      for (const p of def.pins) {
        const pos = getPinWorldPos(comp, p.id);
        for (const hole of bbHoles) {
          const dist = Math.hypot(pos.x - hole.x, pos.y - hole.y);
          if (dist <= 8) {
            uf.union(pinKey(comp.id, p.id), hole.key);
            break;
          }
        }
      }
    }
  }

  // 4. User wires
  for (const w of wires) {
    uf.union(pinKey(w.from.compId, w.from.pinId), pinKey(w.to.compId, w.to.pinId));
  }

  // 5. Determine Ground (node "0")
  const groundRoots = new Set<string>();
  for (const c of components) {
    if (c.type === "ground") {
      groundRoots.add(uf.find(pinKey(c.id, "gnd")));
    }
  }
  if (groundRoots.size === 0) {
    // Fallback to Function Generator neg or DC Supply neg or Scope CH1 GND
    const fg = components.find((c) => c.type === "func-gen");
    const dc = components.find((c) => c.type === "dc-supply");
    const sc = components.find((c) => c.type === "oscilloscope");
    if (fg) groundRoots.add(uf.find(pinKey(fg.id, "neg")));
    else if (dc) groundRoots.add(uf.find(pinKey(dc.id, "neg")));
    else if (sc) groundRoots.add(uf.find(pinKey(sc.id, "ch1_neg")));
  }

  // Assign node names
  const rootToNode = new Map<string, string>();
  let nodeCounter = 1;
  const getNode = (compId: string, pinId: string): string => {
    const root = uf.find(pinKey(compId, pinId));
    if (groundRoots.has(root)) return "0";
    if (!rootToNode.has(root)) {
      rootToNode.set(root, `n${nodeCounter++}`);
    }
    return rootToNode.get(root)!;
  };

  const pinToNode = new Map<string, string>();
  for (const c of components) {
    for (const p of COMPONENT_CATALOG[c.type].pins) {
      pinToNode.set(pinKey(c.id, p.id), getNode(c.id, p.id));
    }
  }

  // 6. Emit SPICE netlist lines
  const lines: string[] = [
    "EDC Lab Interactive Workbench",
    ".model D1N4007 D(IS=7.02e-9 N=1.75 RS=0.034 BV=1000 IBV=5e-6)",
    ".model D1N34A D(IS=1.5e-5 N=1.2 RS=0.5 BV=60 IBV=1e-4)",
    ".model DLED D(IS=1e-18 N=1.9 RS=2.0 BV=5 IBV=1e-4)",
  ];

  const usedNodes = new Set<string>();
  const touch = (n: string) => {
    if (n !== "0") usedNodes.add(n);
  };

  let compIdx = 1;
  let hasFuncGen = false;
  let maxFreq = 1000;
  let minFreq = 1000;
  let hasCapOrInd = false;
  const ammeterNames = new Map<string, string>();
  const ledSenseNames = new Map<string, string>();

  for (const c of components) {
    if (c.type === "breadboard" || c.type === "ground") continue;
    const idx = compIdx++;

    if (c.type === "dc-supply") {
      const nPos = getNode(c.id, "pos");
      const nNeg = getNode(c.id, "neg");
      touch(nPos);
      touch(nNeg);
      const v = Number(c.props.voltage ?? 5);
      lines.push(`Vdc${idx} ${nPos} ${nNeg} DC ${v}`);
    } else if (c.type === "func-gen") {
      hasFuncGen = true;
      const nPos = getNode(c.id, "pos");
      const nNeg = getNode(c.id, "neg");
      touch(nPos);
      touch(nNeg);
      const wave = String(c.props.waveform ?? "sine");
      const amp = Number(c.props.vpp ?? 10) / 2;
      const freq = Math.max(10, Number(c.props.freq ?? 1000));
      maxFreq = Math.max(maxFreq, freq);
      minFreq = Math.min(minFreq, freq);
      const period = 1 / freq;

      if (wave === "square") {
        lines.push(
          `Vfg${idx} ${nPos} ${nNeg} PULSE(${-amp} ${amp} 0 ${period * 0.01} ${period * 0.01} ${period * 0.48} ${period})`
        );
      } else if (wave === "triangle") {
        lines.push(
          `Vfg${idx} ${nPos} ${nNeg} PULSE(${-amp} ${amp} 0 ${period * 0.49} ${period * 0.49} ${period * 0.01} ${period})`
        );
      } else {
        lines.push(`Vfg${idx} ${nPos} ${nNeg} SIN(0 ${amp} ${freq})`);
      }
    } else if (c.type === "resistor") {
      const na = getNode(c.id, "a");
      const nb = getNode(c.id, "b");
      touch(na);
      touch(nb);
      const r = Math.max(0.1, Number(c.props.resistance ?? 1000));
      lines.push(`R${idx} ${na} ${nb} ${r}`);
    } else if (c.type === "capacitor") {
      hasCapOrInd = true;
      const na = getNode(c.id, "a");
      const nb = getNode(c.id, "b");
      touch(na);
      touch(nb);
      const cap = Math.max(0.001, Number(c.props.capacitance ?? 10));
      lines.push(`C${idx} ${na} ${nb} ${cap}u`);
    } else if (c.type === "inductor") {
      hasCapOrInd = true;
      const na = getNode(c.id, "a");
      const nb = getNode(c.id, "b");
      touch(na);
      touch(nb);
      const l = Math.max(0.01, Number(c.props.inductance ?? 100));
      lines.push(`L${idx} ${na} ${nb} ${l}m`);
    } else if (c.type === "diode") {
      const na = getNode(c.id, "anode");
      const nc = getNode(c.id, "cathode");
      touch(na);
      touch(nc);
      const mat = String(c.props.material ?? "si");
      lines.push(`D${idx} ${na} ${nc} ${mat === "ge" ? "D1N34A" : "D1N4007"}`);
    } else if (c.type === "zener") {
      const na = getNode(c.id, "anode");
      const nc = getNode(c.id, "cathode");
      touch(na);
      touch(nc);
      const vz = Math.max(2.0, Number(c.props.vz ?? 5.1));
      const modelName = `DZ_${idx}`;
      lines.push(`.model ${modelName} D(IS=1e-9 N=1.5 RS=1.2 BV=${(vz - 0.05).toFixed(3)} IBV=5e-3)`);
      lines.push(`Dz${idx} ${na} ${nc} ${modelName}`);
    } else if (c.type === "led") {
      const na = getNode(c.id, "anode");
      const nc = getNode(c.id, "cathode");
      touch(na);
      touch(nc);
      const mid = `ledmid_${idx}`;
      const sense = `vled${idx}`;
      ledSenseNames.set(c.id, sense);
      lines.push(`Vled${idx} ${na} ${mid} DC 0`);
      lines.push(`Dled${idx} ${mid} ${nc} DLED`);
    } else if (c.type === "multimeter") {
      const nPos = getNode(c.id, "pos");
      const nNeg = getNode(c.id, "neg");
      touch(nPos);
      touch(nNeg);
      if (c.props.mode === "current") {
        const name = `vamm${idx}`;
        ammeterNames.set(c.id, name);
        lines.push(`Vamm${idx} ${nPos} ${nNeg} DC 0`);
      } else {
        // High-impedance voltmeter
        lines.push(`Rvm${idx} ${nPos} ${nNeg} 10Meg`);
      }
    } else if (c.type === "oscilloscope") {
      const c1p = getNode(c.id, "ch1_pos");
      const c1n = getNode(c.id, "ch1_neg");
      const c2p = getNode(c.id, "ch2_pos");
      const c2n = getNode(c.id, "ch2_neg");
      touch(c1p);
      touch(c1n);
      touch(c2p);
      touch(c2n);
      lines.push(`Rsc1_${idx} ${c1p} ${c1n} 1Meg`);
      lines.push(`Rsc2_${idx} ${c2p} ${c2n} 1Meg`);
    }
  }

  // Stabilize all non-ground nodes with 100Meg path to ground so floating parts never singular-matrix
  let gIdx = 1;
  for (const node of usedNodes) {
    lines.push(`Rgmin${gIdx++} ${node} 0 100Meg`);
  }

  // Ensure at least one element exists
  if (usedNodes.size === 0) {
    lines.push("Rdummy 0 0 1k");
    warnings.push("Connect at least one power source and component to simulate.");
  }

  const hasScope = components.some((c) => c.type === "oscilloscope");
  const hasTransient = hasFuncGen || hasScope;

  let tranSkipRatio = 0;
  if (hasTransient) {
    const period = 1 / Math.max(10, minFreq);
    const cycles = hasCapOrInd && hasFuncGen ? 10 : 3;
    const tStop = period * cycles;
    const tStep = period / 90;
    tranSkipRatio = hasCapOrInd && hasFuncGen ? 7 / 10 : 1 / 3;
    lines.push(`.tran ${tStep.toExponential(4)} ${tStop.toExponential(4)}`);
  } else {
    // Run short transient so we get uniform real data even for pure DC circuits
    lines.push(".tran 0.1m 2m");
  }

  lines.push(".end");

  return {
    netlist: lines.join("\n"),
    pinToNode,
    hasTransient,
    tranSkipRatio,
    ammeterNames,
    ledSenseNames,
    warnings,
  };
}

function computeStats(arr: number[]) {
  if (!arr.length) {
    return { vmax: 0, vmin: 0, vpp: 0, vavg: 0, vrms: 0, rippleFactor: 0 };
  }
  const vmax = Math.max(...arr);
  const vmin = Math.min(...arr);
  const vpp = vmax - vmin;
  const vavg = arr.reduce((a, b) => a + b, 0) / arr.length;
  const vrms = Math.sqrt(arr.reduce((a, b) => a + b * b, 0) / arr.length);
  const vrRms = Math.sqrt(Math.max(0, vrms * vrms - vavg * vavg));
  const rippleFactor = Math.abs(vavg) > 1e-4 ? vrRms / Math.abs(vavg) : 0;
  return {
    vmax: Number(vmax.toFixed(2)),
    vmin: Number(vmin.toFixed(2)),
    vpp: Number(vpp.toFixed(2)),
    vavg: Number(vavg.toFixed(2)),
    vrms: Number(vrms.toFixed(2)),
    rippleFactor: Number(rippleFactor.toFixed(3)),
  };
}

export function simulateWorkbench(
  components: PlacedComponent[],
  wires: Wire[]
): Promise<WorkbenchSimResult> {
  const job = async (): Promise<WorkbenchSimResult> => {
    const {
      netlist,
      pinToNode,
      tranSkipRatio,
      ammeterNames,
      ledSenseNames,
      warnings,
    } = compileWorkbenchNetlist(components, wires);

    const sim = await getSimulator();
    sim.setNetList(netlist);
    const res = await sim.runSim();
    const errors = sim.getError();

    const getSeries = (varName: string): number[] => {
      if (varName === "v(0)") return [];
      const found = res.data.find((d) => d.name.toLowerCase() === varName.toLowerCase());
      return found?.values ?? [];
    };

    const timeArr = getSeries("time");
    const len = timeArr.length;
    const startIdx = Math.floor(len * tranSkipRatio);
    const t0 = timeArr[startIdx] ?? 0;

    const getNodeSeries = (node: string): number[] => {
      if (node === "0") return new Array(len).fill(0);
      const s = getSeries(`v(${node})`);
      return s.length === len ? s : new Array(len).fill(0);
    };

    // Oscilloscopes
    const oscilloscopes: Record<string, OscilloscopeData> = {};
    for (const c of components) {
      if (c.type !== "oscilloscope") continue;
      const c1p = getNodeSeries(pinToNode.get(pinKey(c.id, "ch1_pos")) ?? "0");
      const c1n = getNodeSeries(pinToNode.get(pinKey(c.id, "ch1_neg")) ?? "0");
      const c2p = getNodeSeries(pinToNode.get(pinKey(c.id, "ch2_pos")) ?? "0");
      const c2n = getNodeSeries(pinToNode.get(pinKey(c.id, "ch2_neg")) ?? "0");

      const ch1Full: number[] = [];
      const ch2Full: number[] = [];
      for (let i = startIdx; i < len; i++) {
        ch1Full.push((c1p[i] ?? 0) - (c1n[i] ?? 0));
        ch2Full.push((c2p[i] ?? 0) - (c2n[i] ?? 0));
      }

      const maxPts = 220;
      const step = Math.max(1, Math.floor((len - startIdx) / maxPts));
      const points: { t: number; ch1: number; ch2: number }[] = [];
      for (let i = startIdx; i < len; i += step) {
        points.push({
          t: Number((((timeArr[i] ?? 0) - t0) * 1000).toFixed(3)),
          ch1: Number(((c1p[i] ?? 0) - (c1n[i] ?? 0)).toFixed(3)),
          ch2: Number(((c2p[i] ?? 0) - (c2n[i] ?? 0)).toFixed(3)),
        });
      }

      const s1 = computeStats(ch1Full);
      const s2 = computeStats(ch2Full);
      oscilloscopes[c.id] = {
        compId: c.id,
        points,
        ch1: {
          vmax: s1.vmax,
          vmin: s1.vmin,
          vpp: s1.vpp,
          vavg: s1.vavg,
          vrms: s1.vrms,
        },
        ch2: s2,
      };
    }

    // Multimeters
    const multimeters: Record<string, MultimeterReading> = {};
    for (const c of components) {
      if (c.type !== "multimeter") continue;
      if (c.props.mode === "current") {
        const vName = ammeterNames.get(c.id);
        const iArr = vName ? getSeries(`i(${vName})`) : [];
        const sliced = iArr.slice(startIdx);
        const avgMa = sliced.length
          ? (sliced.reduce((a, b) => a + b, 0) / sliced.length) * 1000
          : 0;
        multimeters[c.id] = {
          compId: c.id,
          value: Number(Math.abs(avgMa).toFixed(3)),
          unit: "mA",
          mode: "current",
        };
      } else {
        const np = getNodeSeries(pinToNode.get(pinKey(c.id, "pos")) ?? "0");
        const nn = getNodeSeries(pinToNode.get(pinKey(c.id, "neg")) ?? "0");
        const diff: number[] = [];
        for (let i = startIdx; i < len; i++) {
          diff.push((np[i] ?? 0) - (nn[i] ?? 0));
        }
        const avgV = diff.length ? diff.reduce((a, b) => a + b, 0) / diff.length : 0;
        multimeters[c.id] = {
          compId: c.id,
          value: Number(avgV.toFixed(3)),
          unit: "V",
          mode: "voltage",
        };
      }
    }

    // LED currents
    const ledCurrentsMa: Record<string, number> = {};
    for (const [compId, vName] of ledSenseNames.entries()) {
      const iArr = getSeries(`i(${vName})`);
      const sliced = iArr.slice(startIdx);
      const avgMa = sliced.length
        ? (sliced.reduce((a, b) => a + b, 0) / sliced.length) * 1000
        : 0;
      ledCurrentsMa[compId] = Number(Math.abs(avgMa).toFixed(2));
    }

    // Final node voltages
    const nodeVoltages: Record<string, number> = { "0": 0 };
    for (const d of res.data) {
      if (d.name.startsWith("v(") && d.name.endsWith(")")) {
        const node = d.name.slice(2, -1);
        const last = d.values[d.values.length - 1] ?? 0;
        nodeVoltages[node] = Number(last.toFixed(3));
      }
    }

    return {
      running: true,
      oscilloscopes,
      multimeters,
      ledCurrentsMa,
      nodeVoltages,
      netlist,
      errors,
      warnings,
    };
  };

  const next = simQueue.then(job, job);
  simQueue = next.catch(() => undefined);
  return next;
}
