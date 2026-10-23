# Safety, Privacy, Accessibility, and Responsible AI

## Student privacy

- No login is required for the MVP.
- Do not use student names, school IDs, grades, photos, voice, location, or other identifiers in the core activity.
- Run the algorithms in the browser and do not upload data automatically.
- Do not include advertising, behavioral profiling, social features, or public child leaderboards.
- If accounts, analytics, teacher classes, or cloud saves are added, conduct a privacy/legal review for every target jurisdiction and obtain appropriate school/guardian permissions.
- Provide a clear local-data reset/export path.

## Responsible AI/ML explanation

- State that toy datasets are designed examples; accuracy on them is not evidence of real-world utility.
- Explain that labels can be noisy or biased and that a model learns patterns in its examples.
- Avoid presenting model output as objective truth.
- Do not use real sensitive datasets in default activities.
- If an LLM explanation is introduced later, do not let it override calculated metrics or invent an explanation unsupported by model metadata.

## Accessibility

- Keyboard operability and visible focus for all core controls.
- Canvas alternatives through point lists, forms, accessible table of predictions, and text summaries.
- Color-independent class distinction using shapes/labels/patterns.
- Screen-reader announcements for completion and validation feedback.
- Contrast-safe chart labels and logical reading order.
- Reduced-motion option.
- Responsive interface and zoom support.

## Security

- No arbitrary code, notebook execution, pickle loading, or external URL fetch in MVP.
- Validate all local imported experiment JSON if import/export is added.
- Cap datasets and computation to prevent browser lockups.
- Avoid loading third-party datasets without checking source and permissions.
- Maintain lockfile and dependency scanning in CI.

## Inclusive learning

- Let learners explore before introducing scores.
- Explain terminology on demand.
- Avoid ranking students publicly.
- Make failure informative and reversible.
- Provide both plain-language and optional mathematical explanations.
