import { describe, it, expect } from 'vitest';
import { calculatePhTransition, calculatePpmDecay } from '../calculators.js';
import { isValidTransition } from '../state-machine.js';

describe('Simulation Calculators', () => {
  it('should calculate linear pH transition', () => {
    expect(calculatePhTransition(7, 10, 0.5)).toBe(8.5);
  });

  it('should calculate PPM decay', () => {
    expect(calculatePpmDecay(50, 10, 0.5, false)).toBe(30);
  });

  it('should calculate non-linear PPM decay (isotherm sim)', () => {
    const linear = calculatePpmDecay(50, 10, 0.5, false);
    const nonLinear = calculatePpmDecay(50, 10, 0.5, true);
    // 0.5^0.7 is ~0.61, so it should decay faster initially
    expect(nonLinear).toBeLessThan(linear);
  });
});

describe('State Machine', () => {
  it('should allow valid transitions', () => {
    expect(isValidTransition('IDLE', 'PIPE_FLOW_IN')).toBe(true);
    expect(isValidTransition('FINISHED', 'IDLE')).toBe(true);
  });

  it('should block invalid transitions', () => {
    expect(isValidTransition('IDLE', 'FINISHED')).toBe(false);
    expect(isValidTransition('PIPE_FLOW_IN', 'ADSORPTION')).toBe(false);
  });

  it('should allow resetting from any phase', () => {
    expect(isValidTransition('ADSORPTION', 'RESETTING')).toBe(true);
  });
});
