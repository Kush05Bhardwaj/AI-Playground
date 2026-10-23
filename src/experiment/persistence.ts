import type { Label, Point } from '../ml/types';
import type { Preset } from '../ml/datasets';

export const STORAGE_KEY = 'ai-playground.experiment.v1';
export const PERSISTENCE_VERSION = 1;
export const ACTIVITY_IDS = ['teach-model', 'k-matters', 'add-noise', 'overfitting', 'test-before-trust', 'fix-mistake'] as const;
export type ActivityId = typeof ACTIVITY_IDS[number];
export interface PersistedActivityProgress {
  runKs: number[];
  edited: boolean;
  inspectedTest: boolean;
  inspectedMistake: boolean;
  editedAfterMistake: boolean;
  rerunAfterEdit: boolean;
  comparedEvaluation: boolean;
}
export interface SavedExperiment {
  schemaVersion: 1;
  savedAt: string;
  seed: number;
  preset: Preset;
  points: Point[];
  k: number;
  activeLabel: Label;
  activeActivity: ActivityId | null;
  completedActivities: ActivityId[];
  activityProgress: PersistedActivityProgress;
}
export interface StorageLike { getItem(key: string): string | null; setItem(key: string, value: string): void; removeItem(key: string): void }
export type LoadResult = { status: 'missing' } | { status: 'valid'; value: SavedExperiment } | { status: 'invalid'; reason: string } | { status: 'unavailable' };

export function isSavedExperiment(value: unknown): value is SavedExperiment {
  if (!value || typeof value !== 'object') return false;
  const data = value as Partial<SavedExperiment>;
  if (data.schemaVersion !== PERSISTENCE_VERSION || typeof data.savedAt !== 'string' || !Number.isFinite(Date.parse(data.savedAt))) return false;
  if (!Number.isInteger(data.seed) || (data.seed ?? -1) < 0 || (data.seed ?? 0) > 0xffffffff || !['separated', 'overlap', 'noisy'].includes(data.preset ?? '')) return false;
  if (!Number.isInteger(data.k) || (data.k ?? 0) < 1 || (data.k ?? 16) > 15 || (data.k! > 1 && data.k! % 2 === 0)) return false;
  if (data.activeLabel !== 'A' && data.activeLabel !== 'B') return false;
  if (data.activeActivity !== null && !(ACTIVITY_IDS as readonly unknown[]).includes(data.activeActivity)) return false;
  if (!Array.isArray(data.completedActivities) || data.completedActivities.some(id => !(ACTIVITY_IDS as readonly unknown[]).includes(id))) return false;
  const progress = data.activityProgress;
  if (!progress || typeof progress !== 'object' || !Array.isArray(progress.runKs) || progress.runKs.length > 100 || progress.runKs.some(k => !Number.isInteger(k) || k < 1 || k > 15 || (k > 1 && k % 2 === 0))) return false;
  if (['edited', 'inspectedTest', 'inspectedMistake', 'editedAfterMistake', 'rerunAfterEdit', 'comparedEvaluation'].some(key => typeof progress[key as keyof PersistedActivityProgress] !== 'boolean')) return false;
  if (!Array.isArray(data.points) || data.points.length > 1000) return false;
  const ids = new Set<string>();
  for (const point of data.points) {
    if (!point || typeof point.id !== 'string' || point.id.length < 1 || point.id.length > 80 || ids.has(point.id)) return false;
    if (!Number.isFinite(point.x) || !Number.isFinite(point.y) || point.x < 0 || point.x > 1 || point.y < 0 || point.y > 1) return false;
    if (point.label !== 'A' && point.label !== 'B') return false;
    ids.add(point.id);
  }
  return true;
}

export function loadExperiment(storage: StorageLike): LoadResult {
  try {
    const raw = storage.getItem(STORAGE_KEY);
    if (raw === null) return { status: 'missing' };
    let parsed: unknown;
    try { parsed = JSON.parse(raw); } catch { return { status: 'invalid', reason: 'The saved experiment is not valid JSON.' }; }
    if (!parsed || typeof parsed !== 'object' || !('schemaVersion' in parsed)) return { status: 'invalid', reason: 'The saved experiment is missing its version.' };
    if ((parsed as { schemaVersion?: unknown }).schemaVersion !== PERSISTENCE_VERSION) return { status: 'invalid', reason: 'This saved experiment uses an unsupported version.' };
    if (!isSavedExperiment(parsed)) return { status: 'invalid', reason: 'The saved experiment contains invalid data.' };
    return { status: 'valid', value: parsed };
  } catch { return { status: 'unavailable' }; }
}

export function saveExperiment(storage: StorageLike, value: Omit<SavedExperiment, 'schemaVersion' | 'savedAt'>, now = new Date()): boolean {
  const saved: SavedExperiment = { ...value, schemaVersion: PERSISTENCE_VERSION, savedAt: now.toISOString() };
  if (!isSavedExperiment(saved)) return false;
  try { storage.setItem(STORAGE_KEY, JSON.stringify(saved)); return true; } catch { return false; }
}

export function clearExperiment(storage: StorageLike): boolean {
  try { storage.removeItem(STORAGE_KEY); return true; } catch { return false; }
}

export function browserStorage(): StorageLike | null {
  try { return typeof window === 'undefined' ? null : window.localStorage; } catch { return null; }
}
