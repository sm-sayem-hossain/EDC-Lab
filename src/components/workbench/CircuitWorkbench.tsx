"use client";

import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  Activity,
  BookOpen,
  ChevronLeft,
  ChevronRight,
  Eraser,
  Play,
  Redo2,
  RotateCw,
  Search,
  Square,
  Trash2,
  Undo2,
  X,
  ZoomIn,
  ZoomOut,
} from "lucide-react";
import {
  CATALOG_LIST,
  COMPONENT_CATALOG,
  getPinWorldPos,
} from "@/lib/workbench/componentCatalog";
import {
  EXPERIMENT_TEMPLATES,
  WIRE_COLORS,
} from "@/lib/workbench/experimentTemplates";
import { simulateWorkbench } from "@/lib/workbench/netlistCompiler";
import type {
  ComponentCategory,
  ComponentType,
  PlacedComponent,
  Wire,
  WireEndpoint,
  WorkbenchSimResult,
} from "@/lib/workbench/workbenchTypes";
import { ComponentGraphic } from "./ComponentGraphic";
import { ScopeDrawer } from "./ScopeDrawer";

interface BoardSnapshot {
  components: PlacedComponent[];
  wires: Wire[];
}

function snap(v: number, grid = 8): number {
  return Math.round(v / grid) * grid;
}

const BREADBOARD_MOUNTABLE = new Set<ComponentType>([
  "resistor",
  "capacitor",
  "inductor",
  "diode",
  "zener",
  "led",
]);

function snapToBreadboardHoles(
  comp: PlacedComponent,
  allComponents: PlacedComponent[],
  threshold = 14
): { x: number; y: number } {
  if (!BREADBOARD_MOUNTABLE.has(comp.type)) {
    return { x: snap(comp.x), y: snap(comp.y) };
  }
  const breadboards = allComponents.filter((c) => c.type === "breadboard");
  if (breadboards.length === 0) {
    return { x: snap(comp.x), y: snap(comp.y) };
  }
  const def = COMPONENT_CATALOG[comp.type];
  const firstPin = def.pins[0];
  if (!firstPin) return { x: snap(comp.x), y: snap(comp.y) };

  const pin0 = getPinWorldPos(comp, firstPin.id);
  let bestDx = 0;
  let bestDy = 0;
  let bestDist = Infinity;

  for (const bb of breadboards) {
    for (const hole of COMPONENT_CATALOG.breadboard.pins) {
      const hp = getPinWorldPos(bb, hole.id);
      const dist = Math.hypot(hp.x - pin0.x, hp.y - pin0.y);
      if (dist < bestDist) {
        bestDist = dist;
        bestDx = hp.x - pin0.x;
        bestDy = hp.y - pin0.y;
      }
    }
  }

  if (bestDist <= threshold) {
    return { x: comp.x + bestDx, y: comp.y + bestDy };
  }
  return { x: snap(comp.x), y: snap(comp.y) };
}

function makeWirePath(x1: number, y1: number, x2: number, y2: number): string {
  const midY = (y1 + y2) / 2;
  return `M ${x1} ${y1} L ${x1} ${midY} L ${x2} ${midY} L ${x2} ${y2}`;
}

