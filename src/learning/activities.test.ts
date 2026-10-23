import { describe, expect, it } from 'vitest';
import { activities, emptySignals, isActivityComplete } from './activities';
describe('guided activity completion', () => {
  it('provides progressive hints for every activity without making them completion criteria', () => {
    expect(activities.every(activity => activity.hint.trim().length > 10)).toBe(true);
    expect(isActivityComplete('teach-model', emptySignals())).toBe(false);
  });
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
  it('requires two distinct trained tree depths for the tree activity', () => {
    expect(isActivityComplete('grow-tree', { ...emptySignals(), runTreeDepths: [1] })).toBe(false);
    expect(isActivityComplete('grow-tree', { ...emptySignals(), runTreeDepths: [1, 4] })).toBe(true);
  });
});
