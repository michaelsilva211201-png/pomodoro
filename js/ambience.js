// Sons ambientes: vento, pássaros, grilos, caverna, fogo e chuva sintetizados (Web Audio),
// mais os sons dos mobs (gravações de sons/ e sínteses), com volume e lado conforme a posição.
import { HOUSE, MOB_TYPES } from './mobs.js';

const SCENE_W = 320;
const MOB_SOUND_EVERY_MS = 15_000; // em média, cada mob faz um som a cada ~15 s
const QUIET_STATES = new Set(['leave', 'flee', 'burn']);

const clamp = (x, lo, hi) => Math.min(hi, Math.max(lo, x));
const round2 = (x) => Math.round(x * 100) / 100;

// ---------- Funções puras ----------

// Mais alto perto da casa (onde o personagem está); fora da tela, mudo.
export function mobSoundGain(x, w) {
  if (x + w <= 0 || x >= SCENE_W) return 0;
  let distance = 0;
  if (x + w <= HOUSE.left) distance = HOUSE.left - (x + w);
  else if (x >= HOUSE.right) distance = x - HOUSE.right;
  return clamp(1 - Math.max(0, distance - 2) / 68, 0.25, 1);
}

// -1 = esquerda, 0 = centro, 1 = direita.
export function mobSoundPan(x, w) {
  return clamp((x + w / 2 - SCENE_W / 2) / (SCENE_W / 2), -1, 1);
}

// Volume de cada camada (0–1) conforme o nível de noite (0–1) e a chuva.
export function ambienceLayers(night, rain) {
  return {
    wind: round2(1 - 0.7 * night),
    birds: round2(1 - night),
    crickets: round2(night),
    cave: round2(night),
    fire: 1,
    rain: rain ? 1 : 0,
  };
}

// Sorteia quais mobs fazem som neste passo (só os visíveis que não estão indo embora).
export function pickMobSounds(mobs, dtMs, rand) {
  const chance = dtMs / MOB_SOUND_EVERY_MS;
  return mobs.filter((m) => {
    const { w } = MOB_TYPES[m.type];
    if (QUIET_STATES.has(m.state) || m.x + w <= 0 || m.x >= SCENE_W) return false;
    return rand() < chance;
  });
}

// ---------- Motor de áudio (navegador) ----------

const SAMPLES = { chicken: 'sons/galinha.ogg', sheep: 'sons/ovelha.ogg', pig: 'sons/porco.ogg', zombie: 'sons/zumbi.ogg' };
const FADE_S = 0.8;

