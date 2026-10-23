export type Label = 'A' | 'B';
export interface Point { id: string; x: number; y: number; label: Label }
export interface Neighbor { point: Point; distance: number }
export interface Prediction { label: Label; neighbors: Neighbor[]; votes: Record<Label, number> }
export interface Partition { train: Point[]; test: Point[] }
export interface Evaluation { accuracy: number | null; matrix: [[number, number], [number, number]]; predictions: Array<{ point: Point; predicted: Label }> }
