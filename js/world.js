import { spriteRects, rectsToSvg, tileRuns } from './pixel.js';
import { SCENE_W, SCENE_H, BLOCK, GROUND_Y, TILES, SPRITES, STARS, LAYOUT, buildMap, trunk } from './art.js';

const draw = (name, x = 0, y = 0) => rectsToSvg(spriteRects(SPRITES[name].rows, SPRITES[name].palette, x, y));
const drawArt = (art, x, y) => rectsToSvg(spriteRects(art.rows, art.palette, x, y));
const at = ([x, y], inner, attrs = '') => `<g transform="translate(${x} ${y})"${attrs}>${inner}</g>`;

function defs() {
  const patterns = Object.entries(TILES).map(([key, t]) =>
    `<pattern id="tile-${key}" width="${BLOCK}" height="${BLOCK}" patternUnits="userSpaceOnUse">${drawArt(t, 0, 0)}</pattern>`);
  return `<defs>
    <linearGradient id="sky-grad" x1="0" y1="0" x2="0" y2="1">
      <stop id="sky-top" offset="0" stop-color="#468ceb"/>
      <stop id="sky-bottom" offset="1" stop-color="#aad7ff"/>
    </linearGradient>
    <radialGradient id="torch-glow">
      <stop offset="0" stop-color="#ffc066" stop-opacity="1"/>
      <stop offset=".5" stop-color="#ffb347" stop-opacity=".45"/>
      <stop offset="1" stop-color="#ffb347" stop-opacity="0"/>
    </radialGradient>
    ${patterns.join('')}
    <g id="spr-coin">${draw('coin')}</g>
    <g id="spr-star">${draw('star')}</g>
  </defs>`;
}

function trees() {
  return LAYOUT.trees.map((t) =>
    `<g class="tree">${drawArt(trunk(GROUND_Y - t.trunkTop), t.trunkX, t.trunkTop)}` +
    `<g transform="translate(${t.x} ${t.y})"><g class="canopy">${draw('canopy')}</g></g></g>`).join('');
}

function world() {
  return tileRuns(buildMap(), BLOCK)
    .map((r) => `<rect x="${r.x}" y="${r.y}" width="${r.w}" height="${r.h}" fill="url(#tile-${r.tile})"/>`)
    .join('');
}

function furniture() {
  return ['door', 'bed', 'chair', 'table', 'workbench', 'chest'].map((name) => draw(name, ...LAYOUT[name])).join('') +
    LAYOUT.torches.map((pos) => draw('torchStick', ...pos)).join('');
}

// Cada pose tem seus quadros (.f1/.f2) e detalhes; o CSS mostra só a pose do modo atual.
function player() {
  const L = LAYOUT;
  const puffs = [0, 1, 2].map((i) => `<g class="puff">${draw('puff', i * 2 - 2, 0)}</g>`).join('');
  return `<g id="player">
    <g id="pose-work" class="pose">
      ${at(L.work, `<g class="f1">${draw('workUp')}</g><g class="f2">${draw('workDown')}</g>`)}
      ${at(L.sweat, `<g id="sweat">${draw('sweat')}</g>`)}
    </g>
    <g id="pose-sit" class="pose">
      ${at(L.sit, `<g class="f1">${draw('sit')}</g><g class="f2">${draw('sip')}</g>`)}
      ${at(L.steam, `<g id="steam">${puffs}</g>`)}
      ${at(L.yawnSit, `<g class="yawn">${draw('yawn')}</g>`)}
    </g>
    <g id="pose-bed" class="pose">
      ${at(L.sleepHead, draw('sleepHead'))}
      ${at(L.zzz, `<g id="zzz">${[0, 1, 2].map((i) => `<g class="zee">${draw('zee', i * 4, -i * 5)}</g>`).join('')}</g>`)}
      ${at(L.yawnBed, `<g class="yawn">${draw('yawn')}</g>`)}
    </g>
    <g id="pose-cheer" class="pose">${at(L.cheer, `<g class="hop">${draw('cheer')}</g>`)}</g>
  </g>`;
}

function torches() {
  return LAYOUT.torches.map(([x, y]) =>
    `<circle class="glow" cx="${x + 2}" cy="${y + 2}" r="22" fill="url(#torch-glow)"/>` +
    at([x, y], `<g class="f1">${draw('flameA')}</g><g class="f2">${draw('flameB')}</g>`, ' class="flame"')).join('');
}

export function renderScene() {
  const stars = STARS.map(([x, y], i) =>
    `<rect x="${x}" y="${y}" width="${i % 3 === 0 ? 2 : 1}" height="${i % 3 === 0 ? 2 : 1}" fill="#fff8d6"/>`).join('');
  return [
    defs(),
    `<rect width="${SCENE_W}" height="${SCENE_H}" fill="url(#sky-grad)"/>`,
    `<g id="sun">${draw('sun')}</g>`,
    `<g id="clouds">${LAYOUT.clouds.map((pos) => draw('cloud', ...pos)).join('')}</g>`,
    trees(),
    world(),
    furniture(),
    player(),
    `<rect id="night-shade" width="${SCENE_W}" height="${SCENE_H}" fill="#060a24" opacity="0"/>`,
    `<g id="stars" opacity="0">${stars}</g>`,
    at(LAYOUT.moon, draw('moon'), ' id="moon" opacity="0"'),
    torches(),
    '<g id="confetti"></g>',
  ].join('');
}
