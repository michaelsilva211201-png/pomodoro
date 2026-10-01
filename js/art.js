// Arte em pixels da cena (original, inspirada em jogos 2D de blocos).
// Cada desenho é uma lista de linhas; cada caractere é um pixel da paleta ('.' = transparente).
// A cena tem 320×160 pixels; blocos têm 8×8.

export const SCENE_W = 320;
export const SCENE_H = 160;
export const BLOCK = 8;
export const GROUND_Y = 120; // topo da grama e do piso

// ---------- Blocos (texturas 8×8, viram <pattern>) ----------

export const TILES = {
  G: { // grama sobre terra
    palette: { g: '#5cbf3f', G: '#3f9a2e', d: '#8b5a2b', D: '#6e4420' },
    rows: [
      'gGgggGgg',
      'ggGgggGg',
      'dgddgddg',
      'dddddddd',
      'ddDddddd',
      'dddddDdd',
      'dDdddddd',
      'dddddddd',
    ],
  },
  D: { // terra
    palette: { d: '#8b5a2b', D: '#6e4420' },
    rows: [
      'dddddddd',
      'ddDddddd',
      'ddddddDd',
      'dddddddd',
      'dDdddddd',
      'ddddDddd',
      'dddddddd',
      'Dddddddd',
    ],
  },
  S: { // pedra
    palette: { s: '#80808a', S: '#5f5f6a', l: '#9a9aa4' },
    rows: [
      'sssSssss',
      'slssssSs',
      'ssssssss',
      'sSsslsss',
      'ssssssss',
      'sssSsssl',
      'lsssssss',
      'ssSsssss',
    ],
  },
  W: { // tábuas de madeira
    palette: { W: '#b5803f', w: '#9c6a33', k: '#6b4423' },
    rows: [
      'WWWWWWWk',
      'WwWWWWWk',
      'WWWWwWWk',
      'kkkkkkkk',
      'WWWkWWWW',
      'WWWkWwWW',
      'WwWkWWWW',
      'kkkkkkkk',
    ],
  },
  B: { // parede de fundo (madeira escura)
    palette: { b: '#6b4a2e', B: '#5a3d25', k: '#3f2a18' },
    rows: [
      'bbbbbbbk',
      'bBbbbbbk',
      'bbbbBbbk',
      'kkkkkkkk',
      'bbbkbbbb',
      'bbbkbBbb',
      'bBbkbbbb',
      'kkkkkkkk',
    ],
  },
  q: { // vidro (o céu aparece por trás)
    palette: { l: '#d9eefc', q: 'rgba(191,227,255,.22)' },
    rows: [
      'llllllll',
      'lqqqqqql',
      'lqqqqqql',
      'lqqqqqql',
      'lqqqqqql',
      'lqqqqqql',
      'lqqqqqql',
      'llllllll',
    ],
  },
};

// Pedras espalhadas na terra: [coluna, linha]
const STONES = [[2, 17], [3, 17], [7, 18], [14, 19], [15, 19], [22, 17], [31, 18], [32, 18], [36, 16], [37, 19]];

// Mapa de 40×20 blocos.
export function buildMap() {
  const rows = Array.from({ length: SCENE_H / BLOCK }, () => Array(SCENE_W / BLOCK).fill('.'));
  const fill = (ch, c0, c1, r0, r1) => {
    for (let r = r0; r <= r1; r++) for (let c = c0; c <= c1; c++) rows[r][c] = ch;
  };
  fill('G', 0, 39, 15, 15); // superfície
  fill('D', 0, 39, 16, 19); // terra
  for (const [c, r] of STONES) rows[r][c] = 'S';
  fill('W', 12, 27, 6, 6); // telhado em degrau
  fill('W', 10, 29, 7, 7);
  fill('B', 12, 27, 8, 14); // parede de fundo
  fill('q', 17, 19, 9, 10); // janela
  fill('W', 11, 11, 8, 11); // parede esquerda (porta embaixo)
  fill('W', 28, 28, 8, 14); // parede direita
  fill('W', 11, 28, 15, 15); // piso
  return rows.map((r) => r.join(''));
}

// ---------- Personagem ----------

