import type { Evaluation, Label, Point } from './types';
export function evaluate(test: Point[], predict: (point: Point) => 'A' | 'B'): Evaluation {
  const matrix: [[number, number], [number, number]] = [[0, 0], [0, 0]];
  const predictions = test.map(point => ({ point, predicted: predict(point) }));
  for (const { point, predicted } of predictions) matrix[point.label === 'A' ? 0 : 1][predicted === 'A' ? 0 : 1]++;
  const total = predictions.length; const correct = matrix[0][0] + matrix[1][1];
  const byClass = {} as Record<Label, Evaluation['byClass'][Label]>;
  for (const [label, row] of [['A', 0], ['B', 1]] as const) {
    const tp = matrix[row][row];
    const support = matrix[row][0] + matrix[row][1];
    const predicted = matrix[0][row] + matrix[1][row];
    const precision = predicted ? tp / predicted : null;
    const recall = support ? tp / support : null;
    byClass[label] = {
      support,
      predicted,
      precision,
      recall,
      f1: precision === null || recall === null || precision + recall === 0
        ? precision === 0 && recall === 0 ? 0 : null
        : 2 * precision * recall / (precision + recall),
    };
  }
  return { accuracy: total ? correct / total : null, matrix, predictions, byClass };
}
