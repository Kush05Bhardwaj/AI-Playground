# Suggested Repository Structure

```text
ai-playground/
├── public/assets/               # Self-created or clearly licensed assets only
├── src/
│   ├── app/
│   ├── components/
│   ├── features/
│   │   ├── activity-launcher/
│   │   ├── dataset-builder/
│   │   ├── experiment-controls/
│   │   ├── decision-boundary/
│   │   ├── evaluation/
│   │   └── explanation/
│   ├── ml/
│   │   ├── types.ts
│   │   ├── datasets/
│   │   ├── split.ts
│   │   ├── knn.ts
│   │   ├── decision-tree.ts      # P1
│   │   ├── logistic-regression.ts # P1
│   │   ├── metrics.ts
│   │   └── *.test.ts
│   ├── experiment/
│   ├── storage/
│   ├── accessibility/
│   └── styles/
├── docs/
├── examples/
├── tests/e2e/
├── .github/workflows/ci.yml
├── CONTRIBUTING.md
├── SECURITY.md
├── README.md
├── package.json
└── package-lock.json
```

The ML modules should be importable in a Node test environment without browser globals. Visualization should consume prediction results rather than reimplementing the models.
