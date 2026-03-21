/**
 * Safe DOM Access Utility
 * Ensures elements exist and have the correct type.
 */
export function must<T extends HTMLElement | SVGElement>(id: string): T {
  const el = document.getElementById(id);
  if (!el) throw new Error(`CRITICAL: Element with id "${id}" not found.`);
  return el as T;
}

export const ELEMENTS = {
  // Buttons
  startBtn: must<HTMLButtonElement>('start-btn'),
  speedBtn: must<HTMLButtonElement>('speed-btn'),
  resetBtn: must<HTMLButtonElement>('reset-btn'),
  regenBtn: must<HTMLButtonElement>('regen-btn'),

  // Displays
  statusText: must<HTMLDivElement>('status-text'),
  timerText: must<HTMLDivElement>('timer-text'),
  phDisplay: must<HTMLDivElement>('ph-display'),
  outputPpmMain: must<HTMLDivElement>('output-ppm-main'),
  flowRateEl: must<HTMLDivElement>('flow-rate'),
  filterStatusEl: must<HTMLDivElement>('filter-status'),
  volumeEl: must<HTMLDivElement>('total-volume'),
  costEl: must<HTMLDivElement>('total-cost'),
  logEl: must<HTMLDivElement>('log'),
  interlockEl: must<HTMLDivElement>('interlock-status'),

  // Visuals
  canvas: must<HTMLCanvasElement>('ppm-chart'),

  // SVG Vessels
  liquid1: must<SVGRectElement>('liquid-1'),
  liquid2: must<SVGRectElement>('liquid-2'),
  liquid3: must<SVGRectElement>('liquid-3'),
  sludge1: must<SVGRectElement>('sludge-1'),

  // SVG Flows
  flowIntro: must<SVGPathElement>('flow-intro'),
  flowStage1_2: must<SVGPathElement>('flow-stage1-2'),
  flowOutro: must<SVGPathElement>('flow-outro'),

  // SVG Effects
  cascade1: must<SVGPathElement>('cascade-1'),
  cascade2: must<SVGPathElement>('cascade-2'),
  cascade3: must<SVGPathElement>('cascade-3'),
  ripple1: must<SVGEllipseElement>('ripple-1'),
  ripple2: must<SVGEllipseElement>('ripple-2'),
  ripple3: must<SVGEllipseElement>('ripple-3'),
  particlesGroup: must<SVGGElement>('particles-group'),
  resultIndicator: must<SVGCircleElement>('result-indicator'),

  // SVG Gradients
  stopTop: must<SVGStopElement>('stop-top'),
  stopBottom: must<SVGStopElement>('stop-bottom'),
} as const;
