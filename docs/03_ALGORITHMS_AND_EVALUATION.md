# Algorithms and Evaluation Specification

## Non-negotiable rule

Each algorithm must be implemented as a testable module and the visualization must call that module. Never draw a hand-authored decision boundary that merely looks plausible.

## MVP algorithm: k-nearest neighbors (k-NN)

### Inputs
- training points `X_train`, each with exactly two numeric features for the MVP;
- labels `y_train`, drawn from a versioned list of class IDs;
- integer `k` with `1 <= k <= number of training examples`;
- distance metric: Euclidean for MVP;
- tie policy: stable deterministic rule, such as total vote count then nearest individual neighbor, then stable class ID order. Document the chosen rule.

### Prediction flow
1. Validate that input features are finite and dimension-compatible.
2. Compute distance from query point to each training point.
3. Sort by distance with a stable tie-break.
4. Take the first `k` neighbors.
5. Count votes by label.
6. Apply the documented tie policy.
7. Return predicted class plus explanation metadata (neighbors, distances, votes).

### Complexity
Naive training storage is O(n·d); prediction is O(n·d) distance work plus O(n log n) sorting if sorting every point. This is acceptable for small classroom datasets. For larger sets, use selection/partial sorting; do not prematurely add a complex index.

### Feature scaling
Distance-based algorithms are sensitive to feature scales. The MVP may normalize generated datasets to a shared range. If arbitrary data or dissimilar scales are allowed later, implement a train-only scaler and apply it identically to train and test. Explain that fitting preprocessing on all data leaks information from the test set.

## Decision boundary

- Define a bounded grid in the plotted feature coordinate system.
- For each grid location, call the actual `predict` method.
- Cache only if model version, training data, grid resolution, and parameters match.
- Render each grid cell using the predicted class, but keep class shape/icon labels available for color-blind users.
- Make grid resolution configurable for performance; do not confuse pixel interpolation with actual prediction points.

## Train/test evaluation

- Split data before fitting any learned preprocessing.
- Keep the test set out of training, neighbor lookup, feature scaling fit, hyperparameter selection, and visual model editing.
- Provide deterministic split seeds.
- Display train/test counts and split method.
- For the initial synthetic point-builder, allow the user to create points then freeze the split for an experiment. Adding points should trigger a visible warning that the experiment has changed and a rerun is required.
- Never silently score training points as a substitute for test performance.

## Metrics

### Confusion matrix
For two classes, document row/column orientation explicitly: rows are true labels, columns are predicted labels, or vice versa—pick one and show labels on axes.

### Accuracy
`correct predictions / all evaluated predictions`. If no evaluated predictions exist, show N/A, never 0% or 100%.

### Optional P1 metrics
Precision, recall, and F1 per class. Clearly state the averaging method and how zero denominators are handled. Do not use only aggregate accuracy for imbalanced datasets.

## P1 algorithm: decision tree

- Use a small CART-style classification tree.
- Candidate split thresholds are derived from sorted training feature values only.
- Choose split minimizing weighted impurity (Gini is the simplest initial criterion).
- Expose `maxDepth` and possibly `minSamplesLeaf`.
- Stop on pure node, depth limit, too few points, or no valid gain.
- Generate prediction by traversing the trained tree and expose the path as explanation metadata.
- Tree training must use only the training partition.
- Unit-test a tiny dataset whose split can be calculated by hand.

## P1 algorithm: logistic regression

- Two-class binary classifier with sigmoid probability and gradient descent.
- Document feature scaling, learning rate, epoch count, initialization/seed, and loss function.
- Plot loss by epoch and decision boundary from current weights.
- Clamp or stabilize computations to avoid numeric overflow.
- Do not call a raw score a calibrated probability unless calibration is evaluated.

## Comparison rules

- Compare models on the same fixed train/test split.
- Show algorithm and parameter settings.
- Do not rank models on a tiny test set without a caveat.
- Keep test results unchanged during parameter tuning only if the learner is not using the test result to make choices; otherwise describe the result as exploratory rather than an unbiased final evaluation.

## Key references

Use the official scikit-learn user guide for definitions and implementation cross-checks. Its common pitfalls guide discusses data leakage and fitting preprocessing only on the training subset: https://scikit-learn.org/stable/common_pitfalls.html
