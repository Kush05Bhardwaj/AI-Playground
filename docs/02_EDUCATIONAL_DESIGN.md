# Educational Design

## Core loop

**Observe data → make a prediction → train or change the model → test on unseen examples → inspect mistakes → revise the hypothesis.**

## Learning outcomes

A learner should be able to:
1. Explain the difference between a feature (input) and label (target).
2. Explain that a model uses patterns in examples to make predictions.
3. Explain k-NN in plain language: nearby labeled examples influence the new point's predicted class.
4. Describe why changing `k`, data distribution, or noisy labels can change predictions.
5. Distinguish training data from test data.
6. Read a small confusion matrix and interpret correct vs incorrect predictions.
7. Recognize that accuracy can be misleading with imbalanced data or an unrepresentative test set.
8. State that a model's performance on a synthetic classroom dataset does not automatically transfer to real-world tasks.

## Grade bands

| Band | Learning target | UI treatment | Optional depth |
|---|---|---|---|
| Classes 8-9 | examples, categories, similarity, features | guided two-color/symbol dataset and short prompts | avoid formula-first explanation |
| Classes 10-11 | train/test split, k-NN, decision boundaries, metrics | adjustable `k`, confusion matrix, neighbor distances | distance formula and feature scaling concept |
| Class 12 | bias/variance intuition, decision trees, logistic regression, leakage, class imbalance | model-comparison mode and evaluation choices | equations, optimization, cross-validation caveats |

Confirm local syllabus alignment with a teacher; these bands are suggested learning design, not formal board certification.

## Guided lab activities

### Activity A — What counts as similar?
Start with well-separated synthetic groups. Ask students to predict the class of a new point before the model does. Show its nearest examples and compare the prediction.

### Activity B — Does `k` matter?
Use a point near a class boundary. Change `k` from a very small odd value to a larger value and observe whether the majority label changes. Explain that larger `k` can smooth noisy local patterns but may blur small groups.

### Activity C — Add a misleading example
Add one wrongly labeled or outlier point. Observe what happens near it. Discuss label quality and noisy examples.

### Activity D — Test set matters
Generate a fixed train/test split, then compare the score to a new split. Explain why a metric can change just because the sampled test examples differ. In advanced mode, discuss why repeatedly tuning on the test set makes the test result less independent.

### Activity E — Accuracy trap (P1)
Use a deliberately imbalanced synthetic dataset. Compare accuracy with per-class recall or a confusion matrix; demonstrate that a model can be “accurate” while missing a minority class.

## Feedback requirements

- Explain a prediction using the actual nearest examples or path through a tree.
- On error, state what was predicted and what the known label is, without shaming the learner.
- If no test set exists or is too small, say “not enough test examples” rather than showing a misleading metric.
- Display sample counts next to scores.
- Never suggest that a particular model is objectively “best” without naming the evaluation goal and data.

## Teacher facilitation

Each lab should include: target concept, setup, 5-minute exploration, 5-minute challenge, 3 reflection questions, expected misconceptions, and an extension. For the MVP, ship at least two complete lab scripts rather than a large menu of empty lesson cards.
