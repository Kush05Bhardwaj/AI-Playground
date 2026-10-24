import type { CrossModelComparison } from '../ml/crossModelComparison';
import type { ClassifierConfiguration } from '../ml/classifierTypes';

interface Props {
  values: [ClassifierConfiguration, ClassifierConfiguration];
  result: CrossModelComparison | null;
  stale: boolean;
  error: string;
  onChange: (index: number, value: ClassifierConfiguration) => void;
  onCompare: () => void;
}
const percent = (value: number | null) => value === null ? 'N/A' : `${Math.round(value * 100)}%`;
function label(configuration: ClassifierConfiguration) { return configuration.algorithm === 'knn' ? `k-NN (k=${configuration.k})` : `Decision tree (depth=${configuration.maxDepth}, min split=${configuration.minSamplesSplit})`; }

export default function CrossModelComparisonPanel({ values, result, stale, error, onChange, onCompare }: Props) {
  return <section className="panel comparison-panel cross-model-panel" aria-labelledby="cross-model-title">
    <div className="result-head"><div><div className="panel-kicker">SHARED VALIDATION EXAMPLES</div><h2 id="cross-model-title">Compare algorithms</h2></div><span className={stale ? 'not-run' : result ? 'inspect-tag' : 'not-run'}>{stale ? 'STALE' : result ? 'RECOMPUTED' : 'NOT RUN'}</span></div>
    <p className="comparison-description">Choose a model for each side. Both learn from the same practice examples and are compared on shared validation examples; test examples stay reserved.</p>
    <div className="cross-model-controls">{values.map((value, index) => <fieldset key={index}><legend>Model {index + 1}</legend><label>Algorithm<select value={value.algorithm} onChange={event => onChange(index, event.target.value === 'knn' ? { algorithm: 'knn', k: 5 } : { algorithm: 'decision-tree', maxDepth: 3, minSamplesSplit: 2 })}><option value="knn">k-nearest neighbors</option><option value="decision-tree">Decision tree</option></select></label>{value.algorithm === 'knn' ? <label>k<input type="number" min="1" max="15" step="2" value={value.k} onChange={event => onChange(index, { ...value, k: Number(event.target.value) })}/></label> : <><label>Maximum depth<input type="number" min="0" max="8" value={value.maxDepth} onChange={event => onChange(index, { ...value, maxDepth: Number(event.target.value) })}/></label><label>Minimum samples to split<input type="number" min="2" max="1000" value={value.minSamplesSplit} onChange={event => onChange(index, { ...value, minSamplesSplit: Number(event.target.value) })}/></label></>}</fieldset>)}</div>
    <button className="button secondary compare-button" onClick={onCompare}>Compare on the same split</button>{error && <p role="alert" className="comparison-status">{error}</p>}{stale && <p role="status" className="comparison-status">Data or settings changed. Recompute to refresh these scores.</p>}
    {result && !stale && <><p className="comparison-split-note">Seed {result.splitSeed} · {result.trainCount} practice / {result.validationCount} validation examples for both models; {result.testCount} test examples stay reserved.</p><div className="saved-comparison-results">{([result.left, result.right] as const).map((score, index) => <article className="saved-score-card" key={index}><h3>{label(score.configuration)}</h3><dl><div><dt>Training accuracy</dt><dd>{percent(score.training.accuracy)}</dd></div><div><dt>Validation accuracy</dt><dd>{percent(score.validation.accuracy)}</dd></div></dl></article>)}</div></>}
  </section>;
}
