import type { ActivityId } from '../experiment/persistence';
export interface ActivityDefinition {
  id: ActivityId;
  title: string;
  objective: string;
  challenge: string;
  steps: string[];
  hint: string;
  explanation: string;
  completion: string;
  preset: 'separated' | 'overlap' | 'noisy';
  initialK: number;
}
export const activities: ActivityDefinition[] = [
  { id: 'teach-model', title: 'A · Teach the model', objective: 'Examples and labels give a classifier evidence for its predictions.', challenge: 'Run the model, then inspect one held-out point and its neighbors.', steps: ['Start with the separated groups.', 'Train the model.', 'Select an outlined test point on the map and compare its true label with the neighbors.'], hint: 'Look for an outlined point. It was set aside and did not vote while the model was trained.', explanation: 'The closest labeled examples vote. The model has not seen the outlined test point during training.', completion: 'Train the model and inspect a held-out test point.', preset: 'separated', initialK: 5 },
  { id: 'k-matters', title: 'B · What does k change?', objective: 'The number of neighbors changes how local or smooth a k-NN model behaves.', challenge: 'Compare the same dataset with k = 1 and k = 15.', steps: ['Train once with k = 1.', 'Change k to 15 and train again without changing the data.', 'Compare the new results. The comparison lab can show both settings side by side.'], hint: 'With k = 1, one nearby example can decide. With k = 15, more examples share the vote.', explanation: 'A small k follows nearby examples closely. A larger k averages over a wider area. Scores can move either way on a particular sample.', completion: 'Train on the same data with at least two different k values.', preset: 'overlap', initialK: 1 },
  { id: 'add-noise', title: 'C · Add noise', objective: 'Misleading labels and overlapping examples can change local votes.', challenge: 'Flip or move an example, then train again to see the effect.', steps: ['Start with the noisy preset.', 'Change a point label or position using the point editor.', 'Train again and inspect nearby predictions.'], hint: 'Choose an example near points from the other group, then check its neighbors after the edit.', explanation: 'k-NN uses the labels it receives. A mislabeled example can sway predictions in its neighborhood; it does not know the label was a mistake.', completion: 'Edit the noisy dataset and train on the edited version.', preset: 'noisy', initialK: 3 },
  { id: 'overfitting', title: 'D · Investigate overfitting', objective: 'A very local model can react to individual examples; held-out data helps check whether those details generalize.', challenge: 'Compare the detailed k = 1 boundary with the smoother k = 15 boundary on the same data.', steps: ['Use the noisy preset.', 'Train with k = 1, then k = 15 without changing the data.', 'Compare training and held-out scores as well as the boundary.'], hint: 'Look for a gap between training and test results. A detailed boundary by itself does not show that the model overfits.', explanation: 'A detailed boundary alone does not prove overfitting. If the model fits its training examples better than held-out examples, that gap is evidence of overfitting for this split. The training score is in-sample and can be optimistic.', completion: 'Train with both k = 1 and k = 15 on the same dataset.', preset: 'noisy', initialK: 1 },
  { id: 'test-before-trust', title: 'E · Test before you trust', objective: 'Training and held-out scores answer different questions.', challenge: 'Compare the score on examples used by the model with its score on held-out examples.', steps: ['Train the model.', 'Compare the two scores, sample counts, and per-class scores.', 'Use the reflection button to record that you reviewed the difference.'], hint: 'When one group has fewer test examples, overall accuracy may not show how well that group was classified.', explanation: 'Training performance describes examples used in the model. Test performance uses held-out examples, but small synthetic tests still give uncertain estimates. Repeatedly choosing settings from the same test score can make it less independent.', completion: 'Train the model and explicitly review the training/test comparison.', preset: 'overlap', initialK: 5 },
  { id: 'fix-mistake', title: 'F · Fix the mistake', objective: 'Error analysis can suggest useful changes to data or model settings.', challenge: 'Inspect a wrong test prediction, revise an example, and rerun.', steps: ['Start with noisy data and train.', 'Select a red-outlined test point that was misclassified.', 'Edit a nearby example or its label, then train again.'], hint: 'The inspector lists the actual neighbors that influenced a mistake. Try changing a nearby training example, then check all the held-out scores again.', explanation: 'A model mistake can come from overlap, noise, or the chosen k. A change may help some predictions and hurt others, so inspect the new test results too.', completion: 'Inspect a misclassified test point, edit the data, and train again.', preset: 'noisy', initialK: 3 },
];

export interface ActivitySignals {
  runKs: number[];
  edited: boolean;
  inspectedTest: boolean;
  inspectedMistake: boolean;
  editedAfterMistake: boolean;
  rerunAfterEdit: boolean;
  comparedEvaluation: boolean;
}
export const emptySignals = (): ActivitySignals => ({ runKs: [], edited: false, inspectedTest: false, inspectedMistake: false, editedAfterMistake: false, rerunAfterEdit: false, comparedEvaluation: false });
export function isActivityComplete(id: ActivityId, signals: ActivitySignals): boolean {
  switch (id) {
    case 'teach-model': return signals.runKs.length > 0 && signals.inspectedTest;
    case 'k-matters': return new Set(signals.runKs).size >= 2;
    case 'add-noise': return signals.edited && signals.runKs.length > 0 && signals.rerunAfterEdit;
    case 'overfitting': return signals.runKs.includes(1) && signals.runKs.includes(15);
    case 'test-before-trust': return signals.runKs.length > 0 && signals.comparedEvaluation;
    case 'fix-mistake': return signals.inspectedMistake && signals.editedAfterMistake && signals.rerunAfterEdit;
  }
}
