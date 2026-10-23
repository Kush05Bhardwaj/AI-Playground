# Product Requirements Document (PRD)

## 1. Summary

AI Playground provides a tactile, visual introduction to machine learning. Learners build a small dataset, choose labels, train a simple model, and test it. The interface links every prediction and visual boundary to actual algorithm behavior.

## 2. Problem statement

Many school students encounter AI as a chatbot or a mysterious black box. This project lets them inspect a narrower but foundational question: how does a model learn a relationship from labeled examples, and why does it make mistakes?

## 3. Audience

- **Core:** Classes 9-12, roughly ages 14-18 depending on school placement.
- **Introductory adaptation:** Classes 8-9 can explore labels, examples, similarity, and simple rules with guided mode.
- **Facilitators:** computing, maths, science teachers and STEM clubs.
- **Device context:** ordinary school laptop or desktop browser; no GPU and no software installation required.

## 4. User needs

- I want to see how examples influence a model.
- I want to change the data and observe how predictions change.
- I want to know why a particular point was classified a certain way.
- I want to understand accuracy and mistakes rather than only see a score.
- I want to compare two experiments fairly.
- A teacher needs a reliable activity and debrief questions that fit a short class period.

## 5. Product goals

1. Meaningful first action in less than 60 seconds.
2. At least one model is trained using actual algorithm logic, not a canned animation.
3. Every displayed metric is computed from explicit predictions and a documented split.
4. The student can inspect both a correct and incorrect prediction when the dataset supports them.
5. All core activity works locally with no sign-up, external AI API, or personal data collection.

## 6. Non-goals

- Teaching all of AI/ML in one application.
- Replacing Python, mathematics, or proper model evaluation at higher levels.
- Training large neural networks or processing private/student-identifying data.
- Claiming that a toy demo is a scientific benchmark.
- Giving students an unbounded natural-language interface to external tools.

## 7. MVP requirements

### P0 — release blocker
- R1: launch a sample experiment without login.
- R2: display labeled points on a 2D feature plane.
- R3: allow add-point and label selection; allow delete/reset.
- R4: generate deterministic built-in datasets using a seed.
- R5: implement actual k-nearest-neighbors prediction in TypeScript.
- R6: expose `k`, distance function, and tie policy (with safe defaults).
- R7: generate a decision-boundary grid from real model predictions.
- R8: keep train and test samples separate; fit/predict workflow is explicit.
- R9: show confusion matrix, test count, class labels, and correct/incorrect examples.
- R10: explain each prediction using nearest neighbors.
- R11: allow reset and repeat under a changed configuration.
- R12: show the limits of the demo and define features/labels in plain language.
- R13: write algorithm unit tests against hand-calculated examples.
- R14: support keyboard-accessible controls and a non-color-only label distinction.

### P1 — after MVP validation
- Decision tree with depth control and readable split rules.
- Logistic regression with training-loss/decision-boundary visualization.
- Compare two algorithms on the same split.
- Train/test split seed control and cross-validation concept module.
- Guided missions and teacher activity sheets.
- Export synthetic experiment config and results as JSON/CSV.

### P2 — later exploration
- Optional Python/scikit-learn engine for advanced modules.
- User-uploaded CSV with schema preview, size limits, local-first processing, and privacy review.
- Clustering, regression, neural-network playground, explainability modules.
- Accounts/classroom assignments only with a clear and reviewed need.

## 8. Core user journey

1. Open “Can a model separate these two groups?”
2. Explore a sample dataset and inspect the features/labels.
3. Select k-NN and choose `k`.
4. Train/run the model.
5. See the decision boundary and test metrics.
6. Click a misclassified point to inspect nearby neighbors.
7. Add an example or change `k`, rerun, and compare.
8. Answer a reflection prompt about why the result changed.

## 9. Success metrics

- time to first model run;
- proportion of learners completing a second experiment;
- proportion accurately explaining that changing examples or `k` can alter predictions;
- whether students can read a confusion matrix at an age-appropriate level;
- algorithm correctness in deterministic tests;
- usability with keyboard and assistive technology;
- performance on low-spec devices.

Do not use time-on-site or leaderboard rank as the main measure of learning.

## 10. Key assumptions/open questions

- The first demo uses two classes and two numeric features to keep plotting intuitive.
- Built-in synthetic data will be more reliable for the first interaction than arbitrary CSV upload.
- A teacher should review vocabulary and lesson timing before formal classroom use.
- Decide how much mathematical detail to expose by grade band after quick usability tests.
