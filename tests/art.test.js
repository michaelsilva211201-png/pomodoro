import { test, eq } from './runner.js';
import { TILES, SPRITES, BLOCK, buildMap, SCENE_W, SCENE_H } from '../js/art.js';

const unknownChars = (art) => {
  const bad = new Set();
  for (const row of art.rows) for (const ch of row) if (ch !== '.' && !(ch in art.palette)) bad.add(ch);
  return [...bad];
};

test('arte: todo pixel dos blocos e sprites usa uma cor da paleta', () => {
  for (const [name, art] of [...Object.entries(TILES), ...Object.entries(SPRITES)]) {
    eq(unknownChars(art), [], name);
  }
});

test('arte: blocos são quadrados do tamanho de um bloco', () => {
  for (const [name, tile] of Object.entries(TILES)) {
    eq([tile.rows.length, ...new Set(tile.rows.map((r) => r.length))], [BLOCK, BLOCK], name);
  }
});

test('arte: o mapa cobre a cena e só usa blocos conhecidos', () => {
  const map = buildMap();
  eq([map.length, ...new Set(map.map((r) => r.length))], [SCENE_H / BLOCK, SCENE_W / BLOCK]);
  const used = new Set(map.join('').replaceAll('.', ''));
  eq([...used].filter((ch) => !(ch in TILES)), []);
});
