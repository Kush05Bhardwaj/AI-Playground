import { useMemo, useState } from 'react';
import type { SavedExperiment } from '../experiment/persistence';
import { compareExperiments, type ExperimentComparison, type ExperimentConfiguration } from '../ml/experimentComparison';

interface Props {
  current: ExperimentConfiguration;
  saved: SavedExperiment | null;
}

const percent = (value: number | null) => value === null ? 'N/A' : `${Math.round(value * 100)}%`;

function ConfigSummary({ title, result }: { title: string; result: ExperimentComparison['current'] }) {
  return <div className="saved-score-card"><h3>{title}</h3><dl>
    <div><dt>Dataset</dt><dd>{result.preset} · {result.pointCount} points</dd></div>
    <div><dt>Model</dt><dd>k = {result.k}</dd></div>
    <div><dt>Evaluation split</dt><dd>seed {result.splitSeed} · {result.trainCount} train / {result.testCount} test</dd></div>
    <div><dt>Training accuracy</dt><dd>{percent(result.training.accuracy)}</dd></div>
    <div><dt>Held-out accuracy</dt><dd>{percent(result.test.accuracy)}</dd></div>
    <div><dt>Test confusion matrix</dt><dd>A: {result.test.matrix[0][0]} correct, {result.test.matrix[0][1]} predicted B · B: {result.test.matrix[1][1]} correct, {result.test.matrix[1][0]} predicted A</dd></div>
  </dl></div>;
}

export default function SavedExperimentComparison({ current, saved }: Props) {
  const inputKey = useMemo(() => JSON.stringify({ current, saved: saved && { preset: saved.preset, points: saved.points, k: saved.k } }), [current, saved]);
  const [stored, setStored] = useState<{ key: string; result: ExperimentComparison } | null>(null);
  const [error, setError] = useState('');
  const stale = stored !== null && stored.key !== inputKey;

  function compare() {
    if (!saved) return;
    try {
      setStored({ key: inputKey, result: compareExperiments(current, { label: 'Saved experiment', preset: saved.preset, points: saved.points, k: saved.k, splitSeed: 123 }) });
      setError('');
    } catch (cause) {
      setStored(null);
      setError(cause instanceof Error ? cause.message : 'The saved experiment could not be compared.');
    }
  }

  const result = stale ? null : stored?.result ?? null;
  return <section className="panel saved-comparison-panel" aria-labelledby="saved-comparison-title">
    <div className="result-head"><div><div className="panel-kicker">REPRODUCIBILITY</div><h2 id="saved-comparison-title">Current vs saved experiment</h2></div><span className={result ? 'inspect-tag' : 'not-run'}>{stale ? 'STALE' : result ? (result.sameEvaluationExamples ? 'SAME TEST EXAMPLES' : 'DIFFERENT TEST EXAMPLES') : 'NOT RUN'}</span></div>
    <p className="comparison-description">The saved configuration is read from this browser and its scores are recalculated now. Saved metric values are not used.</p>
    {saved && <p className="saved-timestamp">Saved on this device: <time dateTime={saved.savedAt}>{new Date(saved.savedAt).toLocaleString()}</time></p>}
    <button className="button secondary saved-compare-button" onClick={compare} disabled={!saved}>Compare current with saved</button>
    {!saved && <p className="comparison-status">Save an experiment on this device to compare its configuration here.</p>}
    {error && <p className="comparison-status" role="alert">{error}</p>}
    {stale && <p className="comparison-status" role="status">An experiment or setting changed. Recompute this comparison to refresh the results.</p>}
    {result && <>
      <p className={result.sameEvaluationExamples ? 'comparison-split-note' : 'comparison-status'} role="status">
        {result.sameDataset ? 'The datasets match.' : 'The datasets differ.'} {result.sameEvaluationExamples ? 'The held-out examples match.' : 'The held-out examples differ, so the scores are not directly comparable.'}
      </p>
      <div className="saved-comparison-results"><ConfigSummary title="Current" result={result.current}/><ConfigSummary title="Saved" result={result.saved}/></div>
    </>}
  </section>;
}
