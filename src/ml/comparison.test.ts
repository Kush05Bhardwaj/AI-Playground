import { describe, expect, it } from 'vitest';
import { compareKnnConfigurations } from './comparison';
import { makeDataset } from './datasets';
import { evaluate } from './metrics';
import { splitData } from './split';
import type { Point } from './types';

describe('k-NN configuration comparison', () => {
  it('evaluates configurations on the same held-out observations', () => {
    const result = compareKnnConfigurations(makeDataset('overlap'), [1, 5]);
    expect(result.results[0].test.predictions.map(item => item.point.id))
      .toEqual(result.results[1].test.predictions.map(item => item.point.id));
    expect(result.results[0].training.predictions.map(item => item.point.id))
      .toEqual(result.results[1].training.predictions.map(item => item.point.id));
  });

  it('can produce different predictions for different k values', () => {
    const initial: Point[] = Array.from({ length: 6 }, (_, index) => ({ id: `p${index}`, x: .5, y: .5, label: 'A' }));
    const trainIds = new Set(splitData(initial).train.map(point => point.id));
    const training: Point[] = [
      { id: 'a1', x: 0, y: 0, label: 'A' },
      { id: 'a2', x: .1, y: 0, label: 'A' },
      { id: 'b1', x: .2, y: 0, label: 'B' },
      { id: 'a3', x: .8, y: .8, label: 'A' },
      { id: 'a4', x: .9, y: .8, label: 'A' },
    ];
    let trainIndex = 0;
    const points = initial.map(point => trainIds.has(point.id)
      ? { ...training[trainIndex++]!, id: point.id }
      : { ...point, x: .19, y: 0, label: 'B' as const });
    const result = compareKnnConfigurations(points, [1, 3]);
    expect(result.results[0].test.predictions[0]!.predicted).toBe('B');
    expect(result.results[1].test.predictions[0]!.predicted).toBe('A');
  });

  it('reports class metrics as undefined when denominators are empty', () => {
    const onlyA: Point[] = [{ id: 'a', x: 0, y: 0, label: 'A' }];
    const evaluation = evaluate(onlyA, () => 'A');
    expect(evaluation.byClass.A).toMatchObject({ support: 1, predicted: 1, precision: 1, recall: 1, f1: 1 });
    expect(evaluation.byClass.B).toMatchObject({ support: 0, predicted: 0, precision: null, recall: null, f1: null });
    expect(evaluate([], () => 'A').accuracy).toBeNull();
  });

  it('handles no predictions for a class and false positives for a missing class', () => {
    const actualA: Point[] = [{ id: 'a', x: 0, y: 0, label: 'A' }];
    const noPredictionsForB = evaluate(actualA, () => 'A');
    expect(noPredictionsForB.byClass.B).toMatchObject({ support: 0, predicted: 0, precision: null, recall: null, f1: null });
    const actualB: Point[] = [{ id: 'b', x: 0, y: 0, label: 'B' }];
    const falsePositiveOnly = evaluate(actualB, () => 'A');
    expect(falsePositiveOnly.byClass.A).toMatchObject({ support: 0, predicted: 1, precision: 0, recall: null, f1: null });
    expect(falsePositiveOnly.byClass.B).toMatchObject({ support: 1, predicted: 0, precision: null, recall: 0, f1: null });
  });

  it('rejects configurations that cannot use the training partition', () => {
    expect(() => compareKnnConfigurations(makeDataset('separated'), [1, 999])).toThrow(/training examples/);
  });
});
