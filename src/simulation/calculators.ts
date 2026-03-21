export function calculatePhTransition(startPh: number, targetPh: number, progress: number): number {
  return startPh + (targetPh - startPh) * progress;
}

export function calculatePpmDecay(
  startPpm: number,
  endPpm: number,
  progress: number,
  isNonLinear = false,
): number {
  const curvedProgress = isNonLinear ? Math.pow(progress, 0.7) : progress;
  return startPpm + (endPpm - startPpm) * curvedProgress;
}

export function getWaterColor(ppm: number): { top: string; bottom: string } {
  // Interpolação entre Marrom (50ppm) e Azul (0ppm)
  const ratio = Math.max(0, Math.min(1, ppm / 50));

  const h = 210 - ratio * 180; // 210 -> 30
  const s = 100 - ratio * 60; // 100 -> 40
  const l = 67 - ratio * 37; // 67 -> 30

  const color = `hsl(${h}, ${s}%, ${l}%)`;
  const darkerColor = `hsl(${h}, ${s}%, ${l - 15}%)`;

  return { top: color, bottom: darkerColor };
}
