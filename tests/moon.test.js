import { test, eq } from './runner.js';
import { moonPhase, moonPhaseIndex } from '../js/moon.js';

// distância circular até um ponto do ciclo (0 = nova, 0.5 = cheia)
const off = (phase, target) => Math.min(Math.abs(phase - target), 1 - Math.abs(phase - target));

test('lua: cheia em 3/jan/2026 e nova em 18/jan/2026', () => {
  eq(off(moonPhase(Date.UTC(2026, 0, 3, 10, 3)), 0.5) < 0.03, true);
  eq(off(moonPhase(Date.UTC(2026, 0, 18, 19, 52)), 0) < 0.03, true);
});

test('lua: índice de 0 (nova) a 7, com 4 = cheia', () => {
  eq(moonPhaseIndex(Date.UTC(2026, 0, 3, 10, 3)), 4);
  eq(moonPhaseIndex(Date.UTC(2026, 0, 18, 19, 52)), 0);
  eq(moonPhaseIndex(Date.UTC(2026, 0, 26, 4, 47)), 2); // quarto crescente
});
