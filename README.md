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

On first visit, a short introduction points out the feature map, model controls, prediction explanations, and evaluation scores. Close it at any time; it will not appear again on this browser unless reopened with **How to use AI Playground**. For a first experiment, explore the examples, make a prediction guess, then teach the model and inspect practice and validation scores. After choosing settings, select **Evaluate on unseen examples** to reveal the reserved test score.

## Explore a model

1. Choose a dataset preset, then select Group A or B and click the feature map to add examples. Drag existing points to move them; select one to edit its label or coordinates. Undo and redo restore dataset changes. Practice, validation, and test examples are assigned deterministically; validation and test examples do not participate in fitting.
2. Choose k-NN or Decision Tree. k-NN uses `k` nearby training examples. The tree repeatedly selects a feature threshold with the best weighted Gini impurity reduction, stopping at its depth limit or when a node cannot be usefully split.
3. Teach the model. It learns only from practice examples. Practice accuracy measures fit; validation accuracy supports model selection. The fitted model also computes map regions and prediction explanations.
4. For a tree, inspect its learned questions and branches. Select a point to highlight its actual route through the tree and the training counts in its leaf.
5. Change data or model settings and train again. The prediction challenge requires a fresh guess for the current data and settings before revealing the next run. Challenge answers do not alter the dataset or undo history. Results from a different dataset or configuration are marked stale until recalculated.

The inspector exposes nearest examples and votes for k-NN, or the actual threshold route and leaf counts for a tree. Counts and vote shares are not calibrated probabilities. Practice accuracy describes fit to examples the model has already seen; use validation results to compare settings and the reserved test score for a final class-level check.

## Compare models

**Compare two k-NN settings** compares two `k` values on one seeded split. **Compare algorithms** lets you choose k-NN or a tree on each side; both use the same practice examples and validation examples. The test set is excluded from these comparisons. Both panels recalculate from current data and become stale after relevant data or settings change.

The split uses seed `123`. With at least 10 examples it assigns approximately 60% to practice, 20% to validation, and 20% to test. Smaller datasets use practice/test and disable setting comparisons because a separate validation set would be too small. The split is deterministic and not stratified, so class balance can vary between partitions. Undefined metric denominators are shown as `N/A`. Use validation scores to choose settings, then select **Evaluate on unseen examples** for the test score. Using test scores to change settings makes them less independent.

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

Phase-specific implementation and verification records are in [docs/18_PHASE4_IMPLEMENTATION.md](docs/18_PHASE4_IMPLEMENTATION.md), [docs/19_PHASE5_IMPLEMENTATION.md](docs/19_PHASE5_IMPLEMENTATION.md), [docs/20_PHASE6_RELEASE.md](docs/20_PHASE6_RELEASE.md), and [docs/21_PHASE7_GENERALIZATION_AND_UX.md](docs/21_PHASE7_GENERALIZATION_AND_UX.md). Phase 7 checks pass: TypeScript, 60 automated tests, ESLint, and the production build. Browser viewport, device, and assistive-technology checks still need manual review.
