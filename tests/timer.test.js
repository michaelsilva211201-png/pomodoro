import { test, eq } from './runner.js';
import { createTimer, finalStretchLevel } from '../js/timer.js';
import { DEFAULTS } from '../js/settings.js';

const MIN = 60_000;
const cfg = (over = {}) => ({ ...DEFAULTS, ...over });

function fakeClock(start = 1_000_000) {
  let t = start;
  const now = () => t;
  now.advance = (ms) => { t += ms; };
  return now;
}

function finish(timer, now) {
  timer.start();
  now.advance(timer.getState().remainingMs);
  return timer.tick();
}

const INICIAL = { mode: 'focus', focusCount: 0, remainingMs: 25 * MIN, durationMs: 25 * MIN, running: false };

test('timer: começa em foco, pausado, com tempo cheio', () => {
  eq(createTimer(cfg(), null, fakeClock()).getState(), INICIAL);
});

test('timer: 4 focos levam à pausa longa e o ciclo recomeça', () => {
  const now = fakeClock();
  const t = createTimer(cfg(), null, now);
  const modes = [];
  for (let i = 0; i < 8; i++) {
    finish(t, now);
    modes.push(t.getState().mode);
  }
  eq(modes, ['short', 'focus', 'short', 'focus', 'short', 'focus', 'long', 'focus']);
  eq(t.getState().focusCount, 0);
});

test('timer: com 1 foco por ciclo toda pausa é longa', () => {
  const now = fakeClock();
  const t = createTimer(cfg({ cyclesBeforeLong: 1 }), null, now);
  const modes = [];
  for (let i = 0; i < 3; i++) {
    finish(t, now);
    modes.push(t.getState().mode);
  }
  eq(modes, ['long', 'focus', 'long']);
});

test('timer: pausar e retomar preserva o restante exato', () => {
  const now = fakeClock();
  const t = createTimer(cfg(), null, now);
  t.start();
  now.advance(10_000);
  t.pause();
  now.advance(60_000);
  eq([t.getState().remainingMs, t.getState().running], [25 * MIN - 10_000, false]);
  t.start();
  now.advance(5_000);
  eq([t.getState().remainingMs, t.getState().running], [25 * MIN - 15_000, true]);
});

test('timer: tick só conclui quando o tempo zera', () => {
  const now = fakeClock();
  const t = createTimer(cfg(), null, now);
  t.start();
  now.advance(25 * MIN - 1);
  eq(t.tick(), false);
  eq(t.getState().mode, 'focus');
  now.advance(1);
  eq(t.tick(), true);
  eq(t.getState().mode, 'short');
});

test('timer: tick com timer pausado não faz nada', () => {
  const t = createTimer(cfg(), null, fakeClock());
  eq(t.tick(), false);
  eq(t.getState(), INICIAL);
});

test('timer: próximo bloco começa pausado por padrão', () => {
  const now = fakeClock();
  const t = createTimer(cfg(), null, now);
  finish(t, now);
  eq(t.getState(), { mode: 'short', focusCount: 1, remainingMs: 5 * MIN, durationMs: 5 * MIN, running: false });
});

test('timer: com autoStart o próximo bloco já começa rodando', () => {
  const now = fakeClock();
  const t = createTimer(cfg({ autoStart: true }), null, now);
  finish(t, now);
  now.advance(1_000);
  eq([t.getState().running, t.getState().remainingMs], [true, 5 * MIN - 1_000]);
});

test('timer: reset volta ao tempo cheio e pausa', () => {
  const now = fakeClock();
  const t = createTimer(cfg(), null, now);
  t.start();
  now.advance(3 * MIN);
  t.reset();
  eq(t.getState(), INICIAL);
});

test('timer: skip avança o modo e conta o foco pulado', () => {
  const t = createTimer(cfg(), null, fakeClock());
  t.skip();
  eq([t.getState().mode, t.getState().focusCount, t.getState().running], ['short', 1, false]);
  t.skip();
  eq(t.getState().mode, 'focus');
});

test('timer: updateSettings aplica na hora com o bloco intacto', () => {
  const t = createTimer(cfg(), null, fakeClock());
  t.updateSettings(cfg({ focusMin: 50 }));
  eq([t.getState().remainingMs, t.getState().durationMs], [50 * MIN, 50 * MIN]);
});

test('timer: updateSettings não altera bloco em andamento, só o próximo', () => {
  const now = fakeClock();
  const t = createTimer(cfg(), null, now);
  t.start();
  now.advance(MIN);
  t.pause();
  t.updateSettings(cfg({ focusMin: 50 }));
  eq([t.getState().remainingMs, t.getState().durationMs], [24 * MIN, 25 * MIN]);
  t.skip();
  t.skip();
  eq([t.getState().mode, t.getState().remainingMs], ['focus', 50 * MIN]);
});

test('timer: restaura estado salvo válido, sempre pausado', () => {
  const t = createTimer(cfg(), { mode: 'short', focusCount: 2, remainingMs: 120_000 }, fakeClock());
  eq(t.getState(), { mode: 'short', focusCount: 2, remainingMs: 120_000, durationMs: 5 * MIN, running: false });
});

test('timer: estado salvo corrompido volta ao início', () => {
  for (const saved of [null, 'lixo', 42, [], { mode: 'xyz', focusCount: 1, remainingMs: 1000 }]) {
    eq(createTimer(cfg(), saved, fakeClock()).getState(), INICIAL, JSON.stringify(saved));
  }
});

test('timer: campos inválidos no estado salvo usam valores seguros', () => {
  const t = createTimer(cfg(), { mode: 'short', focusCount: -3, remainingMs: 'abc' }, fakeClock());
  eq(t.getState(), { mode: 'short', focusCount: 0, remainingMs: 5 * MIN, durationMs: 5 * MIN, running: false });
  const t2 = createTimer(cfg(), { mode: 'short', focusCount: 99, remainingMs: 99 * MIN }, fakeClock());
  eq([t2.getState().focusCount, t2.getState().remainingMs], [4, 5 * MIN]);
});

test('finalStretchLevel: último minuto e últimos 10 s em bloco longo', () => {
  eq(finalStretchLevel(25 * MIN, 25 * MIN), 'none');
  eq(finalStretchLevel(60_001, 25 * MIN), 'none');
  eq(finalStretchLevel(60_000, 25 * MIN), 'minute');
  eq(finalStretchLevel(10_001, 25 * MIN), 'minute');
  eq(finalStretchLevel(10_000, 25 * MIN), 'seconds');
  eq(finalStretchLevel(0, 25 * MIN), 'seconds');
});

test('finalStretchLevel: blocos menores que 5 min usam os últimos 20%', () => {
  eq(finalStretchLevel(25_000, 2 * MIN), 'none');
  eq(finalStretchLevel(24_000, 2 * MIN), 'minute');
  eq(finalStretchLevel(9_000, 2 * MIN), 'seconds');
});
