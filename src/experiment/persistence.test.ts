import { describe, expect, it } from 'vitest';
import { clearExperiment, LEGACY_STORAGE_KEY, loadExperiment, saveExperiment, STORAGE_KEY, type SavedExperiment, type StorageLike } from './persistence';
class MemoryStorage implements StorageLike {
  values = new Map<string, string>();
  getItem(key: string) { return this.values.get(key) ?? null; }
  setItem(key: string, value: string) { this.values.set(key, value); }
  removeItem(key: string) { this.values.delete(key); }
}
const value: Omit<SavedExperiment, 'schemaVersion' | 'savedAt'> = { seed: 42, preset: 'separated', points: [{ id: 'a', x: .2, y: .3, label: 'A' }], k: 5, algorithm: 'knn', treeDepth: 3, treeMinSamplesSplit: 2, activeLabel: 'B', activeActivity: null, completedActivities: [], activityProgress: { runKs: [], runTreeDepths: [], edited: false, inspectedTest: false, inspectedMistake: false, editedAfterMistake: false, rerunAfterEdit: false, comparedEvaluation: false } };
describe('local experiment persistence', () => {
  it('round-trips a validated experiment without derived model results', () => {
    const storage = new MemoryStorage();
    const savedValue = { ...value, activityProgress: { ...value.activityProgress, runKs: [1, 5], inspectedTest: true } };
    expect(saveExperiment(storage, savedValue, new Date('2025-01-01T00:00:00Z'))).toBe(true);
    const loaded = loadExperiment(storage);
    expect(loaded.status).toBe('valid');
    if (loaded.status === 'valid') { expect(loaded.value.points).toEqual(value.points); expect(loaded.value.activityProgress).toEqual(savedValue.activityProgress); }
    expect(JSON.stringify(loaded)).not.toContain('accuracy');
  });
  it('handles malformed, outdated, and unavailable storage', () => {
    const storage = new MemoryStorage(); storage.values.set(STORAGE_KEY, '{broken');
    expect(loadExperiment(storage).status).toBe('invalid');
    storage.values.set(STORAGE_KEY, JSON.stringify({ schemaVersion: 99 }));
    expect(loadExperiment(storage)).toMatchObject({ status: 'invalid', reason: expect.stringContaining('unsupported') });
    const blocked: StorageLike = { getItem() { throw new Error('blocked'); }, setItem() {}, removeItem() {} };
    expect(loadExperiment(blocked).status).toBe('unavailable');
  });
  it('migrates a valid version 1 experiment to k-NN defaults without removing the old save', () => {
    const storage = new MemoryStorage();
    const { runKs, edited, inspectedTest, inspectedMistake, editedAfterMistake, rerunAfterEdit, comparedEvaluation } = value.activityProgress;
    const legacyProgress = { runKs, edited, inspectedTest, inspectedMistake, editedAfterMistake, rerunAfterEdit, comparedEvaluation };
    const legacyValue = { seed: value.seed, preset: value.preset, points: value.points, k: value.k, activeLabel: value.activeLabel, activeActivity: value.activeActivity, completedActivities: value.completedActivities, activityProgress: legacyProgress };
    storage.values.set(LEGACY_STORAGE_KEY, JSON.stringify({ ...legacyValue, schemaVersion: 1, savedAt: '2025-01-01T00:00:00.000Z' }));
    const loaded = loadExperiment(storage);
    expect(loaded.status).toBe('valid');
    if (loaded.status === 'valid') expect(loaded.value).toMatchObject({ schemaVersion: 2, algorithm: 'knn', treeDepth: 3, treeMinSamplesSplit: 2 });
    expect(storage.getItem(LEGACY_STORAGE_KEY)).not.toBeNull();
    expect(clearExperiment(storage)).toBe(true);
    expect(storage.getItem(LEGACY_STORAGE_KEY)).toBeNull();
  });
  it('keeps Phase 4 version 2 progress readable when tree-activity fields are absent', () => {
    const storage = new MemoryStorage();
    const { runKs, edited, inspectedTest, inspectedMistake, editedAfterMistake, rerunAfterEdit, comparedEvaluation } = value.activityProgress;
    const phase4Progress = { runKs, edited, inspectedTest, inspectedMistake, editedAfterMistake, rerunAfterEdit, comparedEvaluation };
    storage.values.set(STORAGE_KEY, JSON.stringify({ ...value, activityProgress: phase4Progress, schemaVersion: 2, savedAt: '2025-01-01T00:00:00.000Z' }));
    const loaded = loadExperiment(storage);
    expect(loaded.status).toBe('valid');
    if (loaded.status === 'valid') expect(loaded.value.activityProgress.runTreeDepths).toEqual([]);
  });
  it('rejects invalid points and clears saved state safely', () => {
    const storage = new MemoryStorage(); expect(saveExperiment(storage, { ...value, points: [{ ...value.points[0]!, x: 2 }] })).toBe(false);
    expect(clearExperiment(storage)).toBe(true);
  });
  it('reports failed storage writes without throwing', () => {
    const blocked: StorageLike = { getItem() { return null; }, setItem() { throw new Error('quota exceeded'); }, removeItem() {} };
    expect(saveExperiment(blocked, value)).toBe(false);
  });
});
