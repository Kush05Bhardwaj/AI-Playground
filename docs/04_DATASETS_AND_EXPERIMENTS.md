# Datasets and Experiment Design

## MVP dataset strategy

Use synthetic, generated datasets first. Benefits: predictable labels, instant load, no licensing ambiguity, no personal data, and good control of the concept being taught.

Include only a few high-quality modes:
- **Separated clusters:** clear first-success experience.
- **Overlapping clusters:** demonstrates uncertainty/misclassification.
- **Curved groups (P1):** shows that straight-line intuition is insufficient.
- **Outliers/noisy labels:** demonstrates sensitivity to examples.
- **Imbalanced classes (P1):** demonstrates metric limitations.

Every generator must be seeded so the same seed and parameters create the same dataset. Store the generator name/version, seed, class definitions, and feature ranges in the experiment config.

## CSV upload — later phase only

Before accepting arbitrary CSV:
- show a local preview and require the user to choose feature columns and target label;
- cap file bytes, rows, columns, and cell length;
- reject or safely neutralize formula-like content on CSV export;
- detect missing values, nonnumeric features, constant columns, and high-cardinality labels;
- explain that browser-local processing keeps the file in the browser only if no API or telemetry transmits it;
- do not upload data by default;
- warn users not to use names, student IDs, health data, grades linked to identifiable pupils, or other personal data;
- handle malformed encodings and delimiter edge cases;
- state limitations on data types and missing-value handling.

## Real datasets

If a later release includes public datasets, record source, creator, license/terms, version/date retrieved, feature definitions, preprocessing, target definition, known biases/limitations, and citation. Do not scrape arbitrary websites for classroom datasets or assume public access grants reuse rights.

## Experiment record

An experiment should preserve enough information for repeatability:
- experiment schema version;
- dataset generator/type, seed, point coordinates and labels;
- train/test split seed and strategy;
- algorithm ID/version and hyperparameters;
- optional preprocessing configuration;
- evaluation metrics plus raw confusion counts;
- run timestamp if saved, but no identity fields by default.

## Reproducibility

The same config, data, algorithm version, and split seed should produce the same prediction results. If a future algorithm is randomized, seed it and record the seed. If a browser implementation differs across floating-point behavior, tests should use exact expected classes and sensible numeric tolerances.
