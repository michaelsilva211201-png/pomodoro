import { test, eq } from './runner.js';
import { sunTimes } from '../js/sun.js';

const MIN = 60_000;
const near = (actual, expected, tolerance) => Math.abs(actual - expected) <= tolerance;

test('sun: Londres no solstício de junho nasce ~03:43 e se põe ~20:21 (UTC)', () => {
  const t = sunTimes(Date.UTC(2026, 5, 21, 12), 51.5074, -0.1278);
  eq(near(t.sunrise, Date.UTC(2026, 5, 21, 3, 43), 3 * MIN), true, new Date(t.sunrise).toISOString());
  eq(near(t.sunset, Date.UTC(2026, 5, 21, 20, 21), 3 * MIN), true, new Date(t.sunset).toISOString());
});

test('sun: no equador, no equinócio, o dia dura ~12h', () => {
  const t = sunTimes(Date.UTC(2026, 2, 20, 12), 0, 0);
  const minutes = (t.sunset - t.sunrise) / MIN;
  eq(minutes > 715 && minutes < 735, true, `${minutes} min`);
});

test('sun: a longitude desloca o meio-dia solar (São Paulo ≈ 15h UTC)', () => {
  const t = sunTimes(Date.UTC(2026, 8, 30, 15), -23.55, -46.63);
  const noon = (t.sunrise + t.sunset) / 2;
  eq(near(noon, Date.UTC(2026, 8, 30, 15, 0), 15 * MIN), true, new Date(noon).toISOString());
});

test('sun: sol da meia-noite e noite polar em Tromsø', () => {
  eq(sunTimes(Date.UTC(2026, 5, 21, 12), 69.65, 18.96), { polar: 'day' });
  eq(sunTimes(Date.UTC(2026, 11, 21, 12), 69.65, 18.96), { polar: 'night' });
});
