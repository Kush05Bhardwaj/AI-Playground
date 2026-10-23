import { describe, expect, it } from 'vitest';
import { explainTreePrediction, fitDecisionTree, predictTree } from './decisionTree';
import type { Point } from './types';

const line: Point[] = [
  { id: 'a0', x: .1, y: .1, label: 'A' },
  { id: 'a1', x: .2, y: .8, label: 'A' },
  { id: 'a2', x: .3, y: .4, label: 'A' },
  { id: 'b0', x: .7, y: .2, label: 'B' },
  { id: 'b1', x: .8, y: .7, label: 'B' },
  { id: 'b2', x: .9, y: .5, label: 'B' },
];

describe('decision tree classifier', () => {
  it('chooses a deterministic weighted-Gini split and predicts from that learned node', () => {
    const tree = fitDecisionTree(line, { algorithm: 'decision-tree', maxDepth: 1, minSamplesSplit: 2 });
    expect(tree.kind).toBe('split');
    if (tree.kind !== 'split') return;
    expect(tree.feature).toBe('x');
    expect(tree.threshold).toBeCloseTo(.5);
    expect(tree.impurity).toBeCloseTo(.5);
    expect(tree.gain).toBeCloseTo(.5);
    expect(predictTree(tree, { x: .4, y: .5 })).toBe('A');
    expect(predictTree(tree, { x: .6, y: .5 })).toBe('B');
    expect(fitDecisionTree(line, { algorithm: 'decision-tree', maxDepth: 1, minSamplesSplit: 2 })).toEqual(tree);
  });

  it('returns the actual sequence of threshold decisions and leaf training counts', () => {
    const tree = fitDecisionTree(line, { algorithm: 'decision-tree', maxDepth: 2, minSamplesSplit: 2 });
    const explanation = explainTreePrediction(tree, { x: .8, y: .4 });
    expect(explanation.prediction).toBe(predictTree(tree, { x: .8, y: .4 }));
    expect(explanation.path.length).toBeGreaterThan(0);
    for (const step of explanation.path) expect(step.direction).toBe(step.value < step.threshold ? 'left' : 'right');
    expect(explanation.leaf.sampleCount).toBe(explanation.leaf.counts.A + explanation.leaf.counts.B);
    expect(explanation.prediction).toBe(explanation.leaf.prediction);
  });

  it('respects depth zero, pure nodes, and deterministic majority ties', () => {
    const zeroDepth = fitDecisionTree(line, { algorithm: 'decision-tree', maxDepth: 0, minSamplesSplit: 2 });
    expect(zeroDepth.kind).toBe('leaf');
    if (zeroDepth.kind === 'leaf') { expect(zeroDepth.prediction).toBe('A'); expect(zeroDepth.counts).toEqual({ A: 3, B: 3 }); }
    const pure = fitDecisionTree(line.slice(0, 3), { algorithm: 'decision-tree', maxDepth: 8, minSamplesSplit: 2 });
    expect(pure.kind).toBe('leaf');
    if (pure.kind === 'leaf') expect(pure.prediction).toBe('A');
  });

  it('stops on identical coordinates with conflicting labels and on duplicate points', () => {
    const identical: Point[] = [
      { id: 'a1', x: .5, y: .5, label: 'A' }, { id: 'b1', x: .5, y: .5, label: 'B' },
      { id: 'a2', x: .5, y: .5, label: 'A' }, { id: 'b2', x: .5, y: .5, label: 'B' },
    ];
    const tree = fitDecisionTree(identical, { algorithm: 'decision-tree', maxDepth: 8, minSamplesSplit: 2 });
    expect(tree.kind).toBe('leaf');
    if (tree.kind === 'leaf') { expect(tree.sampleCount).toBe(4); expect(tree.prediction).toBe('A'); expect(tree.counts).toEqual({ A: 2, B: 2 }); }
  });

  it('rejects empty training, invalid thresholds, depth, and split limits', () => {
    expect(() => fitDecisionTree([], { algorithm: 'decision-tree', maxDepth: 2, minSamplesSplit: 2 })).toThrow(/empty/);
    expect(() => fitDecisionTree(line, { algorithm: 'decision-tree', maxDepth: -1, minSamplesSplit: 2 })).toThrow(/depth/);
    expect(() => fitDecisionTree(line, { algorithm: 'decision-tree', maxDepth: 9, minSamplesSplit: 2 })).toThrow(/depth/);
    expect(() => fitDecisionTree(line, { algorithm: 'decision-tree', maxDepth: 2, minSamplesSplit: 1 })).toThrow(/Minimum samples/);
    expect(() => explainTreePrediction(fitDecisionTree(line, { algorithm: 'decision-tree', maxDepth: 1, minSamplesSplit: 2 }), { x: Number.NaN, y: .5 })).toThrow(/finite/);
  });
});
