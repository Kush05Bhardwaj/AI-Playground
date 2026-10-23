import type { DecisionTreeNode, TreeConfiguration, TreeCounts, TreeExplanation, TreeLeafNode, TreeSplitNode, TreeStep } from './classifierTypes';
import type { Label, Point } from './types';

const labels: Label[] = ['A', 'B'];
const countLabels = (points: Point[]): TreeCounts => ({ A: points.filter(point => point.label === 'A').length, B: points.filter(point => point.label === 'B').length });
const gini = (counts: TreeCounts, total: number) => total ? 1 - (counts.A / total) ** 2 - (counts.B / total) ** 2 : 0;

export function validateTreeConfiguration(configuration: TreeConfiguration) {
  if (!Number.isInteger(configuration.maxDepth) || configuration.maxDepth < 0 || configuration.maxDepth > 8) throw new Error('Maximum tree depth must be an integer from 0 to 8.');
  if (!Number.isInteger(configuration.minSamplesSplit) || configuration.minSamplesSplit < 2 || configuration.minSamplesSplit > 1000) throw new Error('Minimum samples to split must be an integer from 2 to 1000.');
}

function validateTraining(points: Point[]) {
  if (!Array.isArray(points) || points.length === 0) throw new Error('Decision tree training data is empty.');
  if (points.length > 1000) throw new Error('Decision tree supports at most 1000 training examples.');
  if (points.some(point => !point || !Number.isFinite(point.x) || !Number.isFinite(point.y) || point.x < 0 || point.x > 1 || point.y < 0 || point.y > 1 || !labels.includes(point.label))) throw new Error('Decision tree training data contains an invalid point.');
}

interface Candidate { feature: 'x' | 'y'; threshold: number; impurity: number; gain: number; left: Point[]; right: Point[] }
function bestSplit(points: Point[], parentImpurity: number, minimum: number): Candidate | null {
  let best: Candidate | null = null;
  for (const feature of ['x', 'y'] as const) {
    const values = [...new Set(points.map(point => point[feature]))].sort((a, b) => a - b);
    for (let index = 0; index < values.length - 1; index++) {
      const low = values[index]!; const high = values[index + 1]!;
      if (low === high) continue;
      const threshold = low + (high - low) / 2;
      const left = points.filter(point => point[feature] < threshold);
      const right = points.filter(point => point[feature] >= threshold);
      if (left.length < minimum || right.length < minimum) continue;
      const leftImpurity = gini(countLabels(left), left.length);
      const rightImpurity = gini(countLabels(right), right.length);
      const impurity = left.length / points.length * leftImpurity + right.length / points.length * rightImpurity;
      const gain = parentImpurity - impurity;
      if (!best || impurity < best.impurity - 1e-12) best = { feature, threshold, impurity, gain, left, right };
    }
  }
  return best && best.gain > 1e-12 ? best : null;
}

function majority(counts: TreeCounts): Label { return counts.A >= counts.B ? 'A' : 'B'; }

export function fitDecisionTree(points: Point[], configuration: TreeConfiguration): DecisionTreeNode {
  validateTraining(points);
  validateTreeConfiguration(configuration);
  let leafIndex = 0;
  function grow(examples: Point[], depth: number, id: string): DecisionTreeNode {
    const counts = countLabels(examples);
    const impurity = gini(counts, examples.length);
    const leaf: TreeLeafNode = { kind: 'leaf', id: `leaf-${leafIndex++}`, depth, sampleCount: examples.length, counts, prediction: majority(counts) };
    if (depth >= configuration.maxDepth || impurity === 0 || examples.length < configuration.minSamplesSplit) return leaf;
    const split = bestSplit(examples, impurity, 1);
    if (!split) return leaf;
    const left = grow(split.left, depth + 1, `${id}L`);
    const right = grow(split.right, depth + 1, `${id}R`);
    const node: TreeSplitNode = { kind: 'split', id, depth, sampleCount: examples.length, counts, feature: split.feature, threshold: split.threshold, impurity, gain: split.gain, left, right };
    return node;
  }
  return grow(points, 0, 'root');
}

export function explainTreePrediction(tree: DecisionTreeNode, point: Pick<Point, 'x' | 'y'>): TreeExplanation {
  if (!Number.isFinite(point.x) || !Number.isFinite(point.y)) throw new Error('Query coordinates must be finite.');
  const path: TreeStep[] = [];
  let node = tree;
  while (node.kind === 'split') {
    const value = point[node.feature];
    const direction = value < node.threshold ? 'left' : 'right';
    path.push({ nodeId: node.id, feature: node.feature, threshold: node.threshold, value, direction, sampleCount: node.sampleCount });
    node = direction === 'left' ? node.left : node.right;
  }
  return { kind: 'decision-tree', prediction: node.prediction, path, leaf: node };
}

export function predictTree(tree: DecisionTreeNode, point: Pick<Point, 'x' | 'y'>): Label {
  return explainTreePrediction(tree, point).prediction;
}
