import { spriteRects, rectsToSvg } from './pixel.js';

// Ícones da interface em pixel art. Cada um vira um <svg> com shape-rendering="crispEdges".
const ICONS = {
  pickaxe: { // picareta: cabeça em arco, cabo na diagonal
    palette: { k: '#1e1e1e', m: '#c9d1da', M: '#7d8794', n: '#8a5a2b', N: '#5e3c1b' },
    rows: [
      '..kkkkk...',
      '.kmmmmmk..',
      'kmMkkkmmk.',
      'kmk..kNmk.',
      'kk..kNnkmk',
      '...kNnk.kk',
      '..kNnk....',
      '.kNnk.....',
      'kNnk......',
      '.kk.......',
    ],
  },
  bread: {
    palette: { k: '#3a2410', l: '#e8b868', b: '#c8923a', B: '#9a6a22' },
    rows: [
      '..........',
      '...kkkk...',
      '..klllbk..',
      '.klbblbbk.',
      'klbbbbbbBk',
      'kbbbbbbBBk',
      '.kBBBBBBk.',
      '..kkkkkk..',
      '..........',
      '..........',
    ],
  },
  bed: {
    palette: { k: '#1e1e1e', o: '#f4f4f4', r: '#c8323a', R: '#9e2630', p: '#a7834a' },
    rows: [
      '..........',
      '..........',
      '..........',
      'kkkkkkkkkk',
      'kooorrrrrk',
      'kooorrrRrk',
      'kkkkkkkkkk',
      'kppppppppk',
      'kpk....kpk',
      'kkk....kkk',
    ],
  },
  play: {
    palette: { g: '#80ff20', G: '#3ac400', k: '#0f2a05' },
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
    palette: { g: '#80ff20', G: '#3ac400', k: '#0f2a05' },
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
    palette: { r: '#ff5555', R: '#b02a2a', k: '#2a0808', w: '#ffaaaa' },
    rows: [
      'kkkkkkkkkk',
      'kwrrrrrrRk',
      'krrrrrrrRk',
      'krrrrrrrRk',
      'krrrrrrrRk',
      'krrrrrrrRk',
      'krrrrrrrRk',
      'krrrrrrrRk',
      'kRRRRRRRRk',
      'kkkkkkkkkk',
    ],
  },
  skip: {
    palette: { s: '#ffffff', S: '#a0a0a0' },
    rows: [
      's.....s...',
      'ss....s...',
      'sss...s...',
      'ssss..s...',
      'sssss.s...',
      'SSSSS.S...',
      'SSSS..S...',
      'SSS...S...',
      'SS....S...',
      'S.....S...',
    ],
  },
  gear: {
    palette: { m: '#ffffff', M: '#a0a0a0' },
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
  heart: { // coração cheio
    palette: { r: '#ff1f1f', R: '#b80f0f', w: '#ffb3b3', k: '#1a0000' },
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
  heartEmpty: { // coração vazio: só o contorno escuro
    palette: { e: '#3a2222', k: '#1a0000' },
    rows: [
      '.kk.kk.',
      'keekeek',
      'keeeeek',
      'keeeeek',
      '.keeek.',
      '..kek..',
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
