const startBtn = document.getElementById('start-btn') as HTMLButtonElement;
const speedBtn = document.getElementById('speed-btn') as HTMLButtonElement;
const resetBtn = document.getElementById('reset-btn') as HTMLButtonElement;
const statusText = document.getElementById('status-text') as HTMLDivElement;
const logEl = document.getElementById('log') as HTMLDivElement;
const timerText = document.getElementById('timer-text') as HTMLDivElement;
const phDisplay = document.getElementById('ph-display') as HTMLDivElement;
const outputPpmMain = document.getElementById('output-ppm-main') as HTMLDivElement;
const flowRateEl = document.getElementById('flow-rate') as HTMLDivElement;
// const turbidityEl = document.getElementById('turbidity-val') as HTMLDivElement;
const interlockEl = document.getElementById('interlock-status') as HTMLDivElement;

// SVG Elements
const liquid1 = document.getElementById('liquid-1') as SVGRectElement | null;
const liquid2 = document.getElementById('liquid-2') as SVGRectElement | null;
const flowIntro = document.getElementById('flow-intro') as SVGPathElement | null;
const flowStage1_2 = document.getElementById('flow-stage1-2') as SVGPathElement | null;
const flowOutro = document.getElementById('flow-outro') as SVGPathElement | null;
const liquid3 = document.getElementById('liquid-3') as SVGRectElement | null;
const resultIndicator = document.getElementById('result-indicator') as SVGCircleElement | null;
const filterStatusEl = document.getElementById('filter-status') as HTMLDivElement;
const volumeEl = document.getElementById('total-volume') as HTMLDivElement;
const costEl = document.getElementById('total-cost') as HTMLDivElement;
const regenBtn = document.getElementById('regen-btn') as HTMLButtonElement;
const particlesGroup = document.getElementById('particles-group') as SVGGElement | null;
const canvas = document.getElementById('ppm-chart') as HTMLCanvasElement;
const ctx = canvas.getContext('2d');

// Novos Elementos Hidráulicos
const sludge1 = document.getElementById('sludge-1') as SVGRectElement | null;
const cascade1 = document.getElementById('cascade-1') as SVGPathElement | null;
const cascade2 = document.getElementById('cascade-2') as SVGPathElement | null;
const cascade3 = document.getElementById('cascade-3') as SVGPathElement | null;
const ripple1 = document.getElementById('ripple-1') as SVGEllipseElement | null;
const ripple2 = document.getElementById('ripple-2') as SVGEllipseElement | null;
const ripple3 = document.getElementById('ripple-3') as SVGEllipseElement | null;
const stopTop = document.getElementById('stop-top') as SVGStopElement | null;
const stopBottom = document.getElementById('stop-bottom') as SVGStopElement | null;

// Estados do Sistema
let isRunning = false;
let speedMultiplier = 1;
let timerInterval: number | null = null;
let remainingSeconds = 1815; // Atualizado no start
let currentSimId = 0;

// Novos Estados de Expansão
let filterUses = 0;
let totalVolume = 0;
let totalCost = 0;
let chartData: { x: number, y: number }[] = [];

const REAL_DURATIONS = {
  PIPE_FLOW: 2 * 1000,      // Tempo da água correndo no tubo (novo)
  INTRO: 5 * 1000,          // 5s de entrada (enchimento)
  STAGE_1: 15 * 60 * 1000,  // 15 min
  TRANS_1_2: 5 * 1000,      // 5s transferência
  STAGE_2: 12 * 60 * 1000,  // 12 min
  TRANS_2_3: 5 * 1000,      // 5s saída
  TEST: 3 * 60 * 1000       // 3 min
};

const TOTAL_SECONDS = Object.values(REAL_DURATIONS).reduce((a, b) => a + b, 0) / 1000;

const log = (msg: string) => {
  const time = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
  logEl.innerHTML = `<div>[${time}] ${msg}</div>` + logEl.innerHTML;
};

const updatePpmDisplay = (output: number | null) => {
  if (output !== null) {
    outputPpmMain.innerText = `${output.toFixed(2)} ppm`;
    outputPpmMain.style.color = output < 1.5 ? 'var(--fluoride-low)' : 'var(--fluoride-high)';
    updateWaterColor(output);
  } else {
    outputPpmMain.innerText = `-- ppm`;
    outputPpmMain.style.color = 'inherit';
  }
};

