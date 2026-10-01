import { test, eq } from './runner.js';
import { spriteRects, rectsToSvg, tileRuns } from '../js/pixel.js';

test('pixel: junta pixels vizinhos da mesma cor na linha', () => {
  eq(spriteRects(['aab.a'], { a: '#f00', b: '#00f' }), [
    { x: 0, y: 0, w: 2, h: 1, fill: '#f00' },
    { x: 2, y: 0, w: 1, h: 1, fill: '#00f' },
    { x: 4, y: 0, w: 1, h: 1, fill: '#f00' },
  ]);
});

test('pixel: junta faixas iguais de linhas seguidas', () => {
  eq(spriteRects(['aa', 'aa', '.a'], { a: '#f00' }), [
    { x: 0, y: 0, w: 2, h: 2, fill: '#f00' },
    { x: 1, y: 2, w: 1, h: 1, fill: '#f00' },
  ]);
});

test('pixel: caracteres fora da paleta são transparentes e o deslocamento é aplicado', () => {
  eq(spriteRects(['.x', 'z.'], { x: '#000' }, 10, 20), [{ x: 11, y: 20, w: 1, h: 1, fill: '#000' }]);
});

test('pixel: retângulos viram SVG', () => {
  eq(rectsToSvg([{ x: 1, y: 2, w: 3, h: 4, fill: '#abc' }]), '<rect x="1" y="2" width="3" height="4" fill="#abc"/>');
});

test('pixel: mapa de blocos vira faixas por linha, ignorando o vazio', () => {
  eq(tileRuns(['GG.W', '..WW'], 8), [
    { x: 0, y: 0, w: 16, h: 8, tile: 'G' },
    { x: 24, y: 0, w: 8, h: 8, tile: 'W' },
    { x: 16, y: 8, w: 16, h: 8, tile: 'W' },
  ]);
});
