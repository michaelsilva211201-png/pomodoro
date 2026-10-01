import { skyAt } from './sky.js';
import { renderScene } from './world.js';
import { SCENE_W } from './art.js';

const SVG_NS = 'http://www.w3.org/2000/svg';

const rand = (min, max) => min + Math.random() * (max - min);

function prefersReducedMotion() {
  return window.matchMedia?.('(prefers-reduced-motion: reduce)').matches ?? false;
}

// Moedas e estrelinhas caindo (sprites #spr-coin / #spr-star definidos em world.js).
function spawnConfetti(layer) {
  const pieces = [];
  for (let i = 0; i < 36; i++) {
    const g = document.createElementNS(SVG_NS, 'g');
    g.setAttribute('transform', `translate(${rand(8, SCENE_W - 8).toFixed(0)} ${rand(-30, -6).toFixed(0)})`);
    const piece = document.createElementNS(SVG_NS, 'use');
    piece.setAttribute('href', i % 3 === 0 ? '#spr-star' : '#spr-coin');
    piece.setAttribute('class', 'confetti-piece');
    piece.style.setProperty('--dx', `${rand(-24, 24).toFixed(0)}px`);
    piece.style.setProperty('--dur', `${rand(1, 1.5).toFixed(2)}s`);
    piece.style.setProperty('--delay', `${rand(0, 0.3).toFixed(2)}s`);
    g.append(piece);
    pieces.push(g);
  }
  layer.replaceChildren(...pieces);
}

export function createScene(root) {
  const svg = root.querySelector('.scene');
  svg.innerHTML = renderScene();
  const skyTop = svg.querySelector('#sky-top');
  const skyBottom = svg.querySelector('#sky-bottom');
  const sun = svg.querySelector('#sun');
  const clouds = svg.querySelector('#clouds');
  const shade = svg.querySelector('#night-shade');
  const nightLayers = [svg.querySelector('#stars'), svg.querySelector('#moon')];
  const confetti = svg.querySelector('#confetti');
  let lastProgress = -1;

  return {
    setMode(mode) {
      root.dataset.mode = mode;
    },
    setRunning(running) {
      root.classList.toggle('running', running);
    },
    setProgress(fraction) {
      if (Math.abs(fraction - lastProgress) < 0.001) return;
      lastProgress = fraction;
      const sky = skyAt(fraction);
      skyTop.setAttribute('stop-color', sky.top);
      skyBottom.setAttribute('stop-color', sky.bottom);
      // Sol 12×12: arco do horizonte esquerdo ao direito; no horizonte fica meio escondido atrás da grama.
      const cx = 10 + sky.sunX * (SCENE_W - 20);
      const cy = 124 - sky.sunHeight * 108;
      sun.setAttribute('transform', `translate(${Math.round(cx - 6)} ${Math.round(cy - 6)})`);
      sun.setAttribute('opacity', (1 - sky.night).toFixed(2));
      clouds.setAttribute('opacity', (1 - sky.night).toFixed(2));
      shade.setAttribute('opacity', (sky.night * 0.45).toFixed(2));
      for (const layer of nightLayers) layer.setAttribute('opacity', sky.night.toFixed(2));
      root.style.setProperty('--night', sky.night.toFixed(2));
    },
    setFinalStretch(level) {
      root.dataset.final = level;
    },
    celebrate() {
      const reduced = prefersReducedMotion();
      root.classList.add('celebrating');
      if (!reduced) spawnConfetti(confetti);
      return new Promise((resolve) => {
        setTimeout(() => {
          root.classList.remove('celebrating');
          confetti.replaceChildren();
          resolve();
        }, reduced ? 800 : 2000);
      });
    },
  };
}
