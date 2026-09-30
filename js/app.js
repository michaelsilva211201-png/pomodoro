import { createTimer, finalStretchLevel } from './timer.js';
import { loadSettings, saveSettings, loadState, saveState, validate } from './settings.js';
import { unlockAudio, playEnd, notify, requestPermission } from './alerts.js';
import { createScene } from './scene.js';

const LABELS = { focus: 'Foco', short: 'Pausa', long: 'Pausa longa' };
const EMOJI = { focus: '🍅', short: '☕', long: '🌙' };
const CHEVRON = '<svg viewBox="0 0 22 14" aria-hidden="true"><path d="M3 2l6 5-6 5M12 2l6 5-6 5" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"/></svg>';
const NUMBER_FIELDS = ['focusMin', 'shortMin', 'longMin', 'cyclesBeforeLong', 'volume'];
const BOOL_FIELDS = ['autoStart', 'sound', 'notifications'];

const $ = (id) => document.getElementById(id);
const root = $('app');
const els = {
  time: $('time'),
  toggle: $('toggle'),
  reset: $('reset'),
  skip: $('skip'),
  cycles: $('cycles'),
  activity: $('activity'),
  openSettings: $('open-settings'),
  dialog: $('settings'),
  form: $('settings-form'),
  notifHint: $('notif-hint'),
};

let settings = loadSettings();
const saved = loadState();
const timer = createTimer(settings, saved);
const scene = createScene(root);
let activity = typeof saved?.activity === 'string' ? saved.activity.slice(0, 80) : '';
let celebrating = false;
let lastSaveAt = 0;

function format(ms) {
  const total = Math.ceil(ms / 1000);
  const minutes = String(Math.floor(total / 60)).padStart(2, '0');
  const seconds = String(total % 60).padStart(2, '0');
  return `${minutes}:${seconds}`;
}

function persist() {
  const { mode, focusCount, remainingMs } = timer.getState();
  saveState({ mode, focusCount, remainingMs, activity });
  lastSaveAt = Date.now();
}

function renderCycles(focusCount) {
  const total = settings.cyclesBeforeLong;
  if (els.cycles.childElementCount !== total) {
    els.cycles.innerHTML = Array.from({ length: total }, () => `<span class="cycle">${CHEVRON}</span>`).join('');
  }
  [...els.cycles.children].forEach((el, i) => el.classList.toggle('done', i < focusCount));
  els.cycles.setAttribute('aria-label', `${Math.min(focusCount, total)} de ${total} focos concluídos`);
}

function render() {
  const st = timer.getState();
  const time = format(st.remainingMs);
  els.time.textContent = time;
  document.title = `${EMOJI[st.mode]} ${time} – ${LABELS[st.mode]}`;
  els.toggle.dataset.state = st.running ? 'running' : 'paused';
  els.toggle.setAttribute('aria-label', st.running ? 'Pausar' : 'Iniciar');
  renderCycles(st.focusCount);
  if (celebrating) return; // a cena termina a comemoração no modo antigo
  scene.setMode(st.mode);
  scene.setRunning(st.running);
  scene.setProgress(1 - st.remainingMs / st.durationMs);
  scene.setFinalStretch(finalStretchLevel(st.remainingMs, st.durationMs));
}

async function onBlockEnd(endedMode) {
  persist();
  if (settings.sound) playEnd(endedMode, settings.volume);
  if (settings.notifications) {
    notify(endedMode === 'focus' ? 'Foco concluído!' : 'Pausa terminada!', activity || 'Hora do próximo bloco.');
  }
  celebrating = true;
  scene.setFinalStretch('none');
  await scene.celebrate();
  celebrating = false;
  render();
}

function onTick() {
  const endedMode = timer.getState().mode;
  if (timer.tick()) onBlockEnd(endedMode);
  render();
  if (timer.getState().running && Date.now() - lastSaveAt > 5000) persist();
}

// Controles do timer
els.toggle.addEventListener('click', () => {
  unlockAudio();
  if (timer.getState().running) timer.pause();
  else timer.start();
  persist();
  render();
});

els.reset.addEventListener('click', () => {
  const st = timer.getState();
  if (st.remainingMs < st.durationMs) {
    if (!confirm('Reiniciar o bloco atual?')) return;
    if (timer.getState().mode !== st.mode) return; // o bloco acabou com o diálogo aberto
  }
  timer.reset();
  persist();
  render();
});

els.skip.addEventListener('click', () => {
  timer.skip();
  persist();
  render();
});

// Atividade
els.activity.value = activity;
els.activity.addEventListener('input', () => {
  activity = els.activity.value.slice(0, 80);
  persist();
});
els.activity.addEventListener('keydown', (e) => {
  if (e.key === 'Enter') els.activity.blur();
});

// Configurações
function fillForm(s) {
  const f = els.form.elements;
  for (const key of NUMBER_FIELDS) f[key].value = s[key];
  for (const key of BOOL_FIELDS) f[key].checked = s[key];
  f.notifications.checked = s.notifications && ('Notification' in window) && Notification.permission === 'granted';
  els.notifHint.hidden = true;
}

function readForm() {
  const f = els.form.elements;
  const values = {};
  for (const key of NUMBER_FIELDS) values[key] = f[key].value;
  for (const key of BOOL_FIELDS) values[key] = f[key].checked;
  return validate(values);
}

els.openSettings.addEventListener('click', () => {
  fillForm(settings);
  els.dialog.returnValue = '';
  els.dialog.showModal();
});

els.form.elements.notifications.addEventListener('change', async (e) => {
  if (!e.target.checked) return;
  const granted = await requestPermission();
  if (!granted) {
    e.target.checked = false;
    els.notifHint.hidden = false;
  }
});

els.dialog.addEventListener('close', () => {
  if (els.dialog.returnValue !== 'save') return;
  unlockAudio();
  settings = readForm();
  saveSettings(settings);
  timer.updateSettings(settings);
  persist();
  render();
});

window.addEventListener('pagehide', persist);

render();

// Worker dedicado não sofre a limitação agressiva de timers de abas em segundo plano.
function startTicker() {
  try {
    const worker = new Worker(new URL('./ticker.js', import.meta.url));
    worker.addEventListener('message', onTick);
    worker.addEventListener('error', () => {
      worker.terminate();
      setInterval(onTick, 250);
    });
  } catch {
    setInterval(onTick, 250);
  }
}
startTicker();
