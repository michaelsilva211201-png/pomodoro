// Arte em pixels da cena (original, inspirada em jogos de blocos 3D como Minecraft, vista em corte lateral).
// Cada desenho é uma lista de linhas; cada caractere é um pixel da paleta ('.' = transparente).
// A cena tem 320×160 pixels; blocos têm 16×16.

export const SCENE_W = 320;
export const SCENE_H = 160;
export const BLOCK = 16;
export const GROUND_Y = 112; // topo da grama e do piso

// ---------- Blocos (texturas 16×16, viram <pattern>) ----------

const DIRT = { d: '#8c6239', D: '#6b4a2b', l: '#a67c52' };
const DIRT_ROWS = [
  'dddldddddDdddddd',
  'dDdddddldddddldd',
  'ddddDddddddDdddd',
  'dldddddddldddddD',
  'ddddddDddddddldd',
  'dddlddddddDddddd',
  'Ddddddddldddddld',
  'dddDdldddddDdddd',
  'dlddddddDddddddd',
  'ddddDddldddddDdd',
  'ddlddddddddldddd',
  'dDdddddDddddddDd',
  'ddddldddddlddddd',
  'dddddddDddddDddl',
  'dlddDddddldddddd',
  'ddddddldddddDddd',
];

const PLANK_ROWS = [
  'pppPpppppppkpppp',
  'pppppppppppkppPp',
  'ppppppPppppkpppp',
  'kkkkkkkkkkkkkkkk',
  'ppppkppppPpppppp',
  'pPppkppppppppppp',
  'ppppkpppppppPppp',
  'kkkkkkkkkkkkkkkk',
  'pppppPpppppppkpp',
  'pppppppppppppkpP',
  'ppPppppppppppkpp',
  'kkkkkkkkkkkkkkkk',
  'pppppppkppppPppp',
  'pPpppppkpppppppp',
  'pppppppkppppppPp',
  'kkkkkkkkkkkkkkkk',
];

