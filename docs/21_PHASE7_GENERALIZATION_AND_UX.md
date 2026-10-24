# Phase 7: Generalization and Learning Flow

## Root cause review

The classifiers were not shown to have a mathematical defect. k-NN already selected the Euclidean nearest points with deterministic ID ordering and a defined vote tie rule. The decision tree already used weighted Gini improvement, deterministic threshold ordering, and a depth limit of eight.

The main evaluation weakness was the experiment workflow: a deterministic 75/25 training/test split was reused for every comparison and prediction challenge. Since students could repeatedly compare settings against those same test examples, the displayed test score could become part of model selection. The split was also unstratified, and the app's small synthetic samples made any one score uncertain. A training/test gap alone was not evidence of a broken classifier. There was no pre-change benchmark establishing an accuracy deficit or a guaranteed score gain to target.

The seeded generators are class balanced: the separated preset has 28 examples per class, while overlap and noisy presets have 36 per class. The noisy preset deliberately flips four labels in each class (8 of 72 examples); overlap uses wider clouds around closer class centers. These properties can produce real errors or train/held-out score differences. The split validates unique IDs and assigns each example to one partition; the reused test set in comparisons/challenges, rather than neighbor math, Gini calculations, or a train/test fitting leak, was the identified workflow flaw.

## Data partitions and evaluation

`splitData` now returns practice (`train`), validation, and test partitions using the same seeded shuffle. At 10 or more examples, approximately 60% are practice, 20% validation, and 20% test, with each held-out partition receiving at least one example. The partitions are disjoint and cover the input observations. At fewer than 10 examples, the split explicitly falls back to practice/test and returns an empty validation partition with `validationAvailable: false`.

Models fit only on practice examples. Candidate k-NN and cross-algorithm settings compare on validation examples from the same split. Saved experiment comparisons also report validation scores. The workspace reports practice and validation accuracy after training; the test label is hidden in the map, text alternative, table, and inspector until a separate **Evaluate on unseen examples** action reveals the final score and labels. Once learners inspect that result, repeated use to guide settings makes the estimate less independent, which the UI explains. Dataset edits and model setting changes mark calculated results stale; restored experiments still recalculate all derived results.

Partitions are deterministic but not stratified. Small datasets that lack validation cannot compare settings; the UI explains the limitation. A single test split is not a guarantee of real-world performance, and no change here asserts that model accuracy increased. Existing saved experiments contain data, settings, and learning progress, but no cached partitions or scores. Restored experiments therefore keep their saved content and recalculate partition membership under the current split rules; no persistence migration is needed.

## Model behavior and student flow

The classifier math and controls remain stable: k-NN keeps the current supported integer `k` range and intuitive local-to-smoother labels; the tree retains maximum depth and minimum examples to split. No additional complexity controls were added. Existing prediction explanations continue to show nearest-neighbor votes or the tree's actual decision path.

The primary action now reads **Teach the model**. The workspace presents counts for practice, validation, and test examples, explains the role of the two visible scores, and keeps the test result behind a deliberate evaluation action. The prediction challenge uses a validation example. Existing learning activities, dataset editing, undo/redo, saved experiments, and algorithm comparisons remain available. Persistence schema is unchanged because partitions and metrics are derived from the dataset and are recomputed rather than saved.

## UI and accessibility

Terminology in the main flow now distinguishes practice, validation, and unseen test examples and names the student action directly. Result copy explains the purpose of practice and validation scores and warns that small samples and noisy labels make score gaps uncertain. Existing semantic controls, keyboard interactions, visible focus, text alternative to the plot, and non-color point shapes remain in place.

Automated component tests cover the training action, three-way counts, explicit test-score reveal, comparisons, and stale results. No browser automation framework is configured. The 320–390, 430, 768, 1280, and 1440 px viewport matrix, physical touch behavior, and screen-reader announcements were not manually checked in this pass; accessibility compliance is not claimed.

## Verification

Baseline before changes: 58 tests passed and TypeScript typecheck passed. The test runner took about 46 seconds with the default worker behavior; subsequent runs use one worker.

Post-change results:

- `npm.cmd run typecheck`: passed.
- `npm.cmd test -- --maxWorkers=1 --reporter=dot`: passed, 10 files and 60 tests.
- `npm.cmd run lint`: passed.
- `npm.cmd run build`: passed; JavaScript bundle 235.05 kB (72.07 kB gzip), CSS 31.80 kB (7.78 kB gzip).
- `git diff --check`: passed; Git reported only the repository's LF-to-CRLF working-copy notices.

## Limitations

- The random split is not stratified; class balance may differ across partitions.
- Fewer than 10 examples cannot support a separate validation set, so comparison is disabled.
- The data remains an editable synthetic classroom dataset. The test score is an educational check, not an independent external benchmark if a learner uses it repeatedly to guide choices.
- No pre/post accuracy benchmark demonstrates a measured improvement; the implemented improvement is separation of model selection from final test scoring.
- Responsive and assistive-technology checks remain manual.
