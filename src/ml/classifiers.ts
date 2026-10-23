import { fitDecisionTreeClassifier } from './decisionTreeClassifier';
import { fitKnnClassifier } from './knnClassifier';
import type { ClassifierConfiguration, ClassifierDefinition, FittedClassifier, KnnConfiguration, TreeConfiguration } from './classifierTypes';
import type { Point } from './types';

export const classifierDefinitions: Array<ClassifierDefinition> = [
  { id: 'knn', name: 'k-Nearest Neighbors', capabilities: { batchPrediction: true, explanation: 'nearest-neighbors', decisionRegions: true }, defaultConfiguration: { algorithm: 'knn', k: 5 } },
  { id: 'decision-tree', name: 'Decision Tree', capabilities: { batchPrediction: true, explanation: 'decision-path', decisionRegions: true }, defaultConfiguration: { algorithm: 'decision-tree', maxDepth: 3, minSamplesSplit: 2 } },
];

export function fitClassifier(training: Point[], configuration: ClassifierConfiguration): FittedClassifier {
  if (configuration.algorithm === 'knn') return fitKnnClassifier(training, configuration as KnnConfiguration);
  return fitDecisionTreeClassifier(training, configuration as TreeConfiguration);
}
