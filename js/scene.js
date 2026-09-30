import { skyAt } from './sky.js';

const SVG_NS = 'http://www.w3.org/2000/svg';
const CONFETTI_COLORS = ['#ffd166', '#ef476f', '#06d6a0', '#118ab2', '#fff8ee'];
const STAR_PATH = 'M0-9L2.5-2.5L9 0L2.5 2.5L0 9L-2.5 2.5L-9 0L-2.5-2.5Z';

const rand = (min, max) => min + Math.random() * (max - min);

function prefersReducedMotion() {
  return window.matchMedia?.('(prefers-reduced-motion: reduce)').matches ?? false;
}

function spawnConfetti(layer) {
  const pieces = [];
  for (let i = 0; i < 40; i++) {
    const star = i % 3 === 0;
    const g = document.createElementNS(SVG_NS, 'g');
    g.setAttribute('transform', `translate(${rand(40, 960).toFixed(0)} ${rand(-60, -10).toFixed(0)})`);
    const piece = document.createElementNS(SVG_NS, star ? 'path' : 'rect');
    if (star) {
      piece.setAttribute('d', STAR_PATH);
    } else {
      piece.setAttribute('x', '-4');
      piece.setAttribute('y', '-6');
      piece.setAttribute('width', '8');
      piece.setAttribute('height', '12');
      piece.setAttribute('rx', '2');
    }
    piece.setAttribute('class', 'confetti-piece');
    piece.setAttribute('fill', star ? '#ffd166' : CONFETTI_COLORS[i % CONFETTI_COLORS.length]);
    piece.style.setProperty('--dx', `${rand(-90, 90).toFixed(0)}px`);
    piece.style.setProperty('--rot', `${rand(300, 900).toFixed(0)}deg`);
    piece.style.setProperty('--dur', `${rand(1, 1.5).toFixed(2)}s`);
    piece.style.setProperty('--delay', `${rand(0, 0.3).toFixed(2)}s`);
    g.append(piece);
    pieces.push(g);
  }
  layer.replaceChildren(...pieces);
}

export function createScene(root) {
  const skyTop = root.querySelector('#sky-top');
  const skyBottom = root.querySelector('#sky-bottom');
  const sun = root.querySelector('#sun');
  const nightLayers = [root.querySelector('#stars'), root.querySelector('#moon')];
  const confetti = root.querySelector('#confetti');
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
      sun.setAttribute('cy', sky.sunY.toFixed(1));
      for (const layer of nightLayers) layer.setAttribute('opacity', sky.night.toFixed(2));
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
