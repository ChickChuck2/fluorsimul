import { ELEMENTS } from './dom.js';
import type { ChartPoint } from '../simulation/types.js';

export class PPMChart {
  private canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D;
  private resizeObserver: ResizeObserver;

  constructor() {
    this.canvas = ELEMENTS.canvas;
    const context = this.canvas.getContext('2d');
    if (!context) throw new Error('Could not get 2D context');
    this.ctx = context;

    this.resizeObserver = new ResizeObserver(() => this.handleResize());
    this.resizeObserver.observe(this.canvas.parentElement!);

    this.handleResize();
  }

  private handleResize() {
    const dpr = window.devicePixelRatio || 1;
    const rect = this.canvas.parentElement!.getBoundingClientRect();

    this.canvas.width = rect.width * dpr;
    this.canvas.height = rect.height * dpr;
    this.canvas.style.width = `${rect.width}px`;
    this.canvas.style.height = `${rect.height}px`;

    this.ctx.scale(dpr, dpr);
    // Redraw if we have data (handled by engine subscription usually)
  }

  render(data: ChartPoint[], totalSeconds: number) {
    const { width, height } = this.canvas.getBoundingClientRect();
    const maxPpm = 50;

    this.ctx.clearRect(0, 0, width, height);
    if (data.length === 0) return;

    this.ctx.strokeStyle = '#58a6ff';
    this.ctx.lineWidth = 2;
    this.ctx.beginPath();

    data.forEach((point, i) => {
      const x = (point.x / totalSeconds) * width;
      const y = height - (point.y / maxPpm) * height;
      if (i === 0) this.ctx.moveTo(x, y);
      else this.ctx.lineTo(x, y);
    });

    this.ctx.stroke();
  }

  dispose() {
    this.resizeObserver.disconnect();
  }
}
