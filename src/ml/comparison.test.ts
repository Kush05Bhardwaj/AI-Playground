import { describe, expect, it } from 'vitest';
import { compareKnnConfigurations } from './comparison';
import { makeDataset } from './datasets';
import { evaluate } from './metrics';
import type { Point } from './types';

describe('k-NN configuration comparison', () => {
  it('compares configurations on identical validation observations, separate from test', () => {
    const result = compareKnnConfigurations(makeDataset('overlap'), [1, 5]);
    expect(result.results[0].validation.predictions.map(item => item.point.id))
      .toEqual(result.results[1].validation.predictions.map(item => item.point.id));
    expect(result.results[0].training.predictions.map(item => item.point.id))
      .toEqual(result.results[1].training.predictions.map(item => item.point.id));
    expect(result.results[0].validation.predictions.map(item => item.point.id)).not.toContain(result.split.test[0]!.id);
  });

  it('requires enough examples for a separate validation set', () => {
    const small: Point[] = Array.from({ length: 6 }, (_, index) => ({ id: `p${index}`, x: index / 6, y: .5, label: index < 3 ? 'A' : 'B' }));
    expect(() => compareKnnConfigurations(small, [1, 3])).toThrow(/10 examples/);
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
