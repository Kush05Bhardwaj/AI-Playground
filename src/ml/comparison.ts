import { evaluate } from './metrics';
import { predictKnn } from './knn';
import { splitData } from './split';
import type { Evaluation, Label, Point } from './types';

export interface KnnComparisonResult {
  k: number;
  training: Evaluation;
  test: Evaluation;
}

export interface KnnComparison {
  split: ReturnType<typeof splitData>;
  splitSeed: number;
  results: [KnnComparisonResult, KnnComparisonResult];
}

export function compareKnnConfigurations(
  points: Point[],
  kValues: [number, number],
  splitSeed = 123,
): KnnComparison {
  if (kValues.some(k => !Number.isInteger(k) || k < 1)) {
    throw new Error('Each k value must be a positive integer.');
  }
  const split = splitData(points, splitSeed);
  const results = kValues.map(k => {
    if (k > split.train.length) throw new Error(`k must not exceed the ${split.train.length} training examples.`);
    const predict = (point: Point): Label => predictKnn(point, split.train, k).label;
    return {
      k,
      training: evaluate(split.train, predict),
      test: evaluate(split.test, predict),
    };
  }) as [KnnComparisonResult, KnnComparisonResult];
  return { split, splitSeed, results };
}
