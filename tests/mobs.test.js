import { test, eq } from './runner.js';
import { createMobWorld, stepMobs, MOB_TYPES, HOUSE } from '../js/mobs.js';

// sorteio com semente, para os testes serem repetíveis
function seeded(seed) {
  let s = seed >>> 0;
  return () => {
    s = (s + 0x6d2b79f5) >>> 0;
    let t = Math.imul(s ^ (s >>> 15), 1 | s);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const DAY = { night: 0, final: false, celebrating: false, still: false };
const NIGHT = { night: 1, final: false, celebrating: false, still: false };

// avança "seconds" segundos em passos de 50 ms, chamando check(world) a cada passo
function run(world, seconds, ctx, rand, check) {
  for (let i = 0; i < seconds * 20; i++) {
    stepMobs(world, 50, { ...ctx, rand });
    check?.(world);
  }
}

const types = (world) => world.mobs.map((m) => m.type).sort();
const kind = (m) => MOB_TYPES[m.type].kind;
const insideHouse = (m) => m.x + MOB_TYPES[m.type].w > HOUSE.left && m.x < HOUSE.right;

test('mobs: de dia aparecem só os animais', () => {
  const world = createMobWorld();
  run(world, 20, DAY, seeded(1));
  eq(types(world), ['chicken', 'pig', 'sheep']);
});

test('mobs: à noite aparecem os monstros e os animais vão embora', () => {
  const world = createMobWorld();
  const rand = seeded(2);
  run(world, 20, DAY, rand);
  run(world, 40, NIGHT, rand);
  eq(types(world), ['mossling', 'skeleton', 'spider', 'zombie']);
});

test('mobs: nunca entram na casa', () => {
  const world = createMobWorld();
  const rand = seeded(3);
  const check = (w) => {
    for (const m of w.mobs) if (insideHouse(m)) throw new Error(`${m.type} entrou na casa em x=${m.x}`);
  };
  run(world, 60, NIGHT, rand, check);
  run(world, 30, { ...NIGHT, final: true }, rand, check);
  run(world, 30, { ...NIGHT, celebrating: true }, rand, check);
  run(world, 60, DAY, rand, check);
});

test('mobs: ao amanhecer zumbi e esqueleto pegam fogo; aranha e criatura de musgo vão embora', () => {
  const world = createMobWorld();
  const rand = seeded(4);
  run(world, 40, NIGHT, rand);
  stepMobs(world, 50, { ...DAY, rand });
  const state = Object.fromEntries(world.mobs.filter((m) => kind(m) === 'monster').map((m) => [m.type, m.state]));
  eq(state, { mossling: 'leave', skeleton: 'burn', spider: 'leave', zombie: 'burn' });
  run(world, 30, DAY, rand);
  eq(world.mobs.some((m) => kind(m) === 'monster'), false);
});

test('mobs: no último minuto do foco os monstros encostam na casa', () => {
  const world = createMobWorld();
  const rand = seeded(5);
  run(world, 40, NIGHT, rand);
  run(world, 40, { ...NIGHT, final: true }, rand);
  for (const m of world.mobs) {
    const w = MOB_TYPES[m.type].w;
    const touching = Math.abs(m.x + w - (HOUSE.left - 2)) < 0.01 || Math.abs(m.x - (HOUSE.right + 2)) < 0.01;
    eq([m.type, m.state, touching], [m.type, 'approach', true]);
  }
});

test('mobs: na comemoração os monstros fogem e depois voltam', () => {
  const world = createMobWorld();
  const rand = seeded(6);
  run(world, 40, NIGHT, rand);
  stepMobs(world, 50, { ...NIGHT, celebrating: true, rand });
  eq(world.mobs.every((m) => m.state === 'flee'), true);
  run(world, 10, { ...NIGHT, celebrating: true }, rand);
  eq(world.mobs.length, 0);
  run(world, 40, NIGHT, rand);
  eq(types(world), ['mossling', 'skeleton', 'spider', 'zombie']);
});

test('mobs: com o timer parado eles aparecem já posicionados e não andam', () => {
  const world = createMobWorld();
  const rand = seeded(7);
  run(world, 1, { ...NIGHT, still: true }, rand);
  eq(types(world), ['mossling', 'skeleton', 'spider', 'zombie']);
  const before = world.mobs.map((m) => m.x);
  run(world, 5, { ...NIGHT, still: true }, rand);
  eq(world.mobs.map((m) => m.x), before);
});

test('mobs: largura dos sprites bate com a usada no movimento', async () => {
  const { SPRITES } = await import('../js/art.js');
  for (const [type, { w }] of Object.entries(MOB_TYPES)) {
    for (const frame of ['A', 'B']) {
      const widths = new Set(SPRITES[`${type}${frame}`].rows.map((r) => r.length));
      eq([...widths], [w], `${type}${frame}`);
    }
  }
});