export function createAmbience() {
  let ctx = null;
  let master = null;
  let noise = null;
  const layers = {};
  const samples = {};
  let active = false;
  let levels = ambienceLayers(0, false);
  let fuse = null;

  const now = () => ctx.currentTime;
  const ramp = (param, value, time = FADE_S) => param.setTargetAtTime(value, now(), time / 3);

  function noiseBuffer() {
    const buffer = ctx.createBuffer(1, ctx.sampleRate * 2, ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < data.length; i++) data[i] = Math.random() * 2 - 1;
    return buffer;
  }

  function noiseSource() {
    const src = ctx.createBufferSource();
    src.buffer = noise;
    src.loop = true;
    return src;
  }

  function layerGain(name, gainScale) {
    const g = ctx.createGain();
    g.gain.value = 0;
    const out = ctx.createGain();
    out.gain.value = gainScale;
    g.connect(out).connect(master);
    layers[name] = g;
    return g;
  }

  // Vento: ruído grave com o volume oscilando devagar.
  function buildWind() {
    const src = noiseSource();
    const filter = ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.value = 380;
    const swell = ctx.createGain();
    swell.gain.value = 0.6;
    const lfo = ctx.createOscillator();
    lfo.frequency.value = 0.08;
    const lfoDepth = ctx.createGain();
    lfoDepth.gain.value = 0.4;
    lfo.connect(lfoDepth).connect(swell.gain);
    src.connect(filter).connect(swell).connect(layerGain('wind', 0.5));
    src.start();
    lfo.start();
  }

  // Chuva: ruído claro e constante.
  function buildRain() {
    const src = noiseSource();
    const hp = ctx.createBiquadFilter();
    hp.type = 'highpass';
    hp.frequency.value = 900;
    const lp = ctx.createBiquadFilter();
    lp.type = 'lowpass';
    lp.frequency.value = 7000;
    src.connect(hp).connect(lp).connect(layerGain('rain', 0.35));
    src.start();
  }

  // Grilos: tom agudo picotado rápido, em rajadas.
  function buildCrickets() {
    const osc = ctx.createOscillator();
    osc.frequency.value = 4400;
    const chirp = ctx.createGain();
    chirp.gain.value = 0.5;
    const fast = ctx.createOscillator();
    fast.type = 'square';
    fast.frequency.value = 28;
    const fastDepth = ctx.createGain();
    fastDepth.gain.value = 0.5;
    fast.connect(fastDepth).connect(chirp.gain);
    const burst = ctx.createGain();
    burst.gain.value = 0.5;
    const slow = ctx.createOscillator();
    slow.type = 'square';
    slow.frequency.value = 1.1;
    const slowDepth = ctx.createGain();
    slowDepth.gain.value = 0.5;
    slow.connect(slowDepth).connect(burst.gain);
    osc.connect(chirp).connect(burst).connect(layerGain('crickets', 0.05));
    [osc, fast, slow].forEach((o) => o.start());
  }

  // Envelope curto (ataque/queda) num GainNode novo.
  function envelope(dest, peak, attack, release, at = now()) {
    const g = ctx.createGain();
    g.gain.setValueAtTime(0.0001, at);
    g.gain.exponentialRampToValueAtTime(peak, at + attack);
    g.gain.exponentialRampToValueAtTime(0.0001, at + attack + release);
    g.connect(dest);
    return g;
  }

  function noiseBurst(dest, { freq, q = 1, peak, attack, release, at = now(), type = 'bandpass' }) {
    const src = noiseSource();
    const filter = ctx.createBiquadFilter();
    filter.type = type;
    filter.frequency.value = freq;
    filter.Q.value = q;
    src.connect(filter).connect(envelope(dest, peak, attack, release, at));
    src.start(at, Math.random());
    src.stop(at + attack + release + 0.05);
  }

  // Pássaro: 2 a 4 piados com a frequência subindo.
  function birdSong() {
    const t0 = now();
    const notes = 2 + Math.floor(Math.random() * 3);
    const base = 2400 + Math.random() * 1400;
    for (let i = 0; i < notes; i++) {
      const at = t0 + i * (0.12 + Math.random() * 0.08);
      const osc = ctx.createOscillator();
      osc.frequency.setValueAtTime(base, at);
      osc.frequency.exponentialRampToValueAtTime(base * 1.5, at + 0.07);
      osc.connect(envelope(layers.birds, 0.12, 0.01, 0.08, at));
      osc.start(at);
      osc.stop(at + 0.12);
    }
  }

  // Estalos de fogo das tochas e da fornalha.
  function crackle() {
    noiseBurst(layers.fire, { freq: 1800 + Math.random() * 1500, q: 2, peak: 0.08 + Math.random() * 0.1, attack: 0.002, release: 0.03 });
  }

  // "Caverna": um ronco grave que cresce e some devagar.
  function caveRumble() {
    noiseBurst(layers.cave, { freq: 90, q: 0.7, peak: 0.5, attack: 3, release: 4, type: 'lowpass' });
  }

  // Agendadores aleatórios (só fazem algo se a camada estiver audível).
  function every(minMs, maxMs, fn, layer) {
    const loop = () => {
      if (active && levels[layer] > 0.05) fn();
      setTimeout(loop, minMs + Math.random() * (maxMs - minMs));
    };
    setTimeout(loop, minMs);
  }

  async function loadSamples() {
    await Promise.all(Object.entries(SAMPLES).map(async ([type, url]) => {
      try {
        const res = await fetch(url);
        samples[type] = await ctx.decodeAudioData(await res.arrayBuffer());
      } catch {
        // sem o arquivo, esse mob fica quieto
      }
    }));
  }

  function init() {
    const AudioCtx = window.AudioContext || window.webkitAudioContext;
    if (!AudioCtx) return;
    ctx = new AudioCtx();
    master = ctx.createGain();
    master.gain.value = 0;
    master.connect(ctx.destination);
    noise = noiseBuffer();
    buildWind();
    buildRain();
    buildCrickets();
    layerGain('birds', 1);
    layerGain('fire', 1);
    layerGain('cave', 0.6);
    layerGain('mobs', 1);
    layers.mobs.gain.value = 1;
    every(2500, 7000, birdSong, 'birds');
    every(60, 260, crackle, 'fire');
    every(18000, 40000, caveRumble, 'cave');
    loadSamples();
  }

  // Saída de um som de mob: volume pela distância e lado pela posição.
  function mobOutput(m) {
    const { w } = MOB_TYPES[m.type];
    const gain = ctx.createGain();
    gain.gain.value = mobSoundGain(m.x, w);
    const pan = ctx.createStereoPanner();
    pan.pan.value = mobSoundPan(m.x, w);
    gain.connect(pan).connect(layers.mobs);
    return gain;
  }

  function playSample(type, out, { rate = 1, offset = 0, duration, volume = 1 }) {
    const buffer = samples[type];
    if (!buffer) return;
    const src = ctx.createBufferSource();
    src.buffer = buffer;
    src.playbackRate.value = rate;
    const g = ctx.createGain();
    g.gain.value = volume;
    src.connect(g).connect(out);
    src.start(now(), offset, duration);
  }

  // Eco simples (atraso com realimentação) para o gemido do zumbi.
  function withEcho(out) {
    const input = ctx.createGain();
    const delay = ctx.createDelay();
    delay.delayTime.value = 0.18;
    const feedback = ctx.createGain();
    feedback.gain.value = 0.35;
    input.connect(out);
    input.connect(delay).connect(feedback).connect(delay);
    delay.connect(out);
    return input;
  }

  const MOB_VOICES = {
    chicken: (out) => {
      const buffer = samples.chicken;
      const offset = buffer ? Math.random() * Math.max(0, buffer.duration - 1.2) : 0;
      playSample('chicken', out, { offset, duration: 0.9, volume: 0.9 });
    },
    pig: (out) => playSample('pig', out, { rate: 0.9 + Math.random() * 0.25, volume: 1 }),
    sheep: (out) => playSample('sheep', out, { rate: 0.9 + Math.random() * 0.2, volume: 0.9 }),
    zombie: (out) => playSample('zombie', withEcho(out), { rate: 0.75 + Math.random() * 0.1, volume: 0.8 }),
    skeleton: (out) => { // ossos chocalhando
      for (let i = 0; i < 4; i++) noiseBurst(out, { freq: 1600 + Math.random() * 800, q: 4, peak: 0.5, attack: 0.002, release: 0.04, at: now() + i * 0.07 });
    },
    spider: (out) => noiseBurst(out, { freq: 3500, q: 0.8, peak: 0.35, attack: 0.05, release: 0.35, type: 'highpass' }),
    mossling: (out) => noiseBurst(out, { freq: 3000, q: 0.6, peak: 0.25, attack: 0.02, release: 0.3, type: 'highpass' }),
  };

  return {
    // Precisa ser chamado num clique do usuário (exigência dos navegadores para áudio).
    unlock() {
      try {
        if (!ctx) init();
        if (ctx?.state === 'suspended') ctx.resume();
      } catch {
        // sem áudio disponível
      }
    },
    // { active, volume (0–1), night (0–1), rain }
    update({ active: on, volume, night, rain }) {
      if (!ctx) return;
      levels = ambienceLayers(night, rain);
      for (const [name, value] of Object.entries(levels)) ramp(layers[name].gain, value, 2);
      if (on !== active) {
        active = on;
        ramp(master.gain, on ? volume : 0);
        if (!on) this.setFuse(null);
      } else if (on) {
        ramp(master.gain, volume, 0.3);
      }
    },
    mobSound(m) {
      if (!ctx || !active) return;
      try {
        MOB_VOICES[m.type]?.(mobOutput(m));
      } catch {
        // falha de áudio não atrapalha a cena
      }
    },
    // Chiado contínuo do pavio da criatura de musgo na reta final (null = desliga).
    setFuse(m) {
      if (!ctx) return;
      if (!m || !active) {
        if (fuse) {
          ramp(fuse.gain.gain, 0, 0.3);
          const old = fuse;
          setTimeout(() => old.src.stop(), 600);
          fuse = null;
        }
        return;
      }
      if (!fuse) {
        const out = mobOutput(m);
        const src = noiseSource();
        const filter = ctx.createBiquadFilter();
        filter.type = 'highpass';
        filter.frequency.value = 4000;
        const gain = ctx.createGain();
        gain.gain.value = 0;
        src.connect(filter).connect(gain).connect(out);
        src.start();
        ramp(gain.gain, 0.12, 0.3);
        fuse = { src, gain };
      }
    },
  };
}
