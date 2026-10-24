import { fitClassifier } from './classifiers';
import { evaluate } from './metrics';
import { splitData } from './split';
import type { ClassifierConfiguration } from './classifierTypes';
import type { Evaluation, Point } from './types';

export interface CrossModelComparison {
  splitSeed: number;
  trainCount: number;
  testCount: number;
  validationCount: number;
  left: { configuration: ClassifierConfiguration; training: Evaluation; validation: Evaluation };
  right: { configuration: ClassifierConfiguration; training: Evaluation; validation: Evaluation };
}

export function compareModelsOnSharedSplit(points: Point[], left: ClassifierConfiguration, right: ClassifierConfiguration, splitSeed = 123): CrossModelComparison {
  const split = splitData(points, splitSeed);
  if (!split.validationAvailable) throw new Error('At least 10 examples are needed to compare models on a separate validation set.');
  const score = (configuration: ClassifierConfiguration) => {
    const model = fitClassifier(split.train, configuration);
    const predict = (point: Point) => model.predict(point);
    return { configuration, training: evaluate(split.train, predict), validation: evaluate(split.validation, predict) };
  };
  return { splitSeed, trainCount: split.train.length, validationCount: split.validation.length, testCount: split.test.length, left: score(left), right: score(right) };
}
