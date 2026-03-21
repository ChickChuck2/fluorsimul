import { ELEMENTS } from '../ui/dom.js';
import type { SimulationState } from '../simulation/types.js';

export class SVG_Vessels {
  update(state: SimulationState) {
    const { phase, speedMultiplier } = state;
    const duration = 5000 / speedMultiplier;

    // Smooth transitions for liquid heights
    [ELEMENTS.liquid1, ELEMENTS.liquid2, ELEMENTS.liquid3].forEach((l) => {
      l.style.transition = `height ${duration}ms linear, y ${duration}ms linear`;
    });

    if (phase === 'PIPE_FLOW_IN' || phase === 'LIME_DOSING') {
      ELEMENTS.liquid1.setAttribute('height', '180');
      ELEMENTS.liquid1.setAttribute('y', '170');
    } else if (phase === 'TRANSFER_TO_STAGE_2') {
      ELEMENTS.liquid1.setAttribute('height', '0');
      ELEMENTS.liquid1.setAttribute('y', '350');
      ELEMENTS.liquid2.setAttribute('height', '180');
      ELEMENTS.liquid2.setAttribute('y', '170');
    } else if (phase === 'TRANSFER_TO_OUTPUT') {
      ELEMENTS.liquid2.setAttribute('height', '0');
      ELEMENTS.liquid2.setAttribute('y', '350');
      ELEMENTS.liquid3.setAttribute('height', '150');
      ELEMENTS.liquid3.setAttribute('y', '200');
    } else if (phase === 'RESETTING' || phase === 'IDLE') {
      [ELEMENTS.liquid1, ELEMENTS.liquid2, ELEMENTS.liquid3].forEach((l) => {
        l.style.transition = 'none';
        l.setAttribute('height', '0');
        l.setAttribute('y', '350');
      });
    }

    // Sludge level in stage 1
    if (phase === 'PRECIPITATION') {
      const sludgeDuration = (15 * 60 * 1000) / speedMultiplier;
      ELEMENTS.sludge1.style.transition = `height ${sludgeDuration}ms linear, y ${sludgeDuration}ms linear`;
      ELEMENTS.sludge1.setAttribute('height', '30');
      ELEMENTS.sludge1.setAttribute('y', '320');
    } else if (phase === 'RESETTING' || phase === 'IDLE') {
      ELEMENTS.sludge1.style.transition = 'none';
      ELEMENTS.sludge1.setAttribute('height', '0');
      ELEMENTS.sludge1.setAttribute('y', '350');
    }
  }

  dispose() {
    // No specific cleanup needed for these SVG attributes
  }
}
