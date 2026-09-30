export const MODES = Object.freeze(['focus', 'short', 'long']);

const MINUTE = 60_000;

export function durationFor(mode, settings) {
  const minutes = { focus: settings.focusMin, short: settings.shortMin, long: settings.longMin }[mode];
  return minutes * MINUTE;
}

// Reta final: últimos 10 s → 'seconds'; último minuto (ou últimos 20% em blocos < 5 min) → 'minute'.
export function finalStretchLevel(remainingMs, durationMs) {
  if (remainingMs <= 10_000) return 'seconds';
  const threshold = durationMs < 5 * MINUTE ? durationMs * 0.2 : MINUTE;
  return remainingMs <= threshold ? 'minute' : 'none';
}

function restore(saved, settings) {
  const fresh = { mode: 'focus', focusCount: 0, remainingMs: durationFor('focus', settings) };
  if (!saved || typeof saved !== 'object' || !MODES.includes(saved.mode)) return fresh;
  const durationMs = durationFor(saved.mode, settings);
  const focusCount = Number.isInteger(saved.focusCount)
    ? Math.min(Math.max(saved.focusCount, 0), settings.cyclesBeforeLong)
    : 0;
  const remainingMs = Number.isFinite(saved.remainingMs) && saved.remainingMs > 0
    ? Math.min(saved.remainingMs, durationMs)
    : durationMs;
  return { mode: saved.mode, focusCount, remainingMs };
}

export function createTimer(initialSettings, saved = null, now = () => Date.now()) {
  let settings = initialSettings;
  let { mode, focusCount, remainingMs } = restore(saved, settings);
  let durationMs = durationFor(mode, settings);
  let endsAt = null; // instante de término enquanto roda; null quando pausado

  const running = () => endsAt !== null;
  const remaining = () => (running() ? Math.max(0, endsAt - now()) : remainingMs);

  function advance() {
    if (mode === 'focus') {
      focusCount += 1;
      mode = focusCount >= settings.cyclesBeforeLong ? 'long' : 'short';
    } else {
      if (mode === 'long') focusCount = 0;
      mode = 'focus';
    }
    durationMs = durationFor(mode, settings);
    remainingMs = durationMs;
    endsAt = settings.autoStart ? now() + durationMs : null;
  }

  return {
    start() {
      if (!running()) endsAt = now() + remainingMs;
    },
    pause() {
      if (!running()) return;
      remainingMs = remaining();
      endsAt = null;
    },
    reset() {
      endsAt = null;
      remainingMs = durationMs;
    },
    skip() {
      advance();
    },
    tick() {
      if (!running() || remaining() > 0) return false;
      advance();
      return true;
    },
    getState() {
      return { mode, focusCount, remainingMs: remaining(), durationMs, running: running() };
    },
    updateSettings(next) {
      settings = next;
      if (!running() && remainingMs === durationMs) {
        durationMs = durationFor(mode, settings);
        remainingMs = durationMs;
      }
      focusCount = Math.min(focusCount, settings.cyclesBeforeLong);
    },
  };
}
