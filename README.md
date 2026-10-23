# AI Playground

An in-browser machine-learning lab for exploring k-nearest neighbors (k-NN) and decision trees on two-dimensional synthetic data. No account, backend, or external AI service is required. Student-created observations and saved experiments stay in this browser.

## Run locally

Requires Node.js 20 or newer.

```sh
npm ci
npm run dev
```

Vite prints the local URL, usually `http://localhost:5173`.

## Verify and build

```sh
npm run typecheck
npm test -- --maxWorkers=1
npm run lint
npm run build
```

The build writes a static site to `dist/`. There are no required environment variables. To publish, configure a static host to build with `npm ci` and `npm run build`, then serve the contents of `dist/`. No hosting provider is configured in this repository yet; see [docs/13_DEPLOYMENT.md](docs/13_DEPLOYMENT.md) and [the Phase 6 release record](docs/20_PHASE6_RELEASE.md).

## Start here

On first visit, a short introduction points out the feature map, model controls, prediction explanations, and evaluation scores. Close it at any time; it will not appear again on this browser unless reopened with **How to use AI Playground**. For a first experiment, choose a dataset, inspect group locations and counts, make a prediction guess for the outlined test example, then train a model and compare its prediction and held-out scores with your expectation.

## Explore a model

1. Choose a dataset preset, then select Group A or B and click the feature map to add examples. Drag existing points to move them; select one to edit its label or coordinates. Undo and redo restore dataset changes. Outlined points are held out before training and never participate in fitting.
2. Choose k-NN or Decision Tree. k-NN uses `k` nearby training examples. The tree repeatedly selects a feature threshold with the best weighted Gini impurity reduction, stopping at its depth limit or when a node cannot be usefully split.
3. Train. The model sees only training examples. Outlined points are held out. The same fitted model computes predictions, the evaluation metrics, the map's decision regions, and the selected point's explanation.
4. For a tree, inspect its learned questions and branches. Select a point to highlight its actual route through the tree and the training counts in its leaf.
5. Change data or model settings and train again. The prediction challenge requires a fresh guess for the current data and settings before revealing the next run. Challenge answers do not alter the dataset or undo history. Results from a different dataset or configuration are marked stale until recalculated.

The inspector exposes nearest examples and votes for k-NN, or the actual threshold route and leaf counts for a tree. Counts and vote shares are not calibrated probabilities. Training accuracy describes fit to examples the model has already seen; use held-out metrics and the confusion matrix to inspect generalization and class-level mistakes.

## Compare models

**Compare two k-NN settings** compares two `k` values on one seeded split. **Compare algorithms** lets you choose k-NN or a tree on each side; both use the same training examples and make predictions for exactly the same held-out examples. Both panels recalculate from current data. Comparisons become stale after relevant data or settings change.

The split uses seed `123` and holds approximately 25% of observations out. It is deterministic and not stratified, so a small or imbalanced dataset may have few or no test examples from one class. Undefined metric denominators are shown as `N/A`. Repeatedly choosing settings from the same test set can tune to those observations and weaken it as a final estimate.

## Save, restore, and learn

Save stores the dataset, selected algorithm and its settings, and learning progress in this browser. Derived metrics are recomputed; they are not saved. Version 1 k-NN snapshots migrate to version 2 with k-NN selected and default tree settings. Restore clears current results; train again to recalculate. Only one snapshot is retained.

The Learn page organizes seven action-based activities into three journeys: foundations, model behavior, and evaluation. Each activity shows its objective, challenge, steps, completion criteria, explanation, and an optional hint. Completing an activity points to the next unfinished activity. Completion depends on performing the described actions; saved activity progress is restored from local storage.

Dataset presets illustrate separated groups, overlap, and noisy labels. Group counts make class imbalance visible; click, move, relabel, and delete interactions let you explore dataset size and composition. Every edit is undoable and marks prior model and comparison results stale. The text list below the feature map provides each example's group, coordinates, and train/test role.

## Architecture

- `src/ml/classifierTypes.ts` defines shared classifier configuration, prediction and explanation types.
- `src/ml/knnClassifier.ts` and `src/ml/decisionTreeClassifier.ts` fit models behind the shared classifier interface.
- `src/ml/decisionTree.ts` implements deterministic weighted-Gini splits, stopping rules and decision paths.
- `src/ml/metrics.ts`, `src/ml/split.ts`, and comparison modules provide shared evaluation and same-split scoring.
- `src/experiment/` contains dataset history and validated local persistence with migration.
- `src/components/` contains the model comparison and decision tree views; `src/App.tsx` coordinates the experiment.

Keyboard users can focus plotted examples, select with Enter/Space, and move with arrow keys. Visible focus outlines, semantic point labels, the complete text list, and the examples table provide non-color ways to identify examples and text alternatives to the map. The introduction is keyboard-dismissible and keeps focus within the dialog. Narrow-screen layouts stack the workspace and comparison controls; point dragging supports touch. Browser/assistive-technology testing is not automated here, so screen-reader announcements and touch target comfort still need manual review. The lab supports two numeric features and two classes; it does not implement calibrated probabilities, stratified or repeated cross-validation, export/import, multiple saved snapshots, or cloud sync.

## Verification

Phase-specific implementation and verification records are in [docs/18_PHASE4_IMPLEMENTATION.md](docs/18_PHASE4_IMPLEMENTATION.md), [docs/19_PHASE5_IMPLEMENTATION.md](docs/19_PHASE5_IMPLEMENTATION.md), and [docs/20_PHASE6_RELEASE.md](docs/20_PHASE6_RELEASE.md). Current Phase 6 checks pass: TypeScript, 58 automated tests, ESLint, and the production build. Browser/device and assistive-technology checks that still need a human are listed in the release record.
