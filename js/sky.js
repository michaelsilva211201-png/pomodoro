// Céu a partir do horário real: dia → amanhecer/entardecer → noite.
const DAY = { top: [120, 167, 255], bottom: [192, 216, 255] };
const DUSK = { top: [235, 110, 70], bottom: [255, 196, 120] };
const NIGHT = { top: [12, 16, 48], bottom: [36, 44, 100] };

const TWILIGHT_MS = 3_600_000; // ~1 h de céu colorido em volta do nascer e do pôr

const clamp01 = (x) => Math.min(1, Math.max(0, x));

const mixRgb = (from, to, t) => from.map((v, i) => v + (to[i] - v) * t);
const toHex = (rgb) => `#${rgb.map((v) => Math.round(v).toString(16).padStart(2, '0')).join('')}`;

function colors(glow, night) {
  const pick = (part) => toHex(mixRgb(mixRgb(DAY[part], DUSK[part], glow), NIGHT[part], night));
  return { top: pick('top'), bottom: pick('bottom') };
}

// times: { sunrise, sunset } (ms) ou { polar: 'day' | 'night' }, vindos de sunTimes().
// sunX: 0 (nascente, esquerda) → 1 (poente, direita); sunHeight: 0 (horizonte) → 1 (topo); night: 0 → 1.
export function skyAtTime(nowMs, times) {
  if (times.polar === 'day') return { ...colors(0, 0), sunX: 0.5, sunHeight: 0.5, night: 0 };
  if (times.polar === 'night') return { ...colors(1, 1), sunX: 0, sunHeight: 0, night: 1 };

  const { sunrise, sunset } = times;
  const isDay = nowMs >= sunrise && nowMs <= sunset;
  const sunX = clamp01((nowMs - sunrise) / (sunset - sunrise));
  let night = 0;
  if (nowMs > sunset) night = clamp01((nowMs - sunset) / TWILIGHT_MS);
  else if (nowMs < sunrise) night = clamp01((sunrise - nowMs) / TWILIGHT_MS);
  const glow = isDay ? 1 - clamp01(Math.min(nowMs - sunrise, sunset - nowMs) / TWILIGHT_MS) : 1;
  return {
    ...colors(glow, night),
    sunX,
    sunHeight: isDay ? Math.sin(Math.PI * sunX) : 0,
    night,
  };
}
