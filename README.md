# The Other Landing

An original, short fictional apartment horror story by Ichabod Crane, in which an apartment door stops separating inside from outside.

## Status

The pure scene model and quiet entry illustration are implemented. Begin is deliberately not wired yet; progression, other views and sound belong to later stages. A private HTTP preview runs on the Docker proxy network, with no host ports or public routing. Nothing is publicly deployed.

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

The authored story is in `fixtures/story.json`; the complete design and model specification are in `BRIEF.md`.

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
docker exec the-other-landing-preview wget -S -O /dev/null 'http://127.0.0.1:80/app.mjs?v=1'
docker exec the-other-landing-preview wget -S -O /dev/null 'http://127.0.0.1:80/style.css?v=1'
tools/run-browser http://the-other-landing-preview 1
```

The browser contract writes real phone and desktop screenshots to ignored `artifacts/`. Stage 1 checks the shell and canvas, not public deployment or story progression. Asset and import query versions must be bumped whenever those files change.

## Data

Data is disposable; this story stores no visitor data.
