// Local synthesis only. Constructing this controller creates no AudioContext.
export function createAudio(onChange = () => {}) {
  let context = null;
  let master = null;
  let enabled = false;
  let unavailable = false;
  let generation = 0;
  let scene = 0;
  let offsets = [0, 320, 640];
  let blocked = false;
  const voices = new Set();

  function cancelSources() {
    for (const voice of [...voices]) {
      try { voice.source.stop(); } catch { /* It may already have ended. */ }
      voice.dispose();
    }
  }

  function fail() {
    generation++;
    enabled = false;
    unavailable = true;
    cancelSources();
    onChange();
  }

  function track(source, nodes) {
    const voice = {
      source,
      dispose() {
        source.onended = null;
        source.disconnect();
        for (const node of nodes) node.disconnect();
        voices.delete(voice);
      },
    };
    source.onended = () => voice.dispose();
    voices.add(voice);
    return source;
  }

  function noise(seconds, envelope = () => 1) {
    const buffer = context.createBuffer(1, Math.ceil(context.sampleRate * seconds), context.sampleRate);
    const samples = buffer.getChannelData(0);
    // Same seed and algorithm on each burst: no random audio surprises.
    let seed = 0x1a2b3c4d;
    for (let i = 0; i < samples.length; i++) {
      seed = (Math.imul(seed, 1664525) + 1013904223) >>> 0;
      samples[i] = (seed / 0x100000000 * 2 - 1) * envelope(i / context.sampleRate);
    }
    return buffer;
  }

  function filteredNoise(buffer, { type, frequency, peak, pan = 0, loop = false, at = context.currentTime }) {
    const source = context.createBufferSource();
    source.buffer = buffer;
    source.loop = loop;
    const filter = context.createBiquadFilter();
    filter.type = type;
    filter.frequency.value = frequency;
    filter.Q.value = 0.7;
    const gain = context.createGain();
    gain.gain.value = peak;
    const panner = context.createStereoPanner();
    panner.pan.value = pan;
    source.connect(filter).connect(gain).connect(panner).connect(master);
    track(source, [filter, gain, panner]);
    return { source, gain, at };
  }

  function knocks(pan, rhythm) {
    const buffer = noise(0.09);
    const start = context.currentTime;
    for (const offset of rhythm) {
      const at = start + offset / 1000;
      const voice = filteredNoise(buffer, { type: 'bandpass', frequency: 750, peak: 0, pan, at });
      voice.gain.gain.setValueAtTime(0, at);
      voice.gain.gain.linearRampToValueAtTime(0.25, at + 0.005);
      voice.gain.gain.exponentialRampToValueAtTime(0.001, at + 0.09);
      voice.source.start(at);
      voice.source.stop(at + 0.09);
    }
  }

  function hum() {
    const source = context.createOscillator();
    source.type = 'sine';
    source.frequency.value = 55;
    const filter = context.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.value = 750;
    const gain = context.createGain();
    gain.gain.setValueAtTime(0, context.currentTime);
    gain.gain.linearRampToValueAtTime(0.025, context.currentTime + 0.09);
    source.connect(filter).connect(gain).connect(master);
    track(source, [filter, gain]).start();
  }

  function cue() {
    cancelSources();
    if (!enabled || blocked || context.state !== 'running') return;
    // Endings have no additional authored synthesis; scene three is silent.
    if (scene === 3 || scene >= 8) return;
    hum();
    if (scene === 0 || scene === 2) knocks(scene === 0 ? -0.6 : 0.6, [0, 320, 640]);
    if (scene === 4) {
      const buffer = noise(1, t => Math.sin(Math.PI * t) ** 2);
      const voice = filteredNoise(buffer, { type: 'lowpass', frequency: 750, peak: 0.04 });
      voice.source.start();
    }
    if (scene === 5) {
      // One seamless four-second breath envelope, with no timer or new sources.
      const buffer = noise(4, t => Math.sin(Math.PI * t / 4) ** 2);
      const voice = filteredNoise(buffer, { type: 'lowpass', frequency: 750, peak: 0.025, loop: true });
      voice.source.start();
    }
    if (scene === 7) knocks(0.6, offsets.length ? offsets : [0, 320, 640]);
  }

  async function enable() {
    const ticket = ++generation;
    unavailable = false;
    blocked = document.hidden;
    try {
      if (!context) {
        const AudioContext = window.AudioContext || window.webkitAudioContext;
        context = new AudioContext();
        context.addEventListener('statechange', onChange);
        master = context.createGain();
        master.gain.value = 0.15;
        master.connect(context.destination);
      }
      await context.resume();
      if (ticket !== generation) return;
      if (context.state !== 'running') throw new Error('AudioContext did not resume');
      enabled = true;
      cue();
      onChange();
    } catch {
      if (ticket === generation) fail();
    }
  }

  function disable() {
    generation++;
    enabled = false;
    unavailable = false;
    cancelSources();
    if (context?.state === 'running') context.suspend().catch(fail);
    onChange();
  }

  function setScene(nextScene, echoOffsets = []) {
    scene = nextScene;
    offsets = [...echoOffsets];
    try { cue(); } catch { fail(); }
  }

  function suspend() {
    blocked = true;
    cancelSources();
    if (context?.state === 'running') context.suspend().catch(fail);
    onChange();
  }

  return Object.freeze({
    enable, disable, setScene, suspend,
    get soundEnabled() { return enabled; },
    get audioState() {
      if (unavailable) return 'unavailable';
      if (!enabled) return 'off';
      return context?.state === 'running' && !blocked ? 'running' : 'suspended';
    },
  });
}
