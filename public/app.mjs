import { create, reduce } from './model.mjs?v=1';
import { drawScene } from './render.mjs?v=2';

// Serve the authored fixture unchanged, so visible words have one source.
const response = await fetch('./fixtures/story.json?v=1');
if (!response.ok) throw new Error(`Story fixture HTTP ${response.status}`);
const story = await response.json();
let model = create();
const canvas = document.querySelector('#scene');
const ctx = canvas.getContext('2d');
const begin = document.querySelector('#begin');
const next = document.querySelector('#next');
const restart = document.querySelector('#restart');
const storyLine = document.querySelector('#line');
const caption = document.querySelector('#caption');
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

function updateStory() {
  const scene = story.scenes[model.scene];
  storyLine.textContent = scene.line;
  caption.textContent = scene.caption;
  begin.textContent = story.controls.begin;
  restart.textContent = story.controls.restart;
  begin.hidden = model.started;
  next.hidden = !model.started || model.ended;
  next.textContent = scene.next ?? '';
  restart.hidden = !model.ended;
  requestRedraw();
}

function act(type) {
  model = reduce(model, { type });
  updateStory();
}

begin.addEventListener('click', () => {
  act('begin');
  next.focus({ preventScroll: true });
});
next.addEventListener('click', () => {
  act('advance');
  if (model.ended) restart.focus({ preventScroll: true });
});
restart.addEventListener('click', () => {
  act('restart');
  begin.focus({ preventScroll: true });
});

new ResizeObserver(requestRedraw).observe(canvas);
window.addEventListener('resize', requestRedraw);
updateStory();
