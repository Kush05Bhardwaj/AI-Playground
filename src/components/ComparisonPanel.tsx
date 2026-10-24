import type { KnnComparison } from '../ml/comparison';

interface Props {
  comparison: KnnComparison | null;
  stale: boolean;
  canCompare: boolean;
  error: string;
  kValues: [number, number];
  onKChange: (index: 0 | 1, value: number) => void;
  onCompare: () => void;
}

const percent = (value: number | null) => value === null ? 'N/A' : `${Math.round(value * 100)}%`;

function ConfigurationResult({ k, training, validation }: KnnComparison['results'][number]) {
  return <article className="comparison-result" aria-label={`Results for k equals ${k}`}>
    <h3>Configuration · k = {k}</h3>
    <dl className="comparison-scores">
      <div><dt>Training · in-sample</dt><dd>{percent(training.accuracy)}</dd></div>
      <div><dt>Validation accuracy</dt><dd>{percent(validation.accuracy)}</dd></div>
      <div><dt>Validation examples</dt><dd>{validation.predictions.length}</dd></div>
    </dl>
    <p className="comparison-matrix-label">Confusion matrix · actual rows, predicted columns</p>
    <table className="comparison-matrix">
      <caption className="sr-only">Confusion matrix for k equals {k}. Rows are actual groups and columns are predicted groups.</caption>
      <thead><tr><th scope="col">Actual</th><th scope="col">Predicted A</th><th scope="col">Predicted B</th></tr></thead>
      <tbody>
        <tr><th scope="row">Group A</th><td>{validation.matrix[0][0]}</td><td>{validation.matrix[0][1]}</td></tr>
        <tr><th scope="row">Group B</th><td>{validation.matrix[1][0]}</td><td>{validation.matrix[1][1]}</td></tr>
      </tbody>
    </table>
    <p className="comparison-matrix-label">Per-class test scores · undefined values show as N/A</p>
    <table className="comparison-matrix per-class-metrics">
      <caption className="sr-only">Precision, recall, and F1 score per group for k equals {k}</caption>
      <thead><tr><th scope="col">Group</th><th scope="col">Support</th><th scope="col">Precision</th><th scope="col">Recall</th><th scope="col">F1</th></tr></thead>
      <tbody>{(['A', 'B'] as const).map(label => {
        const metric = validation.byClass[label];
        return <tr key={label}><th scope="row">{label}</th><td>{metric.support}</td><td>{percent(metric.precision)}</td><td>{percent(metric.recall)}</td><td>{percent(metric.f1)}</td></tr>;
      })}</tbody>
    </table>
  </article>;
}

export default function ComparisonPanel({ comparison, stale, canCompare, error, kValues, onKChange, onCompare }: Props) {
  return <section className="panel comparison-panel" aria-labelledby="comparison-title">
    <div className="result-head"><div><div className="panel-kicker">MODEL COMPARISON</div><h2 id="comparison-title">Compare two k-NN settings</h2></div><span className={stale ? 'not-run' : comparison ? 'inspect-tag' : 'not-run'}>{stale ? 'STALE' : comparison ? 'SAME VALIDATION SET' : 'NOT RUN'}</span></div>
    <p className="comparison-description">Both settings learn from the same practice examples and are compared on a shared validation set. The final test set stays out of this comparison.</p>
    <div className="comparison-controls">
      {([0, 1] as const).map(index => <div className="comparison-setting" key={index}>
        <label htmlFor={`compare-k-${index}`}>Configuration {index + 1} · k</label>
        <output htmlFor={`compare-k-${index}`}>{kValues[index]}</output>
        <input id={`compare-k-${index}`} aria-label={`Comparison configuration ${index + 1} k`} type="range" min="1" max="15" step="2" value={kValues[index]} onChange={event => onKChange(index, Number(event.currentTarget.value))}/>
      </div>)}
      <button className="button primary compare-button" onClick={onCompare} disabled={!canCompare}>Compare settings</button>
    </div>
    {stale && <p className="comparison-status" role="status">Dataset or comparison settings changed. Run the comparison again before using these results.</p>}
    {error && <p className="comparison-status" role="alert">{error}</p>}
    {comparison && !stale ? <>
      <p className="comparison-split-note" role="status">Shared split: {comparison.split.train.length} practice, {comparison.split.validation.length} validation, and {comparison.split.test.length} reserved test examples · seed {comparison.splitSeed}.</p>
      <div className="comparison-results">{comparison.results.map(result => <ConfigurationResult key={result.k} {...result}/>)}</div>
      <p className="comparison-caution"><b>Read the scores carefully.</b> Accuracy can hide different results for each group; check per-class precision, recall, support and the confusion matrix. Use validation results to choose settings; reserve the test set for a final check.</p>
    </> : <div className="empty-result"><span>Choose two k values and compare them on the current experiment.</span></div>}
  </section>;
}
