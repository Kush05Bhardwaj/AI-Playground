import { describe, expect, it } from 'vitest';
import { fitClassifier, classifierDefinitions } from './classifiers';
import { makeDataset } from './datasets';
import { predictKnn } from './knn';

describe('shared classifier contract', () => {
  it('exposes the genuinely supported algorithms and batch prediction capabilities', () => {
    expect(classifierDefinitions.map(definition => definition.id)).toEqual(['knn', 'decision-tree']);
    expect(classifierDefinitions.every(definition => definition.capabilities.batchPrediction && definition.capabilities.decisionRegions)).toBe(true);
  });

  it('keeps k-NN predictions and neighbor explanations compatible', () => {
    const training = makeDataset('overlap').slice(0, 28);
    const config = { algorithm: 'knn' as const, k: 5 };
    const model = fitClassifier(training, config);
    const queries = [{ x: .25, y: .4 }, { x: .7, y: .6 }];
    expect(model.algorithm).toBe('knn');
    expect(model.predictMany(queries)).toEqual(queries.map(point => predictKnn(point, model.training, config.k).label));
    expect(model.explain(queries[0]!).kind).toBe('knn');
  });

  it('fits a tree and returns a decision-path explanation through the same contract', () => {
    const model = fitClassifier(makeDataset('separated').slice(0, 28), { algorithm: 'decision-tree', maxDepth: 3, minSamplesSplit: 2 });
    expect(model.algorithm).toBe('decision-tree');
    expect(model.predictMany([{ x: .2, y: .2 }, { x: .8, y: .8 }])).toHaveLength(2);
    expect(model.explain({ x: .2, y: .2 }).kind).toBe('decision-tree');
  });
});
