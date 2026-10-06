import { create, reduce } from './model.mjs?v=1';
import { drawScene } from './render.mjs?v=11';
import { createAudio } from './audio.mjs?v=3';

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
const open = document.querySelector('#open');
const endTitle = document.querySelector('#end-title');
const motionPreference = matchMedia('(prefers-reduced-motion: reduce)');
const look = document.querySelector('#look');
const sound = document.querySelector('#sound');
const audioStatus = document.querySelector('#audio-status');
const knock = document.querySelector('#knock');
const knockGuide = document.querySelector('#knock-guide');
const pause = document.querySelector('#pause');
const pausedStatus = document.querySelector('#paused-status');
const leave = document.querySelector('#leave');
const audio = createAudio(updateSound);
const storyLine = document.querySelector('#line');
const caption = document.querySelector('#caption');
let pendingFrame = null;
let looking = false;
let heldPointer = null;
const heldKeys = new Set();
const echoTimers = new Set();
let echoRing = false;
let activeEchoBursts = 0;
// Only active scene time reaches the renderer; a pause never adds elapsed time.
let elapsed = 0;
let clockStart = performance.now();

function sceneElapsed() {
  return elapsed + (clockStart === null ? 0 : performance.now() - clockStart);
}

function stopFrames() {
  if (pendingFrame !== null) cancelAnimationFrame(pendingFrame);
  pendingFrame = null;
}

function echoOffsets() {
  return model.knocks.map(at => at - model.knocks[0]);
}

function later(callback, delay) {
  const timer = setTimeout(() => {
    echoTimers.delete(timer);
    callback();
  }, delay);
  echoTimers.add(timer);
}

function cancelEcho() {
  for (const timer of echoTimers) clearTimeout(timer);
  echoTimers.clear();
  activeEchoBursts = 0;
  audio.cancelRhythm();
  if (echoRing) {
    echoRing = false;
    requestRedraw();
  }
}

function showEcho(rhythm) {
  // The small ring is also a silent transcription of each returned knock.
  for (const offset of rhythm) {
    later(() => {
      activeEchoBursts++;
      echoRing = true;
      requestRedraw();
      later(() => {
        activeEchoBursts--;
        echoRing = activeEchoBursts > 0;
        requestRedraw();
      }, 90);
    }, offset);
  }
}

