import './styles/main.css';
import { store } from './simulation/store.js';
import { ELEMENTS } from './ui/dom.js';
import { logger } from './ui/logger.js';
import { PPMChart } from './ui/chart.js';
import { UIControls } from './ui/controls.js';
import { SVG_Vessels } from './svg/vessels.js';
import { SVG_Flows } from './svg/flows.js';
import { SVG_Particles } from './svg/particles.js';

// Initialize UI Modules
const chart = new PPMChart();
new UIControls();
const vessels = new SVG_Vessels();
const flows = new SVG_Flows();
const particles = new SVG_Particles();

// Single Subscription to State
store.subscribe((state) => {
  // Update UI Elements
  ELEMENTS.statusText.innerText = `SISTEMA: ${state.phase}`;
  ELEMENTS.statusText.style.color = getStatusColor(state.phase);

  const m = Math.floor(state.remainingSeconds / 60);
  const s = Math.floor(state.remainingSeconds % 60);
  ELEMENTS.timerText.innerText = `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;

  ELEMENTS.phDisplay.innerText = state.ph.toFixed(2);
  ELEMENTS.phDisplay.style.color = getPhColor(state.ph);

  if (state.ppm !== null) {
    ELEMENTS.outputPpmMain.innerText = `${state.ppm.toFixed(2)} ppm`;
    ELEMENTS.outputPpmMain.style.color =
      state.ppm < 1.5 ? 'var(--fluoride-low)' : 'var(--fluoride-high)';
  } else {
    ELEMENTS.outputPpmMain.innerText = '-- ppm';
    ELEMENTS.outputPpmMain.style.color = 'inherit';
  }

  ELEMENTS.flowRateEl.innerText = state.isRunning ? '5.0 m³/h' : '0.0 m³/h';
  ELEMENTS.volumeEl.innerText = `${state.totalVolume} L`;
  ELEMENTS.costEl.innerText = `R$ ${state.totalCost.toFixed(2)}`;

  if (state.filterUses >= 3) {
    ELEMENTS.filterStatusEl.innerText = 'SATURADO (NECESSITA REGEN.)';
    ELEMENTS.filterStatusEl.style.color = 'var(--danger-color)';
    ELEMENTS.regenBtn.style.display = 'block';
  } else {
    const efficiency = 100 - state.filterUses * 10;
    ELEMENTS.filterStatusEl.innerText = `EFICIENTE (${efficiency}%)`;
    ELEMENTS.filterStatusEl.style.color = 'var(--accent-color)';
    ELEMENTS.regenBtn.style.display = 'none';
  }

  ELEMENTS.startBtn.disabled = state.isRunning;
  ELEMENTS.speedBtn.innerText = `ACELERAR (${state.speedMultiplier}x)`;

  // Update Visuals
  chart.render(state.chartData, state.totalSeconds);
  vessels.update(state);
  flows.update(state);
  particles.update(state);

  // Update Water Color Gradient
  updateGlobalWaterColor(state.ppm ?? 50);
});

function getStatusColor(phase: string): string {
  if (phase === 'FINISHED') return 'var(--success-color)';
  if (phase === 'IDLE' || phase === 'RESETTING') return 'var(--warning-color)';
  return 'var(--accent-color)';
}

function getPhColor(ph: number): string {
  if (ph >= 5.5 && ph <= 6.5) return 'var(--fluoride-low)';
  if (ph > 10) return 'var(--warning-color)';
  return 'var(--accent-color)';
}

function updateGlobalWaterColor(ppm: number) {
  const ratio = Math.max(0, Math.min(1, ppm / 50));
  const h = 210 - ratio * 180;
  const s = 100 - ratio * 60;
  const l = 67 - ratio * 37;

  ELEMENTS.stopTop.setAttribute('style', `stop-color: hsl(${h}, ${s}%, ${l}%); stop-opacity: 1`);
  ELEMENTS.stopBottom.setAttribute(
    'style',
    `stop-color: hsl(${h}, ${s}%, ${l - 15}%); stop-opacity: 1`,
  );
}

logger.log('Planta Técnica Industrial pronta.');
