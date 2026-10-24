import { evaluate } from './metrics';
import { predictKnn } from './knn';
import { splitData } from './split';
import type { Evaluation, Label, Point } from './types';

export interface KnnComparisonResult {
  k: number;
  training: Evaluation;
  validation: Evaluation;
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
    if (!split.validationAvailable) throw new Error('At least 10 examples are needed to compare settings on a separate validation set.');
    const predict = (point: Point): Label => predictKnn(point, split.train, k).label;
    return {
      k,
      training: evaluate(split.train, predict),
      validation: evaluate(split.validation, predict),
    };
  }) as [KnnComparisonResult, KnnComparisonResult];
  return { split, splitSeed, results };
}
