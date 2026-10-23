import { predictKnn } from './knn';
import type { FittedKnnClassifier, KnnConfiguration } from './classifierTypes';
import type { Point } from './types';

export function fitKnnClassifier(training: Point[], configuration: KnnConfiguration): FittedKnnClassifier {
  if (!training.length) throw new Error('Training set is empty.');
  if (!Number.isInteger(configuration.k) || configuration.k < 1 || configuration.k > training.length) throw new Error(`k must be an integer from 1 to ${training.length}.`);
  const examples = training.map(point => ({ ...point }));
  return {
    algorithm: 'knn', configuration: { ...configuration }, training: examples,
    predict: point => predictKnn(point, examples, configuration.k).label,
    predictMany: points => points.map(point => predictKnn(point, examples, configuration.k).label),
    explain: point => ({ kind: 'knn', prediction: predictKnn(point, examples, configuration.k) }),
  };
}
