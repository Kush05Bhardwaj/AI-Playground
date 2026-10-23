# AI Playground

An in-browser machine-learning lab for students to explore how k-nearest neighbors (k-NN) classifies two-dimensional synthetic data. No account, backend, or external AI service is required. Student-created observations and the saved experiment stay in this browser.

## Run locally

Requires Node.js 20 or newer.

```sh
npm ci
npm run dev
```

Vite prints the local URL, usually `http://localhost:5173`.

Verification commands:

```sh
npm run typecheck
npm test -- --maxWorkers=1 --minWorkers=1
npm run lint
npm run build
```

## Explore an experiment

1. Choose a preset: separated groups, overlapping groups, or noisy labels.
2. Choose Group A or B, then click an empty place on the feature map to add an example.
3. Drag an existing point to move it. Select it and use arrow keys or the inspector move buttons for keyboard-accessible movement. Coordinates stay within the plotted 0–1 range.
4. Set `k` and train. The points, predictions, and shaded decision regions use the same real k-NN classifier.
5. Outlined observations are held out from training. Select one by mouse or keyboard to inspect its prediction.
6. Edit the data or model setting and train again. Results from a different data/configuration signature are marked stale and hidden until recalculated.

Adding, moving, relabeling, deleting, clearing, switching presets, and restoring a saved experiment are undoable dataset edits. A completed drag is one edit. Training is not part of dataset history. Use **Undo** / **Redo**, `Ctrl+Z`, `Ctrl+Shift+Z`, or `Ctrl+Y` (`Cmd` on macOS). History holds up to 50 snapshots.

## Compare two model settings

The **Compare two k-NN settings** panel evaluates two `k` values using one shared seeded split of the current dataset. Both configurations receive exactly the same training examples and make predictions for the same held-out examples. The panel reports training accuracy, held-out accuracy, test confusion matrices, and precision, recall, F1, and support for each group.

Only `k` is adjustable because Euclidean distance is the only implemented metric and there are no other model parameters. Higher training accuracy does not make a configuration better. Accuracy can hide class-level differences, so inspect the confusion matrix and per-class scores too.

The split uses seed `123` and holds approximately 25% of observations out. It is deterministic for the same point order and dataset. The current split is not stratified; on small or imbalanced datasets a class may have few or no test examples. A metric whose denominator is zero is shown as `N/A` (undefined), with the class support displayed. Repeatedly comparing settings on the same held-out split can tune choices to those test observations and make the score less reliable as a final estimate of future performance.

## Inspect one prediction

Select a point on the map or in the accessible examples table. The inspector shows its known actual class, predicted class, correctness, training/test role, configured `k`, nearest training examples, straight-line distances, and A/B vote counts. A test observation is not in the training neighbor list. A training observation may be its own neighbor, so use held-out points for an independent check.

The classifier breaks tied class votes using the closest neighbor. Equal-distance neighbors are ordered by point ID. Displayed vote counts and shares are not calibrated probabilities.

## Compare current and saved experiments

Use **Save on this device** to store the current dataset, seed, settings, and learning progress. The existing version 1 persistence schema remains unchanged; prediction and metric values are not saved. The **Current vs saved experiment** panel recomputes both configurations from their stored point data. It identifies dataset, model setting, and evaluation split differences. When test examples differ, the UI warns that scores are not directly comparable. Replacing a different saved snapshot asks for confirmation; only one local saved snapshot is retained. There is no cloud sync or account system.

**Restore** loads the saved configuration, clears current model results, and requires a new run. **Start fresh** and **Clear saved** ask for confirmation. Malformed or unsupported saved data is rejected with a message. No personal student information is stored.

## Guided learning

The Learn page has six activities: Teach the Model, What Does `k` Change?, Add Noise, Investigate Overfitting, Test Before You Trust, and Fix the Mistake. Each has an objective, challenge, steps, an optional hint, an explanation, a reset action, and an action-based completion rule. Opening an activity alone does not complete it. Activities use the existing k-NN implementation and current experiment data.

## Architecture

- `src/ml/` contains seeded dataset generation and splitting, k-NN, evaluation metrics, same-split configuration comparison, and current/saved experiment scoring.
- `src/experiment/history.ts` provides immutable, validated, 50-step dataset undo/redo.
- `src/experiment/persistence.ts` validates versioned local experiment snapshots. Derived metrics are recomputed on use.
- `src/learning/activities.ts` defines activity objectives, hints, explanations, and completion rules.
- `src/components/` contains comparison panels; `src/App.tsx` coordinates state and SVG interaction.

## Accessibility and known limits

The map exposes each point as a keyboard-focusable button with a text label; Enter/Space selects it and arrow keys move it. Shape as well as color distinguishes the groups. The examples table and inspector provide text alternatives to essential chart information. Visible keyboard focus, semantic labels, and responsive narrow-screen layout are included.

Screen-reader behavior, contrast under different display settings, and touch interactions still need manual review with assistive technology and physical devices. The table shows the first eight observations; all plotted points remain keyboard-focusable. This version supports two numeric features, two classes, and Euclidean k-NN only. It has no calibrated probability output, stratified or repeated cross-validation, decision tree, multiple-snapshot archive, export/import, or cloud sync. A complex boundary alone is not treated as proof of overfitting.

## Verification record

The Phase 3 final verification results and test coverage are recorded in [docs/17_PHASE3_IMPLEMENTATION.md](docs/17_PHASE3_IMPLEMENTATION.md).
