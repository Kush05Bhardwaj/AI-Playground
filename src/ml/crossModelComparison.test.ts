import { describe, expect, it } from 'vitest';
import { makeDataset } from './datasets';
import { compareModelsOnSharedSplit } from './crossModelComparison';

describe('cross algorithm comparison', () => {
  it('uses one held-out set and scores both classifiers on those same examples', () => {
    const result = compareModelsOnSharedSplit(makeDataset('overlap'), { algorithm: 'knn', k: 5 }, { algorithm: 'decision-tree', maxDepth: 3, minSamplesSplit: 2 });
    expect(result.testCount).toBe(Math.max(1, Math.min(makeDataset('overlap').length - 1, Math.round(makeDataset('overlap').length * .25))));
    expect(result.left.test.predictions.map(item => item.point.id)).toEqual(result.right.test.predictions.map(item => item.point.id));
    expect(result.left.training.predictions).toHaveLength(result.trainCount);
    expect(result.right.training.predictions).toHaveLength(result.trainCount);
  });

  it('rejects configurations that cannot fit on the shared training partition', () => {
    expect(() => compareModelsOnSharedSplit(makeDataset('separated'), { algorithm: 'knn', k: 99 }, { algorithm: 'decision-tree', maxDepth: 2, minSamplesSplit: 2 })).toThrow();
  });
});
