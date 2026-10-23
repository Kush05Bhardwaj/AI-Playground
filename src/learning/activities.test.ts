import { describe, expect, it } from 'vitest';
import { emptySignals, isActivityComplete } from './activities';
describe('guided activity completion', () => {
  it('does not complete by opening; Teach the Model requires a run and test inspection', () => {
    expect(isActivityComplete('teach-model', emptySignals())).toBe(false);
    expect(isActivityComplete('teach-model', { ...emptySignals(), runKs: [5] })).toBe(false);
    expect(isActivityComplete('teach-model', { ...emptySignals(), runKs: [5], inspectedTest: true })).toBe(true);
  });
  it('requires model comparisons and correction actions', () => {
    expect(isActivityComplete('overfitting', { ...emptySignals(), runKs: [1] })).toBe(false);
    expect(isActivityComplete('overfitting', { ...emptySignals(), runKs: [1, 15] })).toBe(true);
    expect(isActivityComplete('fix-mistake', { ...emptySignals(), inspectedMistake: true, editedAfterMistake: true })).toBe(false);
    expect(isActivityComplete('fix-mistake', { ...emptySignals(), inspectedMistake: true, editedAfterMistake: true, rerunAfterEdit: true })).toBe(true);
  });
});
