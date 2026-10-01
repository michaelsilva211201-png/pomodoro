import { createTimer, finalStretchLevel } from './timer.js';
import { loadSettings, saveSettings, loadState, saveState, validate, loadLocation, saveLocation } from './settings.js';
import { unlockAudio, playEnd, notify, requestPermission } from './alerts.js';
import { createScene } from './scene.js';
import { iconSvg, paintIcons } from './icons.js';
import { sunTimes } from './sun.js';
import { skyAtTime } from './sky.js';
import { requestLocation } from './location.js';
import { moonPhaseIndex } from './moon.js';
import { loadTracks, createMusicPlayer, shouldPlayMusic } from './music.js';
import { createAmbience, pickMobSounds } from './ambience.js';

const LABELS = { focus: 'Foco', short: 'Pausa', long: 'Pausa longa' };
const EMOJI = { focus: '🍅', short: '☕', long: '🌙' };
const HEART = iconSvg('heart');
const HEART_EMPTY = iconSvg('heartEmpty');
const FOOD = iconSvg('drumstick');
const FOOD_EMPTY = iconSvg('drumstickEmpty');
const FOOD_SLOTS = 10;
const NUMBER_FIELDS = ['focusMin', 'shortMin', 'longMin', 'cyclesBeforeLong', 'volume', 'musicVolume', 'ambienceVolume'];
const BOOL_FIELDS = ['autoStart', 'sound', 'notifications', 'ambience', 'rain'];
const TICK_MS = 250;

const $ = (id) => document.getElementById(id);
const root = $('app');
paintIcons(root);
const els = {
  time: $('time'),
  toggle: $('toggle'),
  reset: $('reset'),
  skip: $('skip'),
  cycles: $('cycles'),
  xp: $('xp'),
  hunger: $('hunger'),
  nowPlaying: $('now-playing'),
  musicInfo: $('music-info'),
  activity: $('activity'),
  openSettings: $('open-settings'),
  dialog: $('settings'),
  form: $('settings-form'),
  notifHint: $('notif-hint'),
  skyInfo: $('sky-info'),
  useLocation: $('use-location'),
  locationHint: $('location-hint'),
};

let settings = loadSettings();
const saved = loadState();
const timer = createTimer(settings, saved);
const scene = createScene(root);
let activity = typeof saved?.activity === 'string' ? saved.activity.slice(0, 80) : '';
let celebrating = false;
let lastSaveAt = 0;
let place = loadLocation(); // null → horário padrão 6h–18h
let sunCache = { key: '', times: null };
let music = null; // criado quando a lista da pasta musica/ termina de carregar
const ambience = createAmbience();
let nowPlayingTimer = null;

// Como o aviso de disco tocando no jogo: aparece alguns segundos acima da hotbar.
function showNowPlaying(track) {
  els.nowPlaying.textContent = `Tocando agora: ${track.name}`;
  els.nowPlaying.hidden = false;
  clearTimeout(nowPlayingTimer);
  nowPlayingTimer = setTimeout(() => { els.nowPlaying.hidden = true; }, 4000);
}

function describeMusic() {
  if (!music) return 'Procurando músicas na pasta musica/…';
  if (!music.count) return 'Nenhuma música encontrada. Coloque arquivos (MP3, OGG…) em pomodoro/musica/.';
  return `${music.count} ${music.count === 1 ? 'música' : 'músicas'} na pasta musica/`;
}

// Nascer/pôr do sol de hoje (recalcula quando muda o dia ou a localização).
function todaySunTimes(nowMs) {
  const d = new Date(nowMs);
  const key = `${d.toDateString()}|${place ? `${place.lat},${place.lon}` : 'padrão'}`;
  if (key !== sunCache.key) {
    const at = (h) => new Date(d.getFullYear(), d.getMonth(), d.getDate(), h).getTime();
    sunCache = { key, times: place ? sunTimes(at(12), place.lat, place.lon) : { sunrise: at(6), sunset: at(18) } };
  }
  return sunCache.times;
}

const clock = (ms) => new Date(ms).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });

function describeSky() {
  const times = todaySunTimes(Date.now());
  const source = place ? 'Sua localização' : 'Horário padrão';
  if (times.polar === 'day') return `${source} · sol da meia-noite`;
  if (times.polar === 'night') return `${source} · noite polar`;
  return `${source} · nascer ${clock(times.sunrise)} · pôr ${clock(times.sunset)}`;
}

