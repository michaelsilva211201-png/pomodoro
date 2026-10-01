// Arte em pixels da cena (original, no estilo de jogos de blocos como Minecraft, vista em corte lateral).
// Cada desenho é uma lista de linhas; cada caractere é um pixel da paleta ('.' = transparente).
// A cena tem 320×160 pixels; blocos têm 16×16. As texturas usam ruído com semente fixa (sempre iguais).

export const SCENE_W = 320;
export const SCENE_H = 160;
export const BLOCK = 16;
export const GROUND_Y = 112; // topo da grama e do piso

// ---------- Ruído determinístico ----------

function rng(seed) {
  let s = seed >>> 0;
  return () => {
    s = (s + 0x6d2b79f5) >>> 0;
    let t = Math.imul(s ^ (s >>> 15), 1 | s);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

// Escolhe um caractere por pixel segundo os pesos, ex.: [['d', 6], ['D', 3], ['l', 1]].
function pick(rand, weights) {
  const total = weights.reduce((sum, [, w]) => sum + w, 0);
  let r = rand() * total;
  for (const [ch, w] of weights) {
    r -= w;
    if (r < 0) return ch;
  }
  return weights[0][0];
}

function noiseRows(seed, weights, w = 16, h = 16) {
  const rand = rng(seed);
  return Array.from({ length: h }, () => Array.from({ length: w }, () => pick(rand, weights)).join(''));
}

// ---------- Blocos (texturas 16×16, viram <pattern>) ----------

const DIRT = { d: '#866043', D: '#6c4a32', l: '#9b7653', k: '#5a3c28' };
const DIRT_W = [['d', 6], ['D', 3], ['l', 2], ['k', 1]];

function grassSide() {
  const rand = rng(7);
  const dirt = noiseRows(8, DIRT_W);
  // A grama desce de 2 a 4 pixels, com algumas "gotas" mais longas, como na lateral do bloco
  const depth = Array.from({ length: 16 }, () => 2 + Math.floor(rand() * 3) + (rand() < 0.15 ? 2 : 0));
  return dirt.map((row, y) => [...row].map((ch, x) => {
    if (y < depth[x]) return pick(rand, [['g', 5], ['G', 3], ['h', 2]]);
    if (y === depth[x]) return 'G';
    return ch;
  }).join(''));
}

function planks(seed) {
  const rand = rng(seed);
  const seams = [11, 4, 13, 7]; // emenda vertical de cada tábua
  return Array.from({ length: 16 }, (_, y) => {
    const board = Math.floor(y / 4);
    if (y % 4 === 3) return 'k'.repeat(16);
    return Array.from({ length: 16 }, (_, x) => {
      if (x === seams[board]) return 'k';
      if (y % 4 === 0 && rand() < 0.5) return 'l';
      return pick(rand, [['p', 7], ['P', 3]]);
    }).join('');
  });
}

// Pedregulho: argamassa escura ('#') entre pedras com ruído.
const COBBLE = [
  '.....#.....#....',
  '.....#.....#....',
  '######.....#####',
  '...#..#####.....',
  '...#......#.....',
  '...#......#.....',
  '####......######',
  '.....######....#',
  '.....#.....#...#',
  '######.....#...#',
  '..#...#....#####',
  '..#...######....',
  '..#.......#.....',
  '###.......#.....',
  '..#########.####',
  '..#.....#.......',
];

function cobble() {
  const rand = rng(21);
  return COBBLE.map((row, y) => [...row].map((ch, x) => {
    if (ch === '#') return rand() < 0.8 ? 'k' : 'C';
    const above = y > 0 && COBBLE[y - 1][x] === '#';
    if (above && rand() < 0.6) return 'l'; // topo da pedra mais claro
    return pick(rand, [['c', 6], ['C', 3], ['l', 1]]);
  }).join(''));
}

function log() {
  const rand = rng(33);
  const stripes = 'lLlmlLllLlmlLllL';
  return Array.from({ length: 16 }, () => [...stripes].map((ch) => (rand() < 0.18 ? (ch === 'L' ? 'k' : 'L') : ch)).join(''));
}

function glass() {
  return Array.from({ length: 16 }, (_, y) => Array.from({ length: 16 }, (_, x) => {
    if (x === 0 || y === 0 || x === 15 || y === 15) return 'w';
    if (x + y === 6 || x + y === 7 || x + y === 20) return 's'; // reflexos diagonais
    return 'q';
  }).join(''));
}

export const TILES = {
  G: { palette: { g: '#6fa944', G: '#4f8a2f', h: '#86c158', ...DIRT }, rows: grassSide() }, // grama (lateral)
  D: { palette: DIRT, rows: noiseRows(8, DIRT_W) }, // terra
  S: { palette: { s: '#7f7f7f', S: '#686868', l: '#959595', k: '#5a5a5a' }, rows: noiseRows(14, [['s', 7], ['S', 3], ['l', 2], ['k', 1]]) }, // pedra
  C: { palette: { c: '#7a7a7a', C: '#5c5c5c', l: '#a0a0a0', k: '#3a3a3a' }, rows: cobble() }, // pedregulho
  P: { palette: { p: '#b8945f', P: '#9c7a48', l: '#c8a46e', k: '#6b5232' }, rows: planks(41) }, // tábuas de carvalho
  B: { palette: { p: '#6e5433', P: '#5c452a', l: '#7a5e3a', k: '#3e2f1c' }, rows: planks(42) }, // parede de fundo (sombreada)
  L: { palette: { l: '#6b5232', L: '#4f3b22', m: '#806240', k: '#3a2a17' }, rows: log() }, // tronco de carvalho
  F: { // folhas: verde escuro, com furinhos
    palette: { f: '#3f7f24', F: '#2f6219', l: '#56993a', k: '#24491a' },
    rows: noiseRows(55, [['f', 6], ['F', 4], ['l', 2], ['k', 2], ['.', 1]]),
  },
  g: { palette: { w: '#dbeeff', q: 'rgba(200,230,255,.18)', s: 'rgba(255,255,255,.75)' }, rows: glass() }, // vidro
};

// Mapa de 20×10 blocos.
export function buildMap() {
  const rows = Array.from({ length: SCENE_H / BLOCK }, () => Array(SCENE_W / BLOCK).fill('.'));
  const fill = (ch, c0, c1, r0, r1) => {
    for (let r = r0; r <= r1; r++) for (let c = c0; c <= c1; c++) rows[r][c] = ch;
  };
  // Árvores de carvalho
  fill('F', 1, 2, 2, 2); fill('F', 0, 3, 3, 4); fill('L', 1, 1, 5, 6);
  fill('F', 17, 18, 2, 2); fill('F', 16, 19, 3, 4); fill('L', 18, 18, 5, 6);
  // Casa
  fill('P', 4, 15, 3, 3); // telhado
  fill('B', 6, 13, 4, 6); // parede de fundo
  fill('g', 9, 10, 4, 4); // janela
  fill('L', 5, 5, 4, 4); // viga sobre a porta (porta é um sprite nas linhas 5–6)
  fill('L', 14, 14, 4, 6); // pilar direito
  // Chão
  fill('G', 0, 19, 7, 7);
  fill('C', 5, 14, 7, 7); // fundação / piso
  fill('D', 0, 19, 8, 9);
  for (const [c, r] of [[2, 9], [7, 8], [12, 9], [16, 8], [19, 9]]) rows[r][c] = 'S';
  return rows.map((r) => r.join(''));
}

// ---------- Personagem (proporções de jogo de blocos, visto de frente, luz vindo da esquerda) ----------

const PERSON = {
  h: '#3f2716', H: '#57361f', s: '#cf9c6b', S: '#a97850', L: '#e2b585', w: '#ffffff', b: '#3a7d44',
  m: '#7a3f2f', t: '#a67650', c: '#4f8a3a', C: '#3a6a2a', l: '#64a24a', k: '#2e2318',
  p: '#5b4630', P: '#45351f', q: '#6e563b', o: '#4a4a4a', O: '#2e2e2e',
};

const HEAD = [
  'hhhhhhhh',
  'hHhhhHhh',
  'hLssssSh',
  'Lwbssbws',
  'LssSSssS',
  'Lstmmtss',
  'LsttttsS',
  'LssssssS',
];
const SLEEPY_HEAD = HEAD.map((r, i) => (i === 3 ? 'LkkssskS' : r));

// Monta o personagem 16 px de largura: braços 'down' | 'half' (mão na altura da boca) | 'up'.
function person({ left = 'down', right = 'down', sit = false } = {}) {
  const ARM = { // [manga, pele] de cada lado: o braço esquerdo recebe mais luz
    left: ['llcc', 'LLss'],
    right: ['ccCC', 'ssSS'],
  };
  const arm = (side, pose, r) => {
    const [sleeve, skin] = ARM[side];
    if (pose === 'up') return r < 8 ? skin : r < 12 ? sleeve : '....';
    if (pose === 'half') return r < 4 ? '....' : r < 8 ? skin : r < 12 ? sleeve : '....';
    if (r < 8) return '....';
    return r < 12 ? sleeve : skin;
  };
  const torso = (r) => {
    if (r === 8) return 'lccLLccC'; // gola
    if (r === 19) return 'kkkkkkkk'; // cinto
    return 'lcccccCC';
  };
  const rows = [];
  for (let r = 0; r < 8; r++) rows.push(arm('left', left, r) + HEAD[r] + arm('right', right, r));
  for (let r = 8; r < 20; r++) rows.push(arm('left', left, r) + torso(r) + arm('right', right, r));
  for (let r = 0; r < (sit ? 4 : 9); r++) rows.push('....qqppppPP....');
  if (!sit) rows.push('....ooooooOO....');
  rows.push('....ooooooOO....', '....OOOOOOOO....');
  return { palette: PERSON, rows };
}

// Lua 14×14 com crateras; a parte não iluminada fica quase invisível (fases de 0 = nova a 7).
function moon(phase) {
  const base = [
    'mmmmmmmmmmmmmm',
    'mmMMmmmmmmmmmm',
    'mmMMmmmmmkkmmm',
    'mmmmmmmmmkkmmm',
    'mmmmmMmmmmmmmm',
    'mmmmmmmmmmmmmm',
    'mkkmmmmmmmMMmm',
    'mkkmmmmmmmMMmm',
    'mmmmmmmmmmmmmm',
    'mmmmmMMmmmmmmm',
    'mmmmmMMmmmmkmm',
    'mmmmmmmmmmmmmm',
    'mmMmmmmmmmmmmm',
    'mmmmmmmmmmmmmm',
  ];
  const lit = (x) => {
    if (phase === 0) return false;
    if (phase === 4) return true;
    if (phase < 4) return x >= 14 - Math.round((14 * phase) / 4); // crescente: luz à direita
    return x < Math.round((14 * (8 - phase)) / 4); // minguante: luz à esquerda
  };
  return {
    palette: { m: '#e1e1e8', M: '#b9b9c4', k: '#9a9aa6', n: 'rgba(190,195,215,.14)' },
    rows: base.map((row) => [...row].map((ch, x) => (lit(x) ? ch : 'n')).join('')),
  };
}

export const SPRITES = {
  workUp: person({ right: 'up' }), // foco: fabricando na mesa de trabalho (2 quadros)
  workDown: person(),
  sit: person({ sit: true }), // pausa curta: sentado comendo pão (2 quadros)
  eat: person({ sit: true, right: 'half' }),
  sleepHead: { palette: PERSON, rows: SLEEPY_HEAD }, // pausa longa
  cheer: person({ left: 'up', right: 'up' }), // comemoração

  bread: { palette: { l: '#e8b868', b: '#c8923a', B: '#9a6a22' }, rows: ['.lll.', 'lbbbB', '.BBB.'] },
  crumb: { palette: { c: '#e0b060' }, rows: ['c'] },
  smoke: { palette: { s: 'rgba(120,120,120,.7)' }, rows: ['s'] },
  sweat: { palette: { a: '#9fdcff', A: '#5fb3e8' }, rows: ['.a', 'aA', 'aA'] },
  yawn: { palette: { k: '#3a1515' }, rows: ['kk', 'kk'] },
  zee: { palette: { z: '#e8f0ff' }, rows: ['zzz', '..z', '.z.', 'z..', 'zzz'] },

  // ---------- Móveis (face de cima mais clara, frente mais escura) ----------
  door: {
    palette: { k: '#4a3418', p: '#b8945f', P: '#9a7744', l: '#c8a46e', q: 'rgba(200,230,255,.35)', h: '#2e2e2e' },
    rows: [
      'kkkkkkkkkkkkkkkk',
      'kllllllllllllllk',
      'kpkkkkkppkkkkkpk',
      ...Array(9).fill('kpkqqqkppkqqqkpk'),
      'kpkkkkkppkkkkkpk',
      'kppppppppppppppk',
      'kPPPPPPPPPPPPPPk',
      'kppppppppppppppk',
      'kppppppppppppppk',
      'kPPPPPPPPPPPPPPk',
      'kppppppppppphhpk',
      'kppppppppppphhpk',
      'kPPPPPPPPPPPPPPk',
      'kppppppppppppppk',
      'kppppppppppppppk',
      'kPPPPPPPPPPPPPPk',
      'kppppppppppppppk',
      'kppppppppppppppk',
      'kPPPPPPPPPPPPPPk',
      'kppppppppppppppk',
      'kppppppppppppppk',
      'kkkkkkkkkkkkkkkk',
    ],
  },
  bed: {
    palette: { o: '#f4f4f4', O: '#cfcfcf', r: '#c8323a', R: '#9e2630', l: '#de4a52', p: '#a7834a', P: '#7a5c36' },
    rows: [
      'oooooooollllllllllllllllllllllll',
      'ooooooooRrrrrrrrrrrrrrrrrrrrrrrr',
      'ooooooooRrrrrrrrrrrrrrrrrrrrrrrr',
      'OOOOOOOORRRRRRRRRRRRRRRRRRRRRRRR',
      'pppppppppppppppppppppppppppppppp',
      'pPpppppppppppppppppppppppppppPpp',
      'PPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPP',
      'ppp..........................ppp',
      'PPP..........................PPP',
    ],
  },
  stair: {
    palette: { p: '#b8945f', P: '#9c7a48', l: '#c8a46e', k: '#6b5232' },
    rows: [
      'llllllll........',
      'kpppPppk........',
      'kpPppppk........',
      'kkkkkkkk........',
      'kppppPpk........',
      'kPpppppk........',
      'kpppPppk........',
      'kpppppppllllllll',
      'kpPpppppppppPppk',
      'kpppppPppppppppk',
      'kkkkkkkkkkkkkkkk',
      'kppPpppppppPpppk',
      'kpppppppPppppppk',
      'kpPppppppppppPpk',
      'kppppPpppppppppk',
      'kkkkkkkkkkkkkkkk',
    ],
  },
  craftingTable: { // grade 3×3 em cima, ferramentas na frente
    palette: { k: '#4a3418', T: '#c8a46a', t: '#a8844e', p: '#a7834a', P: '#8a6a3a', m: '#c9c9c9', M: '#8e8e8e', n: '#6b4a2a' },
    rows: [
      'kkkkkkkkkkkkkkkk',
      'kTTTTkTTTTkTTTTk',
      'kTttTkTttTkTttTk',
      'kkkkkkkkkkkkkkkk',
      'kppppppppppppppk',
      'kpmmmPpppppnnppk',
      'kpmMmmPppppnnppk',
      'kpppMmpppppnnppk',
      'kppppnpppmmmmmpk',
      'kppppnpppMMMMMpk',
      'kppppnppppppnppk',
      'kpppPnppppppnppk',
      'kppppppppppppppk',
      'kPPPPPPPPPPPPPPk',
      'kPPPPPPPPPPPPPPk',
      'kkkkkkkkkkkkkkkk',
    ],
  },
  furnace: { // "rosto" de fornalha: fenda em cima, boca acesa embaixo
    palette: { k: '#2a2a2a', c: '#7d7d7d', C: '#5f5f5f', l: '#a0a0a0', K: '#141414' },
    rows: [
      'llllllllllllllll',
      'kcccCcccccCccclk',
      'kcCcccclcccccCck',
      'kcccKKKKKKKKccck',
      'kcClcccccccclcck',
      'kcccccCcccccccck',
      'kclccccccccccCck',
      'kcckkkkkkkkkkcck',
      'kcckKKKKKKKKkcck',
      'kClkKKKKKKKKkclk',
      'kcckKKKKKKKKkcck',
      'kcckKKKKKKKKkcCk',
      'kcckKKKKKKKKkcck',
      'kcckkkkkkkkkkcck',
      'kcCcclcccCcclcck',
      'kkkkkkkkkkkkkkkk',
    ],
  },
  fireA: { palette: { y: '#ffe066', o: '#ff9a2a', r: '#e0501a' }, rows: ['..y.y...', '.yoyo.y.', 'yoooroyo', 'orroorro'] },
  fireB: { palette: { y: '#ffe066', o: '#ff9a2a', r: '#e0501a' }, rows: ['.y...y..', 'yoy.yoy.', 'oooyooro', 'rorrooro'] },
  chest: {
    palette: { k: '#2e1c0c', w: '#9c6a33', W: '#b5803f', l: '#c8945a', y: '#c8c8c8', Y: '#8e8e8e' },
    rows: [
      'kkkkkkkkkkkkkk',
      'kllllllllllllk',
      'kWwwwwwwwwwwWk',
      'kWwwwwwwwwwwWk',
      'kWWWWWWWWWWWWk',
      'kkkkkkyykkkkkk',
      'kWWWWWyYWWWWWk',
      'kWwwwwYYwwwwWk',
      'kWwwwwwwwwwwWk',
      'kWwwwwwwwwwwWk',
      'kWwwwwwwwwwwWk',
      'kWwwwwwwwwwwWk',
      'kWWWWWWWWWWWWk',
      'kkkkkkkkkkkkkk',
    ],
  },
  torchStick: { palette: { n: '#8a5a2b', N: '#6b4423' }, rows: ['', '', '', '', '.nN.', '.nN.', '.nN.', '.nN.', '.nN.', '.nN.', '.nN.', '.nN.'] },
  flameA: { palette: { y: '#ffe066', o: '#ff9a2a', r: '#e0501a' }, rows: ['..y.', '.yy.', 'yooy', 'yoor'] },
  flameB: { palette: { y: '#ffe066', o: '#ff9a2a', r: '#e0501a' }, rows: ['.y..', '.yy.', 'yoyy', 'royy'] },
  tuft: { // grama alta
    palette: { g: '#6fa944', G: '#4f8a2f', h: '#86c158' },
    rows: ['...h....g.', '.g.g..h.g.', '.g.Gg.g.G.', 'gG.gG.GgG.', 'gGhGGgGgGg', 'GgGgGGgGgG'],
  },
  poppy: { palette: { r: '#d8282a', R: '#9e1a1c', k: '#2a1a0a', g: '#4f8a2f' }, rows: ['.rr.', 'rRkr', '.rr.', '..g.', '.gg.', '..g.', '..g.', '..g.'] },
  dandelion: { palette: { y: '#ffd83a', Y: '#e0a81a', g: '#4f8a2f' }, rows: ['.yy.', 'yYYy', '.yy.', '..g.', '..gg', '..g.', '..g.', '..g.'] },

  // ---------- Céu ----------
  sun: {
    palette: { y: '#ffe680', W: '#fff4b8', w: '#fffdf0' },
    rows: [
      'yyyyyyyyyyyyyy',
      'yWWWWWWWWWWWWy',
      'yWWWWWWWWWWWWy',
      ...Array(8).fill('yWWwwwwwwwwWWy'),
      'yWWWWWWWWWWWWy',
      'yWWWWWWWWWWWWy',
      'yyyyyyyyyyyyyy',
    ],
  },
  sunHalo: { palette: { h: 'rgba(255,244,190,.22)' }, rows: Array(24).fill('h'.repeat(24)) },
  ...Object.fromEntries(Array.from({ length: 8 }, (_, i) => [`moon${i}`, moon(i)])),
  orb: { // orbe de experiência
    palette: { y: '#e8ff66', G: '#7ed321', g: '#b4f04a', w: '#ffffff' },
    rows: ['.yGy.', 'yGgGy', 'Ggwgg', 'yGgGy', '.yGy.'],
  },
  spark: { palette: { y: '#f6ffb0' }, rows: ['.y.', 'yyy', '.y.'] },
};

// ---------- Mobs (vistos de lado, virados para a direita; A e B = quadros de caminhada) ----------

const MOSSLING_A = [ // criatura de musgo original: bloco de musgo com um olho e pavio de dinamite
  '.....s......',
  '....sS......',
  '.....f......',
  '....ff......',
  '.mmlmmmMmml.',
  'mlmmMmmmmlmm',
  'mmmmwwwwmmMm',
  'mMmwwkkwwmmm',
  'mmmwwkkwwmlm',
  'mlmmwwwwmmmm',
  'mmmmmmmmmMmm',
  'mMmlmmmmlmmm',
  'mmmmmMmmmmmm',
  '.mmmmmmmmmm.',
  '..MM....MM..',
  '..MM....MM..',
];
const MOSSLING = { m: '#4f8a3a', M: '#3a6a2a', l: '#6aa84f', w: '#e8f0d8', k: '#1a1a1a', f: '#8a6a3a', s: '#ffd34d', S: '#ff6a2a' };

const ZOMBIE = { z: '#6f9a5a', Z: '#557a44', e: '#1a2a14', c: '#6b4a30', C: '#4f3622', p: '#3f3f4a', P: '#2c2c36' };
const ZOMBIE_TOP = [
  'zzzzzzzz..',
  'zZzzzzzz..',
  'zzzzzzez..',
  'Zzzzzzez..',
  'zzzzzzzz..',
  'zzzzzeez..',
  'ZzzzzzzZ..',
  'ZZzzzzZZ..',
  '..cccc....',
  '..cccccczz',
  '..CccccCzz',
  '..cccc....',
  '..cCcc....',
  '..cccc....',
  '..ccCc....',
  '..cc.c....',
  '..cccc....',
  '..cc.c....',
  '..pppp....',
  '..pPpp....',
];

const SKELETON = { b: '#d8d8d0', B: '#a8a8a0', k: '#2a2a2a', n: '#8a5a2b' };
const SKELETON_TOP = [
  'bbbbbbbb..',
  'bBbbbbbb..',
  'bbbbbkkb..',
  'Bbbbbkkb..',
  'bbbbbbbb..',
  'bbbkkkkb..',
  'BbbbbbbB.n',
  'BBbbbbBB.n',
  '...bb....n',
  '..bbbbbbbn',
  '..bkkb...n',
  '..bbbb...n',
  '..bkkb...n',
  '..bbbb...n',
  '..bkkb...n',
  '...bb.....',
  '..bbbb....',
  '..b..b....',
];

const MOB_SPRITES = {
  chickenA: {
    palette: { w: '#f4f4f4', W: '#cfcfcf', y: '#e8b020', r: '#d82a2a', k: '#1a1a1a' },
    rows: ['.....ww.', '....wkwy', '....wwwr', 'wwwwwww.', 'Wwwwwww.', '.WwwwW..', '..y..y..', '..y..y..'],
  },
  chickenB: {
    palette: { w: '#f4f4f4', W: '#cfcfcf', y: '#e8b020', r: '#d82a2a', k: '#1a1a1a' },
    rows: ['.....ww.', '....wkwy', '....wwwr', 'wwwwwww.', 'Wwwwwww.', '.WwwwW..', '...yy...', '..y..y..'],
  },
  pigA: {
    palette: { p: '#f0a0a8', P: '#d07880', n: '#c86a74', k: '#1a1a1a' },
    rows: ['.........pp.', 'pppppppppkpp', 'ppppppppppnn', 'ppppppppppnn', 'PpppppppppP.', '.PPPPPPPPP..', '.pp.....pp..', '.PP.....PP..'],
  },
  pigB: {
    palette: { p: '#f0a0a8', P: '#d07880', n: '#c86a74', k: '#1a1a1a' },
    rows: ['.........pp.', 'pppppppppkpp', 'ppppppppppnn', 'ppppppppppnn', 'PpppppppppP.', '.PPPPPPPPP..', '..pp...pp...', '..PP...PP...'],
  },
  sheepA: {
    palette: { w: '#ececec', W: '#c8c8c8', f: '#c9a98a', F: '#a8876a', k: '#1a1a1a' },
    rows: ['..wwwwwwww..', '.wwwwwwwwwff', 'wwwwwwwwwwfk', 'wwwwwwwwwwff', 'WwwwwwwwwwFf', '.WWWWWWWWW..', '.ff......ff.', '.ff......ff.', '.ff......ff.', '.FF......FF.'],
  },
  sheepB: {
    palette: { w: '#ececec', W: '#c8c8c8', f: '#c9a98a', F: '#a8876a', k: '#1a1a1a' },
    rows: ['..wwwwwwww..', '.wwwwwwwwwff', 'wwwwwwwwwwfk', 'wwwwwwwwwwff', 'WwwwwwwwwwFf', '.WWWWWWWWW..', '..ff....ff..', '..ff....ff..', '..ff....ff..', '..FF....FF..'],
  },
  zombieA: { palette: ZOMBIE, rows: [...ZOMBIE_TOP, '..pp.pp...', '.pp...pp..', '.pp...pp..', '.PP...PP..'] },
  zombieB: { palette: ZOMBIE, rows: [...ZOMBIE_TOP, '..pppp....', '..pppp....', '..pPPp....', '..PPPP....'] },
  skeletonA: { palette: SKELETON, rows: [...SKELETON_TOP, '..b..b....', '..b..b....', '.b....b...', '.b....b...', '.b....b...', '.B....B...'] },
  skeletonB: { palette: SKELETON, rows: [...SKELETON_TOP, '..b..b....', '...bb.....', '...bb.....', '...bb.....', '...bb.....', '...BB.....'] },
  spiderA: {
    palette: { k: '#2e2626', K: '#463a3a', r: '#d81e1e', l: '#1a1212' },
    rows: ['...KKKKk......', '.lKkkkkkkKk.l.', 'l.kkkkkkkkkrr.', '.l.KkkkkkKrr.l', 'l..l..l..l..l.', '.l..l..l..l...'],
  },
  spiderB: {
    palette: { k: '#2e2626', K: '#463a3a', r: '#d81e1e', l: '#1a1212' },
    rows: ['...KKKKk......', '.lKkkkkkkKk.l.', 'l.kkkkkkkkkrr.', '.l.KkkkkkKrr.l', '.l..l..l..l..l', 'l..l..l..l..l.'],
  },
  mosslingA: { palette: MOSSLING, rows: MOSSLING_A },
  mosslingB: {
    palette: MOSSLING,
    rows: ['......s.....', '.....Ss.....', ...MOSSLING_A.slice(2, 14), '...MM..MM...', '...MM..MM...'],
  },
  mosslingFlash: { // pisca branco na reta final, como quem vai explodir (nunca explode)
    palette: { x: 'rgba(255,255,255,.85)' },
    rows: MOSSLING_A.map((r) => r.replace(/[^.]/g, 'x')),
  },
  burnA: {
    palette: { y: '#ffe066', o: '#ff9a2a', r: '#e0501a' },
    rows: ['..y...y...', '.yoy.yoy..', '.yooyooy.y', 'yoorooroyo', 'oorrooorro', '.orr.orr..'],
  },
  burnB: {
    palette: { y: '#ffe066', o: '#ff9a2a', r: '#e0501a' },
    rows: ['.y...y...y', 'yoy.yoy.yo', 'yooyooyoo.', 'oorooroyoo', 'orroorrooo', '..rro.rr..'],
  },
};
Object.assign(SPRITES, MOB_SPRITES);

// Nuvem em camadas retangulares, semitransparente (largura em pixels; seed muda o recorte).
export function cloud(width, seed) {
  const rand = rng(seed);
  const top = Math.floor(width * (0.3 + rand() * 0.3));
  const offset = Math.floor(rand() * (width - top));
  const topRow = '.'.repeat(offset) + 'w'.repeat(top) + '.'.repeat(width - top - offset);
  return {
    palette: { w: 'rgba(255,255,255,.88)', W: 'rgba(225,232,244,.88)' },
    rows: [topRow, topRow, topRow, ...Array(4).fill('w'.repeat(width)), ...Array(2).fill('W'.repeat(width))],
  };
}

// Estrelas: [x, y]
export const STARS = [[12, 10], [30, 26], [64, 8], [88, 30], [104, 14], [150, 24], [176, 10], [198, 30], [214, 16], [240, 8], [262, 22], [292, 12], [308, 32], [70, 40]];

// Posição (canto superior esquerdo) de cada elemento, em pixels da cena.
export const LAYOUT = {
  sun: { size: 14, horizonY: 120, peakY: 18 }, // centro do sol no horizonte e no topo do arco
  clouds: [[20, 8, 48], [140, 20, 32], [230, 4, 56]], // x, y, largura
  moon: [124, 10],
  tufts: [[38, 106], [68, 106], [246, 106], [290, 106]],
  poppies: [[58, 104]],
  dandelions: [[270, 104]],
  door: [80, 80],
  bed: [96, 103],
  stair: [128, 96],
  craftingTable: [176, 96],
  furnace: [192, 96],
  fire: [196, 104],
  chest: [209, 98],
  torches: [[116, 66], [212, 66]],
  work: [160, 80],
  sit: [128, 86],
  breadDown: [141, 104],
  breadUp: [140, 90],
  crumbs: [141, 96],
  sleepHead: [99, 95],
  cheer: [152, 80],
  sweat: [161, 82],
  yawnSit: [135, 91],
  yawnBed: [102, 100],
  zzz: [110, 82],
  // Sombra nos cantos (ambient occlusion): x, y, largura, altura, opacidade
  shadows: [
    [96, 64, 128, 3, 0.32], [96, 67, 128, 3, 0.16], // sob o telhado
    [96, 64, 3, 48, 0.24], [99, 64, 3, 48, 0.1], // parede esquerda
    [221, 64, 3, 48, 0.24], [218, 64, 3, 48, 0.1], // parede direita
    [96, 109, 128, 3, 0.18], // junto ao piso
    [80, 112, 160, 2, 0.25], // fundação sob a casa
  ],
};