const PERSON = {
  k: '#1b1420', h: '#6b3e1f', H: '#8a5428', s: '#f2c18d', S: '#d79a68',
  e: '#1b1420', w: '#ffffff', c: '#4a9a4a', C: '#33703a', p: '#4a3f8f', P: '#362e6a',
  b: '#5a3a22', m: '#a7b0ba', M: '#6b7480', n: '#8a5a2b', u: '#e8e1d0', U: '#b9ad92',
};

const HEAD = [
  '...hhhhhh.......',
  '..hhhhhhhhh.....',
  '.hhhhHHhhhh.....',
  '.hhhssssss......',
  '.hhsssswes......',
  '.hhsssswes......',
  '..hsssssss......',
  '...ssssss.......',
  '.....ss.........',
];

const LEGS = [
  '...pppppp.......',
  '...pppppp.......',
  '...pp..pp.......',
  '...pp..pp.......',
  '...PP..PP.......',
  '..bbb..bbb......',
];

export const SPRITES = {
  // Foco: martelando na bancada (2 quadros)
  workUp: {
    palette: PERSON,
    rows: [
      '...hhhhhh.......',
      '..hhhhhhhhh.MMMM',
      '.hhhhHHhhhh.mmmm',
      '.hhhssssss..mmmm',
      '.hhsssswes...n..',
      '.hhsssswes...n..',
      '..hsssssss..sn..',
      '...ssssss..cs...',
      '.....ss...cc....',
      '...ccccccccc....',
      '..ccccccccc.....',
      '..cCcccccc......',
      '..cCcccccc......',
      '..sCcccccc......',
      ...LEGS,
    ],
  },
  workDown: {
    palette: PERSON,
    rows: [
      ...HEAD.slice(0, 8),
      '.....ss.....MMM.',
      '...cccccccsnmmm.',
      '..cccccccc..mmm.',
      '..cCcccccc......',
      '..cCcccccc......',
      '..sCcccccc......',
      ...LEGS,
    ],
  },
  // Pausa curta: sentado tomando algo (2 quadros)
  sit: {
    palette: PERSON,
    rows: [
      ...HEAD,
      '...cccccccsuu',
      '..ccccccccsUu',
      '..cCcccccc...',
      '..cpppppppp..',
      '...ppppppppp.',
      '.........pp..',
      '.........PP..',
      '........bbb..',
    ],
  },
  sip: {
    palette: PERSON,
    rows: [
      ...HEAD.slice(0, 6),
      '..hsssssssuu',
      '...sssssssUu',
      '.....ss..s..',
      '...cccccccs..',
      '..ccccccccc..',
      '..cCcccccc...',
      '..cpppppppp..',
      '...ppppppppp.',
      '.........pp..',
      '.........PP..',
      '........bbb..',
    ],
  },
  // Pausa longa: cabeça dormindo no travesseiro
  sleepHead: {
    palette: PERSON,
    rows: [
      '..hhhh..',
      '.hhhhhh.',
      'hhhssss.',
      'hhskkss.',
      'hhsssss.',
      '.hsssss.',
      '..ssss..',
    ],
  },
  // Comemoração: braços para cima
  cheer: {
    palette: PERSON,
    rows: [
      '...hhhhhh...',
      '..hhhhhhhhh.',
      '.hhhhHHhhhh.',
      'shhhssssss.s',
      'shhsssswes.s',
      'chhsssswes.c',
      'c.hsssssss.c',
      'c..ssssss..c',
      'cc...ss...cc',
      '.cccccccccc.',
      '..cccccccc..',
      '..cCccccCc..',
      '..cCccccCc..',
      '..cCccccCc..',
      '...pppppp...',
      '...pppppp...',
      '...pp..pp...',
      '...pp..pp...',
      '...PP..PP...',
      '..bbb..bbb..',
    ],
  },

  // ---------- Detalhes animados ----------
  sweat: { palette: { a: '#9fdcff', A: '#5fb3e8' }, rows: ['.a', 'aA', 'aA'] },
  yawn: { palette: { k: '#5a1f1f' }, rows: ['kk', 'kk'] },
  puff: { palette: { w: 'rgba(255,255,255,.8)' }, rows: ['.w', 'w.', '.w'] },
  zee: { palette: { z: '#e8f0ff' }, rows: ['zzz', '..z', '.z.', 'z..', 'zzz'] },

  // ---------- Móveis ----------
  door: {
    palette: { k: '#3b2414', W: '#b5803f', w: '#9c6a33', y: '#ffd34d' },
    rows: [
      'kkkkkkkk',
      'kWWWWWWk',
      'kWwwwwWk',
      'kWwWWwWk',
      'kWwWWwWk',
      'kWwwwwWk',
      'kWWWWWWk',
      'kWWWWWWk',
      'kWWWWWWk',
      'kWwwwwWk',
      'kWwWWwWk',
      'kWwWWwyk',
      'kWwWWwWk',
      'kWwwwwWk',
      'kWWWWWWk',
      'kWWWWWWk',
      'kWwwwwWk',
      'kWwWWwWk',
      'kWwWWwWk',
      'kWwWWwWk',
      'kWwwwwWk',
      'kWWWWWWk',
      'kWWWWWWk',
      'kkkkkkkk',
    ],
  },
  bed: {
    palette: { k: '#3b2414', W: '#b5803f', w: '#9c6a33', o: '#f4f1ea', r: '#c8463c', R: '#a33730' },
    rows: [
      'kkkk....................',
      'kWWk....................',
      'kWWk....................',
      'kWWkkkkkkkkkkkkkkkkkkkkk',
      'kWWkoooooorrrrrrrrrrrrrk',
      'kWWkoooooorrrrRrrrrrRrrk',
      'kWWkkkkkkkkkkkkkkkkkkkkk',
      'kWWwwwwwwwwwwwwwwwwwwwwk',
      'kWWkkkkkkkkkkkkkkkkkkWWk',
      'kkkk.................kkk',
    ],
  },
  chair: {
    palette: { k: '#3b2414', W: '#b5803f', w: '#9c6a33' },
    rows: [
      'kk......',
      'kWk.....',
      'kWk.....',
      'kWk.....',
      'kWk.....',
      'kWk.....',
      'kWk.....',
      'kWkkkkkk',
      'kWWWWWWk',
      'kkkkkkkk',
      'kWk..kWk',
      'kWk..kWk',
      'kWk..kWk',
      'kkk..kkk',
    ],
  },
  table: {
    palette: { k: '#3b2414', W: '#b5803f', w: '#9c6a33' },
    rows: [
      'kkkkkkkkkkkkkkkk',
      'kWWWWWWWWWWWWWWk',
      'kwwwwwwwwwwwwwwk',
      'kkkkkkkkkkkkkkkk',
      '.kWk........kWk.',
      '.kWk........kWk.',
      '.kWk........kWk.',
      '.kWk........kWk.',
      '.kWk........kWk.',
      '.kkk........kkk.',
    ],
  },
  workbench: {
    palette: { k: '#3b2414', W: '#c48a48', w: '#9c6a33', m: '#a7b0ba', M: '#6b7480' },
    rows: [
      '...........mmm......',
      'kkkkkkkkkkkMMMkkkkkk',
      'kWWWWWWWWWWWWWWWWWWk',
      'kwwwwwwwwwwwwwwwwwwk',
      'kkkkkkkkkkkkkkkkkkkk',
      '.kWk............kWk.',
      '.kWk.kkkkkkkkkk.kWk.',
      '.kWk.kwwwwwwwwk.kWk.',
      '.kWk.kkkkkkkkkk.kWk.',
      '.kkk............kkk.',
    ],
  },
  chest: {
    palette: { k: '#3b2414', W: '#c48a48', w: '#9c6a33', y: '#ffd34d' },
    rows: [
      '.kkkkkkkkkk.',
      'kWWWWWWWWWWk',
      'kWWWWWWWWWWk',
      'kkkkkyykkkkk',
      'kwwwwyywwwwk',
      'kwwwwwwwwwwk',
      'kwwwwwwwwwwk',
      'kwwwwwwwwwwk',
      'kwwwwwwwwwwk',
      'kkkkkkkkkkkk',
    ],
  },
  torchStick: { palette: { n: '#8a5a2b', N: '#6b4423' }, rows: ['', '', '', '', '.nN.', '.nN.', '.nN.', '.nN.', '.nN.', '.nN.'] },
  flameA: { palette: { y: '#ffe066', o: '#ff9a2a', r: '#e0501a' }, rows: ['..y.', '.yy.', 'yooy', 'yoor'] },
  flameB: { palette: { y: '#ffe066', o: '#ff9a2a', r: '#e0501a' }, rows: ['.y..', '.yy.', 'yoyy', 'royy'] },

  // ---------- Céu e natureza ----------
  sun: {
    palette: { y: '#ffe066', Y: '#ffc23a', w: '#fff6c4' },
    rows: [
      '....yyyy....',
      '..yyyyyyyy..',
      '.yyywwyyyyy.',
      '.yywwyyyyyy.',
      'yyywyyyyyyYy',
      'yyyyyyyyyyYy',
      'yyyyyyyyyyYy',
      'yyyyyyyyyYYy',
      '.yyyyyyyYYy.',
      '.yyyyyyYYYy.',
      '..yyYYYYyy..',
      '....yyyy....',
    ],
  },
  moon: {
    palette: { m: '#f4f1d0', M: '#d9d4a6' },
    rows: [
      '...mmmm...',
      '..mmm.....',
      '.mmM......',
      '.mmm......',
      'mmMm......',
      'mmmm......',
      '.mmmm.....',
      '.mmmmm..m.',
      '..mmMmmmm.',
      '...mmmm...',
    ],
  },
  cloud: {
    palette: { w: '#ffffff', W: '#dfe9f5' },
    rows: [
      '......wwww......',
      '...wwwwwwwww....',
      '.wwwwwwwwwwwwww.',
      'wwwwwwwwwwwwwwww',
      '.WWWWWWWWWWWWWW.',
    ],
  },
  canopy: {
    palette: { g: '#3f9b3a', G: '#2f7a2c', l: '#5cbf3f' },
    rows: [
      '......gggggg......',
      '....gggGggglggg...',
      '...ggGGgglggGggg..',
      '..gggggggGGgglggg.',
      '.ggGgggglgggggGggg',
      '.ggggggGGgggglgggg',
      'gggGglgggggGGggggg',
      'ggggggggglggggGggg',
      '.gggGgggggggggggg.',
      '..ggggggGGggggg...',
      '...gggggggggg.....',
      '.....gggggg.......',
    ],
  },
  coin: { palette: { y: '#ffd34d', Y: '#d9a21b', w: '#fff3b0' }, rows: ['.yy.', 'ywyY', 'yyyY', '.YY.'] },
  star: { palette: { y: '#fff3b0' }, rows: ['..y..', '.yyy.', 'yyyyy', '.yyy.', '..y..'] },
};

