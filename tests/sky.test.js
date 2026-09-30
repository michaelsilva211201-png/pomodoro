import { test, eq } from './runner.js';
import { skyAt } from '../js/sky.js';

test('sky: início é dia', () => {
  eq(skyAt(0), { top: '#7ec8f0', bottom: '#cdeefd', sunY: 110, night: 0 });
});

test('sky: 60% é pôr do sol', () => {
  const s = skyAt(0.6);
  eq([s.top, s.bottom], ['#f08a5d', '#ffd28a']);
});

test('sky: fim é noite', () => {
  eq(skyAt(1), { top: '#1c2340', bottom: '#3b3f73', sunY: 260, night: 1 });
});

test('sky: interpola cores entre os pontos', () => {
  eq(skyAt(0.3).top, '#b7a9a7');
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
