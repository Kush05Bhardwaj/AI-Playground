import { evaluate } from './metrics';
import { predictKnn } from './knn';
import { splitData } from './split';
import type { Evaluation, Point } from './types';
import type { Preset } from './datasets';

export interface ExperimentConfiguration {
  label: string;
  preset: Preset;
  points: Point[];
  k: number;
  splitSeed?: number;
}

export interface ScoredExperiment {
  label: string;
  preset: Preset;
  k: number;
  splitSeed: number;
  pointCount: number;
  trainCount: number;
  testCount: number;
  training: Evaluation;
  test: Evaluation;
  testExamples: Array<Pick<Point, 'id' | 'x' | 'y' | 'label'>>;
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
  if (!Number.isInteger(configuration.k) || configuration.k < 1 || configuration.k > split.train.length) {
    throw new Error(`k must be between 1 and ${split.train.length} for ${configuration.label}.`);
  }
  const predict = (point: Point) => predictKnn(point, split.train, configuration.k).label;
  return {
    label: configuration.label,
    preset: configuration.preset,
    k: configuration.k,
    splitSeed,
    pointCount: configuration.points.length,
    trainCount: split.train.length,
    testCount: split.test.length,
    training: evaluate(split.train, predict),
    test: evaluate(split.test, predict),
    testExamples: split.test.map(({ id, x, y, label }) => ({ id, x, y, label })),
  };
}

function signature(points: Point[]) {
  return JSON.stringify([...points].sort((a, b) => a.id.localeCompare(b.id)).map(({ id, x, y, label }) => ({ id, x, y, label })));
}

export function compareExperiments(current: ExperimentConfiguration, saved: ExperimentConfiguration): ExperimentComparison {
  const currentScored = score(current);
  const savedScored = score(saved);
  const currentTests = JSON.stringify(currentScored.testExamples);
  const savedTests = JSON.stringify(savedScored.testExamples);
  return {
    sameDataset: current.preset === saved.preset && signature(current.points) === signature(saved.points),
    sameEvaluationExamples: currentTests === savedTests && currentScored.splitSeed === savedScored.splitSeed,
    current: currentScored,
    saved: savedScored,
  };
}
