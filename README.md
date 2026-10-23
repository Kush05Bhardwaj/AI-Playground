# AI Playground

An in-browser machine-learning lab for exploring k-nearest neighbors (k-NN) and decision trees on two-dimensional synthetic data. No account, backend, or external AI service is required. Student-created observations and saved experiments stay in this browser.

## Run locally

Requires Node.js 20 or newer.

```sh
npm ci
npm run dev
```

Vite prints the local URL, usually `http://localhost:5173`.

## Explore a model

1. Choose a dataset preset, then select Group A or B and click the feature map to add examples. Drag existing points to move them; select one to edit its label or coordinates.
2. Choose k-NN or Decision Tree. k-NN uses `k` nearby training examples. The tree repeatedly selects a feature threshold with the best weighted Gini impurity reduction, stopping at its depth limit or when a node cannot be usefully split.
3. Train. The model sees only training examples. Outlined points are held out. The same fitted model computes predictions, the evaluation metrics, the map's decision regions, and the selected point's explanation.
4. For a tree, inspect its learned questions and branches. Select a point to highlight its actual route through the tree and the training counts in its leaf.
5. Change data or model settings and train again. Results from a different dataset or configuration are marked stale until recalculated.

The inspector exposes nearest examples and votes for k-NN, or the actual threshold route and leaf counts for a tree. Counts and vote shares are not calibrated probabilities. Training accuracy describes fit to examples the model has already seen; use held-out metrics and the confusion matrix to inspect generalization and class-level mistakes.

## Compare models

**Compare two k-NN settings** compares two `k` values on one seeded split. **Compare algorithms** lets you choose k-NN or a tree on each side; both use the same training examples and make predictions for exactly the same held-out examples. Both panels recalculate from current data. Comparisons become stale after relevant data or settings change.

The split uses seed `123` and holds approximately 25% of observations out. It is deterministic and not stratified, so a small or imbalanced dataset may have few or no test examples from one class. Undefined metric denominators are shown as `N/A`. Repeatedly choosing settings from the same test set can tune to those observations and weaken it as a final estimate.

## Save, restore, and learn

Save stores the dataset, selected algorithm and its settings, and learning progress in this browser. Derived metrics are recomputed; they are not saved. Version 1 k-NN snapshots migrate to version 2 with k-NN selected and default tree settings. Restore clears current results; train again to recalculate. Only one snapshot is retained.

The Learn page provides six action-based k-NN activities and a decision-tree depth investigation. Activities change the real dataset or model, and completion depends on performing the described experiment.

## Architecture

- `src/ml/classifierTypes.ts` defines shared classifier configuration, prediction and explanation types.
- `src/ml/knnClassifier.ts` and `src/ml/decisionTreeClassifier.ts` fit models behind the shared classifier interface.
- `src/ml/decisionTree.ts` implements deterministic weighted-Gini splits, stopping rules and decision paths.
- `src/ml/metrics.ts`, `src/ml/split.ts`, and comparison modules provide shared evaluation and same-split scoring.
- `src/experiment/` contains dataset history and validated local persistence with migration.
- `src/components/` contains the model comparison and decision tree views; `src/App.tsx` coordinates the experiment.

Keyboard users can focus plotted examples, select with Enter/Space, and move with arrow keys. The examples table and inspector provide text alternatives to essential chart information. The lab supports two numeric features and two classes; it does not implement calibrated probabilities, stratified or repeated cross-validation, export/import, multiple saved snapshots, or cloud sync. Assistive technology and physical touch interaction still benefit from manual review.

## Verification

Implementation details and the Phase 4 verification record are in [docs/18_PHASE4_IMPLEMENTATION.md](docs/18_PHASE4_IMPLEMENTATION.md).
