// Pontos do céu ao longo do bloco: dia → pôr do sol → noite.
const SKY = [
  { at: 0, top: [126, 200, 240], bottom: [205, 238, 253] },
  { at: 0.6, top: [240, 138, 93], bottom: [255, 210, 138] },
  { at: 0.9, top: [28, 35, 64], bottom: [59, 63, 115] },
  { at: 1, top: [28, 35, 64], bottom: [59, 63, 115] },
];

const clamp01 = (x) => Math.min(1, Math.max(0, x));

function mix(from, to, t) {
  return `#${from.map((v, i) => Math.round(v + (to[i] - v) * t).toString(16).padStart(2, '0')).join('')}`;
}

export function skyAt(progress) {
  const p = clamp01(Number.isFinite(progress) ? progress : 0);
  let i = 0;
  while (i < SKY.length - 2 && p > SKY[i + 1].at) i++;
  const a = SKY[i];
  const b = SKY[i + 1];
  const t = (p - a.at) / (b.at - a.at);
  return {
    top: mix(a.top, b.top, t),
    bottom: mix(a.bottom, b.bottom, t),
    sunY: 110 + 150 * Math.min(1, p / 0.7),
    night: clamp01((p - 0.7) / 0.2),
  };
}
