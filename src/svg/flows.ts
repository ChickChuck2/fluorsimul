import { ELEMENTS } from '../ui/dom.js';
import type { SimulationState } from '../simulation/types.js';

export class SVG_Flows {
  update(state: SimulationState) {
    const { phase } = state;

    // Active flows based on phases
    this.toggle('flowIntro', phase === 'PIPE_FLOW_IN' || phase === 'LIME_DOSING');
    this.toggle('cascade1', phase === 'LIME_DOSING');
    this.toggle('ripple1', phase === 'LIME_DOSING');

    this.toggle('flowStage1_2', phase === 'TRANSFER_TO_STAGE_2' || phase === 'ACID_DOSING');
    this.toggle('cascade2', phase === 'ACID_DOSING');
    this.toggle('ripple2', phase === 'ACID_DOSING');

    this.toggle('flowOutro', phase === 'TRANSFER_TO_OUTPUT');
    this.toggle('cascade3', phase === 'TRANSFER_TO_OUTPUT');
    this.toggle('ripple3', phase === 'TRANSFER_TO_OUTPUT');

    if (phase === 'FINISHED') {
      ELEMENTS.resultIndicator.style.fill = 'var(--spadns-pink)';
    } else if (phase === 'RESETTING' || phase === 'IDLE') {
      ELEMENTS.resultIndicator.style.fill = 'rgba(48, 54, 61, 0.5)';
    }
  }

  private toggle(elName: keyof typeof ELEMENTS, active: boolean) {
    const el = ELEMENTS[elName] as SVGElement;
    if (active) el.classList.add('active');
    else el.classList.remove('active');
  }

  dispose() {
    // Classes will be removed manually on reset/update
  }
}
