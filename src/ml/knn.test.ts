import { describe, expect, it } from 'vitest';
import { predictKnn } from './knn';
import { splitData } from './split';
import { evaluate } from './metrics';
import { makeDataset } from './datasets';
import type { Point } from './types';
const points: Point[] = [{ id: 'a', x: 0, y: 0, label: 'A' }, { id: 'b', x: 1, y: 0, label: 'B' }];
describe('k-NN', () => {
  it('predicts from nearest labels and returns distances', () => { expect(predictKnn({ x: 0.1, y: 0 }, points, 1).label).toBe('A'); expect(predictKnn({ x: 0.1, y: 0 }, points, 1).neighbors[0]!.distance).toBeCloseTo(0.1); });
  it('breaks equal vote by nearest neighbor', () => { expect(predictKnn({ x: 0.1, y: 0 }, points, 2).label).toBe('A'); });
  it('rejects invalid k and empty training data', () => { expect(() => predictKnn({ x: 0, y: 0 }, points, 3)).toThrow(); expect(() => predictKnn({ x: 0, y: 0 }, [], 1)).toThrow(); });
  it('makes deterministic datasets and disjoint seeded splits', () => { expect(makeDataset('noisy')).toEqual(makeDataset('noisy')); const a = splitData(makeDataset('separated')); const ids = new Set(a.train.map(p => p.id)); expect(a.test.every(p => !ids.has(p.id))).toBe(true); expect(a).toEqual(splitData(makeDataset('separated'))); });
  it('reports actual accuracy and true-row/predicted-column matrix', () => { const result = evaluate(points, p => p.label); expect(result.accuracy).toBe(1); expect(result.matrix).toEqual([[1, 0], [0, 1]]); });
});