export const TILES = {
  G: { // bloco de grama (lateral): grama em cima, terra embaixo
    palette: { g: '#6aaa40', G: '#4f8a2f', ...DIRT },
    rows: [
      'gggGggggggGgggGg',
      'gGgggggGgggggggg',
      'ggggGggdgggggGgg',
      'gdggdgddgdgggdgd',
      'ddgddddddgdddgdd',
      ...DIRT_ROWS.slice(5),
    ],
  },
  D: { palette: DIRT, rows: DIRT_ROWS }, // terra
  S: { // pedra
    palette: { s: '#8a8a8a', S: '#6f6f6f', l: '#a0a0a0' },
    rows: [
      'sssSssssslssssss',
      'slsssssSssssSsss',
      'sssssSsssssssssl',
      'sSssssssslsssSss',
      'ssssslssssssssss',
      'ssSssssssSsslsss',
      'lsssssSsssssssss',
      'sssslssssssSssSs',
      'sSssssssslssssss',
      'ssssSssssssssls',
      'sslssssSssSsssss',
      'ssssssssssssssSs',
      'sSssslsssssSssss',
      'ssssssssSsssslss',
      'slssSsssssssssss',
      'ssssssslsssSssss',
    ].map((r) => r.padEnd(16, 's')),
  },
  C: { // pedregulho (fundação da casa)
    palette: { c: '#7d7d7d', C: '#5a5a5a', l: '#a2a2a2', k: '#3d3d3d' },
    rows: [
      'kccclkCCcclkcccC',
      'cclcckCcccckclcc',
      'ccccCkkklcckcccc',
      'kkkcccClkkkkCcck',
      'lcckcccccClckkkk',
      'cccklcCcccckcclc',
      'CcckkkkkkCckcccc',
      'kkkccclcckkkkkkc',
      'cclcCcccckcclcck',
      'ccckkkkcckcccCck',
      'lCcccclkkkkkcckk',
      'kkkkcccccccklccc',
      'ccckcClccCckkkkc',
      'clckkkkkcccccclc',
      'cccccckklcCckkkk',
      'kkCcclcckkkcccck',
    ],
  },
  P: { palette: { p: '#b8945f', P: '#a07d48', k: '#8a6a3c' }, rows: PLANK_ROWS }, // tábuas de carvalho
  B: { palette: { p: '#7a5c36', P: '#6a4f2d', k: '#4f3a20' }, rows: PLANK_ROWS }, // parede de fundo (tábuas escuras)
  L: { // tronco de carvalho
    palette: { l: '#6b5232', L: '#4f3b22', m: '#806240' },
    rows: Array.from({ length: 16 }, (_, i) => (i % 3 === 2 ? 'lLlllmLlllLllmlL' : 'lLllmlLlllLlmllL')),
  },
  F: { // folhas (com furinhos por onde aparece o céu)
    palette: { f: '#4f9a2f', F: '#3a7a22', l: '#66b33f' },
    rows: [
      'fFflfFffFflfFfff',
      'ffFfflfFfffFfl.f',
      'lfffFffflfFffffF',
      'fF.fflfFffffFlff',
      'ffFfffFflffFffff',
      'fflfFfffffFflf.F',
      'Ffffflf.FfffffFf',
      'fFlffFffflfFfflf',
      'fffFffflfffFffff',
      'lfFff.FffFflffFf',
      'ffffFflffffffFlf',
      'fFlfffffFlfFffff',
      'fffFlfFffff.fFfl',
      'Fflfffffl.FffffF',
      'ffFfFlffFffflfff',
      'flfffffFfffFffFf',
    ],
  },
  g: { // vidro
    palette: { w: '#e8f4ff', q: 'rgba(200,230,255,.22)', s: 'rgba(255,255,255,.65)' },
    rows: [
      'wwwwwwwwwwwwwwww',
      'wqqqqqqqqqqqqqqw',
      'wqsqqqqqqqqqqqqw',
      'wqqsqqqqqqqqqqqw',
      'wqqqsqqqqqqqqqqw',
      'wqqqqqqqqqqqqqqw',
      'wqqqqqqqqqqqqqqw',
      'wqqqqqqqqqqqqqqw',
      'wqqqqqqqqqqqqqqw',
      'wqqqqqqqqqqqqqqw',
      'wqqqqqqqqqqqqqqw',
      'wqqqqqqqqqqsqqqw',
      'wqqqqqqqqqqqsqqw',
      'wqqqqqqqqqqqqsqw',
      'wqqqqqqqqqqqqqqw',
      'wwwwwwwwwwwwwwww',
    ],
  },
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

// ---------- Personagem (cabeça quadrada, visto de frente) ----------

const PERSON = {
  h: '#4a2f1a', s: '#d9a066', S: '#b9844f', w: '#ffffff', b: '#2f6a3a', m: '#8a4a3a', k: '#3a2a1a',
  c: '#5a8f3a', C: '#46732c', p: '#6b4a2a', P: '#5a3d22', o: '#4a4a4a', O: '#333333',
};

const HEAD = [
  'hhhhhhhh',
  'hhhhhhhh',
  'hsssssSh',
  'swbsswbs',
  'ssssssss',
  'sssmmsss',
  'sSssssSs',
  'SSssssSS',
];
const SLEEPY_HEAD = HEAD.map((r, i) => (i === 3 ? 'skksskks' : r));

// Monta o personagem 16 px de largura: braços 'down' | 'half' (mão na altura da boca) | 'up'.
function person({ left = 'down', right = 'down', sit = false } = {}) {
  const arm = (pose, r) => {
    if (pose === 'up') return r < 8 ? 'ssss' : r < 12 ? 'CCCC' : '....';
    if (pose === 'half') return r < 4 ? '....' : r < 8 ? 'ssss' : r < 12 ? 'CCCC' : '....';
    if (r < 8) return '....';
    if (r < 12) return 'CCCC';
    return r >= 18 ? 'SSSS' : 'ssss';
  };
  const rows = [];
  for (let r = 0; r < 8; r++) rows.push(arm(left, r) + HEAD[r] + arm(right, r));
  for (let r = 8; r < 20; r++) rows.push(arm(left, r) + (r === 19 ? 'kkkkkkkk' : 'cccccccc') + arm(right, r));
  for (let r = 0; r < (sit ? 4 : 9); r++) rows.push('....ppppPPPP....');
  if (!sit) rows.push('....oooooooo....');
  rows.push('....oooooooo....', '....OOOOOOOO....');
  return { palette: PERSON, rows };
}

export const SPRITES = {
  workUp: person({ right: 'up' }), // foco: fabricando na mesa de trabalho (2 quadros)
  workDown: person(),
  sit: person({ sit: true }), // pausa curta: sentado comendo pão (2 quadros)
  eat: person({ sit: true, right: 'half' }),
  sleepHead: { palette: PERSON, rows: SLEEPY_HEAD }, // pausa longa
  cheer: person({ left: 'up', right: 'up' }), // comemoração

  bread: { palette: { l: '#e0b060', b: '#c8923a', B: '#a8722a' }, rows: ['.lll.', 'lbbbB', '.BBB.'] },
  crumb: { palette: { c: '#e0b060' }, rows: ['c'] },
  sweat: { palette: { a: '#9fdcff', A: '#5fb3e8' }, rows: ['.a', 'aA', 'aA'] },
  yawn: { palette: { k: '#4a1f1f' }, rows: ['kk', 'kk'] },
  zee: { palette: { z: '#e8f0ff' }, rows: ['zzz', '..z', '.z.', 'z..', 'zzz'] },

  // ---------- Móveis ----------
  door: {
    palette: { k: '#4a3418', p: '#b8945f', P: '#9a7744', q: 'rgba(200,230,255,.35)', h: '#3a3a3a' },
    rows: [
      'kkkkkkkkkkkkkkkk',
      'kppppppppppppppk',
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
    palette: { o: '#f4f4f4', O: '#cfcfcf', r: '#c8323a', R: '#9e2630', p: '#a7834a', P: '#7a5c36' },
    rows: [
      'oooooooorrrrrrrrrrrrrrrrrrrrrrrr',
      'ooooooooRrrrrrrrrrrrrrrrrrrrrrrr',
      'ooooooooRrrrrrrrrrrrrrrrrrrrrrrr',
      'OOOOOOOORRRRRRRRRRRRRRRRRRRRRRRR',
      'pppppppppppppppppppppppppppppppp',
      'pPpppppppppppppppppppppppppppPpp',
      'pppppppppppppppppppppppppppppppp',
      'ppp..........................ppp',
      'PPP..........................PPP',
    ],
  },
  stair: {
    palette: { p: '#b8945f', P: '#a07d48', k: '#6e522e' },
    rows: [
      'kkkkkkkk........',
      'kpppPppk........',
      'kpPppppk........',
      'kkkkkkkk........',
      'kppppPpk........',
      'kPpppppk........',
      'kpppPppk........',
      'kpppppppkkkkkkkk',
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
  craftingTable: {
    palette: { k: '#4a3418', T: '#c8a46a', p: '#a7834a', P: '#8a6a3a', m: '#c9c9c9', n: '#6b4a2a' },
    rows: [
      'kkkkkkkkkkkkkkkk',
      'kTTkTTTkTTTkTTTk',
      'kTTkTTTkTTTkTTTk',
      'kkkkkkkkkkkkkkkk',
      'kppppppppppppppk',
      'kpmmmppppppnnppk',
      'kpmmmmpppppnnppk',
      'kpppmmpppppnnppk',
      'kppppnpppmmmmmpk',
      'kppppnppppppnppk',
      'kppppnppppppnppk',
      'kpppppppppppnppk',
      'kppppppppppppppk',
      'kPPPPPPPPPPPPPPk',
      'kPPPPPPPPPPPPPPk',
      'kkkkkkkkkkkkkkkk',
    ],
  },
  furnace: {
    palette: { k: '#2e2e2e', c: '#7d7d7d', C: '#5f5f5f', l: '#9b9b9b', K: '#1a1a1a' },
    rows: [
      'kkkkkkkkkkkkkkkk',
      'klccCccclcccCcck',
      'kcccccCcccclccck',
      'kcCclccccCcccClk',
      'kcccccccccccccck',
      'kcccCcclcccCccck',
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
    palette: { k: '#3b2414', w: '#9c6a33', W: '#b5803f', y: '#c8c8c8' },
    rows: [
      'kkkkkkkkkkkkkk',
      'kWWWWWWWWWWWWk',
      'kWwwwwwwwwwwWk',
      'kWwwwwwwwwwwWk',
      'kWWWWWWWWWWWWk',
      'kkkkkkyykkkkkk',
      'kWWWWWyyWWWWWk',
      'kWwwwwyywwwwWk',
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
  tuft: { palette: { g: '#5a9a30', G: '#3f7a22' }, rows: ['..g...g.', '.g..G.g.', '.g.gG.g.', 'g.gG.gG.', 'gG.gGg.g', 'GgGgGGgG'] },
  flower: { palette: { y: '#ffd83a', Y: '#e0a81a', g: '#4f8a2f' }, rows: ['.yy.', 'yYYy', '.yy.', '.g..', '.gg.', '.g..', '.g..', '.g..'] },

  // ---------- Céu ----------
  sun: {
    palette: { y: '#ffd94a', W: '#fff09a', w: '#fffde8' },
    rows: [
      'yyyyyyyyyyyyyy',
      'yWWWWWWWWWWWWy',
      'yWWWWWWWWWWWWy',
      'yWWwwwwwwwwWWy',
      ...Array(6).fill('yWWwwwwwwwwWWy'),
      'yWWwwwwwwwwWWy',
      'yWWWWWWWWWWWWy',
      'yWWWWWWWWWWWWy',
      'yyyyyyyyyyyyyy',
    ],
  },
  moon: {
    palette: { m: '#d9d9e0', M: '#b0b0ba', k: '#8e8e99' },
    rows: [
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
    ],
  },
  orb: { // orbe de experiência
    palette: { y: '#e8ff66', G: '#7ed321', g: '#b4f04a', w: '#ffffff' },
    rows: ['.yGy.', 'yGgGy', 'Ggwgg', 'yGgGy', '.yGy.'],
  },
  spark: { palette: { y: '#f6ffb0' }, rows: ['.y.', 'yyy', '.y.'] },
};

// Nuvem chata e retangular, como nos jogos de blocos.
export function cloud(width) {
  return {
    palette: { w: '#ffffff', W: '#e3e9f2' },
    rows: [...Array(6).fill('w'.repeat(width)), ...Array(2).fill('W'.repeat(width))],
  };
}

// Estrelas: [x, y]
export const STARS = [[12, 10], [30, 26], [64, 8], [88, 30], [104, 14], [130, 6], [150, 24], [176, 10], [198, 30], [214, 16], [240, 8], [262, 22], [292, 12], [308, 32]];

// Posição (canto superior esquerdo) de cada elemento, em pixels da cena.
export const LAYOUT = {
  sun: { size: 14, horizonY: 120, peakY: 18 }, // centro do sol no horizonte e no topo do arco
  clouds: [[20, 10, 48], [140, 22, 32], [230, 6, 56]], // x, y, largura
  moon: [124, 10],
  tufts: [[40, 106], [70, 106], [248, 106], [292, 106]],
  flowers: [[58, 104], [270, 104]],
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
};
