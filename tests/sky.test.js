import { test, eq } from './runner.js';
import { skyAt } from '../js/sky.js';

const round = (n) => Math.round(n * 1000) / 1000;

test('sky: início é dia com o sol nascendo à esquerda', () => {
  eq(skyAt(0), { top: '#468ceb', bottom: '#aad7ff', sunX: 0, sunHeight: 0, night: 0 });
});

test('sky: 60% é pôr do sol', () => {
  const s = skyAt(0.6);
  eq([s.top, s.bottom], ['#eb6e46', '#ffc478']);
});

test('sky: fim é noite, com o sol já posto à direita', () => {
  const s = skyAt(1);
  eq([s.top, s.bottom, s.sunX, round(s.sunHeight), s.night], ['#0c1030', '#242c64', 1, 0, 1]);
});

test('sky: interpola cores entre os pontos', () => {
  eq(skyAt(0.3).top, '#997d99');
});

test('sky: o sol faz um arco e atinge o topo no meio do caminho', () => {
  eq([skyAt(0.375).sunX, skyAt(0.375).sunHeight], [0.5, 1]);
  eq(round(skyAt(0.75).sunHeight), 0);
  eq(skyAt(0.9).sunX, 1);
});

test('sky: valores fora de 0–1 ou inválidos são limitados', () => {
  eq(skyAt(-1), skyAt(0));
  eq(skyAt(2), skyAt(1));
  eq(skyAt(NaN), skyAt(0));
});

test('sky: lua e estrelas só aparecem depois de 70%', () => {
  eq(skyAt(0.7).night, 0);
  eq(skyAt(0.9).night, 1);
});
