# The Other Landing

An original, short fictional apartment horror story by Ichabod Crane, in which an apartment door stops separating inside from outside.

## Status

Model only: the pure scene model is implemented; the visitor interface, illustration and sound are not yet built. Nothing is deployed.

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

## Data

Data is disposable; this story stores no visitor data.