export function trunk(height) {
  return {
    palette: { t: '#7a4e2a', T: '#5e3a1e' },
    rows: Array.from({ length: height }, (_, i) => (i % 5 === 2 ? 'tTtt' : 'ttTt')),
  };
}

// Estrelas: [x, y]
export const STARS = [[12, 10], [30, 26], [64, 8], [88, 30], [104, 14], [130, 6], [150, 24], [176, 10], [198, 30], [214, 16], [240, 8], [262, 22], [292, 12], [308, 32]];

// Posição (canto superior esquerdo) de cada elemento, em pixels da cena.
export const LAYOUT = {
  trees: [{ x: 6, y: 52, trunkX: 13, trunkTop: 63 }, { x: 280, y: 44, trunkX: 287, trunkTop: 55 }],
  clouds: [[36, 14], [244, 26]],
  moon: [52, 16],
  door: [88, 96],
  bed: [100, 110],
  chair: [132, 106],
  table: [142, 110],
  workbench: [184, 110],
  chest: [208, 110],
  torches: [[112, 78], [172, 78]],
  work: [172, 100],
  sit: [130, 103],
  sleepHead: [104, 107],
  cheer: [152, 100],
  sweat: [183, 101],
  steam: [141, 105],
  yawnSit: [137, 110],
  yawnBed: [109, 112],
  zzz: [114, 98],
};
