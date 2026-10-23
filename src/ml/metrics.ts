import type { Evaluation, Point } from './types';
export function evaluate(test: Point[], predict: (point: Point) => 'A' | 'B'): Evaluation {
  const matrix: [[number, number], [number, number]] = [[0, 0], [0, 0]];
  const predictions = test.map(point => ({ point, predicted: predict(point) }));
  for (const { point, predicted } of predictions) matrix[point.label === 'A' ? 0 : 1][predicted === 'A' ? 0 : 1]++;
  const total = predictions.length; const correct = matrix[0][0] + matrix[1][1];
  return { accuracy: total ? correct / total : null, matrix, predictions };
}
