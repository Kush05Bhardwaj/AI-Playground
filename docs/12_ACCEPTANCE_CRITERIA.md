# Acceptance Criteria / Definition of Done

## Student flow

- [ ] Student can launch a built-in experiment without an account.
- [ ] Features and class labels are explained.
- [ ] Student can add or remove points with mouse/touch and an accessible alternative.
- [ ] k-NN is an actual algorithm implementation with deterministic documented tie behavior.
- [ ] k is validated against training-set size.
- [ ] Decision-boundary grid calls the real predictor.
- [ ] Train/test membership is visible and no point appears in both.
- [ ] Confusion matrix orientation and class labels are explicit.
- [ ] Metrics are computed from held-out predictions or shown as N/A.
- [ ] Student can inspect nearest neighbors for a prediction.
- [ ] Data/model changes mark old results stale until rerun.
- [ ] App states that synthetic-demo performance does not establish real-world performance.

## Engineering

- [ ] Algorithm engine imports no UI, DOM, or plotting libraries.
- [ ] Tests cover known predictions, ties, split determinism, confusion matrix, invalid values and empty sets.
- [ ] Seeded generators reproduce the same points for the same config.
- [ ] Computation is bounded and does not freeze a typical school laptop for supported data sizes.
- [ ] No external API or student data transfer is required for core features.
- [ ] Keyboard focus, accessible canvas alternatives and status announcements work.
- [ ] CI runs lint, typecheck, tests, and build.

## Educational QA

- [ ] Teacher reviews content and metric explanations.
- [ ] Students can identify why a chosen prediction occurred.
- [ ] At least one example includes a meaningful model mistake.
- [ ] The activity prompts students to compare experiments rather than pursue a score alone.
