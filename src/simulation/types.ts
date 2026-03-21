export type Phase =
  | 'IDLE'
  | 'PIPE_FLOW_IN'
  | 'LIME_DOSING'
  | 'PRECIPITATION'
  | 'TRANSFER_TO_STAGE_2'
  | 'ACID_DOSING'
  | 'ADSORPTION'
  | 'TRANSFER_TO_OUTPUT'
  | 'FINISHED'
  | 'RESETTING';

export interface ChartPoint {
  x: number;
  y: number;
}

export interface SimulationState {
  phase: Phase;
  isRunning: boolean;
  speedMultiplier: number;
  remainingSeconds: number;
  totalSeconds: number;
  filterUses: number;
  totalVolume: number;
  totalCost: number;
  ph: number;
  ppm: number | null;
  chartData: ChartPoint[];
}

export type StateListener = (state: SimulationState) => void;
