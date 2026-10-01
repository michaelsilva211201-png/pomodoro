// Pontos do céu ao longo do bloco: dia → pôr do sol → noite.
const SKY = [
  { at: 0, top: [70, 140, 235], bottom: [170, 215, 255] },
  { at: 0.6, top: [235, 110, 70], bottom: [255, 196, 120] },
  { at: 0.9, top: [12, 16, 48], bottom: [36, 44, 100] },
  { at: 1, top: [12, 16, 48], bottom: [36, 44, 100] },
];

const SUNSET = 0.75; // fração do bloco em que o sol termina o arco

const clamp01 = (x) => Math.min(1, Math.max(0, x));

function mix(from, to, t) {
  return `#${from.map((v, i) => Math.round(v + (to[i] - v) * t).toString(16).padStart(2, '0')).join('')}`;
}

// sunX: 0 (nascente, esquerda) → 1 (poente, direita); sunHeight: 0 (horizonte) → 1 (topo do arco).
export function skyAt(progress) {
  const p = clamp01(Number.isFinite(progress) ? progress : 0);
  let i = 0;
  while (i < SKY.length - 2 && p > SKY[i + 1].at) i++;
  const a = SKY[i];
  const b = SKY[i + 1];
  const t = (p - a.at) / (b.at - a.at);
  const sunX = Math.min(1, p / SUNSET);
  return {
    top: mix(a.top, b.top, t),
    bottom: mix(a.bottom, b.bottom, t),
    sunX,
    sunHeight: Math.max(0, Math.sin(Math.PI * sunX)),
    night: clamp01((p - 0.7) / 0.2),
  };
}
