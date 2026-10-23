import { fitClassifier } from './classifiers';
import { evaluate } from './metrics';
import { splitData } from './split';
import type { ClassifierConfiguration } from './classifierTypes';
import type { Evaluation, Point } from './types';

export interface CrossModelComparison {
  splitSeed: number;
  trainCount: number;
  testCount: number;
  left: { configuration: ClassifierConfiguration; training: Evaluation; test: Evaluation };
  right: { configuration: ClassifierConfiguration; training: Evaluation; test: Evaluation };
}

export function compareModelsOnSharedSplit(points: Point[], left: ClassifierConfiguration, right: ClassifierConfiguration, splitSeed = 123): CrossModelComparison {
  const split = splitData(points, splitSeed);
  const score = (configuration: ClassifierConfiguration) => {
    const model = fitClassifier(split.train, configuration);
    const predict = (point: Point) => model.predict(point);
    return { configuration, training: evaluate(split.train, predict), test: evaluate(split.test, predict) };
  };
  return { splitSeed, trainCount: split.train.length, testCount: split.test.length, left: score(left), right: score(right) };
}
