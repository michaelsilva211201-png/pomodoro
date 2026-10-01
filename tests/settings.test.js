import { test, eq } from './runner.js';
import {
  DEFAULTS, SETTINGS_KEY, STATE_KEY, LOCATION_KEY, loadLocation, saveLocation,
  validate, loadSettings, saveSettings, loadState, saveState,
} from '../js/settings.js';

function memoryStorage() {
  const data = new Map();
  return {
    getItem: (k) => (data.has(k) ? data.get(k) : null),
    setItem: (k, v) => { data.set(k, String(v)); },
  };
}

const brokenStorage = {
  getItem() { throw new Error('bloqueado'); },
  setItem() { throw new Error('bloqueado'); },
};

test('settings: entrada vazia ou inválida vira padrão', () => {
  for (const input of [undefined, null, 'x', 7, [], {}]) {
    eq(validate(input), DEFAULTS, String(input));
  }
});

test('settings: números fora dos limites são ajustados', () => {
  const s = validate({ focusMin: 500, shortMin: 0, longMin: -5, cyclesBeforeLong: 99, volume: 150 });
  eq([s.focusMin, s.shortMin, s.longMin, s.cyclesBeforeLong, s.volume], [120, 1, 1, 12, 100]);
});

test('settings: texto numérico é aceito e decimais são arredondados', () => {
  const s = validate({ focusMin: '30', shortMin: 4.6 });
  eq([s.focusMin, s.shortMin], [30, 5]);
});

test('settings: campo vazio ou tipo errado volta ao padrão', () => {
  const s = validate({ focusMin: '', longMin: '  ', shortMin: true, autoStart: 'sim', sound: 1 });
  eq([s.focusMin, s.longMin, s.shortMin, s.autoStart, s.sound], [25, 15, 5, false, true]);
});

test('settings: chaves desconhecidas são descartadas', () => {
  eq(validate({ foo: 1, ...DEFAULTS }), DEFAULTS);
});

test('settings: salva e carrega configurações', () => {
  const st = memoryStorage();
  saveSettings({ ...DEFAULTS, focusMin: 40 }, st);
  eq(loadSettings(st).focusMin, 40);
});

test('settings: JSON corrompido carrega padrões', () => {
  const st = memoryStorage();
  st.setItem(SETTINGS_KEY, '{oops');
  eq(loadSettings(st), DEFAULTS);
});

test('settings: storage bloqueado não quebra', () => {
  eq(loadSettings(brokenStorage), DEFAULTS);
  saveSettings(DEFAULTS, brokenStorage);
  saveState({ mode: 'focus' }, brokenStorage);
  eq(loadState(brokenStorage), null);
});

test('settings: estado salvo vai e volta; formatos errados viram null', () => {
  const st = memoryStorage();
  const state = { mode: 'short', focusCount: 2, remainingMs: 1000, activity: 'Estudar' };
  saveState(state, st);
  eq(loadState(st), state);
  st.setItem(STATE_KEY, '[1,2]');
  eq(loadState(st), null);
  st.setItem(STATE_KEY, '5');
  eq(loadState(st), null);
  eq(loadState(memoryStorage()), null);
});

test('settings: localização salva é arredondada e validada', () => {
  const st = memoryStorage();
  eq(loadLocation(st), null);
  saveLocation({ lat: -23.55052, lon: -46.633308 }, st);
  eq(loadLocation(st), { lat: -23.55, lon: -46.63 });
  for (const bad of [{ lat: 91, lon: 0 }, { lat: 0, lon: 181 }, { lat: 'x', lon: 0 }, [1, 2], 5]) {
    st.setItem(LOCATION_KEY, JSON.stringify(bad));
    eq(loadLocation(st), null, JSON.stringify(bad));
  }
});

test('settings: música tem modo e volume próprios, com valores inválidos voltando ao padrão', () => {
  eq([DEFAULTS.musicMode, DEFAULTS.musicVolume], ['focus', 40]);
  const s = validate({ musicMode: 'always', musicVolume: 150 });
  eq([s.musicMode, s.musicVolume], ['always', 100]);
  eq(validate({ musicMode: 'rock' }).musicMode, 'focus');
  eq(validate({ musicMode: 3 }).musicMode, 'focus');
});
