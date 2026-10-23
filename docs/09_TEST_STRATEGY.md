# Test Strategy

## Algorithm unit tests

### k-NN
- Correct nearest neighbor for a known hand-calculated set.
- Correct majority vote for odd and even k values.
- Stable tie behavior across repeated runs.
- `k=1`, `k=trainCount`, and invalid k.
- Empty train set, mismatched dimensions, unknown labels, NaN/infinity, duplicate coordinates.
- Distance values and predicted class remain consistent when point insertion order changes except where the documented tie-break intentionally depends on a stable ID.

### Train/test split
- Deterministic for same seed.
- Changes appropriately for different seeds.
- No point appears in both partitions.
- Every point appears exactly once across train and test.
- Split ratios/counts are correct within rounding rules.
- If stratification is supported, class counts follow documented constraints.

### Evaluation
- Confusion matrix orientation is correct.
- Accuracy equals exact correct count divided by test count.
- No test predictions yields N/A, not a fabricated number.
- Incorrect label order cannot silently swap matrix axes.
- Metrics consume predictions and true labels and never re-train the model.

### Decision boundary
- Grid points are passed through actual prediction function.
- Grid and model parameter changes invalidate cached results.
- Rendering approximation does not affect reported evaluation metrics.

## Integration and E2E
- Open a built-in activity and run a model without login.
- Add a point, rerun, and verify metrics update.
- Change k, rerun, and inspect neighbor explanation.
- Verify stale results are clearly marked before rerun.
- Export and import a valid experiment (if export/import is in scope).
- Keyboard-only flow through label selection, model controls, run and results.

## Educational QA
- Ask a teacher to check feature/label language, train/test terminology, metric interpretation, and expected misconceptions.
- Give learners a small activity and ask them to explain one correct and one incorrect prediction.
- Ensure activity text does not claim real-world performance from a toy dataset.

## CI quality gates
- Strict TypeScript check; lint; unit tests; production build.
- Use deterministic seeds in algorithm tests.
- Test algorithm code separately from canvas rendering.
- Do not replace failing algorithm tests with snapshots or forced values.
