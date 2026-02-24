// DOM Elements
const startBtn = document.getElementById('start-btn') as HTMLButtonElement;
const speedBtn = document.getElementById('speed-btn') as HTMLButtonElement;
const resetBtn = document.getElementById('reset-btn') as HTMLButtonElement;
const statusText = document.getElementById('status-text') as HTMLDivElement;
const inputPpmEl = document.getElementById('input-ppm') as HTMLDivElement;
const outputPpmEl = document.getElementById('output-ppm') as HTMLDivElement;
const logEl = document.getElementById('log') as HTMLDivElement;

// SVG Elements
const liquid1 = document.getElementById('liquid-1') as SVGRectElement | null;
const liquid2 = document.getElementById('liquid-2') as SVGRectElement | null;
const flowIntro = document.getElementById('flow-intro') as SVGPathElement | null;
const flowStage1_2 = document.getElementById('flow-stage1-2') as SVGPathElement | null;
const flowOutro = document.getElementById('flow-outro') as SVGPathElement | null;
const resultIndicator = document.getElementById('result-indicator') as SVGCircleElement | null;

// Estados do Sistema
let isRunning = false;
let speedMultiplier = 1; // 1x, 10x, 100x

const REAL_DURATIONS = {
  STAGE_1: 15 * 60 * 1000, // 15 min
  STAGE_2: 12 * 60 * 1000, // 12 min
  TEST: 3 * 60 * 1000    // 3 min
};

const log = (msg: string) => {
  const time = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
  logEl.innerHTML = `<div>[${time}] ${msg}</div>` + logEl.innerHTML;
};

const updatePpmDisplay = (input: number, output: number | null) => {
  inputPpmEl.innerHTML = `${input.toFixed(1)} <span style="font-size: 0.8rem; font-weight: 400;">ppm</span>`;
  if (output !== null) {
    outputPpmEl.innerHTML = `${output.toFixed(2)} <span style="font-size: 0.8rem; font-weight: 400;">ppm</span>`;
    outputPpmEl.style.color = output < 1.5 ? 'var(--fluoride-low)' : 'var(--fluoride-high)';
  } else {
    outputPpmEl.innerHTML = `-- <span style="font-size: 0.8rem; font-weight: 400;">ppm</span>`;
    outputPpmEl.style.color = 'inherit';
  }
};

const setStatus = (status: string, type: 'AGUARDANDO' | 'RODANDO' | 'SUCESSO' | 'RESET') => {
  statusText.innerText = status;
  switch (type) {
    case 'RODANDO': statusText.style.color = 'var(--accent-color)'; break;
    case 'SUCESSO': statusText.style.color = 'var(--success-color)'; break;
    case 'AGUARDANDO': statusText.style.color = 'var(--warning-color)'; break;
    default: statusText.style.color = 'var(--text-secondary)';
  }
};

const runSimulation = async () => {
  if (isRunning) return;
  isRunning = true;
  startBtn.disabled = true;

  setStatus('FILTRANDO...', 'RODANDO');

  // Etapa 1: Cal
  log('Passo 1: Cal adicionada. Tempo real estimado: 15 min.');
  flowIntro?.classList.add('active');
  if (liquid1) {
    liquid1.style.transition = `height ${3000 / speedMultiplier}ms ease-out, y ${3000 / speedMultiplier}ms ease-out`;
    liquid1.setAttribute('height', '180');
    liquid1.setAttribute('y', '170');
  }
  await animatePpm(50, 10, REAL_DURATIONS.STAGE_1 / speedMultiplier);
  log('Flúor caiu: 50 -> 10 ppm.');

  // Etapa 2: Alumina
  log('Passo 2: Polimento com Alumina. Tempo real estimado: 12 min.');
  flowStage1_2?.classList.add('active');
  if (liquid2) {
    liquid2.style.transition = `height ${3000 / speedMultiplier}ms ease-out, y ${3000 / speedMultiplier}ms ease-out`;
    liquid2.setAttribute('height', '180');
    liquid2.setAttribute('y', '170');
  }
  await animatePpm(10, 0.82, REAL_DURATIONS.STAGE_2 / speedMultiplier);
  log('Água polida! Nível final: 0.82 ppm.');

  // Teste Final
  flowOutro?.classList.add('active');
  log('Teste de Qualidade: O Rosa indica que está pura.');
  await new Promise(r => setTimeout(r, (REAL_DURATIONS.TEST / 2) / speedMultiplier));

  if (resultIndicator) {
    resultIndicator.style.transition = `fill ${2000 / speedMultiplier}ms`;
    resultIndicator.style.fill = 'var(--spadns-pink)';
  }

  await new Promise(r => setTimeout(r, (REAL_DURATIONS.TEST / 2) / speedMultiplier));

  setStatus('PRONTO', 'SUCESSO');
  log('RESULTADO: Água Aprovada (Rosa = Limpa).');
  startBtn.disabled = false;
  isRunning = false;
};

// DRY: Função para animar a descida do ppm
const animatePpm = (start: number, end: number, duration: number) => {
  return new Promise(resolve => {
    let current = start;
    const intervalTime = Math.max(50, 100 / speedMultiplier);
    const totalSteps = duration / intervalTime;
    const stepValue = (end - start) / totalSteps;

    const interval = setInterval(() => {
      current += stepValue;
      const isDone = stepValue < 0 ? current <= end : current >= end;

      if (isDone) {
        clearInterval(interval);
        updatePpmDisplay(50, end);
        resolve(true);
      } else {
        updatePpmDisplay(50, current);
      }
    }, intervalTime);
  });
};

const toggleSpeed = () => {
  if (speedMultiplier === 1) speedMultiplier = 10;
  else if (speedMultiplier === 10) speedMultiplier = 100;
  else if (speedMultiplier === 100) speedMultiplier = 1000;
  else speedMultiplier = 1;

  speedBtn.innerText = `ACELERAR (${speedMultiplier}x)`;
  log(`Velocidade ajustada para ${speedMultiplier}x`);
};

const resetSystem = () => {
  isRunning = false;
  startBtn.disabled = false;

  // Reset UI
  setStatus('AGUARDANDO', 'AGUARDANDO');
  updatePpmDisplay(50.0, null);
  log('Sistema reiniciado e pronto para novo ciclo.');

  // Reset SVG
  [liquid1, liquid2].forEach(l => {
    if (l) {
      l.style.transition = 'none';
      l.setAttribute('height', '0');
      l.setAttribute('y', '350');
    }
  });

  [flowIntro, flowStage1_2, flowOutro].forEach(f => f?.classList.remove('active'));

  if (resultIndicator) {
    resultIndicator.style.fill = 'rgba(48, 54, 61, 0.5)';
  }
};

// Event Listeners
startBtn?.addEventListener('click', runSimulation);
speedBtn?.addEventListener('click', toggleSpeed);
resetBtn?.addEventListener('click', resetSystem);

// Init
console.log('Simulation ready.');
