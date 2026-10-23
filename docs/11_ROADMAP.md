# Roadmap and Delivery Plan

## Phase 0 — Lesson and interface validation
- Choose one concept: nearest examples influence a classification.
- Sketch a point canvas and explanation panel.
- Review the activity with a computing/maths teacher.
- Prepare one seeded synthetic dataset.

**Exit gate:** students can describe features, labels, and what “nearest” means at their grade level.

## Phase 1 — k-NN vertical slice
- Implement point schema, class labels, dataset generator and deterministic split.
- Implement and test k-NN in TypeScript.
- Build canvas and accessible point list.
- Render decision boundary from real predictions.
- Show neighbor-level explanation, confusion matrix and accuracy when valid.

**Exit gate:** a learner can make a change and see the model consequence; all displayed values are computed.

## Phase 2 — Guided learning loop
- Add a short guided activity, hint progression and reflection prompts.
- Add dirty-result state, reset and seeded reproducibility.
- Run a small usability and educational QA session.

**Exit gate:** learners can explain one correct and one incorrect prediction with evidence.

## Phase 3 — Decision tree
- Implement pure training/prediction code and unit tests.
- Visualize split rules and prediction path.
- Compare on a shared train/test split.

**Exit gate:** tree visualization and prediction logic agree for test points.

## Phase 4 — Evaluation literacy
- Add imbalanced data, confusion matrix reading, per-class metrics, and warnings.
- Add export/import for experiment configs if useful.
- Test malformed imports, large data and keyboard access.

## Phase 5 — Logistic regression and advanced mode
- Add gradient descent and loss chart with documented settings.
- Add feature scaling and leakage demonstration.
- Consider optional Python/scikit-learn backend only if it adds meaningful educational value.

## Phase 6 — Classroom features (optional)
Only after privacy, security and teacher-workflow requirements are defined: assignments, anonymous session codes, teacher activity packs, or classroom exports.
