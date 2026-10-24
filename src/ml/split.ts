import type { Partition, Point } from './types';
function rng(seed: number) { let s = seed >>> 0; return () => { s = (s * 1664525 + 1013904223) >>> 0; return s / 4294967296; }; }
export function splitData(points: Point[], seed = 123, testRatio = 0.2, validationRatio = 0.2): Partition {
  if (!Number.isFinite(testRatio) || testRatio <= 0 || testRatio >= 1 || !Number.isFinite(validationRatio) || validationRatio < 0 || validationRatio >= 1 || testRatio + validationRatio >= 1) throw new Error('Test and validation ratios must be positive fractions that leave training examples.');
  if (!Number.isInteger(seed) || seed < 0 || seed > 0xffffffff) throw new Error('Split seed must be a 32-bit unsigned integer.');
  if (points.length < 2) throw new Error('At least two observations are required.');
  const ids = new Set<string>();
  for (const point of points) {
    if (!point || typeof point.id !== 'string' || !point.id || ids.has(point.id)) throw new Error('Each observation must have a unique, non-empty ID.');
    if (!Number.isFinite(point.x) || !Number.isFinite(point.y) || point.x < 0 || point.x > 1 || point.y < 0 || point.y > 1 || (point.label !== 'A' && point.label !== 'B')) throw new Error('Dataset contains an invalid observation.');
    ids.add(point.id);
  }
  const shuffled = [...points]; const random = rng(seed);
  for (let i = shuffled.length - 1; i > 0; i--) { const j = Math.floor(random() * (i + 1)); [shuffled[i], shuffled[j]] = [shuffled[j]!, shuffled[i]!]; }
  const validationAvailable = points.length >= 10 && validationRatio > 0;
  const effectiveTestRatio = validationAvailable ? testRatio : 0.25;
  const testCount = Math.max(1, Math.min(points.length - (validationAvailable ? 2 : 1), Math.round(points.length * effectiveTestRatio)));
  const validationCount = validationAvailable ? Math.max(1, Math.min(points.length - testCount - 1, Math.round(points.length * validationRatio))) : 0;
  const test = shuffled.slice(0, testCount);
  const validation = shuffled.slice(testCount, testCount + validationCount);
  const heldOutIds = new Set([...test, ...validation].map(p => p.id));
  return { test, validation, validationAvailable, train: points.filter(p => !heldOutIds.has(p.id)) };
}
