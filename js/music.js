// Música de fundo: arquivos da pasta musica/, tocados em sequência com fade.

const AUDIO_EXT = /\.(mp3|ogg|oga|opus|m4a|aac|wav|flac|webm)$/i;
const FADE_MS = 1000;
const FADE_TICK_MS = 50;

// Nome mostrado no "Tocando agora": o nome do arquivo sem a extensão.
export function trackName(fileName) {
  return fileName.replace(/\.[^.]+$/, '');
}

// Faixas da pasta musica/ + escolhidas pelo usuário neste navegador, em ordem alfabética.
export function mergeTracks(folderTracks, chosenTracks) {
  return [...folderTracks, ...chosenTracks].sort((a, b) => a.name.localeCompare(b.name, 'pt-BR'));
}

// Lê os arquivos de áudio da listagem de pasta do "python -m http.server" (ignora subpastas e outros arquivos).
export function parseListing(html) {
  const tracks = [];
  for (const [, href] of html.matchAll(/href="([^"]+)"/gi)) {
    if (href.includes('/') || href.startsWith('?') || !AUDIO_EXT.test(href)) continue;
    let name;
    try {
      name = decodeURIComponent(href);
    } catch {
      name = href;
    }
    tracks.push({ url: href, name: trackName(name) });
  }
  return tracks.sort((a, b) => a.name.localeCompare(b.name, 'pt-BR'));
}

// musicMode: 'focus' (só no foco) | 'always' (foco e pausas) | 'off'.
export function shouldPlayMusic({ mode, running }, musicMode) {
  if (!running || musicMode === 'off') return false;
  return musicMode === 'always' || mode === 'focus';
}

export async function loadTracks(folder = 'musica/') {
  try {
    const res = await fetch(folder, { cache: 'no-store' });
    if (!res.ok) return [];
    return parseListing(await res.text()).map((t) => ({ ...t, url: folder + t.url }));
  } catch {
    return [];
  }
}

// Tocador: setPlaying(bool) liga/desliga com fade; continua do mesmo ponto; pula faixas com erro.
export function createMusicPlayer(tracks, { onTrackStart } = {}) {
  const audio = new Audio();
  audio.preload = 'auto';
  let index = 0;
  let wanted = false;
  let volume = 0.4;
  let fadeTimer = null;
  let failures = 0;
  let announced = '';

  const load = (i) => {
    index = (i + tracks.length) % tracks.length;
    audio.src = tracks[index].url;
  };

  function fadeTo(target, done) {
    clearInterval(fadeTimer);
    const step = Math.max(0.01, Math.abs(target - audio.volume) / (FADE_MS / FADE_TICK_MS));
    fadeTimer = setInterval(() => {
      const diff = target - audio.volume;
      if (Math.abs(diff) <= step) {
        audio.volume = target;
        clearInterval(fadeTimer);
        fadeTimer = null;
        done?.();
      } else {
        audio.volume += Math.sign(diff) * step;
      }
    }, FADE_TICK_MS);
  }

  function start() {
    if (!tracks.length) return;
    if (!audio.src) load(0);
    if (audio.paused) audio.volume = 0;
    // play() é chamado na hora (dentro do clique do usuário), exigência dos navegadores para tocar áudio
    audio.play().then(() => {
      if (wanted) fadeTo(volume);
      else audio.pause();
    }).catch(() => {
      // bloqueado ou arquivo inválido: o evento 'error' ou a próxima chamada tentam de novo
    });
  }

  const next = () => {
    load(index + 1);
    if (wanted) start();
  };

  audio.addEventListener('ended', next);
  audio.addEventListener('error', () => {
    failures += 1;
    if (failures >= tracks.length) {
      wanted = false; // nenhuma faixa toca: desiste sem travar o app
      return;
    }
    next();
  });
  audio.addEventListener('playing', () => {
    failures = 0;
    if (announced !== audio.src) {
      announced = audio.src;
      onTrackStart?.(tracks[index]);
    }
  });

  return {
    count: tracks.length,
    setPlaying(on) {
      if (on === wanted) return;
      wanted = on;
      if (on) start();
      else fadeTo(0, () => {
        if (!wanted) audio.pause();
      });
    },
    setVolume(v) {
      volume = v;
      if (wanted && !audio.paused) fadeTo(v);
    },
  };
}
