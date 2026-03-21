import { store } from './store.js';

export class Clock {
  private abortController: AbortController | null = null;
  private timerInterval: ReturnType<typeof setInterval> | null = null;

  start(onTick: () => void) {
    this.stop();
    this.abortController = new AbortController();

    this.timerInterval = setInterval(() => {
      // Tick logic handled externally for flexibility,
      // but managed by Clock's interval
      onTick();
    }, 1000); // We'll adjust the perceived time based on speedMultiplier in the engine/store

    return this.abortController.signal;
  }

  stop() {
    if (this.timerInterval) {
      clearInterval(this.timerInterval);
      this.timerInterval = null;
    }
    if (this.abortController) {
      this.abortController.abort();
      this.abortController = null;
    }
  }

  async wait(ms: number, signal?: AbortSignal): Promise<void> {
    const { speedMultiplier } = store.getState();
    const adjustedMs = ms / speedMultiplier;

    return new Promise((resolve, reject) => {
      const timeout = setTimeout(resolve, adjustedMs);

      const onAbort = () => {
        clearTimeout(timeout);
        reject(new Error('Aborted'));
      };

      signal?.addEventListener('abort', onAbort, { once: true });
      this.abortController?.signal.addEventListener('abort', onAbort, { once: true });
    });
  }
}

export const clock = new Clock();