// Debug observation only: callers receive copies, never live state or actions.
Object.defineProperty(window, '__landing', {
  value: Object.freeze({
    snapshot() {
      return {
        model: { ...model, knocks: [...model.knocks] },
        looking,
        soundEnabled: audio.soundEnabled,
        audioState: audio.audioState,
        echoOffsets: echoOffsets(),
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
  // Full-page capture or a collapsed viewport can temporarily have no drawable area.
  // ResizeObserver will request a fresh frame when layout returns.
  if (width <= 0 || height <= 0) return;
  const dpr = Math.min(window.devicePixelRatio || 1, 2);
  canvas.width = Math.round(width * dpr);
  canvas.height = Math.round(height * dpr);
  // Rounded backing dimensions still map exactly to CSS coordinates.
  ctx.setTransform(canvas.width / width, 0, 0, canvas.height / height, 0, 0);
  const renderElapsed = sceneElapsed();
  drawScene(ctx, width, height, {
    scene: model.scene,
    looking,
    echoRing,
    elapsed: renderElapsed,
    reducedMotion: motionPreference.matches,
  });
  // One shared frame chain: only the breathing coat and the finite ending fade move.
  if (model.ended && (motionPreference.matches || renderElapsed >= 600)) {
    elapsed = 600;
    clockStart = null;
  }
  if (!model.paused && !document.hidden && !motionPreference.matches &&
      (model.scene === 5 || (model.ended && renderElapsed < 600))) requestRedraw();
}

function requestRedraw() {
  // Resizing while paused may repaint the frozen view, but starts no RAF.
  if (model.paused || document.hidden) return;
  if (pendingFrame === null) pendingFrame = requestAnimationFrame(redraw);
}

function updateSound() {
  sound.textContent = audio.soundEnabled ? story.controls.soundOff : story.controls.soundOn;
  sound.setAttribute('aria-pressed', String(audio.soundEnabled));
  audioStatus.textContent = audio.audioState === 'unavailable' ? story.controls.audioError : '';
}

function updateStory() {
  const scene = story.scenes[model.scene];
  storyLine.textContent = scene.line;
  caption.textContent = model.scene === 6 && model.knocks.length
    ? 'Your rhythm returns from the other side.' : scene.caption;
  begin.textContent = story.controls.begin;
  restart.textContent = story.controls.restart;
  begin.hidden = model.started;
  next.hidden = !model.started || model.ended;
  next.textContent = scene.next ?? '';
  next.disabled = model.paused;
  restart.hidden = !model.ended;
  endTitle.hidden = !model.ended;
  endTitle.textContent = story.controls.endTitle;
  open.textContent = story.controls.open;
  open.hidden = !model.started || model.scene !== 6;
  open.disabled = model.paused || model.ended;
  document.querySelector('footer p').textContent = story.controls.footer;
  document.querySelector('footer a').textContent = story.controls.home;
  look.textContent = story.controls.look;
  look.hidden = !model.started;
  look.disabled = !canLook();
  knock.textContent = story.controls.knock;
  knockGuide.textContent = story.controls.knockGuide;
  knock.hidden = knockGuide.hidden = !model.started || model.scene !== 6;
  knock.disabled = model.paused || model.ended;
  pause.hidden = !model.started;
  pause.disabled = model.ended;
  pause.textContent = model.paused ? story.controls.resume : story.controls.pause;
  pausedStatus.textContent = model.paused ? story.controls.paused : '';
  leave.textContent = story.controls.leave;
  updateSound();
  requestRedraw();
}

function canLook() {
  return model.started && !model.paused && !model.ended &&
    [1, 5, 7].includes(model.scene) && !document.hidden;
}

function updateLooking() {
  const held = canLook() && (heldPointer !== null || heldKeys.size > 0);
  if (looking !== held) {
    looking = held;
    requestRedraw();
  }
}

function clearLook() {
  const pointer = heldPointer;
  heldPointer = null;
  heldKeys.clear();
  updateLooking();
  if (pointer !== null && look.hasPointerCapture(pointer)) {
    look.releasePointerCapture(pointer);
  }
}

function act(type) {
  clearLook();
  const previousScene = model.scene;
  model = reduce(model, { type });
  if (model.scene !== previousScene || ['restart', 'pause'].includes(type)) cancelEcho();
  if (type === 'pause' && model.paused) {
    elapsed = sceneElapsed();
    clockStart = null;
    audio.suspend();
    stopFrames();
  }
  if (type === 'resume' && !model.paused) {
    clockStart = performance.now();
    audio.resume();
  }
  if (type === 'restart') {
    audio.disable();
    stopFrames();
    elapsed = 0;
    clockStart = performance.now();
    audio.setScene(0);
  }
  if (model.scene !== previousScene) {
    elapsed = 0;
    clockStart = performance.now();
    const rhythm = echoOffsets();
    audio.setScene(model.scene, rhythm);
    if (model.scene === 7 && !document.hidden) {
      showEcho(rhythm.length ? rhythm : [0, 320, 640]);
    }
  }
  updateStory();
  if (model.paused) redraw();
}

pause.addEventListener('click', () => act(model.paused ? 'resume' : 'pause'));

look.addEventListener('pointerdown', event => {
  if (!canLook() || !event.isPrimary || event.button !== 0 || heldPointer !== null) return;
  look.setPointerCapture(event.pointerId);
  heldPointer = event.pointerId;
  updateLooking();
});
for (const type of ['pointerup', 'pointercancel', 'lostpointercapture']) {
  look.addEventListener(type, event => {
    if (event.pointerId === heldPointer) clearLook();
  });
}

const isHoldKey = event => event.code === 'Space' || event.code === 'Enter';
look.addEventListener('keydown', event => {
  if (!isHoldKey(event)) return;
  // Keep Tab native, but suppress Space scrolling and Enter's synthetic click.
  event.preventDefault();
  if (event.repeat || !canLook()) return;
  heldKeys.add(event.code);
  updateLooking();
});
look.addEventListener('keyup', event => {
  if (!isHoldKey(event)) return;
  event.preventDefault();
  clearLook();
});
look.addEventListener('blur', clearLook);
window.addEventListener('blur', clearLook);
document.addEventListener('visibilitychange', () => {
  if (document.hidden) {
    if (model.started && !model.ended && !model.paused) act('pause');
    else {
      clearLook();
      cancelEcho();
      audio.suspend();
      stopFrames();
    }
  }
});

sound.addEventListener('click', async () => {
  if (audio.soundEnabled) {
    cancelEcho();
    audio.disable();
  } else {
    sound.disabled = true;
    try { await audio.enable({ suspended: model.paused }); } finally { sound.disabled = false; }
  }
});

knock.addEventListener('click', () => {
  if (document.hidden) return;
  const at = performance.now();
  const updated = reduce(model, { type: 'knock', at });
  if (updated.knocks.at(-1) !== at) return;
  model = updated;
  cancelEcho();
  const rhythm = echoOffsets();
  later(() => {
    audio.echo(rhythm);
    showEcho(rhythm);
  }, 900);
  updateStory();
});

begin.addEventListener('click', () => {
  act('begin');
  next.focus({ preventScroll: true });
});
next.addEventListener('click', () => {
  act('advance');
  if (model.ended) restart.focus({ preventScroll: true });
});
open.addEventListener('click', () => {
  act('open');
  if (model.ended) restart.focus({ preventScroll: true });
});
restart.addEventListener('click', () => {
  act('restart');
  begin.focus({ preventScroll: true });
});

motionPreference.addEventListener('change', () => {
  stopFrames();
  // Once snapped to its final view, an ending must not fade in a second time.
  if (model.ended && motionPreference.matches) {
    elapsed = Math.max(600, sceneElapsed());
    clockStart = null;
  }
  if (model.paused) redraw();
  else requestRedraw();
});

function resizeScene() {
  if (model.paused) redraw();
  else requestRedraw();
}
new ResizeObserver(resizeScene).observe(canvas);
window.addEventListener('resize', resizeScene);
updateStory();
