import { describe, expect, it } from 'vitest';
import { makeDataset } from './datasets';
import { compareExperiments } from './experimentComparison';

describe('current and saved experiment comparison', () => {
  const points = makeDataset('separated');
  const current = { label: 'Current experiment', preset: 'separated' as const, points, k: 3, algorithm: 'knn' as const, splitSeed: 123 };

  it('recomputes metrics and recognizes identical datasets and evaluation examples', () => {
    const result = compareExperiments(current, { ...current, label: 'Saved experiment', k: 5 });
    expect(result.sameDataset).toBe(true);
    expect(result.sameEvaluationExamples).toBe(true);
    expect(result.current.test.predictions).toHaveLength(14);
    expect(result.saved.k).toBe(5);
  });

  it('flags dataset and evaluation split differences so scores are not presented as equivalent', () => {
    const changed = points.map((point, index) => index === 0 ? { ...point, x: Math.min(.99, point.x + .03) } : point);
    const result = compareExperiments(current, { ...current, label: 'Saved experiment', points: changed, preset: 'overlap' });
    expect(result.sameDataset).toBe(false);
    expect(result.sameEvaluationExamples).toBe(false);
  });

  it('rejects a saved k that does not fit its training partition', () => {
    expect(() => compareExperiments(current, { ...current, label: 'Saved experiment', k: 99 })).toThrow(/k must be/);
  });
});
