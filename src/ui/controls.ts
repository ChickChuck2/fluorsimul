import { ELEMENTS } from './dom.js';
import { store } from '../simulation/store.js';
import { engine } from '../simulation/engine.js';
import { logger } from './logger.js';

export class UIControls {
  private cleanup: (() => void)[] = [];

  constructor() {
    this.initEventListeners();
  }

  private initEventListeners() {
    const startHandler = () => engine.start();
    const speedHandler = () => this.toggleSpeed();
    const resetHandler = () => this.resetSimulation();
    const regenHandler = () => this.regenFilter();

    ELEMENTS.startBtn.addEventListener('click', startHandler);
    ELEMENTS.speedBtn.addEventListener('click', speedHandler);
    ELEMENTS.resetBtn.addEventListener('click', resetHandler);
    ELEMENTS.regenBtn.addEventListener('click', regenHandler);

    this.cleanup.push(
      () => ELEMENTS.startBtn.removeEventListener('click', startHandler),
      () => ELEMENTS.speedBtn.removeEventListener('click', speedHandler),
      () => ELEMENTS.resetBtn.removeEventListener('click', resetHandler),
      () => ELEMENTS.regenBtn.removeEventListener('click', regenHandler),
    );
  }

  private toggleSpeed() {
    const speeds = [1, 10, 100, 1000];
    const current = store.getState().speedMultiplier;
    const next = speeds[(speeds.indexOf(current) + 1) % speeds.length] ?? 1;

    store.update({ speedMultiplier: next });
    logger.log(`Velocidade ajustada para ${next}x`);
  }

  private resetSimulation() {
    engine.stop();
    store.reset();
    logger.log('Sistema reiniciado e pronto para novo ciclo.');
  }

  private regenFilter() {
    store.update({ filterUses: 0 });
    logger.log('Filtro regenerado com NaOH com sucesso!');
  }

  dispose() {
    this.cleanup.forEach((c) => c());
  }
}
