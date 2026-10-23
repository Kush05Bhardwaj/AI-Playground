# Phase 4 implementation: multi-algorithm ML lab

## What changed

The experiment now trains either k-nearest neighbors or a binary decision tree through the shared fitted-classifier interface in `src/ml/classifierTypes.ts`. Each fitted model exposes single and batch prediction plus a model-specific explanation. The map boundary, training score, held-out score, confusion matrix, and selected-point inspector all use predictions from that fitted model.

The tree implementation in `src/ml/decisionTree.ts` searches sorted feature values for midpoint thresholds. It chooses the split with the greatest weighted Gini impurity reduction, with deterministic x-before-y and ascending-threshold tie breaks. Nodes retain training counts and gain. Pure nodes, depth limits, minimum split size, empty partitions, and zero-gain splits stop expansion. Prediction follows the learned thresholds; the explanation reports that exact sequence and its reached leaf.

`DecisionTreeView` presents the learned tree as expandable semantic lists, marks the selected point's route, and includes a text path and leaf counts. Maximum depth is capped at 8. The view uses training examples only.

## Evaluation and comparison

Both algorithms use the shared deterministic train/test split and common metrics. The existing two-k comparison remains available. The new algorithm comparison accepts a k-NN and/or decision-tree configuration, fits both on one shared training partition, then scores both on the same training and held-out examples. It reports accuracy and confusion matrices and marks results stale after data or settings change.

The current/saved comparison also supports either algorithm and recalculates both models. Saved score values are never treated as authoritative.

The Learn page adds a decision-tree depth investigation. It begins with a shallow tree and completes only after training at two distinct maximum depths; the current tree panel exposes depth, nodes, leaves, and held-out results for inspection.

## Persistence and compatibility

Persistence is schema version 2 under `ai-playground.experiment.v2`. It stores the selected algorithm, k, tree maximum depth, minimum samples to split, and activity progress with the dataset. When no v2 snapshot exists, a valid v1 k-NN snapshot is read with k-NN selected, tree defaults (depth 3, minimum split 2), and empty tree-activity progress; migration is non-destructive until the user saves a v2 snapshot. Clear saved removes both versions.

## Tests and verification

Unit coverage includes deterministic Gini splitting, real prediction routes, leaf counts, stopping conditions, majority ties, invalid data, shared classifier behavior, same-split cross-algorithm evaluation, the tree activity completion rule, and v1 persistence migration. The broader app tests cover existing behavior and result freshness.

Verification commands:

```sh
npm run typecheck
npm test -- --maxWorkers=1
npm run lint
npm run build
```

The train/test split is deterministic but not stratified. Small datasets can yield undefined per-class metrics. Tree depth is intentionally bounded; the visualization can still be tall and is scrollable. Existing guided activities remain focused on k-NN; the new depth activity introduces the tree workflow.
