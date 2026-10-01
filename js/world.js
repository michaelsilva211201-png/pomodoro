import { spriteRects, rectsToSvg, tileRuns } from './pixel.js';
import { SCENE_W, SCENE_H, BLOCK, TILES, SPRITES, STARS, LAYOUT, buildMap, cloud } from './art.js';

const drawArt = (art, x = 0, y = 0) => rectsToSvg(spriteRects(art.rows, art.palette, x, y));
const draw = (name, x = 0, y = 0) => drawArt(SPRITES[name], x, y);
const at = ([x, y], inner, attrs = '') => `<g transform="translate(${x} ${y})"${attrs}>${inner}</g>`;
const frames = (a, b) => `<g class="f1">${a}</g><g class="f2">${b}</g>`;

function defs() {
  const patterns = Object.entries(TILES).map(([key, t]) =>
    `<pattern id="tile-${key}" width="${BLOCK}" height="${BLOCK}" patternUnits="userSpaceOnUse">${drawArt(t)}</pattern>`);
  return `<defs>
    <linearGradient id="sky-grad" x1="0" y1="0" x2="0" y2="1">
      <stop id="sky-top" offset="0" stop-color="#78a7ff"/>
      <stop id="sky-bottom" offset="1" stop-color="#c0d8ff"/>
    </linearGradient>
    <radialGradient id="torch-glow">
      <stop offset="0" stop-color="#ffc066" stop-opacity="1"/>
      <stop offset=".5" stop-color="#ffb347" stop-opacity=".45"/>
      <stop offset="1" stop-color="#ffb347" stop-opacity="0"/>
    </radialGradient>
    ${patterns.join('')}
    <g id="spr-orb">${draw('orb')}</g>
    <g id="spr-spark">${draw('spark')}</g>
  </defs>`;
}

function world() {
  return tileRuns(buildMap(), BLOCK)
    .map((r) => `<rect x="${r.x}" y="${r.y}" width="${r.w}" height="${r.h}" fill="url(#tile-${r.tile})"/>`)
    .join('');
}

function decor() {
  const L = LAYOUT;
  return [
    ...L.tufts.map((pos) => draw('tuft', ...pos)),
    ...L.flowers.map((pos) => draw('flower', ...pos)),
    ...['door', 'bed', 'stair', 'craftingTable', 'furnace', 'chest'].map((name) => draw(name, ...L[name])),
    at(L.fire, frames(draw('fireA'), draw('fireB')), ' class="fire"'),
    ...L.torches.map((pos) => draw('torchStick', ...pos)),
  ].join('');
}

// Cada pose tem seus quadros (.f1/.f2) e detalhes; o CSS mostra só a pose do modo atual.
function player() {
  const L = LAYOUT;
  const crumbs = [0, 1, 2].map((i) => `<g class="crumb">${draw('crumb', i * 2 - 2, 0)}</g>`).join('');
  return `<g id="player">
    <g id="pose-work" class="pose">
      ${at(L.work, frames(draw('workUp'), draw('workDown')))}
      ${at(L.sweat, `<g id="sweat">${draw('sweat')}</g>`)}
    </g>
    <g id="pose-sit" class="pose">
      <g class="f1">${at(L.sit, draw('sit'))}${draw('bread', ...L.breadDown)}</g>
      <g class="f2">${at(L.sit, draw('eat'))}${draw('bread', ...L.breadUp)}${at(L.crumbs, `<g id="crumbs">${crumbs}</g>`)}</g>
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
    `<circle class="glow" cx="${x + 2}" cy="${y + 2}" r="24" fill="url(#torch-glow)"/>` +
    at([x, y], frames(draw('flameA'), draw('flameB')), ' class="flame"')).join('');
}

export function renderScene() {
  const stars = STARS.map(([x, y], i) =>
    `<rect x="${x}" y="${y}" width="${i % 3 === 0 ? 2 : 1}" height="${i % 3 === 0 ? 2 : 1}" fill="#fff8d6"/>`).join('');
  const clouds = LAYOUT.clouds.map(([x, y, w]) => `<g class="cloud">${drawArt(cloud(w), x, y)}</g>`).join('');
  return [
    defs(),
    `<rect width="${SCENE_W}" height="${SCENE_H}" fill="url(#sky-grad)"/>`,
    `<g id="sun">${draw('sun')}</g>`,
    `<g id="clouds">${clouds}</g>`,
    world(),
    decor(),
    player(),
    `<rect id="night-shade" width="${SCENE_W}" height="${SCENE_H}" fill="#060a24" opacity="0"/>`,
    `<g id="stars" opacity="0">${stars}</g>`,
    at(LAYOUT.moon, draw('moon'), ' id="moon" opacity="0"'),
    torches(),
    '<g id="confetti"></g>',
  ].join('');
}
