import { spriteRects, rectsToSvg } from './pixel.js';

// Ícones da interface em pixel art. Cada um vira um <svg> com shape-rendering="crispEdges".
const ICONS = {
  pickaxe: {
    palette: { m: '#c9d1da', M: '#7d8794', n: '#a8733a', N: '#7a5226' },
    rows: [
      '..mmmmmm..',
      '.mMMMMMMm.',
      'mM..nN..Mm',
      'm...nN...m',
      '....nN....',
      '....nN....',
      '....nN....',
      '....nN....',
      '....nN....',
      '....nN....',
    ],
  },
  mug: {
    palette: { w: 'rgba(255,255,255,.85)', k: '#2a2238', u: '#efe7d4', U: '#c7b996', c: '#7a4a24' },
    rows: [
      '.w..w.....',
      '..w..w....',
      'kkkkkkk...',
      'kcccccckk.',
      'kuuuuuk.k.',
      'kuuuuuk.k.',
      'kuuuuukkk.',
      'kuuuuUk...',
      'kUUUUUk...',
      '.kkkkk....',
    ],
  },
  moon: {
    palette: { y: '#fff3b0', Y: '#e6cf6a' },
    rows: [
      '...yyyy...',
      '..yyy.....',
      '.yyY......',
      '.yyy......',
      'yyYy......',
      'yyyy......',
      '.yyyy.....',
      '.yyyyy..y.',
      '..yyYyyyy.',
      '...yyyy...',
    ],
  },
  play: {
    palette: { g: '#7ee05a', G: '#4caf3e', k: '#14321a' },
    rows: [
      '.kk.......',
      '.kgk......',
      '.kggk.....',
      '.kgggk....',
      '.kggggk...',
      '.kgggGk...',
      '.kggGk....',
      '.kgGk.....',
      '.kGk......',
      '.kk.......',
    ],
  },
  pause: {
    palette: { g: '#7ee05a', G: '#4caf3e', k: '#14321a' },
    rows: [
      'kkkk..kkkk',
      'kggk..kggk',
      'kggk..kggk',
      'kggk..kggk',
      'kggk..kggk',
      'kggk..kggk',
      'kggk..kggk',
      'kGGk..kGGk',
      'kGGk..kGGk',
      'kkkk..kkkk',
    ],
  },
  stop: {
    palette: { r: '#ff6b5e', R: '#c8463c', k: '#3a1010', w: '#ffb3aa' },
    rows: [
      '.kkkkkkkk.',
      'kwrrrrrrRk',
      'krrrrrrrRk',
      'krrrrrrrRk',
      'krrrrrrrRk',
      'krrrrrrrRk',
      'krrrrrrrRk',
      'krrrrrrrRk',
      'kRRRRRRRRk',
      '.kkkkkkkk.',
    ],
  },
  skip: {
    palette: { s: '#c9d1ff' },
    rows: [
      's.....s...',
      'ss....s...',
      'sss...s...',
      'ssss..s...',
      'sssss.s...',
      'sssss.s...',
      'ssss..s...',
      'sss...s...',
      'ss....s...',
      's.....s...',
    ],
  },
  gear: {
    palette: { m: '#c9d1da', M: '#7d8794' },
    rows: [
      '....mm....',
      '.m.mmmm.m.',
      '..mmMMmm..',
      '.mmM..Mmm.',
      'mmM....Mmm',
      'mmM....Mmm',
      '.mmM..Mmm.',
      '..mmMMmm..',
      '.m.mmmm.m.',
      '....mm....',
    ],
  },
  heart: {
    palette: { r: '#ff4a5a', R: '#c42a3a', w: '#ffc2c8', k: '#3a0f18' },
    rows: [
      '.kk.kk.',
      'kwrkrrk',
      'krrrrRk',
      'krrrrRk',
      '.krrRk.',
      '..kRk..',
      '...k...',
    ],
  },
};

export function iconSvg(name) {
  const icon = ICONS[name];
  const w = Math.max(...icon.rows.map((r) => r.length));
  const h = icon.rows.length;
  return `<svg viewBox="0 0 ${w} ${h}" shape-rendering="crispEdges" aria-hidden="true">${rectsToSvg(spriteRects(icon.rows, icon.palette))}</svg>`;
}

// Preenche todo elemento com data-icon="nome".
export function paintIcons(root = document) {
  for (const el of root.querySelectorAll('[data-icon]')) el.innerHTML = iconSvg(el.dataset.icon);
}
