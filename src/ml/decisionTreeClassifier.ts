import type { FittedDecisionTreeClassifier, TreeConfiguration } from './classifierTypes';
import { explainTreePrediction, fitDecisionTree } from './decisionTree';
import type { Point } from './types';

export function fitDecisionTreeClassifier(training: Point[], configuration: TreeConfiguration): FittedDecisionTreeClassifier {
  const examples = training.map(point => ({ ...point }));
  const tree = fitDecisionTree(examples, configuration);
  return {
    algorithm: 'decision-tree', configuration: { ...configuration }, training: examples, tree,
    predict: point => explainTreePrediction(tree, point).prediction,
    predictMany: points => points.map(point => explainTreePrediction(tree, point).prediction),
    explain: point => explainTreePrediction(tree, point),
  };
}
