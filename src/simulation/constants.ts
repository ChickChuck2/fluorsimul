export const REAL_DURATIONS = {
  PIPE_FLOW: 2 * 1000, // 2s
  INTRO: 5 * 1000, // 5s
  STAGE_1: 15 * 60 * 1000, // 15 min
  TRANS_1_2: 5 * 1000, // 5s
  STAGE_2: 12 * 60 * 1000, // 12 min
  TRANS_2_3: 5 * 1000, // 5s
  TEST: 3 * 60 * 1000, // 3 min
} as const;

export const PHYSICAL_CONSTANTS = {
  INITIAL_PH: 7.0,
  PRECIPITATION_PH_TARGET: 10.5,
  ADSORPTION_PH_TARGET: 5.8,
  INITIAL_PPM: 50.0,
  PRECIPITATION_PPM_TARGET: 10.0,
  VOLUME_PER_CYCLE: 20, // Liters
  COST_PER_CYCLE: 0.05, // R$
  MAX_FILTER_USES: 3,
} as const;
