import type { ClassifierConfiguration } from '../ml/classifierTypes';
import type { Label, Point } from '../ml/types';

interface Props {
  point: Point | undefined;
  configuration: ClassifierConfiguration;
  guess: Label;
  submittedFor: string;
  challengeKey: string;
  actualPrediction: Label | null;
  stale: boolean;
  onGuess: (label: Label) => void;
  onSubmit: () => void;
  onReset: () => void;
}
export function configurationKey(configuration: ClassifierConfiguration) { return JSON.stringify(configuration); }
export default function PredictionChallenge({ point, configuration, guess, submittedFor, challengeKey, actualPrediction, stale, onGuess, onSubmit, onReset }: Props) {
  const submitted = submittedFor === challengeKey;
  return <section className="prediction-challenge" aria-labelledby="challenge-title">
    <div><div className="panel-kicker">BEFORE YOU TRAIN</div><h3 id="challenge-title">Make a prediction</h3></div>
    {point ? <>
      <p>Look at the outlined test example near Feature 1 <b>{point.x.toFixed(2)}</b>, Feature 2 <b>{point.y.toFixed(2)}</b>. What group do you expect {configuration.algorithm === 'knn' ? `k-NN with k = ${configuration.k}` : `the tree at maximum depth ${configuration.maxDepth}`} to predict?</p>
      {submittedFor && !submitted && <p className="challenge-feedback" role="status">Data or model settings changed. Submit a fresh guess before training to reveal a result for this experiment.</p>}
      <div className="challenge-actions"><label htmlFor="challenge-guess">Your guess</label><select id="challenge-guess" value={guess} onChange={event => onGuess(event.currentTarget.value as Label)}><option value="A">Group A</option><option value="B">Group B</option></select><button className="button secondary" onClick={onSubmit}>Lock in guess</button>{submitted && <button className="text-button" onClick={onReset}>Try again</button>}</div>
      {submitted && !actualPrediction && <p className="challenge-feedback" role="status">Guess recorded. Train this configuration to reveal its prediction.</p>}
      {submitted && actualPrediction && !stale && <div className="challenge-feedback" role="status"><b>The model predicted Group {actualPrediction}.</b> Your guess was {guess === actualPrediction ? 'the same as the model’s prediction' : 'different from the model’s prediction'}. {actualPrediction === point.label ? `It matches the example’s actual Group ${point.label} label.` : `The example’s actual label is Group ${point.label}.`} A different guess is useful evidence to inspect, not a penalty.</div>}
      {submitted && stale && <p className="challenge-feedback" role="status">The model settings or data changed. Review the point and submit a fresh guess before training again.</p>}
    </> : <p>Add at least four examples to create a held-out point for this challenge.</p>}
  </section>;
}
