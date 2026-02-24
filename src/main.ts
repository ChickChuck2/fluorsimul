// DOM Elements
const startBtn = document.getElementById('start-btn') as HTMLButtonElement;
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
  log('Passo 1: Cal adicionada. Removendo o grosso...');
  flowIntro?.classList.add('active');
  if (liquid1) {
    liquid1.style.transition = 'height 3s ease-out, y 3s ease-out';
    liquid1.setAttribute('height', '180');
    liquid1.setAttribute('y', '170');
  }
  await animatePpm(50, 10, 2000);
  log('Flúor caiu: 50 -> 10 ppm.');

  // Etapa 2: Alumina
  log('Passo 2: Polimento com Alumina. pH em 6.0.');
  flowStage1_2?.classList.add('active');
  if (liquid2) {
    liquid2.style.transition = 'height 3s ease-out, y 3s ease-out';
    liquid2.setAttribute('height', '180');
    liquid2.setAttribute('y', '170');
  }
  await animatePpm(10, 0.82, 2500);
  log('Água polida! Nível final: 0.82 ppm.');

  // Teste Final
  flowOutro?.classList.add('active');
  log('Teste de Qualidade: O Rosa indica que está pura.');
  await new Promise(r => setTimeout(r, 1500));

  if (resultIndicator) {
    resultIndicator.style.transition = 'fill 2s';
    resultIndicator.style.fill = 'var(--spadns-pink)';
  }

  setStatus('PRONTO', 'SUCESSO');
  log('RESULTADO: Água Aprovada (Rosa = Limpa).');
  startBtn.disabled = false;
  isRunning = false;
};

// DRY: Função para animar a descida do ppm
const animatePpm = (start: number, end: number, duration: number) => {
  return new Promise(resolve => {
    let current = start;
    const intervalTime = 100;
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
resetBtn?.addEventListener('click', resetSystem);

// Init
console.log('Simulation ready.');
