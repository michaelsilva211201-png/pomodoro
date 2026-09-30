let ctx = null;

// Navegadores só liberam áudio após um gesto do usuário: chamar em cliques.
export function unlockAudio() {
  try {
    const AudioCtx = window.AudioContext || window.webkitAudioContext;
    if (!AudioCtx) return;
    if (!ctx) ctx = new AudioCtx();
    if (ctx.state === 'suspended') ctx.resume();
  } catch {
    // sem áudio disponível
  }
}

// Fim do foco: melodia subindo. Fim da pausa: descendo.
const MELODIES = {
  focus: [[784, 0], [988, 0.18], [1175, 0.36]],
  break: [[1175, 0], [988, 0.18], [784, 0.36]],
};

export function playEnd(endedMode, volume) {
  try {
    if (!ctx || volume <= 0) return;
    if (ctx.state !== 'running') ctx.resume().catch(() => {});
    const notes = endedMode === 'focus' ? MELODIES.focus : MELODIES.break;
    const t0 = ctx.currentTime + 0.05;
    const peak = (volume / 100) * 0.3;
    for (const [freq, offset] of notes) {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.value = freq;
      gain.gain.setValueAtTime(0.0001, t0 + offset);
      gain.gain.exponentialRampToValueAtTime(peak, t0 + offset + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.0001, t0 + offset + 0.35);
      osc.connect(gain).connect(ctx.destination);
      osc.start(t0 + offset);
      osc.stop(t0 + offset + 0.4);
    }
  } catch {
    // falha de áudio não interrompe o timer
  }
}

export async function requestPermission() {
  try {
    if (!('Notification' in window)) return false;
    if (Notification.permission === 'granted') return true;
    if (Notification.permission === 'denied') return false;
    return (await Notification.requestPermission()) === 'granted';
  } catch {
    return false;
  }
}

export function notify(title, body) {
  try {
    if ('Notification' in window && Notification.permission === 'granted') {
      new Notification(title, { body });
    }
  } catch {
    // notificação indisponível
  }
}
