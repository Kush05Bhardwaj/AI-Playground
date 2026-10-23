import type { Label, Point } from './types';
export type Preset = 'separated' | 'overlap' | 'noisy';
function rng(seed: number) { let s = seed >>> 0; return () => { s = (s * 1664525 + 1013904223) >>> 0; return s / 4294967296; }; }
export function makeDataset(kind: Preset, seed = 42): Point[] {
  const random = rng(seed); const points: Point[] = []; const total = kind === 'separated' ? 28 : 36;
  for (const label of ['A', 'B'] as Label[]) for (let i = 0; i < total; i++) {
    const center = label === 'A' ? (kind === 'overlap' ? 0.38 : 0.28) : (kind === 'overlap' ? 0.62 : 0.72);
    const spread = kind === 'separated' ? 0.105 : kind === 'overlap' ? 0.19 : 0.15;
    let x = center + (random() + random() + random() - 1.5) * spread;
    let y = 0.5 + (label === 'A' ? -0.14 : 0.14) + (random() + random() + random() - 1.5) * spread;
    x = Math.max(0.04, Math.min(0.96, x)); y = Math.max(0.04, Math.min(0.96, y));
    let actual = label;
    if (kind === 'noisy' && i % 11 === 0) actual = label === 'A' ? 'B' : 'A';
    points.push({ id: `${label}-${i}`, x, y, label: actual });
  }
  return points;
}
