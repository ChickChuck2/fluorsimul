import { store } from './store.js';
import { clock } from './clock.js';
import { REAL_DURATIONS, PHYSICAL_CONSTANTS } from './constants.js';
import { calculatePhTransition, calculatePpmDecay } from './calculators.js';

export class SimulationEngine {
  private abortController: AbortController | null = null;

  async start() {
    if (store.getState().isRunning) return;

    this.abortController = new AbortController();
    const signal = this.abortController.signal;

    store.update({ isRunning: true });

    try {
      await this.runFlow(signal);
    } catch (e: any) {
      if (e.message === 'Aborted') {
        console.warn('Simulation aborted');
      } else {
        console.error('Simulation error:', e);
      }
    } finally {
      store.update({ isRunning: false });
    }
  }

  stop() {
    if (this.abortController) {
      this.abortController.abort();
      this.abortController = null;
    }
    clock.stop();
  }

  private async runFlow(signal: AbortSignal) {
    // 1. Pipe Flow In
    store.transition('PIPE_FLOW_IN');
    await clock.wait(REAL_DURATIONS.PIPE_FLOW, signal);

    // 2. Lime Dosing
    store.transition('LIME_DOSING');
    await this.animatePh(
      PHYSICAL_CONSTANTS.INITIAL_PH,
      PHYSICAL_CONSTANTS.PRECIPITATION_PH_TARGET,
      REAL_DURATIONS.INTRO,
      signal,
    );

    // 3. Precipitation
    store.transition('PRECIPITATION');
    await this.animatePpm(
      PHYSICAL_CONSTANTS.INITIAL_PPM,
      PHYSICAL_CONSTANTS.PRECIPITATION_PPM_TARGET,
      REAL_DURATIONS.STAGE_1,
      signal,
    );

    // 4. Transfer to Stage 2
    store.transition('TRANSFER_TO_STAGE_2');
    await clock.wait(REAL_DURATIONS.PIPE_FLOW, signal);

    // 5. Acid Dosing
    store.transition('ACID_DOSING');
    await this.animatePh(
      PHYSICAL_CONSTANTS.PRECIPITATION_PH_TARGET,
      PHYSICAL_CONSTANTS.ADSORPTION_PH_TARGET,
      REAL_DURATIONS.TRANS_1_2,
      signal,
    );

    // 6. Adsorption
    store.transition('ADSORPTION');
    const { filterUses } = store.getState();
    const targetPpm = filterUses >= PHYSICAL_CONSTANTS.MAX_FILTER_USES ? 4.5 : 0.82;
    await this.animatePpm(
      PHYSICAL_CONSTANTS.PRECIPITATION_PPM_TARGET,
      targetPpm,
      REAL_DURATIONS.STAGE_2,
      signal,
      true, // Non-linear decay
    );

    // 7. Transfer to Output
    store.transition('TRANSFER_TO_OUTPUT');
    await clock.wait(REAL_DURATIONS.TRANS_2_3, signal);

    // 8. Finished
    store.transition('FINISHED');
    const { totalVolume, totalCost } = store.getState();
    store.update({
      totalVolume: totalVolume + PHYSICAL_CONSTANTS.VOLUME_PER_CYCLE,
      totalCost: totalCost + PHYSICAL_CONSTANTS.COST_PER_CYCLE,
      filterUses: filterUses + 1,
    });
  }

  private async animatePh(start: number, end: number, duration: number, signal: AbortSignal) {
    const interval = 50;
    let elapsed = 0;
    while (elapsed < duration) {
      if (signal.aborted) throw new Error('Aborted');
      const { speedMultiplier } = store.getState();
      elapsed += interval * speedMultiplier;
      const progress = Math.min(1, elapsed / duration);
      store.update({ ph: calculatePhTransition(start, end, progress) });
      await clock.wait(interval, signal);
    }
  }

  private async animatePpm(
    start: number,
    end: number,
    duration: number,
    signal: AbortSignal,
    isNonLinear = false,
  ) {
    const interval = 50;
    let elapsed = 0;
    while (elapsed < duration) {
      if (signal.aborted) throw new Error('Aborted');
      const { speedMultiplier } = store.getState();
      elapsed += interval * speedMultiplier;
      const progress = Math.min(1, elapsed / duration);
      const ppm = calculatePpmDecay(start, end, progress, isNonLinear);

      const { chartData } = store.getState();
      // Simulating relative time for chart x-axis
      const x =
        chartData.length > 0
          ? chartData[chartData.length - 1]!.x + (interval / 1000) * speedMultiplier
          : 0;

      store.update({
        ppm,
        chartData: [...chartData, { x, y: ppm }],
      });
      await clock.wait(interval, signal);
    }
  }
}

export const engine = new SimulationEngine();
