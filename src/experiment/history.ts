import type { Point } from '../ml/types';
import type { Preset } from '../ml/datasets';

export interface DatasetSnapshot { points: Point[]; preset: Preset }
export interface HistoryState {
  past: DatasetSnapshot[];
  present: DatasetSnapshot;
  future: DatasetSnapshot[];
  lastAction: string;
  limit: number;
}

export function isValidSnapshot(value: unknown): value is DatasetSnapshot {
  if (!value || typeof value !== 'object') return false;
  const snapshot = value as Partial<DatasetSnapshot>;
  if (!['separated', 'overlap', 'noisy'].includes(snapshot.preset ?? '') || !Array.isArray(snapshot.points) || snapshot.points.length > 1000) return false;
  const ids = new Set<string>();
  for (const point of snapshot.points) {
    if (!point || typeof point.id !== 'string' || point.id.length < 1 || point.id.length > 80 || ids.has(point.id)) return false;
    if (!Number.isFinite(point.x) || !Number.isFinite(point.y) || point.x < 0 || point.x > 1 || point.y < 0 || point.y > 1) return false;
    if (point.label !== 'A' && point.label !== 'B') return false;
    ids.add(point.id);
  }
  return true;
}

const copy = (snapshot: DatasetSnapshot): DatasetSnapshot => ({ preset: snapshot.preset, points: snapshot.points.map(point => ({ ...point })) });

export function createHistory(initial: DatasetSnapshot, limit = 50): HistoryState {
  if (!isValidSnapshot(initial)) throw new Error('Cannot create history from an invalid dataset.');
  if (!Number.isInteger(limit) || limit < 1) throw new Error('History limit must be a positive integer.');
  return { past: [], present: copy(initial), future: [], lastAction: 'Started a new experiment', limit };
}

export function commitHistory(state: HistoryState, next: DatasetSnapshot, action: string): HistoryState {
  if (!isValidSnapshot(next)) throw new Error('The edit would create an invalid dataset.');
  if (JSON.stringify(state.present) === JSON.stringify(next)) return state;
  return {
    past: [...state.past, copy(state.present)].slice(-state.limit),
    present: copy(next),
    future: [],
    lastAction: action,
    limit: state.limit,
  };
}

export function undoHistory(state: HistoryState): HistoryState {
  const previous = state.past.at(-1);
  if (!previous) return state;
  if (!isValidSnapshot(previous)) return { ...state, past: state.past.slice(0, -1), lastAction: 'Skipped an invalid undo record' };
  return { past: state.past.slice(0, -1), present: copy(previous), future: [copy(state.present), ...state.future].slice(0, state.limit), lastAction: 'Undid last edit', limit: state.limit };
}

export function redoHistory(state: HistoryState): HistoryState {
  const next = state.future[0];
  if (!next) return state;
  if (!isValidSnapshot(next)) return { ...state, future: state.future.slice(1), lastAction: 'Skipped an invalid redo record' };
  return { past: [...state.past, copy(state.present)].slice(-state.limit), present: copy(next), future: state.future.slice(1), lastAction: 'Redid last edit', limit: state.limit };
}
