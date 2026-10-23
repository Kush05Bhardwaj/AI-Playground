# Data Model

## Experiment configuration

```json
{
  "schemaVersion": "1.0.0",
  "id": "knn-two-clusters-v1",
  "title": "Can a model separate these groups?",
  "gradeBand": "9-11",
  "seed": 42,
  "featureNames": ["Feature A", "Feature B"],
  "classNames": ["Class A", "Class B"],
  "dataset": {
    "kind": "synthetic-points",
    "generator": "separated-blobs-v1",
    "generatorParams": { "pointsPerClass": 30, "spread": 0.12 },
    "points": []
  },
  "split": { "strategy": "random", "testRatio": 0.25, "seed": 123 },
  "model": { "algorithm": "knn", "k": 5, "distance": "euclidean", "tieBreak": "nearest-then-class-id" },
  "preprocessing": { "scaler": "none" },
  "assumptions": ["Two numeric features", "Synthetic labels", "Small classroom dataset"]
}
```

`points` is empty above to indicate a generated dataset; if points are embedded, include a bounded list of `{id,x,y,label}` items. Do not mix both forms ambiguously: the schema should state whether points are generated or explicit.

## Run result

```json
{
  "recordVersion": 1,
  "experimentId": "knn-two-clusters-v1",
  "algorithmVersion": "knn-ts-0.1.0",
  "split": { "trainCount": 45, "testCount": 15, "seed": 123 },
  "metrics": { "accuracy": 0.8667 },
  "confusionMatrix": {
    "orientation": "rows=true,columns=predicted",
    "labels": ["Class A", "Class B"],
    "counts": [[7, 1], [1, 6]]
  },
  "predictions": [],
  "warnings": []
}
```

Metric values are illustrative only. The application must compute result values from the actual predictions; do not ship fixed sample numbers as live output.

## Validation rules

- All point coordinates must be finite and within supported plotting limits.
- Labels must match configured class IDs.
- IDs are unique within an experiment.
- The model's k must be integer and valid for the train set.
- Test ratio must be within an agreed range and test/train counts must be nonzero for metric display.
- All seeds are integers within supported bounds.
- Bound list sizes and string lengths to prevent UI lockups and memory abuse.

## Storage and export

- Default: in-memory experiments; optional local save only after user action.
- Export JSON contains configuration and results but no student identity.
- CSV export should avoid spreadsheet formula injection by escaping cell values that begin with `=`, `+`, `-`, or `@` where applicable.
- The clear-data action should remove locally saved experiments.
- If schema changes, either migrate explicitly or offer a user-visible “older experiment format” message.
