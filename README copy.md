# AI Playground

An in-browser machine-learning lab for exploring how k-nearest neighbors classifies two-dimensional synthetic data. No account, server, external AI service, or student data upload is used.

## Run locally

Requires Node.js 20 or newer.

```sh
npm install
npm run dev
```

Other checks: `npm run typecheck`, `npm test`, `npm run build`.

## What works

- Seeded separated, overlapping, and noisy two-class datasets.
- Click-to-add points and a keyboard-accessible table to inspect, edit coordinates, flip labels, and delete examples.
- Deterministic 75/25 train/test split (seed 123); test points are not used as neighbors.
- Pure TypeScript Euclidean k-NN, configurable `k`, stable distance then point-ID ordering, and nearest-neighbor vote explanations. On equal vote totals, the closest neighbor's label wins.
- Model-derived decision-region overlay, held-out accuracy and confusion matrix (rows actual, columns predicted), and mistake outlines.
- Results become stale when the data or `k` changes; train again to update them.

## Architecture

`src/ml` contains UI-independent dataset generation, split, k-NN, and evaluation modules. `src/App.tsx` coordinates experiment state and renders the SVG workspace, point editor, explanation, and metrics. The boundary renderer queries the same predictor as evaluation and point inspection.

## Limitations

This first slice supports two numeric features and two labels only. There is no drag-to-move, undo, persistence, data export, decision tree, logistic regression, formal guided activity completion, automated browser test, or teacher review. Synthetic results illustrate behavior under chosen conditions and do not predict real-world performance. Google Fonts are referenced for typography; the app's computation does not depend on a remote service.
