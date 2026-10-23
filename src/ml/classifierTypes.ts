import type { Label, Point, Prediction } from './types';

export type AlgorithmId = 'knn' | 'decision-tree';
export interface KnnConfiguration { algorithm: 'knn'; k: number }
export interface TreeConfiguration { algorithm: 'decision-tree'; maxDepth: number; minSamplesSplit: number }
export type ClassifierConfiguration = KnnConfiguration | TreeConfiguration;

export interface TreeCounts { A: number; B: number }
export interface TreeLeafNode { kind: 'leaf'; id: string; depth: number; sampleCount: number; counts: TreeCounts; prediction: Label }
export interface TreeSplitNode { kind: 'split'; id: string; depth: number; sampleCount: number; counts: TreeCounts; feature: 'x' | 'y'; threshold: number; impurity: number; gain: number; left: DecisionTreeNode; right: DecisionTreeNode }
export type DecisionTreeNode = TreeLeafNode | TreeSplitNode;

export interface KnnExplanation { kind: 'knn'; prediction: Prediction }
export interface TreeStep { nodeId: string; feature: 'x' | 'y'; threshold: number; value: number; direction: 'left' | 'right'; sampleCount: number }
export interface TreeExplanation { kind: 'decision-tree'; prediction: Label; path: TreeStep[]; leaf: TreeLeafNode }
export type ModelExplanation = KnnExplanation | TreeExplanation;

export interface FittedKnnClassifier {
  algorithm: 'knn';
  configuration: KnnConfiguration;
  training: Point[];
  predict(point: Pick<Point, 'x' | 'y'>): Label;
  predictMany(points: Array<Pick<Point, 'x' | 'y'>>): Label[];
  explain(point: Pick<Point, 'x' | 'y'>): KnnExplanation;
}

export interface FittedDecisionTreeClassifier {
  algorithm: 'decision-tree';
  configuration: TreeConfiguration;
  training: Point[];
  tree: DecisionTreeNode;
  predict(point: Pick<Point, 'x' | 'y'>): Label;
  predictMany(points: Array<Pick<Point, 'x' | 'y'>>): Label[];
  explain(point: Pick<Point, 'x' | 'y'>): TreeExplanation;
}

export type FittedClassifier = FittedKnnClassifier | FittedDecisionTreeClassifier;
export interface ClassifierCapabilities { batchPrediction: true; explanation: 'nearest-neighbors' | 'decision-path'; decisionRegions: true }
export interface ClassifierDefinition<C extends ClassifierConfiguration = ClassifierConfiguration> {
  id: C['algorithm'];
  name: string;
  capabilities: ClassifierCapabilities;
  defaultConfiguration: C;
}
