import { evaluate } from './metrics';
import { fitClassifier } from './classifiers';
import { splitData } from './split';
import type { AlgorithmId } from './classifierTypes';
import type { Evaluation, Point } from './types';
import type { Preset } from './datasets';

export interface ExperimentConfiguration {
  label: string;
  preset: Preset;
  points: Point[];
  algorithm: AlgorithmId;
  k: number;
  treeDepth?: number;
  treeMinSamplesSplit?: number;
  splitSeed?: number;
}

export interface ScoredExperiment {
  label: string;
  preset: Preset;
  algorithm: AlgorithmId;
  k: number;
  treeDepth?: number;
  treeMinSamplesSplit?: number;
  splitSeed: number;
  pointCount: number;
  trainCount: number;
  validationCount: number;
  testCount: number;
  training: Evaluation;
  validation: Evaluation;
  validationExamples: Array<Pick<Point, 'id' | 'x' | 'y' | 'label'>>;
}

export interface ExperimentComparison {
  sameDataset: boolean;
  sameEvaluationExamples: boolean;
  current: ScoredExperiment;
  saved: ScoredExperiment;
}

function score(configuration: ExperimentConfiguration): ScoredExperiment {
  const splitSeed = configuration.splitSeed ?? 123;
  const split = splitData(configuration.points, splitSeed);
  if (!split.validationAvailable) throw new Error('At least 10 examples are needed to compare saved settings on a separate validation set.');
  const model = fitClassifier(split.train, configuration.algorithm === 'knn'
    ? { algorithm: 'knn', k: configuration.k }
    : { algorithm: 'decision-tree', maxDepth: configuration.treeDepth ?? 3, minSamplesSplit: configuration.treeMinSamplesSplit ?? 2 });
  const predict = (point: Point) => model.predict(point);
  return {
    label: configuration.label,
    preset: configuration.preset,
    algorithm: configuration.algorithm,
    k: configuration.k,
    ...(configuration.algorithm === 'decision-tree' ? { treeDepth: configuration.treeDepth ?? 3, treeMinSamplesSplit: configuration.treeMinSamplesSplit ?? 2 } : {}),
    splitSeed,
    pointCount: configuration.points.length,
    trainCount: split.train.length,
    validationCount: split.validation.length,
    testCount: split.test.length,
    training: evaluate(split.train, predict),
    validation: evaluate(split.validation, predict),
    validationExamples: split.validation.map(({ id, x, y, label }) => ({ id, x, y, label })),
  };
}

function signature(points: Point[]) {
  return JSON.stringify([...points].sort((a, b) => a.id.localeCompare(b.id)).map(({ id, x, y, label }) => ({ id, x, y, label })));
}

export function compareExperiments(current: ExperimentConfiguration, saved: ExperimentConfiguration): ExperimentComparison {
  const currentScored = score(current);
  const savedScored = score(saved);
  const currentTests = JSON.stringify(currentScored.validationExamples);
  const savedTests = JSON.stringify(savedScored.validationExamples);
  return {
    sameDataset: current.preset === saved.preset && signature(current.points) === signature(saved.points),
    sameEvaluationExamples: currentTests === savedTests && currentScored.splitSeed === savedScored.splitSeed,
    current: currentScored,
    saved: savedScored,
  };
}