const updateWaterColor = (ppm: number) => {
  if (!stopTop || !stopBottom) return;

  // Interpolação entre Marrom (50ppm) e Azul (0ppm)
  // Suja: HSL(30, 40%, 30%) -> Limpa: HSL(210, 100%, 67%)
  const ratio = Math.max(0, Math.min(1, ppm / 50));

  const h = 210 - (ratio * 180); // 210 - 180 = 30
  const s = 100 - (ratio * 60);  // 100 - 60 = 40
  const l = 67 - (ratio * 37);   // 67 - 37 = 30

  const color = `hsl(${h}, ${s}%, ${l}%)`;
  const darkerColor = `hsl(${h}, ${s}%, ${l - 15}%)`;

  stopTop.setAttribute('style', `stop-color: ${color}; stop-opacity: 1`);
  stopBottom.setAttribute('style', `stop-color: ${darkerColor}; stop-opacity: 1`);
};

const updatePhDisplay = (ph: number) => {
  // Simular jitter de sensor real (pequena oscilação)
  const jitter = (Math.random() - 0.5) * 0.04;
  const displayPh = ph + jitter;
  phDisplay.innerText = displayPh.toFixed(2);
  phDisplay.style.color = (ph >= 5.5 && ph <= 6.5) ? 'var(--fluoride-low)' :
    (ph > 10) ? 'var(--warning-color)' : 'var(--accent-color)';
};