export function CircuitWorkbench() {
  const [activeExpId, setActiveExpId] = useState<string>(EXPERIMENT_TEMPLATES[0].id);
  const [activeStepIdx, setActiveStepIdx] = useState<number>(0);

  const [components, setComponents] = useState<PlacedComponent[]>(
    () => EXPERIMENT_TEMPLATES[0].steps[0].components
  );
  const [wires, setWires] = useState<Wire[]>(
    () => EXPERIMENT_TEMPLATES[0].steps[0].wires
  );
  const [history, setHistory] = useState<BoardSnapshot[]>([]);
  const [future, setFuture] = useState<BoardSnapshot[]>([]);

  const [selectedCompId, setSelectedCompId] = useState<string | null>(null);
  const [selectedWireId, setSelectedWireId] = useState<string | null>(null);
  const [wireColor, setWireColor] = useState<string>(WIRE_COLORS[0].value);
  const [drawingFrom, setDrawingFrom] = useState<WireEndpoint | null>(null);
  const [cursorWorld, setCursorWorld] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [hoveredPin, setHoveredPin] = useState<WireEndpoint | null>(null);

  const [zoom, setZoom] = useState<number>(0.95);
  const [pan, setPan] = useState<{ x: number; y: number }>({ x: 20, y: 12 });
  const [draggingComp, setDraggingComp] = useState<{
    id: string;
    offsetX: number;
    offsetY: number;
  } | null>(null);
  const [panning, setPanning] = useState<{
    startX: number;
    startY: number;
    origX: number;
    origY: number;
  } | null>(null);

  const [searchQuery, setSearchQuery] = useState<string>("");
  const [category, setCategory] = useState<"all" | ComponentCategory>("all");
  const [guideOpen, setGuideOpen] = useState<boolean>(true);
  const [showScopeDrawer, setShowScopeDrawer] = useState<boolean>(false);

  const [simRunning, setSimRunning] = useState<boolean>(false);
  const [simLoading, setSimLoading] = useState<boolean>(false);
  const [simResult, setSimResult] = useState<WorkbenchSimResult | null>(null);

  const svgRef = useRef<SVGSVGElement | null>(null);
  const idCounterRef = useRef<number>(1);

  const activeTemplate = useMemo(
    () => EXPERIMENT_TEMPLATES.find((t) => t.id === activeExpId) ?? EXPERIMENT_TEMPLATES[0],
    [activeExpId]
  );

  const activeStep = activeTemplate.steps[activeStepIdx] ?? activeTemplate.steps[0];

  const pushHistory = useCallback(
    (nextComps: PlacedComponent[], nextWires: Wire[]) => {
      setHistory((h) => [...h.slice(-30), { components, wires }]);
      setFuture([]);
      setComponents(nextComps);
      setWires(nextWires);
    },
    [components, wires]
  );

  const handleUndo = useCallback(() => {
    setHistory((h) => {
      if (h.length === 0) return h;
      const prev = h[h.length - 1];
      setFuture((f) => [{ components, wires }, ...f]);
      setComponents(prev.components);
      setWires(prev.wires);
      return h.slice(0, -1);
    });
  }, [components, wires]);

  const handleRedo = useCallback(() => {
    setFuture((f) => {
      if (f.length === 0) return f;
      const next = f[0];
      setHistory((h) => [...h, { components, wires }]);
      setComponents(next.components);
      setWires(next.wires);
      return f.slice(1);
    });
  }, [components, wires]);

  // Jump directly to a specific Experiment + Step state and auto-run live simulation!
  const applyExperimentStep = useCallback(
    (expId: string, stepIndex: number, autoSimulate = true) => {
      const tpl = EXPERIMENT_TEMPLATES.find((t) => t.id === expId);
      if (!tpl) return;
      const safeIdx = Math.max(0, Math.min(stepIndex, tpl.steps.length - 1));
      const step = tpl.steps[safeIdx];
      setActiveExpId(expId);
      setActiveStepIdx(safeIdx);
      setHistory((h) => [...h.slice(-30), { components, wires }]);
      setFuture([]);
      setComponents(step.components.map((c) => ({ ...c, props: { ...c.props } })));
      setWires(step.wires.map((w) => ({ ...w })));
      setSelectedCompId(null);
      setSelectedWireId(null);
      setDrawingFrom(null);
      setPan({ x: 20, y: 12 });
      setZoom(0.95);
      if (autoSimulate) {
        setSimRunning(true);
      }
    },
    [components, wires]
  );

  // Run SPICE whenever simRunning is true and circuit changes
  useEffect(() => {
    if (!simRunning) {
      return;
    }
    let cancelled = false;
    const timer = setTimeout(async () => {
      setSimLoading(true);
      try {
        const res = await simulateWorkbench(components, wires);
        if (!cancelled) {
          setSimResult(res);
        }
      } catch (err) {
        if (!cancelled) {
          setSimResult({
            running: true,
            oscilloscopes: {},
            multimeters: {},
            ledCurrentsMa: {},
            nodeVoltages: {},
            netlist: "",
            errors: [err instanceof Error ? err.message : "Simulation failed"],
            warnings: [],
          });
        }
      } finally {
        if (!cancelled) setSimLoading(false);
      }
    }, 90);

    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, [simRunning, components, wires]);

  const clientToWorld = useCallback(
    (clientX: number, clientY: number) => {
      const rect = svgRef.current?.getBoundingClientRect();
      if (!rect) return { x: 0, y: 0 };
      return {
        x: (clientX - rect.left - pan.x) / zoom,
        y: (clientY - rect.top - pan.y) / zoom,
      };
    },
    [pan, zoom]
  );

  const handleRotateSelected = useCallback(() => {
    if (!selectedCompId) return;
    const next = components.map((c) =>
      c.id === selectedCompId
        ? { ...c, rotation: (((c.rotation + 90) % 360) as 0 | 90 | 180 | 270) }
        : c
    );
    pushHistory(next, wires);
  }, [selectedCompId, components, wires, pushHistory]);

  const handleDeleteSelected = useCallback(() => {
    if (selectedWireId) {
      pushHistory(
        components,
        wires.filter((w) => w.id !== selectedWireId)
      );
      setSelectedWireId(null);
      return;
    }
    if (selectedCompId) {
      pushHistory(
        components.filter((c) => c.id !== selectedCompId),
        wires.filter(
          (w) => w.from.compId !== selectedCompId && w.to.compId !== selectedCompId
        )
      );
      setSelectedCompId(null);
    }
  }, [selectedCompId, selectedWireId, components, wires, pushHistory]);

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (
        document.activeElement instanceof HTMLInputElement ||
        document.activeElement instanceof HTMLSelectElement
      ) {
        return;
      }
      if (e.key === "Escape") {
        setDrawingFrom(null);
        setSelectedCompId(null);
        setSelectedWireId(null);
      } else if (e.key === "Delete" || e.key === "Backspace") {
        handleDeleteSelected();
      } else if (e.key === "r" || e.key === "R") {
        handleRotateSelected();
      } else if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "z") {
        e.preventDefault();
        if (e.shiftKey) handleRedo();
        else handleUndo();
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [handleDeleteSelected, handleRotateSelected, handleUndo, handleRedo]);

  const handleAddComponent = (type: ComponentType, worldX?: number, worldY?: number) => {
    const def = COMPONENT_CATALOG[type];
    const id = `${type}_${++idCounterRef.current}`;
    const rawX = worldX ?? 260 + (components.length % 5) * 28;
    const rawY = worldY ?? 140 + (components.length % 4) * 28;
    const draft: PlacedComponent = {
      id,
      type,
      x: rawX,
      y: rawY,
      rotation: 0,
      props: { ...def.defaultProps },
    };
    const snapped = snapToBreadboardHoles(draft, components);
    const placed: PlacedComponent = { ...draft, x: snapped.x, y: snapped.y };
    pushHistory([...components, placed], wires);
    setSelectedCompId(id);
    setSelectedWireId(null);
  };

  const handlePinClick = (e: React.MouseEvent, compId: string, pinId: string) => {
    e.stopPropagation();
    if (!drawingFrom) {
      setDrawingFrom({ compId, pinId });
      setSelectedCompId(null);
      setSelectedWireId(null);
      return;
    }
    if (drawingFrom.compId === compId && drawingFrom.pinId === pinId) {
      setDrawingFrom(null);
      return;
    }
    const newWire: Wire = {
      id: `w_${++idCounterRef.current}`,
      from: drawingFrom,
      to: { compId, pinId },
      color: wireColor,
    };
    pushHistory(components, [...wires, newWire]);
    setDrawingFrom(null);
  };

  const handleCanvasMouseDown = (e: React.MouseEvent<SVGSVGElement>) => {
    if (e.button === 2 || drawingFrom) {
      setDrawingFrom(null);
      return;
    }
    setSelectedCompId(null);
    setSelectedWireId(null);
    setPanning({
      startX: e.clientX,
      startY: e.clientY,
      origX: pan.x,
      origY: pan.y,
    });
  };

  const handleCanvasMouseMove = (e: React.MouseEvent<SVGSVGElement>) => {
    const world = clientToWorld(e.clientX, e.clientY);
    setCursorWorld(world);

    if (draggingComp) {
      const rawX = world.x - draggingComp.offsetX;
      const rawY = world.y - draggingComp.offsetY;
      setComponents((prev) =>
        prev.map((c) => {
          if (c.id !== draggingComp.id) return c;
          const snapped = snapToBreadboardHoles({ ...c, x: rawX, y: rawY }, prev);
          return { ...c, x: snapped.x, y: snapped.y };
        })
      );
      return;
    }

    if (panning) {
      setPan({
        x: panning.origX + (e.clientX - panning.startX),
        y: panning.origY + (e.clientY - panning.startY),
      });
    }
  };

  const handleCanvasMouseUp = () => {
    if (draggingComp) setDraggingComp(null);
    if (panning) setPanning(null);
  };

  const handleClearBoard = () => {
    setSimRunning(false);
    pushHistory(
      [
        {
          id: "bb1",
          type: "breadboard",
          x: 240,
          y: 212,
          rotation: 0,
          props: {},
        },
      ],
      []
    );
    setSelectedCompId(null);
    setSelectedWireId(null);
    setDrawingFrom(null);
  };

  const handleUpdateCompProp = (key: string, value: number | string) => {
    if (!selectedCompId) return;
    setComponents((prev) =>
      prev.map((c) =>
        c.id === selectedCompId ? { ...c, props: { ...c.props, [key]: value } } : c
      )
    );
  };

  const filteredCatalog = useMemo(() => {
    return CATALOG_LIST.filter((c) => {
      const catOk = category === "all" || c.category === category;
      const qOk =
        !searchQuery.trim() ||
        c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        c.shortName.toLowerCase().includes(searchQuery.toLowerCase());
      return catOk && qOk;
    });
  }, [category, searchQuery]);

  const selectedComp = useMemo(
    () => components.find((c) => c.id === selectedCompId) ?? null,
    [components, selectedCompId]
  );

  const firstScopeData = useMemo(() => {
    if (!simResult) return null;
    const keys = Object.keys(simResult.oscilloscopes);
    return keys.length > 0 ? simResult.oscilloscopes[keys[0]] : null;
  }, [simResult]);

  const drawingFromPos = useMemo(() => {
    if (!drawingFrom) return null;
    const comp = components.find((c) => c.id === drawingFrom.compId);
    if (!comp) return null;
    return getPinWorldPos(comp, drawingFrom.pinId);
  }, [drawingFrom, components]);

  return (
    <div className="flex flex-col h-[calc(100vh-112px)] min-h-[640px] gap-3">
      {/* Studio Action Toolbar */}
      <div className="rounded-3xl bg-white px-4 py-2.5 shadow-[0_1px_2px_rgba(0,0,0,0.04)] flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-1.5">
          <button
            type="button"
            onClick={() => setGuideOpen((o) => !o)}
            className={`inline-flex items-center gap-1.5 rounded-full px-3.5 py-2 text-xs font-medium transition-colors cursor-pointer ${
              guideOpen
                ? "bg-zinc-900 text-white"
                : "bg-zinc-100 text-zinc-700 hover:bg-zinc-200/80"
            }`}
          >
            <BookOpen className="h-3.5 w-3.5" />
            <span>Lab Guide (Exp 01-07)</span>
          </button>

          <button
            type="button"
            onClick={handleClearBoard}
            className="inline-flex items-center gap-1.5 rounded-full bg-zinc-100 px-3.5 py-2 text-xs font-medium text-zinc-700 hover:bg-zinc-200/80 transition-colors cursor-pointer"
          >
            <Eraser className="h-3.5 w-3.5" />
            <span>Blank Breadboard</span>
          </button>

          <div className="h-4 w-px bg-zinc-200 mx-1 hidden sm:block" />

          <button
            type="button"
            onClick={handleUndo}
            disabled={history.length === 0}
            className="rounded-full p-2 text-zinc-700 hover:bg-zinc-100 disabled:opacity-35 transition-colors cursor-pointer"
            title="Undo"
          >
            <Undo2 className="h-4 w-4" />
          </button>
          <button
            type="button"
            onClick={handleRedo}
            disabled={future.length === 0}
            className="rounded-full p-2 text-zinc-700 hover:bg-zinc-100 disabled:opacity-35 transition-colors cursor-pointer"
            title="Redo"
          >
            <Redo2 className="h-4 w-4" />
          </button>
          <button
            type="button"
            onClick={handleRotateSelected}
            disabled={!selectedCompId}
            className="rounded-full p-2 text-zinc-700 hover:bg-zinc-100 disabled:opacity-35 transition-colors cursor-pointer"
            title="Rotate Component (R)"
          >
            <RotateCw className="h-4 w-4" />
          </button>
          <button
            type="button"
            onClick={handleDeleteSelected}
            disabled={!selectedCompId && !selectedWireId}
            className="rounded-full p-2 text-zinc-700 hover:bg-zinc-100 disabled:opacity-35 transition-colors cursor-pointer"
            title="Delete Selected (Del)"
          >
            <Trash2 className="h-4 w-4" />
          </button>

          <div className="h-4 w-px bg-zinc-200 mx-1 hidden sm:block" />

          <div className="flex items-center gap-1.5 px-1">
            <span className="text-[11px] text-zinc-500 mr-0.5">Wire</span>
            {WIRE_COLORS.map((wc) => (
              <button
                key={wc.value}
                type="button"
                onClick={() => setWireColor(wc.value)}
                title={wc.name}
                className={`h-4 w-4 rounded-full transition-transform cursor-pointer ${
                  wireColor === wc.value ? "scale-125 ring-2 ring-zinc-400 ring-offset-1" : ""
                }`}
                style={{ backgroundColor: wc.value }}
              />
            ))}
          </div>
        </div>

        <div className="flex items-center gap-2">
          <div className="hidden md:flex items-center gap-1 rounded-full bg-zinc-100 p-1">
            <button
              type="button"
              onClick={() => setZoom((z) => Math.max(0.55, Number((z - 0.1).toFixed(2))))}
              className="rounded-full p-1.5 text-zinc-600 hover:bg-white transition-colors cursor-pointer"
              title="Zoom Out"
            >
              <ZoomOut className="h-3.5 w-3.5" />
            </button>
            <span className="px-1.5 text-[11px] font-mono text-zinc-600">
              {Math.round(zoom * 100)}%
            </span>
            <button
              type="button"
              onClick={() => setZoom((z) => Math.min(1.5, Number((z + 0.1).toFixed(2))))}
              className="rounded-full p-1.5 text-zinc-600 hover:bg-white transition-colors cursor-pointer"
              title="Zoom In"
            >
              <ZoomIn className="h-3.5 w-3.5" />
            </button>
          </div>

          {components.some((c) => c.type === "oscilloscope") && (
            <button
              type="button"
              onClick={() => {
                if (!showScopeDrawer && !simRunning) {
                  setSimRunning(true);
                }
                setShowScopeDrawer((s) => !s);
              }}
              className={`inline-flex items-center gap-1.5 rounded-full px-3.5 py-2 text-xs font-medium transition-colors cursor-pointer ${
                showScopeDrawer
                  ? "bg-zinc-900 text-white hover:bg-zinc-800"
                  : "bg-zinc-100 text-zinc-800 hover:bg-zinc-200"
              }`}
            >
              <Activity className="h-3.5 w-3.5" />
              <span>{showScopeDrawer ? "Hide Scope" : "Open Scope"}</span>
            </button>
          )}

          <button
            type="button"
            onClick={() => {
              if (simRunning) {
                setSimRunning(false);
                setSimResult(null);
                setSimLoading(false);
              } else {
                setSimRunning(true);
              }
            }}
            className={`inline-flex items-center gap-2 rounded-full px-5 py-2 text-xs font-semibold transition-colors cursor-pointer ${
              simRunning
                ? "bg-zinc-200 text-zinc-900 hover:bg-zinc-300"
                : "bg-zinc-900 text-white hover:bg-zinc-800"
            }`}
          >
            {simRunning ? (
              <>
                <Square className="h-3.5 w-3.5 fill-current" />
                <span>{simLoading ? "Simulating..." : "Stop Simulation"}</span>
              </>
            ) : (
              <>
                <Play className="h-3.5 w-3.5 fill-current" />
                <span>Start Simulation</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Main Workspace Area */}
      <div className="flex-1 flex gap-3 min-h-0 relative">
        {/* Left Lab Guide Drawer with Clickable Auto-Simulating Steps */}
        {guideOpen && (
          <aside className="w-80 shrink-0 rounded-3xl bg-white p-4 shadow-[0_1px_2px_rgba(0,0,0,0.04)] flex flex-col gap-3 overflow-y-auto">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-semibold text-zinc-900">
                CSE-216 Lab Guide
              </h3>
              <button
                type="button"
                onClick={() => setGuideOpen(false)}
                className="rounded-full p-1 text-zinc-500 hover:bg-zinc-100 cursor-pointer"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* Experiment Pills */}
            <div className="flex flex-wrap gap-1.5">
              {EXPERIMENT_TEMPLATES.map((tpl) => (
                <button
                  key={tpl.id}
                  type="button"
                  onClick={() => applyExperimentStep(tpl.id, 0, true)}
                  className={`rounded-full px-3 py-1.5 text-xs font-medium transition-colors cursor-pointer ${
                    activeExpId === tpl.id
                      ? "bg-zinc-900 text-white"
                      : "bg-zinc-100 text-zinc-700 hover:bg-zinc-200"
                  }`}
                >
                  Exp {tpl.number}
                </button>
              ))}
            </div>

            {/* Active Experiment Info */}
            <div className="rounded-2xl bg-zinc-50 p-3.5 space-y-1.5">
              <div className="text-xs font-semibold text-zinc-900">
                {activeTemplate.title}
              </div>
              <p className="text-xs text-zinc-600 leading-relaxed">
                {activeTemplate.objective}
              </p>
            </div>

            {/* Interactive Step List: Click any step to load & simulate */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-zinc-700">
                  Interactive Steps
                </span>
                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    disabled={activeStepIdx === 0}
                    onClick={() => applyExperimentStep(activeExpId, activeStepIdx - 1, true)}
                    className="inline-flex items-center gap-0.5 rounded-full bg-zinc-100 px-2.5 py-1 text-[11px] font-medium text-zinc-700 hover:bg-zinc-200 disabled:opacity-40 cursor-pointer"
                  >
                    <ChevronLeft className="h-3 w-3" />
                    <span>Prev</span>
                  </button>
                  <button
                    type="button"
                    disabled={activeStepIdx >= activeTemplate.steps.length - 1}
                    onClick={() => applyExperimentStep(activeExpId, activeStepIdx + 1, true)}
                    className="inline-flex items-center gap-0.5 rounded-full bg-zinc-900 px-2.5 py-1 text-[11px] font-medium text-white hover:bg-zinc-800 disabled:opacity-40 cursor-pointer"
                  >
                    <span>Next</span>
                    <ChevronRight className="h-3 w-3" />
                  </button>
                </div>
              </div>

              <div className="space-y-2">
                {activeTemplate.steps.map((step, idx) => {
                  const isCurrent = idx === activeStepIdx;
                  return (
                    <div
                      key={step.id}
                      className={`rounded-2xl p-3 space-y-2 transition-colors ${
                        isCurrent ? "bg-zinc-900 text-white" : "bg-zinc-50 text-zinc-800"
                      }`}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <span className="text-xs font-semibold leading-snug">
                          {step.title}
                        </span>
                      </div>
                      <p
                        className={`text-[11px] leading-relaxed ${
                          isCurrent ? "text-zinc-300" : "text-zinc-600"
                        }`}
                      >
                        {step.instruction}
                      </p>
                      <div
                        className={`rounded-xl px-2.5 py-2 text-[11px] leading-relaxed ${
                          isCurrent
                            ? "bg-zinc-800 text-zinc-200"
                            : "bg-white text-zinc-600"
                        }`}
                      >
                        {step.observation}
                      </div>
                      <button
                        type="button"
                        onClick={() => applyExperimentStep(activeExpId, idx, true)}
                        className={`w-full inline-flex items-center justify-center gap-1.5 rounded-full py-1.5 text-[11px] font-medium transition-colors cursor-pointer ${
                          isCurrent
                            ? "bg-white text-zinc-900 hover:bg-zinc-200"
                            : "bg-zinc-200/80 text-zinc-800 hover:bg-zinc-300/80"
                        }`}
                      >
                        <Play className="h-3 w-3 fill-current" />
                        <span>{isCurrent ? "Re-run This Step" : "Load & Simulate Step"}</span>
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>
          </aside>
        )}

        {/* Center Interactive SVG Canvas */}
        <div
          className="flex-1 rounded-3xl bg-white shadow-[0_1px_2px_rgba(0,0,0,0.04)] relative overflow-hidden select-none flex flex-col"
          onDragOver={(e) => e.preventDefault()}
          onDrop={(e) => {
            e.preventDefault();
            const type = e.dataTransfer.getData("application/edc-comp") as ComponentType;
            if (type && COMPONENT_CATALOG[type]) {
              const pt = clientToWorld(e.clientX, e.clientY);
              const def = COMPONENT_CATALOG[type];
              handleAddComponent(type, pt.x - def.width / 2, pt.y - def.height / 2);
            }
          }}
        >
          {/* Quick Floating Step Switcher Bar on Canvas */}
          <div className="absolute top-3 left-3 right-3 z-10 flex flex-wrap items-center justify-between gap-2 pointer-events-none">
            <div className="pointer-events-auto rounded-full bg-zinc-100/95 backdrop-blur-xs px-3.5 py-1.5 text-[11px] text-zinc-700">
              {drawingFrom
                ? "Click another pin or breadboard hole to connect wire (Esc to cancel)"
                : `Exp ${activeTemplate.number} · ${activeStep.title}`}
            </div>

            <div className="pointer-events-auto flex items-center gap-1 rounded-full bg-zinc-100/95 backdrop-blur-xs p-1">
              {activeTemplate.steps.map((s, idx) => (
                <button
                  key={s.id}
                  type="button"
                  onClick={() => applyExperimentStep(activeExpId, idx, true)}
                  className={`rounded-full px-2.5 py-1 text-[11px] font-medium transition-colors cursor-pointer ${
                    idx === activeStepIdx
                      ? "bg-zinc-900 text-white"
                      : "text-zinc-600 hover:bg-white"
                  }`}
                >
                  Step {idx + 1}
                </button>
              ))}
              {activeStepIdx < activeTemplate.steps.length - 1 && (
                <button
                  type="button"
                  onClick={() => applyExperimentStep(activeExpId, activeStepIdx + 1, true)}
                  className="inline-flex items-center gap-0.5 rounded-full bg-white px-2.5 py-1 text-[11px] font-semibold text-zinc-900 hover:bg-zinc-200/70 transition-colors cursor-pointer"
                >
                  <span>Next</span>
                  <ChevronRight className="h-3 w-3" />
                </button>
              )}
            </div>
          </div>

          <svg
            ref={svgRef}
            className="w-full h-full cursor-crosshair"
            onMouseDown={handleCanvasMouseDown}
            onMouseMove={handleCanvasMouseMove}
            onMouseUp={handleCanvasMouseUp}
            onContextMenu={(e) => {
              e.preventDefault();
              setDrawingFrom(null);
            }}
          >
            <defs>
              <pattern
                id="dot-grid"
                width={16 * zoom}
                height={16 * zoom}
                patternUnits="userSpaceOnUse"
                x={pan.x % (16 * zoom)}
                y={pan.y % (16 * zoom)}
              >
                <circle cx={1.5} cy={1.5} r={1} fill="#d4d4d8" />
              </pattern>
            </defs>

            <rect width="100%" height="100%" fill="url(#dot-grid)" />

            <g transform={`translate(${pan.x}, ${pan.y}) scale(${zoom})`}>
              {/* Render breadboards first so components sit on top */}
              {[...components]
                .sort((a, b) => (a.type === "breadboard" ? -1 : b.type === "breadboard" ? 1 : 0))
                .map((comp) => {
                  const def = COMPONENT_CATALOG[comp.type];
                  const isSelected = comp.id === selectedCompId;
                  const cx = def.width / 2;
                  const cy = def.height / 2;

                  return (
                    <g
                      key={comp.id}
                      transform={`translate(${comp.x}, ${comp.y}) rotate(${comp.rotation}, ${cx}, ${cy})`}
                      className="cursor-grab active:cursor-grabbing"
                      onMouseDown={(e) => {
                        e.stopPropagation();
                        if (drawingFrom) return;
                        setSelectedCompId(comp.id);
                        setSelectedWireId(null);
                        const pt = clientToWorld(e.clientX, e.clientY);
                        setDraggingComp({
                          id: comp.id,
                          offsetX: pt.x - comp.x,
                          offsetY: pt.y - comp.y,
                        });
                      }}
                    >
                      <ComponentGraphic
                        comp={comp}
                        isSelected={isSelected}
                        simRunning={simRunning}
                        scopeData={simResult?.oscilloscopes[comp.id]}
                        meterReading={simResult?.multimeters[comp.id]}
                        ledCurrentMa={simResult?.ledCurrentsMa[comp.id] ?? 0}
                      />

                      {def.pins.map((pin) => {
                        const isHovered =
                          hoveredPin?.compId === comp.id && hoveredPin?.pinId === pin.id;
                        const isStart =
                          drawingFrom?.compId === comp.id && drawingFrom?.pinId === pin.id;
                        const isHole = pin.kind === "hole";

                        return (
                          <g key={pin.id}>
                            <circle
                              cx={pin.x}
                              cy={pin.y}
                              r={isHole ? (isHovered || isStart ? 4.4 : 2.6) : isHovered || isStart ? 5.8 : 4.0}
                              fill={
                                isStart
                                  ? "#18181b"
                                  : isHovered
                                  ? "#52525b"
                                  : isHole
                                  ? "#52525b"
                                  : "#ffffff"
                              }
                              stroke="#18181b"
                              strokeWidth={isHole ? 0.8 : 1.5}
                              className="pointer-events-none"
                            />
                            <circle
                              cx={pin.x}
                              cy={pin.y}
                              r={isHole ? 6.5 : 9}
                              fill="transparent"
                              className="cursor-pointer"
                              onMouseEnter={() => setHoveredPin({ compId: comp.id, pinId: pin.id })}
                              onMouseLeave={() => setHoveredPin(null)}
                              onMouseDown={(e) => e.stopPropagation()}
                              onClick={(e) => handlePinClick(e, comp.id, pin.id)}
                            >
                              <title>{pin.label}</title>
                            </circle>
                          </g>
                        );
                      })}
                    </g>
                  );
                })}

              {/* Rendered Wires */}
              {wires.map((w) => {
                const cFrom = components.find((c) => c.id === w.from.compId);
                const cTo = components.find((c) => c.id === w.to.compId);
                if (!cFrom || !cTo) return null;
                const p1 = getPinWorldPos(cFrom, w.from.pinId);
                const p2 = getPinWorldPos(cTo, w.to.pinId);
                const d = makeWirePath(p1.x, p1.y, p2.x, p2.y);
                const isSelected = w.id === selectedWireId;

                return (
                  <g
                    key={w.id}
                    className="cursor-pointer"
                    onMouseDown={(e) => {
                      e.stopPropagation();
                      setSelectedWireId(w.id);
                      setSelectedCompId(null);
                    }}
                  >
                    <path d={d} fill="none" stroke="transparent" strokeWidth={12} />
                    <path
                      d={d}
                      fill="none"
                      stroke={isSelected ? "#18181b" : w.color}
                      strokeWidth={isSelected ? 3.5 : 2.3}
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                    <circle cx={p1.x} cy={p1.y} r={2.8} fill={w.color} />
                    <circle cx={p2.x} cy={p2.y} r={2.8} fill={w.color} />
                  </g>
                );
              })}

              {/* Live Wire Preview */}
              {drawingFromPos && (
                <path
                  d={makeWirePath(
                    drawingFromPos.x,
                    drawingFromPos.y,
                    cursorWorld.x,
                    cursorWorld.y
                  )}
                  fill="none"
                  stroke={wireColor}
                  strokeWidth={2.2}
                  strokeDasharray="5 4"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="pointer-events-none"
                />
              )}
            </g>
          </svg>

          {/* Floating Component Property Inspector */}
          {selectedComp && (
            <div className="absolute bottom-4 left-4 z-20 w-72 rounded-3xl bg-white p-4 shadow-[0_8px_28px_rgba(0,0,0,0.09)] space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-xs font-semibold text-zinc-900">
                    {COMPONENT_CATALOG[selectedComp.type].name}
                  </div>
                  <div className="text-[10px] font-mono text-zinc-500">
                    Rotation: {selectedComp.rotation} deg
                  </div>
                </div>
                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    onClick={handleRotateSelected}
                    className="rounded-full p-1.5 text-zinc-600 hover:bg-zinc-100 cursor-pointer"
                    title="Rotate 90 deg"
                  >
                    <RotateCw className="h-3.5 w-3.5" />
                  </button>
                  <button
                    type="button"
                    onClick={handleDeleteSelected}
                    className="rounded-full p-1.5 text-zinc-600 hover:bg-zinc-100 cursor-pointer"
                    title="Delete"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>

              {COMPONENT_CATALOG[selectedComp.type].properties.length > 0 ? (
                <div className="space-y-2.5">
                  {COMPONENT_CATALOG[selectedComp.type].properties.map((prop) => {
                    const val = selectedComp.props[prop.key] ?? "";
                    if (prop.type === "select" && prop.options) {
                      return (
                        <div key={prop.key} className="space-y-1">
                          <label className="text-[11px] font-medium text-zinc-600">
                            {prop.label}
                          </label>
                          <select
                            value={String(val)}
                            onChange={(e) => handleUpdateCompProp(prop.key, e.target.value)}
                            className="w-full rounded-xl bg-zinc-100 px-3 py-2 text-xs text-zinc-900 outline-none cursor-pointer"
                          >
                            {prop.options.map((opt) => (
                              <option key={String(opt.value)} value={String(opt.value)}>
                                {opt.label}
                              </option>
                            ))}
                          </select>
                        </div>
                      );
                    }
                    return (
                      <div key={prop.key} className="space-y-1">
                        <div className="flex items-center justify-between text-[11px]">
                          <label className="font-medium text-zinc-600">{prop.label}</label>
                          <span className="font-mono text-zinc-800">
                            {val} {prop.unit ?? ""}
                          </span>
                        </div>
                        <input
                          type="number"
                          min={prop.min}
                          max={prop.max}
                          step={prop.step}
                          value={Number(val)}
                          onChange={(e) =>
                            handleUpdateCompProp(prop.key, Number(e.target.value))
                          }
                          className="w-full rounded-xl bg-zinc-100 px-3 py-1.5 text-xs font-mono text-zinc-900 outline-none"
                        />
                      </div>
                    );
                  })}
                </div>
              ) : (
                <p className="text-[11px] text-zinc-500">
                  Drag to position or click terminals to wire.
                </p>
              )}
            </div>
          )}

          {selectedWireId && (
            <div className="absolute bottom-4 left-4 z-20 rounded-full bg-white px-4 py-2 shadow-[0_8px_28px_rgba(0,0,0,0.09)] flex items-center gap-3">
              <span className="text-xs font-medium text-zinc-700">Wire selected</span>
              <button
                type="button"
                onClick={handleDeleteSelected}
                className="inline-flex items-center gap-1 rounded-full bg-zinc-900 px-3 py-1 text-[11px] font-medium text-white hover:bg-zinc-800 cursor-pointer"
              >
                <Trash2 className="h-3 w-3" />
                <span>Remove Wire</span>
              </button>
            </div>
          )}

          {simResult && simResult.errors.length > 0 && (
            <div className="absolute top-14 left-3 z-20 max-w-md rounded-2xl bg-zinc-900/90 text-zinc-100 px-4 py-2.5 text-xs">
              {simResult.errors[0]}
            </div>
          )}

          {simResult && simResult.errors.length === 0 && simResult.warnings.length > 0 && (
            <div className="absolute top-14 left-3 z-20 max-w-md rounded-2xl bg-amber-50 border border-amber-200 text-amber-900 px-4 py-2 text-[11px]">
              {simResult.warnings[0]}
            </div>
          )}
        </div>

        {/* Right Component Tray with Real SVG Previews */}
        <aside className="w-64 shrink-0 rounded-3xl bg-white p-4 shadow-[0_1px_2px_rgba(0,0,0,0.04)] flex flex-col gap-3">
          <div className="space-y-2">
            <div className="relative">
              <Search className="h-3.5 w-3.5 text-zinc-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search components"
                className="w-full rounded-2xl bg-zinc-100 pl-8 pr-3 py-2 text-xs text-zinc-900 placeholder:text-zinc-400 outline-none"
              />
            </div>

            <div className="flex flex-wrap gap-1">
              {(
                [
                  { id: "all", label: "All" },
                  { id: "instruments", label: "Instruments" },
                  { id: "passive", label: "Passive" },
                  { id: "semiconductors", label: "Diodes" },
                ] as const
              ).map((tab) => (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setCategory(tab.id)}
                  className={`rounded-full px-2.5 py-1 text-[11px] font-medium transition-colors cursor-pointer ${
                    category === tab.id
                      ? "bg-zinc-900 text-white"
                      : "bg-zinc-100 text-zinc-600 hover:bg-zinc-200/70"
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          </div>

          <div className="flex-1 overflow-y-auto grid grid-cols-2 gap-2 content-start pr-0.5">
            {filteredCatalog.map((item) => {
              const previewComp: PlacedComponent = {
                id: `preview_${item.type}`,
                type: item.type,
                x: 0,
                y: 0,
                rotation: 0,
                props: item.defaultProps,
              };
              return (
                <button
                  key={item.type}
                  type="button"
                  draggable
                  onDragStart={(e) => {
                    e.dataTransfer.setData("application/edc-comp", item.type);
                  }}
                  onClick={() => handleAddComponent(item.type)}
                  className="group rounded-2xl bg-zinc-50 hover:bg-zinc-100 p-2.5 flex flex-col items-center justify-between gap-2 text-center transition-colors cursor-grab active:cursor-grabbing"
                >
                  <div className="h-12 w-full flex items-center justify-center overflow-hidden">
                    <svg
                      viewBox={`-4 -4 ${item.width + 8} ${item.height + 8}`}
                      className="max-h-11 max-w-full"
                    >
                      <ComponentGraphic
                        comp={previewComp}
                        isSelected={false}
                        simRunning={false}
                      />
                    </svg>
                  </div>
                  <span className="text-[11px] font-medium text-zinc-800 leading-tight">
                    {item.shortName}
                  </span>
                </button>
              );
            })}
          </div>
        </aside>
      </div>

      {/* Live Oscilloscope Drawer */}
      {simRunning && firstScopeData && showScopeDrawer && (
        <ScopeDrawer
          scopeData={firstScopeData}
          onClose={() => setShowScopeDrawer(false)}
        />
      )}
    </div>
  );
}
