// Mobs do lado de fora da casa: animais de dia, monstros à noite. Lógica pura (sem DOM), avançada por stepMobs().

export const HOUSE = { left: 80, right: 240 }; // paredes da casa na cena (os mobs nunca entram)
const SCENE_RIGHT = 320;
const ZONES = [ // grama à esquerda e à direita da casa
  { min: 2, max: HOUSE.left - 2 },
  { min: HOUSE.right + 2, max: SCENE_RIGHT - 2 },
];

// w = largura do sprite; speed em pixels por segundo; burns = pega fogo ao amanhecer
export const MOB_TYPES = {
  chicken: { w: 8, speed: 10, kind: 'animal' },
  pig: { w: 12, speed: 8, kind: 'animal' },
  sheep: { w: 12, speed: 7, kind: 'animal' },
  zombie: { w: 10, speed: 6, kind: 'monster', burns: true },
  skeleton: { w: 10, speed: 7, kind: 'monster', burns: true },
  spider: { w: 14, speed: 12, kind: 'monster' },
  mossling: { w: 12, speed: 6, kind: 'monster' },
};

const DAY_ROSTER = ['chicken', 'pig', 'sheep'];
const NIGHT_ROSTER = ['zombie', 'skeleton', 'spider', 'mossling'];
const FLEE_SPEEDUP = 3;
const RETURN_AFTER_FLEE_MS = 4000;
const BURN_MS = 1500;
const EXITING = new Set(['leave', 'flee', 'burn']);

export function createMobWorld() {
  return { mobs: [], nextId: 1, cooldown: 0 };
}

const typeOf = (m) => MOB_TYPES[m.type];
const isMonster = (m) => typeOf(m).kind === 'monster';

// Limites do canto esquerdo (x) do mob dentro da zona dele.
function bounds(m) {
  const zone = ZONES[m.zone];
  return [zone.min, zone.max - typeOf(m).w];
}

// Fora da tela, do lado da zona.
const edgeX = (m) => (m.zone === 0 ? -typeOf(m).w - 2 : SCENE_RIGHT + 2);

// Encostado na parede da casa.
const wallX = (m) => (m.zone === 0 ? bounds(m)[1] : bounds(m)[0]);

function setState(m, state, rand) {
  m.state = state;
  m.arrived = false;
  if (state === 'walk') {
    m.timer = 1500 + rand() * 2500;
    m.dir = rand() < 0.5 ? 1 : -1;
  } else if (state === 'idle') {
    m.timer = 1000 + rand() * 2500;
  } else if (state === 'burn') {
    m.timer = BURN_MS;
  }
}

function spawn(world, type, still, rand) {
  const m = { id: world.nextId++, type, zone: rand() < 0.5 ? 0 : 1, dir: 1, x: 0 };
  if (still) {
    const [lo, hi] = bounds(m);
    m.x = lo + rand() * (hi - lo);
    m.dir = rand() < 0.5 ? 1 : -1;
    setState(m, 'idle', rand);
  } else { // entra andando pela borda da tela
    m.x = edgeX(m);
    m.dir = m.zone === 0 ? 1 : -1;
    m.state = 'enter';
  }
  return m;
}

function move(m, dt, rand) {
  const t = typeOf(m);
  const [lo, hi] = bounds(m);
  switch (m.state) {
    case 'enter':
      m.x += m.dir * t.speed * dt;
      if ((m.dir > 0 && m.x >= lo) || (m.dir < 0 && m.x <= hi)) setState(m, 'walk', rand);
      break;
    case 'walk':
      m.x += m.dir * t.speed * dt;
      if (m.x < lo) { m.x = lo; m.dir = 1; }
      if (m.x > hi) { m.x = hi; m.dir = -1; }
      m.timer -= dt * 1000;
      if (m.timer <= 0) setState(m, 'idle', rand);
      break;
    case 'idle':
      m.timer -= dt * 1000;
      if (m.timer <= 0) setState(m, 'walk', rand);
      break;
    case 'approach': { // anda até encostar na casa e fica virado para ela
      const target = wallX(m);
      const step = t.speed * dt;
      if (Math.abs(target - m.x) <= step) {
        m.x = target;
        m.dir = m.zone === 0 ? 1 : -1;
        m.arrived = true;
      } else {
        m.dir = Math.sign(target - m.x);
        m.x += m.dir * step;
      }
      break;
    }
    case 'leave':
    case 'flee': {
      const target = edgeX(m);
      m.dir = m.zone === 0 ? -1 : 1;
      m.x += m.dir * t.speed * (m.state === 'flee' ? FLEE_SPEEDUP : 1) * dt;
      if (m.zone === 0 ? m.x <= target : m.x >= target) m.gone = true;
      break;
    }
    case 'burn':
      m.timer -= dt * 1000;
      if (m.timer <= 0) m.gone = true;
      break;
    default:
      break;
  }
}

// ctx: { night (0–1), final (reta final do foco), celebrating, still (timer parado / movimento reduzido), rand }
export function stepMobs(world, dtMs, { night, final, celebrating, still, rand }) {
  const roster = night >= 0.5 ? NIGHT_ROSTER : DAY_ROSTER;
  world.cooldown = Math.max(0, world.cooldown - dtMs);

  for (const m of world.mobs) {
    if (!EXITING.has(m.state)) {
      if (!roster.includes(m.type)) {
        setState(m, typeOf(m).burns && roster === DAY_ROSTER ? 'burn' : 'leave', rand);
      } else if (celebrating && isMonster(m)) {
        setState(m, 'flee', rand);
        world.cooldown = RETURN_AFTER_FLEE_MS;
      } else if (final && isMonster(m)) {
        if (m.state !== 'approach' && m.state !== 'enter') setState(m, 'approach', rand);
      } else if (m.state === 'approach') {
        setState(m, 'walk', rand);
      }
    }
    if (still) {
      if (EXITING.has(m.state)) m.gone = true; // parado: some na hora em vez de sair andando
      continue;
    }
    move(m, dtMs / 1000, rand);
  }
  world.mobs = world.mobs.filter((m) => !m.gone);

  if (world.cooldown > 0 || celebrating) return;
  const present = new Set(world.mobs.map((m) => m.type));
  const missing = roster.filter((type) => !present.has(type));
  if (!missing.length) return;
  const type = missing[Math.floor(rand() * missing.length)];
  world.mobs.push(spawn(world, type, still, rand));
  world.cooldown = still ? 0 : 800 + rand() * 1500;
}