const updateTimerDisplay = (seconds: number) => {
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  timerText.innerText = `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
};

const updateImpactStats = () => {
  volumeEl.innerText = `${totalVolume} L`;
  costEl.innerText = `R$ ${totalCost.toFixed(2)}`;
};

const drawChart = () => {
  if (!ctx || chartData.length === 0) return;
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  ctx.strokeStyle = '#58a6ff';
  ctx.lineWidth = 2;
  ctx.beginPath();

  const width = canvas.width;
  const height = canvas.height;
  const maxPpm = 50;

  chartData.forEach((point, i) => {
    const x = (point.x / TOTAL_SECONDS) * width;
    const y = height - (point.y / maxPpm) * height;
    if (i === 0) ctx.moveTo(x, y);
    else ctx.lineTo(x, y);
  });

  ctx.stroke();
};

const spawnParticles = (active: boolean) => {
  if (!particlesGroup) return;
  if (!active) {
    particlesGroup.innerHTML = '';
    return;
  }

  for (let i = 0; i < 30; i++) {
    const p = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
    p.setAttribute('class', 'precipitate-particle');
    p.setAttribute('r', (Math.random() * 2 + 1).toString());
    p.setAttribute('cx', (160 + Math.random() * 180).toString());
    p.setAttribute('cy', (150 + Math.random() * 50).toString());
    p.style.animation = `precipitate ${2 + Math.random() * 2}s linear infinite`;
    p.style.animationDelay = `${Math.random() * 2}s`;
    particlesGroup.appendChild(p);
  }
};

const startTimer = (simId: number) => {
  if (timerInterval) clearInterval(timerInterval);
  timerInterval = setInterval(() => {
    if (currentSimId !== simId) {
      if (timerInterval) clearInterval(timerInterval);
      return;
    }
    remainingSeconds -= 1;
    if (remainingSeconds <= 0) {
      remainingSeconds = 0;
      if (timerInterval) clearInterval(timerInterval);
    }
    updateTimerDisplay(remainingSeconds);
  }, 1000 / speedMultiplier);
};

// Espera inteligente que reage à velocidade e cancelamento
const smartWait = (ms: number, simId: number) => {
  return new Promise((resolve, reject) => {
    let elapsed = 0;
    const interval = 50; // Checagem frequente
    const step = () => {
      if (currentSimId !== simId) {
        clearInterval(check);
        reject('Simulação cancelada');
        return;
      }
      elapsed += interval * speedMultiplier;
      if (elapsed >= ms) {
        clearInterval(check);
        resolve(true);
      }
    };
    const check = setInterval(step, interval);
  });
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
  const simId = ++currentSimId;

  log('Iniciando Planta Técnica Industrial...');
  flowRateEl.innerText = '5.0 m³/h';

  // Timer Control - Precisão Total
  remainingSeconds = TOTAL_SECONDS;
  updateTimerDisplay(remainingSeconds);
  startTimer(simId);

  try {
    const updateVesselSpeed = (customDuration?: number) => {
      const duration = customDuration !== undefined ? customDuration : 5000 / speedMultiplier;
      if (liquid1) liquid1.style.transition = `height ${duration}ms linear, y ${duration}ms linear`;
      if (liquid2) liquid2.style.transition = `height ${duration}ms linear, y ${duration}ms linear`;
      if (liquid3) liquid3.style.transition = `height ${duration}ms linear, y ${duration}ms linear`;
    };

    // Etapa 1: Água Bruta -> Cal (SEQUENCIAL)
    log('ETAPA 1: Água bruta correndo pela tubulação...');
    flowIntro?.classList.add('active');
    await smartWait(REAL_DURATIONS.PIPE_FLOW, simId); // Aguarda água chegar no béquere

    log('Dosando Cal Hidratada. Setpoint pH 10.5.');
    cascade1?.classList.add('active');
    ripple1?.classList.add('active');
    spawnParticles(true);
    updateVesselSpeed();
    if (liquid1) {
      liquid1.setAttribute('height', '180');
      liquid1.setAttribute('y', '170');
    }

    // Sobe o pH para precipitação (com delay/transitório)
    await animatePh(7.0, 10.5, REAL_DURATIONS.INTRO, simId);
    cascade1?.classList.remove('active');
    ripple1?.classList.remove('active');
    flowIntro?.classList.remove('active');

    // Precipitação química (F- cai de 50 para 10)
    // Acúmulo de lodo proporcional ao decaimento
    if (sludge1) {
      sludge1.style.transition = `height ${REAL_DURATIONS.STAGE_1 / speedMultiplier}ms linear, y ${REAL_DURATIONS.STAGE_1 / speedMultiplier}ms linear`;
      sludge1.setAttribute('height', '30');
      sludge1.setAttribute('y', '320');
    }
    await animatePpm(50, 10, REAL_DURATIONS.STAGE_1, simId);
    if (currentSimId !== simId) return;
    spawnParticles(false);
    log('Precipitação concluída: Lodo sedimentado no fundo.');

    // ETAPA INTERMEDIÁRIA: Cal -> Alumina (SEQUENCIAL)
    log('Transferindo e dosando Ácido...');
    flowStage1_2?.classList.add('active');
    updateVesselSpeed();
    if (liquid1) { liquid1.setAttribute('height', '0'); liquid1.setAttribute('y', '350'); }
    await smartWait(REAL_DURATIONS.PIPE_FLOW, simId); // Aguarda água chegar no béquere

    cascade2?.classList.add('active');
    ripple2?.classList.add('active');
    if (liquid2) { liquid2.setAttribute('height', '180'); liquid2.setAttribute('y', '170'); }

    // PID simulado descendo o pH
    await animatePh(10.5, 5.8, REAL_DURATIONS.TRANS_1_2, simId);
    interlockEl.style.borderColor = 'var(--success-color)';
    interlockEl.querySelector('.stat-value')!.textContent = 'SISTEMA SEGURO';
    cascade2?.classList.remove('active');
    ripple2?.classList.remove('active');
    flowStage1_2?.classList.remove('active');
    log('Monitoramento Etapa 5: Condição ótima (pH 5.8) atingida.');

    // Etapa 2: Alumina (Adsorção / Polimento)
    log('ETAPA 2: Adsorção por Alumina Ativada. EBCT: 6 min.');
    const targetPpm = filterUses >= 3 ? 4.5 : 0.82;
    if (filterUses >= 3) log('AVISO: Filtro saturado! Eficiência reduzida.');

    await animatePpm(10, targetPpm, REAL_DURATIONS.STAGE_2, simId);
    if (currentSimId !== simId) return;

    // Etapa 3: Alumina -> Reservatório (SEQUENCIAL)
    log('Tratamento concluído. Direcionando para reservatório.');
    flowOutro?.classList.add('active');
    updateVesselSpeed();
    if (liquid2) { liquid2.setAttribute('height', '0'); liquid2.setAttribute('y', '350'); }
    await smartWait(REAL_DURATIONS.PIPE_FLOW, simId);

    cascade3?.classList.add('active');
    ripple3?.classList.add('active');
    if (liquid3) { liquid3.setAttribute('height', '150'); liquid3.setAttribute('y', '200'); }
    await smartWait(REAL_DURATIONS.TRANS_2_3, simId);
    cascade3?.classList.remove('active');
    ripple3?.classList.remove('active');
    flowOutro?.classList.remove('active');

    // Finalização e Teste SPADNS
    log('Monitoramento Final: Água tratada com sucesso.');
    if (resultIndicator) {
      resultIndicator.style.transition = `fill ${REAL_DURATIONS.TEST / speedMultiplier}ms`;
      resultIndicator.style.fill = 'var(--spadns-pink)';
    }
    await smartWait(REAL_DURATIONS.TEST, simId);

    log(`RESULTADO FINAL: ${targetPpm} ppm (Remoção Eficiente).`);
    updateImpactStats();
    filterUses++;

    setStatus('PRONTO', 'SUCESSO');
    log('RESULTADO: Água Aprovada (Rosa = Limpa).');

    // Update Global Stats
    totalVolume += 20;
    totalCost += 0.05;
    updateImpactStats();

    if (filterUses >= 3) {
      filterStatusEl.innerText = 'SATURADO (NECESSITA REGEN.)';
      filterStatusEl.style.color = 'var(--danger-color)';
      regenBtn.style.display = 'block';
    } else {
      const efficiency = 100 - (filterUses * 10);
      filterStatusEl.innerText = `EFICIENTE (${efficiency}%)`;
    }

  } catch (e) {
    console.log('Simulação interrompida ou erro:', e);
  } finally {
    if (currentSimId === simId) {
      startBtn.disabled = false;
      isRunning = false;
    }
  }
};

// DRY: Função para animar a descida do ppm (Agora inteligente)
const animatePpm = (start: number, end: number, totalMs: number, simId: number) => {
  return new Promise(resolve => {
    let elapsedMs = 0;
    const intervalTime = 50;

    const interval = setInterval(() => {
      if (currentSimId !== simId) {
        clearInterval(interval);
        return;
      }

      elapsedMs += intervalTime * speedMultiplier;

      // Isoterma de Adsorção Não-Linear: progress^0.7 (rápido no início, lento no fim)
      const rawProgress = Math.min(1, elapsedMs / totalMs);
      const curvedProgress = Math.pow(rawProgress, 0.7);

      const current = start + (end - start) * curvedProgress;

      updatePpmDisplay(current);

      // Update Graph
      const timePassed = (TOTAL_SECONDS - (remainingSeconds));
      chartData.push({ x: timePassed, y: current });
      drawChart();

      if (rawProgress >= 1) {
        clearInterval(interval);
        updatePpmDisplay(end);
        resolve(true);
      }
    }, intervalTime);
  });
};

// Função para animar mudança de pH
const animatePh = (start: number, end: number, totalMs: number, simId: number) => {
  return new Promise(resolve => {
    let elapsedMs = 0;
    const intervalTime = 50;
    const interval = setInterval(() => {
      if (currentSimId !== simId) { clearInterval(interval); return; }
      elapsedMs += intervalTime * speedMultiplier;
      const progress = Math.min(1, elapsedMs / totalMs);
      const current = start + (end - start) * progress;
      updatePhDisplay(current);
      if (progress >= 1) { clearInterval(interval); resolve(true); }
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

  if (isRunning) {
    startTimer(currentSimId);

    // Atualiza transições do SVG para a nova velocidade
    const updateVesselSpeed = () => {
      const duration = 5000 / speedMultiplier;
      if (liquid1) liquid1.style.transition = `height ${duration}ms linear, y ${duration}ms linear`;
      if (liquid2) liquid2.style.transition = `height ${duration}ms linear, y ${duration}ms linear`;
      if (liquid3) {
        const remH = 150 - parseFloat(liquid3.getAttribute('height') || '0');
        // No modo realista, o preenchimento final do tanque de saída leva 5s.
        const remDuration = (5000 * (remH / 150)) / speedMultiplier;
        liquid3.style.transition = `height ${remDuration}ms linear, y ${remDuration}ms linear`;
      }
    };
    updateVesselSpeed();
  }
};

const resetSystem = () => {
  currentSimId++;
  isRunning = false;
  startBtn.disabled = false;
  chartData = [];
  if (ctx) ctx.clearRect(0, 0, canvas.width, canvas.height);

  updatePhDisplay(7.0);
  updatePpmDisplay(null);
  updateWaterColor(50); // Reset para água suja
  flowRateEl.innerText = '0.0 m³/h';

  if (timerInterval) clearInterval(timerInterval);
  remainingSeconds = TOTAL_SECONDS;
  updateTimerDisplay(remainingSeconds);

  // Reset UI
  setStatus('AGUARDANDO', 'AGUARDANDO');
  log('Sistema reiniciado e pronto para novo ciclo.');

  interlockEl.style.borderColor = 'var(--glass-border)';
  interlockEl.querySelector('.stat-value')!.textContent = 'SISTEMA SEGURO';

  [liquid1, liquid2, liquid3, sludge1].forEach(l => {
    if (l) {
      l.style.transition = 'none';
      l.setAttribute('height', '0');
      l.setAttribute('y', '350');
    }
  });

  [flowIntro, flowStage1_2, flowOutro, cascade1, cascade2, cascade3, ripple1, ripple2, ripple3].forEach(f => f?.classList.remove('active'));

  if (resultIndicator) {
    resultIndicator.style.fill = 'rgba(48, 54, 61, 0.5)';
  }
};

const regenFilter = () => {
  filterUses = 0;
  filterStatusEl.innerText = 'EFICIENTE (100%)';
  filterStatusEl.style.color = 'var(--accent-color)';
  regenBtn.style.display = 'none';
  log('Filtro regenerado com NaOH com sucesso!');
};

// Event Listeners
startBtn?.addEventListener('click', runSimulation);
speedBtn?.addEventListener('click', toggleSpeed);
resetBtn?.addEventListener('click', resetSystem);
regenBtn?.addEventListener('click', regenFilter);

// Init
canvas.width = canvas.offsetWidth;
canvas.height = canvas.offsetHeight;
updateWaterColor(50); // Inicia com água bruta suja
console.log('Simulation ready.');
