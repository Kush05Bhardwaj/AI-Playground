import { describe, expect, it } from 'vitest';
import { commitHistory, createHistory, redoHistory, undoHistory } from './history';
import type { DatasetSnapshot } from './history';
const initial: DatasetSnapshot = { preset: 'separated', points: [{ id: 'p1', x: .2, y: .3, label: 'A' }] };
describe('dataset edit history', () => {
  it('undoes and redoes point additions and groups a whole edit as one entry', () => {
    const first = commitHistory(createHistory(initial), { ...initial, points: [...initial.points, { id: 'p2', x: .4, y: .5, label: 'B' }] }, 'Added point');
    expect(undoHistory(first).present).toEqual(initial);
    expect(redoHistory(undoHistory(first)).present).toEqual(first.present);
  });
  it('drops redo after a new edit and bounds history length', () => {
    const h = commitHistory(createHistory(initial, 2), { preset: 'overlap', points: initial.points }, 'Loaded preset');
    const undone = undoHistory(h);
    const branched = commitHistory(undone, { ...initial, points: [{ ...initial.points[0]!, label: 'B' }] }, 'Changed label');
    expect(branched.future).toHaveLength(0);
    const bounded = commitHistory(commitHistory(branched, { ...initial, points: [{ ...initial.points[0]!, x: .4 }] }, 'Moved point'), { ...initial, points: [{ ...initial.points[0]!, x: .5 }] }, 'Moved point');
    expect(bounded.past).toHaveLength(2);
  });
  it('rejects invalid data rather than placing it in history', () => {
    expect(() => commitHistory(createHistory(initial), { ...initial, points: [{ ...initial.points[0]!, x: 2 }] }, 'Invalid move')).toThrow();
  });
  it('will not restore a corrupted history entry', () => {
    const state = createHistory(initial);
    state.past.push({ preset: 'separated', points: [{ ...initial.points[0]!, x: 5 }] });
    const recovered = undoHistory(state);
    expect(recovered.present).toEqual(initial);
    expect(recovered.past).toHaveLength(0);
  });
});
