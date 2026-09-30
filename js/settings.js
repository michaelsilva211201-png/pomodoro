export const SETTINGS_KEY = 'pomodoro.settings';
export const STATE_KEY = 'pomodoro.state';

export const DEFAULTS = Object.freeze({
  focusMin: 25,
  shortMin: 5,
  longMin: 15,
  cyclesBeforeLong: 4,
  autoStart: false,
  sound: true,
  volume: 70,
  notifications: false,
});

const LIMITS = {
  focusMin: [1, 120],
  shortMin: [1, 60],
  longMin: [1, 60],
  cyclesBeforeLong: [1, 12],
  volume: [0, 100],
};

function toNumber(value) {
  if (typeof value === 'number') return value;
  if (typeof value === 'string' && value.trim() !== '') return Number(value);
  return NaN;
}

export function validate(input) {
  const src = input && typeof input === 'object' ? input : {};
  const out = {};
  for (const [key, fallback] of Object.entries(DEFAULTS)) {
    const value = src[key];
    if (typeof fallback === 'boolean') {
      out[key] = typeof value === 'boolean' ? value : fallback;
      continue;
    }
    const n = toNumber(value);
    if (!Number.isFinite(n)) {
      out[key] = fallback;
      continue;
    }
    const [lo, hi] = LIMITS[key];
    out[key] = Math.min(hi, Math.max(lo, Math.round(n)));
  }
  return out;
}

function defaultStorage() {
  try {
    return globalThis.localStorage ?? null;
  } catch {
    return null;
  }
}

function read(key, storage) {
  try {
    const raw = storage?.getItem(key);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

function write(key, value, storage) {
  try {
    storage?.setItem(key, JSON.stringify(value));
  } catch {
    // storage indisponível (modo privado, bloqueado): segue sem salvar
  }
}

export function loadSettings(storage = defaultStorage()) {
  return validate(read(SETTINGS_KEY, storage));
}

export function saveSettings(settings, storage = defaultStorage()) {
  write(SETTINGS_KEY, settings, storage);
}

export function loadState(storage = defaultStorage()) {
  const state = read(STATE_KEY, storage);
  return state && typeof state === 'object' && !Array.isArray(state) ? state : null;
}

export function saveState(state, storage = defaultStorage()) {
  write(STATE_KEY, state, storage);
}
