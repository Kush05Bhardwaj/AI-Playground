import type { Label, Point, Prediction } from './types';
export function predictKnn(query: Pick<Point, 'x' | 'y'>, training: Point[], k: number): Prediction {
  if (!Number.isFinite(query.x) || !Number.isFinite(query.y)) throw new Error('Query coordinates must be finite.');
  if (!training.length) throw new Error('Training set is empty.');
  if (!Number.isInteger(k) || k < 1 || k > training.length) throw new Error(`k must be an integer from 1 to ${training.length}.`);
  if (training.some(p => !Number.isFinite(p.x) || !Number.isFinite(p.y) || p.x < 0 || p.x > 1 || p.y < 0 || p.y > 1 || !['A', 'B'].includes(p.label))) throw new Error('Training data contains an invalid point.');
  const neighbors = training.map(point => ({ point, distance: Math.hypot(point.x - query.x, point.y - query.y) }))
    .sort((a, b) => a.distance - b.distance || a.point.id.localeCompare(b.point.id)).slice(0, k);
  const votes: Record<Label, number> = { A: 0, B: 0 }; neighbors.forEach(n => votes[n.point.label]++);
  // Stable tie rule: when class counts tie, use the nearest neighbor's label.
  let label: Label;
  if (votes.A === votes.B) label = neighbors[0]!.point.label;
  else label = votes.A > votes.B ? 'A' : 'B';
  return { label, neighbors, votes };
}
