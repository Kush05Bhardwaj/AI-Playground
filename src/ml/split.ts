import type { Partition, Point } from './types';
function rng(seed: number) { let s = seed >>> 0; return () => { s = (s * 1664525 + 1013904223) >>> 0; return s / 4294967296; }; }
export function splitData(points: Point[], seed = 123, testRatio = 0.25): Partition {
  if (!Number.isFinite(testRatio) || testRatio <= 0 || testRatio >= 1) throw new Error('Test ratio must be between 0 and 1.');
  if (points.length < 2) throw new Error('At least two observations are required.');
  const shuffled = [...points]; const random = rng(seed);
  for (let i = shuffled.length - 1; i > 0; i--) { const j = Math.floor(random() * (i + 1)); [shuffled[i], shuffled[j]] = [shuffled[j]!, shuffled[i]!]; }
  const testCount = Math.max(1, Math.min(points.length - 1, Math.round(points.length * testRatio)));
  const test = shuffled.slice(0, testCount); const testIds = new Set(test.map(p => p.id));
  return { test, train: points.filter(p => !testIds.has(p.id)) };
}
