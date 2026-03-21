import type { SimulationState, StateListener, Phase } from './types.js';
import { isValidTransition } from './state-machine.js';
import { PHYSICAL_CONSTANTS, REAL_DURATIONS } from './constants.js';

const INITIAL_STATE: SimulationState = {
  phase: 'IDLE',
  isRunning: false,
  speedMultiplier: 1,
  remainingSeconds: Object.values(REAL_DURATIONS).reduce((a, b) => a + b, 0) / 1000,
  totalSeconds: Object.values(REAL_DURATIONS).reduce((a, b) => a + b, 0) / 1000,
  filterUses: 0,
  totalVolume: 0,
  totalCost: 0,
  ph: PHYSICAL_CONSTANTS.INITIAL_PH,
  ppm: null,
  chartData: [],
};

export class SimulationStore {
  private state: SimulationState;
  private listeners: Set<StateListener> = new Set();

  constructor() {
    this.state = { ...INITIAL_STATE };
  }

  getState(): SimulationState {
    return { ...this.state };
  }

  subscribe(listener: StateListener): () => void {
    this.listeners.add(listener);
    listener(this.getState());
    return () => this.listeners.delete(listener);
  }

  private notify() {
    const currentState = this.getState();
    this.listeners.forEach((l) => l(currentState));
  }

  update(patch: Partial<SimulationState>) {
    this.state = { ...this.state, ...patch };
    this.notify();
  }

  transition(nextPhase: Phase): boolean {
    if (isValidTransition(this.state.phase, nextPhase)) {
      this.update({ phase: nextPhase });
      return true;
    }
    console.warn(`Invalid transition: ${this.state.phase} -> ${nextPhase}`);
    return false;
  }

  reset() {
    this.state = {
      ...INITIAL_STATE,
      filterUses: this.state.filterUses,
      totalVolume: this.state.totalVolume,
      totalCost: this.state.totalCost,
    };
    this.notify();
  }
}

export const store = new SimulationStore();
