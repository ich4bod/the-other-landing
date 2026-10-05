import { create } from './model.mjs?v=1';
import { drawScene } from './render.mjs?v=1';

const model = create();
const canvas = document.querySelector('#scene');
const ctx = canvas.getContext('2d');
let pendingFrame = null;

// Debug observation only: callers receive copies, never live state or actions.
Object.defineProperty(window, '__landing', {
  value: Object.freeze({
    snapshot() {
      return {
        model: { ...model, knocks: [...model.knocks] },
        looking: false,
        soundEnabled: false,
        audioState: 'off',
        echoOffsets: [],
        pendingFrames: pendingFrame === null ? 0 : 1,
      };
    },
  }),
  writable: false,
  configurable: false,
});

function redraw() {
  pendingFrame = null;
  const { width, height } = canvas.getBoundingClientRect();
  const dpr = Math.min(window.devicePixelRatio || 1, 2);
  canvas.width = Math.round(width * dpr);
  canvas.height = Math.round(height * dpr);
  // Rounded backing dimensions still map exactly to CSS coordinates.
  ctx.setTransform(canvas.width / width, 0, 0, canvas.height / height, 0, 0);
  drawScene(ctx, width, height, {
    scene: model.scene,
    looking: false,
    elapsed: 0,
    reducedMotion: matchMedia('(prefers-reduced-motion: reduce)').matches,
  });
}

function requestRedraw() {
  if (pendingFrame === null) pendingFrame = requestAnimationFrame(redraw);
}

new ResizeObserver(requestRedraw).observe(canvas);
window.addEventListener('resize', requestRedraw);
requestRedraw();
