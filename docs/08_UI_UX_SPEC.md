# UI/UX Specification

## Screen 1 — Activity launcher
- Start with one featured challenge, not a wall of cards.
- Show expected time, grade band, and target concept.
- Include a no-login “Start experimenting” button.

## Screen 2 — Experiment canvas

Suggested layout:
- Centre: coordinate plane with points and optional decision boundary.
- Left panel: dataset, class labels, feature names, add-point tool.
- Right panel: algorithm selector, hyperparameters and Run button.
- Bottom panel: train/test counts, confusion matrix, metric and explanation.
- Top: activity objective, reset, undo where supported, and accessible help.

## Point interactions
- Click or tap to add a point using the currently selected class label.
- Select a point to inspect label, coordinates, split, and (after prediction) result.
- Provide a keyboard-accessible alternative through a data table/form; do not make the canvas the only way to edit points.
- Use distinct shapes/patterns as well as colors for class identity.
- Clearly indicate train points vs test points without relying only on opacity or color.

## Training flow
1. Pre-run: show dataset and current parameters.
2. Run: announce that the model is computing; prevent duplicate conflicting runs.
3. Complete: update boundary, predictions and metrics from the same run ID/config hash.
4. Dirty state: if data or parameters change, mark prior results stale with “Run again” and do not continue displaying old metrics as current.

## Explanation panel
For k-NN, show:
- query point and predicted class;
- nearest neighbors with labels and distance;
- vote counts;
- tie handling if relevant;
- true label only when the point belongs to the test set with a known label.

For a decision tree, show the path of feature comparisons. For logistic regression, show the model's score/probability caveat and current coefficients in advanced mode.

## Accessibility and visual design
- Provide keyboard navigation, visible focus, semantic buttons, and live announcements for training completion.
- Provide a table/list view of point data and predictions as an accessible alternative to the canvas.
- Use readable axis labels and tick values; label features rather than leaving “X/Y” unexplained in guided activities.
- Offer a simpler display and optional advanced panel for equations.
- Respect reduced motion; avoid animated flashing decision regions.
- Ensure contrast and class identification do not depend on color alone.

## Design direction
Use a clean scientific workbench aesthetic: crisp axes, visible data points, subtle grid, clear status states, concise panels. Prioritize understandable data over a futuristic theme that obscures the plot.