async function refreshLocation() {
  const found = await requestLocation();
  if (found) {
    saveLocation(found);
    place = loadLocation();
  }
  els.skyInfo.textContent = describeSky();
  return Boolean(found);
}

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
  const filled = Math.min(focusCount, total);
  const key = `${filled}/${total}`;
  if (els.cycles.dataset.key !== key) {
    els.cycles.dataset.key = key;
    els.cycles.innerHTML = Array.from({ length: total }, (_, i) =>
      `<span class="cycle${i < filled ? ' done' : ''}">${i < filled ? HEART : HEART_EMPTY}</span>`).join('');
  }
  els.cycles.setAttribute('aria-label', `${filled} de ${total} focos concluídos`);
}

// Comida: cheia no foco; na pausa vai esvaziando conforme o tempo passa.
function renderHunger(st) {
  const full = st.mode === 'focus' ? FOOD_SLOTS : Math.ceil((FOOD_SLOTS * st.remainingMs) / st.durationMs);
  if (els.hunger.dataset.full === String(full)) return;
  els.hunger.dataset.full = String(full);
  els.hunger.innerHTML = Array.from({ length: FOOD_SLOTS }, (_, i) =>
    `<span class="food">${i < full ? FOOD : FOOD_EMPTY}</span>`).join('');
  els.hunger.setAttribute('aria-label', st.mode === 'focus' ? 'Descansado' : `${full} de ${FOOD_SLOTS} de pausa restante`);
}

function renderXp(st) {
  const progress = 1 - st.remainingMs / st.durationMs;
  els.xp.style.setProperty('--xp', progress.toFixed(4));
  els.xp.setAttribute('aria-valuenow', String(Math.round(progress * 100)));
}

function render() {
  const st = timer.getState();
  const time = format(st.remainingMs);
  els.time.textContent = time;
  document.title = `${EMOJI[st.mode]} ${time} – ${LABELS[st.mode]}`;
  els.toggle.dataset.state = st.running ? 'running' : 'paused';
  els.toggle.setAttribute('aria-label', st.running ? 'Pausar' : 'Iniciar');
  renderCycles(st.focusCount);
  renderXp(st);
  renderHunger(st);
  const now = Date.now();
  const sky = skyAtTime(now, todaySunTimes(now));
  scene.setSky(sky);
  ambience.update({
    active: settings.ambience && (st.running || celebrating),
    volume: settings.ambienceVolume / 100,
    night: sky.night,
    rain: settings.rain,
  });
  scene.setMoonPhase(moonPhaseIndex(now));
  music?.setPlaying(shouldPlayMusic(st, settings.musicMode));
  if (celebrating) return; // a cena termina a comemoração no modo antigo
  scene.setMode(st.mode);
  scene.setRunning(st.running);
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

// Sons dos mobs: de vez em quando, e o chiado do pavio quando a criatura de musgo encosta na casa.
function playMobSounds() {
  if (!settings.ambience) return;
  const mobs = scene.getMobs();
  for (const m of pickMobSounds(mobs, TICK_MS, Math.random)) ambience.mobSound(m);
  ambience.setFuse(mobs.find((m) => m.type === 'mossling' && m.state === 'approach') ?? null);
}

function onTick() {
  const endedMode = timer.getState().mode;
  if (timer.tick()) onBlockEnd(endedMode);
  render();
  playMobSounds();
  if (timer.getState().running && Date.now() - lastSaveAt > 5000) persist();
}

// Controles do timer
els.toggle.addEventListener('click', () => {
  unlockAudio();
  ambience.unlock();
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
  els.locationHint.hidden = true;
  els.skyInfo.textContent = describeSky();
  f.musicMode.value = s.musicMode;
  els.musicInfo.textContent = describeMusic();
}

function readForm() {
  const f = els.form.elements;
  const values = {};
  for (const key of NUMBER_FIELDS) values[key] = f[key].value;
  for (const key of BOOL_FIELDS) values[key] = f[key].checked;
  values.musicMode = f.musicMode.value;
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

els.useLocation.addEventListener('click', async () => {
  els.locationHint.hidden = true;
  if (!(await refreshLocation())) els.locationHint.hidden = false;
});

els.dialog.addEventListener('close', () => {
  if (els.dialog.returnValue !== 'save') return;
  unlockAudio();
  ambience.unlock();
  settings = readForm();
  saveSettings(settings);
  timer.updateSettings(settings);
  music?.setVolume(settings.musicVolume / 100);
  persist();
  render();
});

window.addEventListener('pagehide', persist);

loadTracks().then((tracks) => {
  music = createMusicPlayer(tracks, { onTrackStart: showNowPlaying });
  music.setVolume(settings.musicVolume / 100);
  els.musicInfo.textContent = describeMusic();
  render();
});

if (!place) refreshLocation(); // primeira vez: o navegador pergunta se pode usar a localização
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
