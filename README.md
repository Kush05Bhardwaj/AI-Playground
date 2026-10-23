# AI Playground

An in-browser machine-learning lab for exploring how k-nearest neighbors (k-NN) classifies two-dimensional synthetic data. The app needs no account, backend, or external AI service. Student-created points and saved experiments stay in this browser.

## Run locally

Requires Node.js 20 or newer.

```sh
npm ci
npm run dev
```

Vite prints the local URL, usually `http://localhost:5173`.

Useful checks:

```sh
npm run typecheck
npm test
npm run lint
npm run build
```

## Try an experiment

1. Choose a preset: separated groups, overlapping groups, or noisy labels.
2. Choose Group A or B, then click an empty place on the feature map to add an example.
3. Drag a point to move it. Select it and use the arrow keys or the inspector's move buttons for precise keyboard-accessible movement. Coordinates stay within the plotted 0–1 range.
4. Change `k` and train the model. The boundary and all predictions come from the same real k-NN implementation.
5. Inspect outlined test points. They are excluded from training; the panel shows their nearest training examples and the held-out confusion matrix.
6. Change a point or `k` and train again. Results from the previous run are marked stale until recalculated.

## Editing history

Adding, moving, relabeling, deleting, clearing, switching presets, and restoring a saved experiment are dataset edits. Each completed drag is one edit. Use **Undo** and **Redo**, or `Ctrl+Z` / `Ctrl+Shift+Z` (`Ctrl+Y` also redoes; use `Cmd` on macOS). History holds up to 50 dataset snapshots. Training itself is not an edit. Starting fresh asks for confirmation and clears the current undo history.

## Save and restore

Select **Save** or **Save on this device** to store a versioned experiment in this browser's local storage. It includes the preset, point data, seed, `k`, active label, current activity, activity completion and partial activity progress. It excludes predictions and metrics; restored experiments must be trained again. **Restore** loads the saved snapshot, **Clear saved** removes it, and **Start fresh** resets the current workspace. This is local-only storage, not cloud sync. Storage may be unavailable or full; the app reports save/restore errors and validates saved data before using it. No student identity is stored.

## Guided activities

The Learn page includes six experiments with real model interactions:

- **Teach the model:** train and inspect a held-out point.
- **What does `k` change?:** train on the same data with two values of `k`.
- **Add noise:** edit the noisy dataset and train again.
- **Investigate overfitting:** compare `k=1` and `k=15`, boundaries, and scores. A detailed boundary alone is not proof of overfitting; the training score is explicitly labeled in-sample and can be optimistic.
- **Test before you trust:** train, inspect the two sample counts and scores, then confirm that comparison.
- **Fix the mistake:** inspect a misclassified test point, edit the data, and train again.

Completion is based on those actions, not on opening an activity. Activity progress is saved when the student saves the experiment.

## Architecture and model details

- `src/ml/` contains deterministic dataset generation, seeded 75/25 train/test splitting, pure TypeScript k-NN, and evaluation. The confusion matrix uses rows for actual labels and columns for predictions.
- `src/experiment/history.ts` provides immutable, validated, 50-step dataset undo/redo.
- `src/experiment/persistence.ts` validates and stores the versioned local snapshot. Derived predictions and metrics are never restored.
- `src/learning/activities.ts` defines the six activities and their completion conditions.
- `src/App.tsx` coordinates interaction state and draws the SVG workspace. Drag preview is separate from dataset state; the dataset changes once on pointer release.

The training score is computed on training observations, which are also present in the k-NN reference set. It is an in-sample score and can be optimistic. Test metrics use only held-out predictions. Both are classroom demonstrations on small synthetic samples, not evidence of real-world performance.

## Verification

At the Phase 2 implementation pass, `npm run typecheck`, `npm test -- --maxWorkers=1 --minWorkers=1` (22 tests), `npm run lint`, and `npm run build` all passed. The tests cover k-NN, splitting, metrics, history validation and limits, local persistence validation, activity completion, UI training, dragging, undo/redo, preset changes, local save/restore, fresh reset, plot help, and one guided activity. The full app was not manually reviewed with a screen reader or on physical touch hardware; browser-level behavior still needs that review.

## Known limits

The lab supports only two numeric features, two classes, and k-NN. There is no drag-to-move history across browser sessions, export/import, cloud sync, decision tree, logistic regression, or teacher-reviewed curriculum. The accessible point table shows the first eight rows; every plotted point remains keyboard-focusable, with arrow-key movement. Synthetic results do not guarantee performance on real data.
