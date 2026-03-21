import type { Phase } from './types.js';

export const VALID_TRANSITIONS: Record<Phase, Phase[]> = {
  IDLE: ['PIPE_FLOW_IN', 'RESETTING'],
  PIPE_FLOW_IN: ['LIME_DOSING', 'RESETTING'],
  LIME_DOSING: ['PRECIPITATION', 'RESETTING'],
  PRECIPITATION: ['TRANSFER_TO_STAGE_2', 'RESETTING'],
  TRANSFER_TO_STAGE_2: ['ACID_DOSING', 'RESETTING'],
  ACID_DOSING: ['ADSORPTION', 'RESETTING'],
  ADSORPTION: ['TRANSFER_TO_OUTPUT', 'RESETTING'],
  TRANSFER_TO_OUTPUT: ['FINISHED', 'RESETTING'],
  FINISHED: ['PIPE_FLOW_IN', 'RESETTING', 'IDLE'],
  RESETTING: ['IDLE'],
};

export function isValidTransition(current: Phase, next: Phase): boolean {
  return VALID_TRANSITIONS[current].includes(next);
}
