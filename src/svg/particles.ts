import { ELEMENTS } from '../ui/dom.js';
import type { SimulationState } from '../simulation/types.js';

export class SVG_Particles {
  private active = false;

  update(state: SimulationState) {
    const { phase } = state;
    const shouldBeActive = phase === 'LIME_DOSING' || phase === 'PRECIPITATION';

    if (shouldBeActive && !this.active) {
      this.spawn();
      this.active = true;
    } else if (!shouldBeActive && this.active) {
      this.clear();
      this.active = false;
    }
  }

  private spawn() {
    const group = ELEMENTS.particlesGroup;
    group.innerHTML = '';
    for (let i = 0; i < 30; i++) {
      const p = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
      p.setAttribute('class', 'precipitate-particle');
      p.setAttribute('r', (Math.random() * 2 + 1).toString());
      p.setAttribute('cx', (160 + Math.random() * 180).toString());
      p.setAttribute('cy', (150 + Math.random() * 50).toString());
      p.style.animation = `precipitate ${2 + Math.random() * 2}s linear infinite`;
      p.style.animationDelay = `${Math.random() * 2}s`;
      group.appendChild(p);
    }
  }

  private clear() {
    ELEMENTS.particlesGroup.innerHTML = '';
  }

  dispose() {
    this.clear();
  }
}
