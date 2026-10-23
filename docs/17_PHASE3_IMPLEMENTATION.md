# Phase 3 implementation record

## Delivered

- Added a model-comparison panel for two real k-NN configurations. Both use one identical seeded train/test partition and each reports in-sample training accuracy, held-out accuracy, a confusion matrix, and per-class precision, recall, F1, and support.
- Comparison outputs are hidden as stale when the point data or either comparison `k` changes. The panel explains repeated test-set tuning and cautions that accuracy alone may hide class-level differences.
- Expanded the prediction inspector. With no explicit selection it shows an empty state. Selecting a map point with mouse or keyboard reveals actual/predicted class, correctness, training/test membership, `k`, actual nearest training examples and Euclidean distances, A/B vote counts, and the deterministic tie rule.
- Extended evaluation to calculate per-class metrics. Precision and recall with zero denominators are `null` internally and shown as `N/A`; F1 is also undefined when either required class metric is undefined. The confusion matrix remains actual rows and predicted columns.
- Strengthened splitting to reject duplicate/empty point IDs, malformed observations, and invalid seeds. This keeps the ID-based split disjoint and deterministic.
- Added a current-vs-saved experiment comparison that re-scores both configurations instead of trusting stored metrics. It reports dataset/configuration details and warns when their held-out examples differ. The existing version 1 local persistence schema is unchanged. Saving a different snapshot now asks before replacing the one existing local snapshot.
- Reviewed the six activities and added optional, progressively revealed hints. Existing completion signals and persistence fields remain compatible.
- Added accessible result/status descriptions and semantic comparison tables, and styles that adapt comparison panels to narrow screens.

## Architecture decisions

- Kept the classifier as the existing pure TypeScript k-NN function. `src/ml/comparison.ts` runs each `k` against one shared `splitData` result rather than splitting independently.
- Added `ClassMetrics` to the common `Evaluation` result and reused `evaluate` for all reported scores. Both current and saved comparison results use that same path.
- Preserved the version 1 local-storage schema. Saved snapshots contain point data/settings/progress only; evaluation results are recomputed. No migration was needed.
- The test split remains seed 123 and approximately 25%, matching the existing experiment workflow. It is not stratified. Per-class support and `N/A` output make missing classes visible rather than inventing a score.
- The k-NN tie rule is: highest vote count; when counts tie, the nearest neighbor's class; equal-distance neighbors are ordered by point ID.
- No distance selector is shown because Euclidean distance is the only implemented metric. No other unimplemented model setting is exposed.
- Decision trees remain deferred. The application currently has direct k-NN calls and no shared classifier interface; adding a second model would expand the core surface and tests. No mock tree controls or predictions were introduced.

## Files changed

- `src/ml/types.ts`, `metrics.ts`, `split.ts`, and `knn.ts`: metric types/calculation, split validation, and documented deterministic tie handling.
- `src/ml/comparison.ts` and `comparison.test.ts`: same-split k-NN configuration evaluation and regression coverage.
- `src/ml/experimentComparison.ts` and `experimentComparison.test.ts`: current/saved config scoring and split/data compatibility checks.
- `src/components/ComparisonPanel.tsx` and `SavedExperimentComparison.tsx`: accessible current-config and saved-config comparison views.
- `src/learning/activities.ts` and `activities.test.ts`: activity hints and their coverage.
- `src/App.tsx`, `src/App.test.tsx`, and `src/styles.css`: app integration, prediction details, stale handling, overwrite confirmation, accessible states, UI tests, and responsive styles.
- `README.md`: Phase 3 usage, methodology, known limits, and verification pointer.
- `docs/17_PHASE3_IMPLEMENTATION.md`: this implementation record.

## Evaluation methodology

The app deterministically shuffles unique point IDs with a 32-bit seed, then sets aside about one quarter of the observations. The remaining observations are the only neighbor references for held-out predictions. Training accuracy is measured on those same training observations, so it is in-sample and can be optimistic. The held-out set checks predictions on observations not used as neighbors. It is small synthetic data and does not establish real-world performance.

The two-k comparison evaluates both choices against the exact same partition. A learner who repeatedly chooses settings by this test score is indirectly tuning to those examples; the displayed caution says that repeated comparisons make the score less reliable as an estimate of future performance. Current-vs-saved comparisons recompute both scores and state whether the test examples match. Scores from different test examples are identified as not directly comparable.

A class with no true examples has undefined recall. A class with no predicted examples has undefined precision. Undefined precision or recall yields undefined F1. The UI shows `N/A` and the support/predicted counts make the reason visible.

## Tests and verification

Baseline before Phase 3 changes:

- `npm.cmd run typecheck`: passed.
- `npm.cmd test -- --maxWorkers=1 --minWorkers=1`: passed, 22 tests.
- `npm.cmd run lint`: passed when run alone. Its first concurrent invocation with Vitest failed because ESLint tried to open a temporary Vite config file after it had been removed; the immediate standalone rerun passed.
- `npm.cmd run build`: passed.

Final post-change commands and results are recorded below after the final verification pass. New automated coverage checks shared split membership, different predictions across `k`, metrics with missing classes/denominators, invalid split inputs, current-vs-saved data/split mismatches, explicit prediction empty state and keyboard selection, comparison staleness, persistence recomputation, overwrite confirmation, and activity hints.

## Known limitations and deferred work

- Only two features, two labels, Euclidean k-NN, and odd `k` values are supported. No calibrated confidence, distance alternatives, or classifier abstraction exists.
- The deterministic split is not stratified; small or imbalanced datasets can leave one class absent from test data. This is surfaced through support and `N/A` metrics.
- The current held-out set is reused for comparisons. The UI explains the risk of selecting settings against the same test set; there is no separate validation set or cross-validation.
- One local saved snapshot is supported. Replacing a different snapshot requires confirmation; multiple named snapshots and export/import are not implemented. No cloud/account feature exists.
- The accessible point table shows the first eight rows. All plotted points can be keyboard-focused and moved; physical touch and screen-reader behavior still need manual review.
- Decision tree, logistic regression, repeated/stratified cross-validation, and teacher-reviewed lesson content are deferred.
- Manual visual review across narrow devices, high contrast/display settings, physical touch hardware, and screen-reader software has not been performed.

## Final verification

All final checks completed successfully after implementation and documentation updates. Dependencies were available in the existing `node_modules`; no installation or registry access was needed.

- `npm.cmd run typecheck`: passed.
- `npm.cmd test -- --maxWorkers=1 --minWorkers=1`: passed, 7 test files and 37 tests.
- `npm.cmd run lint`: passed.
- `npm.cmd run build`: passed; Vite produced the production assets.

The initial baseline had 22 tests and also passed type-checking, tests, and build. The first baseline lint call was run concurrently with Vitest and encountered a missing temporary Vite config file; the standalone lint rerun passed. The final lint was run after tests and passed. No final check was blocked.


