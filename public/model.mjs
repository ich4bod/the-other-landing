// The story moves only in response to player events, never a clock.
export function create() {
  return { started: false, scene: 0, paused: false, ended: false, knocks: [] };
}

export function reduce(state, event) {
  if (event?.type === 'restart') return create();

  // Even rejected actions return an independent state and knock history.
  const next = { ...state, knocks: [...state.knocks] };
  switch (event?.type) {
    case 'begin':
      if (!state.started) next.started = true;
      break;
    case 'pause':
      if (state.started && !state.ended) next.paused = true;
      break;
    case 'resume':
      next.paused = false;
      break;
    case 'advance':
      if (state.started && !state.paused && !state.ended && state.scene < 8) {
        next.scene = state.scene + 1;
        next.ended = next.scene === 8;
      }
      break;
    case 'open':
      if (state.started && !state.paused && !state.ended && state.scene === 6) {
        next.scene = 9;
        next.ended = true;
      }
      break;
    case 'knock': {
      const at = event.at;
      const last = state.knocks.at(-1);
      if (
        state.started && !state.paused && !state.ended && state.scene === 6 &&
        Number.isFinite(at) && at >= 0 && (last === undefined || at > last)
      ) {
        next.knocks = [...state.knocks, at].slice(-6);
      }
      break;
    }
  }
  return next;
}
