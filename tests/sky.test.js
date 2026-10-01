import { test, eq } from './runner.js';
import { skyAtTime } from '../js/sky.js';

const H = 3_600_000;
const DAY0 = Date.UTC(2026, 0, 1);
const TIMES = { sunrise: DAY0 + 6 * H, sunset: DAY0 + 18 * H };
const at = (hours) => skyAtTime(DAY0 + hours * H, TIMES);
const round = (n) => Math.round(n * 1000) / 1000;

test('sky: ao meio-dia é dia claro com o sol no topo', () => {
  eq(at(12), { top: '#78a7ff', bottom: '#c0d8ff', sunX: 0.5, sunHeight: 1, night: 0 });
});

test('sky: no pôr do sol o céu fica alaranjado e o sol chega ao horizonte direito', () => {
  const s = at(18);
  eq([s.top, s.bottom, s.sunX, round(s.sunHeight), s.night], ['#eb6e46', '#ffc478', 1, 0, 0]);
});

test('sky: meia hora após o pôr do sol já está meio noite', () => {
  const s = at(18.5);
  eq([s.top, s.night], ['#7c3f3b', 0.5]);
});

test('sky: à meia-noite e de madrugada é noite', () => {
  eq([at(0).top, at(0).night, at(0).sunHeight], ['#0c1030', 1, 0]);
  eq(at(23).night, 1);
  eq(at(5.5).night, 0.5);
});

test('sky: meia hora após o nascer o céu ainda tem tom de amanhecer', () => {
  eq([at(6.5).top, at(6.5).night], ['#b28ba3', 0]);
});

test('sky: dia polar e noite polar', () => {
  const day = skyAtTime(DAY0, { polar: 'day' });
  eq([day.top, day.night, day.sunHeight > 0], ['#78a7ff', 0, true]);
  const night = skyAtTime(DAY0, { polar: 'night' });
  eq([night.top, night.night, night.sunHeight], ['#0c1030', 1, 0]);
});
