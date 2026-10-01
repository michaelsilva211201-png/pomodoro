import { test, eq } from './runner.js';
import { mobSoundGain, mobSoundPan, ambienceLayers, pickMobSounds } from '../js/ambience.js';

const round = (n) => Math.round(n * 100) / 100;

test('ambiente: mob encostado na casa soa no volume máximo; longe, mais baixo; fora da tela, mudo', () => {
  eq(mobSoundGain(70, 8), 1); // encostado na parede esquerda (80)
  eq(mobSoundGain(242, 10), 1); // encostado na parede direita (240)
  eq(round(mobSoundGain(2, 8)), 0.25); // na borda esquerda: mínimo
  eq(mobSoundGain(-20, 8), 0); // fora da tela
  eq(mobSoundGain(330, 8), 0);
});

test('ambiente: o som vem do lado em que o mob está', () => {
  eq(round(mobSoundPan(0, 0)), -1);
  eq(round(mobSoundPan(156, 8)), 0);
  eq(round(mobSoundPan(312, 8)), 0.98);
  eq(mobSoundPan(-50, 8), -1);
});

test('ambiente: de dia vento e pássaros; à noite grilos e caverna; fogo sempre; chuva só se ligada', () => {
  eq(ambienceLayers(0, false), { wind: 1, birds: 1, crickets: 0, cave: 0, fire: 1, rain: 0 });
  eq(ambienceLayers(1, true), { wind: 0.3, birds: 0, crickets: 1, cave: 1, fire: 1, rain: 1 });
  eq(ambienceLayers(0.5, false).crickets, 0.5);
});

test('ambiente: mobs fazem som de vez em quando, só se estiverem na tela e não indo embora', () => {
  const mobs = [
    { id: 1, type: 'pig', x: 20, state: 'walk' },
    { id: 2, type: 'zombie', x: 250, state: 'approach' },
    { id: 3, type: 'sheep', x: -30, state: 'enter' }, // fora da tela
    { id: 4, type: 'spider', x: 30, state: 'flee' }, // fugindo
  ];
  eq(pickMobSounds(mobs, 250, () => 0).map((m) => m.id), [1, 2]);
  eq(pickMobSounds(mobs, 250, () => 0.99), []);
});
