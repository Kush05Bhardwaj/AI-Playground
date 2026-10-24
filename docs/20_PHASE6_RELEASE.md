# Phase 6 release readiness

## Objectives and scope

This pass stabilizes the existing browser-only learning lab. It adds regression coverage for the decision-tree student flow, shared-split algorithm comparison, malformed saved data, and storage write errors. No additional model or persistence format was introduced.

## Machine-learning correctness review

- k-NN selects Euclidean nearest neighbors, orders equal distances by stable point ID, and breaks vote ties using the nearest neighbor. Existing tests cover known distances, selection, ties, and invalid `k`/empty training data.
- The decision tree uses weighted Gini impurity reduction and deterministic feature/threshold ordering. Existing tests cover split values and gain, prediction paths, leaf counts, depth and purity stops, deterministic majority ties, and malformed inputs.
- The deterministic seeded split validates observations and produces disjoint training and held-out partitions. Fitted models receive training points only. Evaluation reports held-out examples separately and uses actual rows/predicted columns in the confusion matrix. Both algorithm-comparison panels reuse a single partition.
- Per-class metrics represent zero denominators as undefined (`N/A`). The deterministic split is not stratified; a small or imbalanced held-out set can lack one class. Repeated comparison/tuning on the same held-out examples can overfit those examples; this is disclosed in the interface and README.
- Data/settings edits mark dependent results stale; the UI labels stale model and comparison outputs and requires recalculation.

## Testing strategy and results

Vitest unit and React Testing Library integration coverage checks algorithm math, evaluation, persistence, learning rules, and workspace behavior. The App tests exercise first-run onboarding/dismiss/reopen, k-NN training and inspection, prediction challenges, stale results, comparisons, save/restore, reload persistence, undo/redo, reset, activity completion, tree path inspection, shared-split comparison, and malformed saved-state recovery. Persistence tests cover v1-to-v2 migration, old v2 progress normalization, invalid snapshots, and failed writes.

Final checks on 2026-10-24, from the repository with its existing installed dependencies:

- `npm.cmd run typecheck`: passed.
- `npm.cmd test -- --maxWorkers=1 --reporter=dot`: passed, 10 files and 58 tests.
- `npm.cmd run lint`: passed.
- `npm.cmd run build`: passed. Vite emitted a 231.98 kB JavaScript asset (71.51 kB gzip) and a 31.80 kB CSS asset (7.78 kB gzip).
- `git diff --check`: passed.

The first baseline typecheck, test, lint, and build were also successful; a first combined shell invocation was blocked by PowerShell's `npm.ps1` execution policy, so checks were run with `npm.cmd`. No pre-existing test failure remains.

These are automated component/integration tests in jsdom, not a real-browser end-to-end suite. No browser automation framework is configured.

## Student workflow coverage

Automated coverage spans first visit and onboarding, choosing data, guessing before training, model training and held-out inspection, both classifiers, comparison against a common split, action-based learning completion, persisted progress after remount, experiment save/restore, reset, and stale-result handling. Point drag, cancellation, and undo/redo have interaction coverage. Physical-device input and a full browser reload in an actual browser remain manual checks.

## Persistence and recovery

Schema v2 stores settings, observations, and learning progress; metrics are recalculated after restore. A supported v1 k-NN migration and older v2 activity progress normalization are covered. Malformed JSON, unsupported versions, invalid data, unavailable storage, and quota/write exceptions are handled without crashing. Restoring clears model results and prompts the learner to train again. Dataset history is bounded and undo/redo restore validated snapshots; a reset starts a fresh in-memory experiment after confirmation.

## Accessibility review

Automated UI tests verify keyboard activation for a plotted test example, semantic names for plotted points, accessible controls, onboarding dialog behavior, tree text/path, and a complete textual list of plotted examples. Class identity is represented with text and distinct shapes as well as color; visible focus styling is present in CSS. Status regions announce training, predictions, and storage feedback.

No full WCAG audit or manual screen-reader session was performed. Confirm focus order and dialog focus return with keyboard, review NVDA/VoiceOver/TalkBack announcements, check zoom/reflow and contrast in a browser, and verify touch target comfort on physical hardware before claiming accessibility conformance.

## Responsive testing

Responsive breakpoints and stacking rules were reviewed in CSS. Earlier Phase 5 notes record headless visual spot-checks at 390 px and 1280 px. For this phase, attempts to capture the production preview at 320, 390, 430, 768, 1280, and 1440 px were blocked by the installed headless Edge GPU process failing in this restricted environment. Thus those viewport checks are not counted as completed here. Test those six widths, browser zoom, and touch interaction in a functioning browser/device before release.

## Performance and practical limits

No timing benchmark was collected in this pass, so no latency claim is made. Current hard dataset validation caps saved/history and tree training at 1,000 observations; built-in datasets contain 56 or 72. Each training run also predicts a fixed 32-by-24 (768 point) decision-region grid synchronously. k-NN performs a neighbor sort for each prediction, including grid points; tree fitting scans candidate thresholds. Keep the 1,000-point guardrail and profile on a lower-powered classroom device before raising it. Browser interaction timing at the maximum size remains unverified.

## Production build and deployment status

The production build passes, and the Vite production preview served `dist/` locally at `http://127.0.0.1:4173/`. The repository has no hosting provider configuration, deploy workflow, or public URL. No public deployment was performed or verified. No environment variables are required. To release, choose/connect a static host, build with `npm ci` and `npm run build`, publish `dist/`, then validate the hosted URL and core student journey.

## Known issues and limitations

- No real-browser E2E framework or CI/deployment workflow is configured.
- Evaluation uses one deterministic, non-stratified split; repeated model selection can tune to the held-out examples.
- Classifiers are synchronous and limited to two numeric features, two labels, and 1,000 observations.
- Results from the maximum-size interactive workflow have not been benchmarked.
- Browser screenshots for the requested viewport matrix could not be captured in this environment.

## Manual verification still required

1. Configure a public static host and verify its URL, asset paths, HTTPS, and deployed student journey.
2. Check 320, 390, 430, 768, 1280, and 1440 px layouts plus browser zoom.
3. Exercise keyboard-only onboarding, plot, forms, model training, comparison, persistence, and Learn flows.
4. Review screen-reader output with at least one supported screen reader; test touch drag and target sizes on a physical device.
5. Measure initial load and train/edit latency on a classroom-class device, including a dataset near the 1,000-point cap.

## Recommended next steps

Connect a static host and automated build checks, verify the production site, then complete the manual accessibility, viewport, touch, and performance checks above. Record the hosting provider, URL, and deployed revision after verification.
