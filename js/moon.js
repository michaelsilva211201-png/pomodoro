// Fase da lua pelo mês sinódico médio (erro de até ~meio dia, suficiente para desenhar a lua).
const SYNODIC_DAYS = 29.530588853;
const KNOWN_NEW_MOON = Date.UTC(2000, 0, 6, 18, 14); // lua nova de referência
const DAY_MS = 86_400_000;

// 0 = nova, 0.25 = quarto crescente, 0.5 = cheia, 0.75 = quarto minguante.
export function moonPhase(ms) {
  const cycles = (ms - KNOWN_NEW_MOON) / DAY_MS / SYNODIC_DAYS;
  return cycles - Math.floor(cycles);
}

// 8 desenhos de fase: 0 = nova … 4 = cheia … 7.
export function moonPhaseIndex(ms) {
  return Math.round(moonPhase(ms) * 8) % 8;
}
