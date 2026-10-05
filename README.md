# The Other Landing

An original, short fictional apartment horror story by Ichabod Crane, in which an apartment door stops separating inside from outside.

## Status

The pure scene model, complete silent linear story and hold-to-look are implemented. Begin, scene-by-scene progression and Restart work at the visitor's pace, with distinct hallway, landing, missing-door, coat, eye and outside views. Hold to look closer is available at the empty landing, standing coat and eye: hold a primary pointer, Space or Enter; release, cancel, focus loss or a hidden tab restores the normal lens. Sound on explicitly enables local Web Audio knocks, a quiet hum, cloth and a slow breath; Sound off cancels all sources, and subsequent toggles reuse the same AudioContext. Captions stay visible when muted or audio is unavailable. Scene changes, restart and a hidden tab cancel old sources; returning to the tab does not automatically play audio. Restart resets opt-in. At the locked-chain scene, Knock on the door records the player's last six native pointer/keyboard taps even with sound off. After 900ms of quiet, the retained rhythm returns once at softer amplitude from the other side, accompanied by a tiny amber peephole ring. Each tap cancels the previous echo; advancing to the eye reprises the current rhythm once, or the authored three knocks if none were recorded. Scene changes, Sound off, restart and hidden tabs cancel pending echoes. Pause stops the story completely: it clears holds, disables story controls, cancels pending echoes and sources, suspends the opted-in AudioContext and leaves no animation frames pending. Resume restores only eligible controls and resumes sound only if opted-in. Switching away from an active unfinished story pauses it; returning stays paused until the visitor explicitly chooses Resume. Sound on while paused records opt-in without playing. Restart resets the scene, sound opt-in, holds, echoes and clock. The renderer's active elapsed time excludes paused time, so future motion cannot jump forward on resume. Leave the story is an always-visible real creations link. The coat and ending are static at this stage; animation and the alternate ending's control belong to the next stage. A private HTTP preview runs on the Docker proxy network, with no host ports or public routing. Nothing is publicly deployed.

Planned URL: https://the-other-landing.ichabod-crane.net

## Model

`public/model.mjs` exports `create()` and `reduce(state, event)`. Story progression is driven by player events, not clocks. Knock timestamps are supplied by the caller. Every returned state and knock history is independent of the input, including rejected actions.

Run the independent model contract from the repository root:

```sh
node tools/model-contract.mjs
```

Expected output:

```text
landing model preserves authored scenes, rhythms and two endings
```

The authored story is in `fixtures/story.json`; Docker serves this unchanged at `/fixtures/story.json` and the app reads its exact scene and control text. The complete design and model specification are in `BRIEF.md`.

## Private preview

From the repository root, build and recreate only the private preview:

```sh
cd /home/ichabod/apps/the-other-landing
docker build -t the-other-landing-preview:latest .
docker rm -f the-other-landing-preview 2>/dev/null || true
docker run -d --name the-other-landing-preview \
  --network ichabod-proxy --cpus .50 --memory 512m --pids-limit 256 \
  --restart unless-stopped \
  --log-opt max-size=10m --log-opt max-file=3 \
  --health-cmd 'wget -qO- http://127.0.0.1:80/healthz || exit 1' \
  --health-interval 30s --health-timeout 5s --health-retries 3 \
  the-other-landing-preview:latest
```

The static nginx service listens on port **80**, not 3000. Its `.mjs` files have explicit JavaScript MIME. There are no routing labels or published ports. Keep this container for the next implementation stage; do not publish until the final card.

Check actual HTTP health and browser-file MIME before the browser contract:

```sh
docker exec the-other-landing-preview wget -S -O- http://127.0.0.1:80/healthz
docker exec the-other-landing-preview wget -S -O /dev/null 'http://127.0.0.1:80/app.mjs?v=7'
docker exec the-other-landing-preview wget -S -O /dev/null 'http://127.0.0.1:80/style.css?v=3'
docker exec the-other-landing-preview wget -S -O /dev/null 'http://127.0.0.1:80/audio.mjs?v=3'
docker exec the-other-landing-preview wget -S -O /dev/null 'http://127.0.0.1:80/render.mjs?v=3'
tools/run-browser http://the-other-landing-preview 6
```

The browser contract writes real phone and desktop screenshots to ignored `artifacts/`. Stage 6 checks the shell, canvas, complete silent linear progression, pointer/keyboard hold-to-look, actual opt-in AudioContext source creation, the retained personal knock rhythm/caption and Pause/Resume at the missing coat, not public deployment. Asset and import query versions must be bumped whenever those files change.

## Data

Data is disposable; this story stores no visitor data.
