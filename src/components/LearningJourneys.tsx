import { ArrowUpRight, BookOpen } from 'lucide-react';
import type { ActivityDefinition } from '../learning/activities';
import type { ActivityId } from '../experiment/persistence';

interface Props { activities: ActivityDefinition[]; completed: ActivityId[]; active: ActivityId | null; onStart: (id: ActivityId) => void }
const journeys: Array<{ title: string; goal: string; ids: ActivityId[] }> = [
  { title: '1 · Build the foundations', goal: 'Meet labeled examples, features, and the two model families.', ids: ['teach-model', 'grow-tree'] },
  { title: '2 · Explore model behavior', goal: 'Change model settings and data to see how predictions respond.', ids: ['k-matters', 'add-noise', 'overfitting'] },
  { title: '3 · Evaluate and reflect', goal: 'Use held-out results and inspect mistakes before drawing conclusions.', ids: ['test-before-trust', 'fix-mistake'] },
];
const difficulty: Record<ActivityId, string> = {
  'teach-model': 'Starter', 'grow-tree': 'Starter', 'k-matters': 'Starter', 'add-noise': 'Developing',
  overfitting: 'Developing', 'test-before-trust': 'Developing', 'fix-mistake': 'Developing',
};

export default function LearningJourneys({ activities, completed, active, onStart }: Props) {
  const ordered = journeys.flatMap(journey => journey.ids);
  const next = ordered.find(id => !completed.includes(id));
  return <section className="learn-page"><div className="eyebrow"><BookOpen size={14}/> GUIDED LEARNING JOURNEYS / CLASSES 8–12</div><h1>Learn by asking<br/>better questions.</h1><p className="learn-lead">Start with how models use examples, explore what changes their predictions, then practice checking model results carefully. Each activity uses the playground itself.</p>
    {next && <div className="journey-next"><div><b>Your next activity</b><p>{activities.find(item => item.id === next)?.title.slice(4)} · Continue the progression at your own pace.</p></div><button className="button primary" onClick={() => onStart(next)}>Continue <ArrowUpRight size={14}/></button></div>}
    {journeys.map(journey => <section className="journey-section" key={journey.title} aria-labelledby={`journey-${journey.ids[0]}`}><div className="journey-heading"><div><h2 id={`journey-${journey.ids[0]}`}>{journey.title}</h2><p>{journey.goal}</p></div><span>{journey.ids.filter(id => completed.includes(id)).length} / {journey.ids.length} complete</span></div><div className="learn-grid">{journey.ids.map((id, index) => { const activity = activities.find(item => item.id === id)!; return <article className="activity-card" key={id}><span>{index + 1} / {difficulty[id]} {completed.includes(id) && <b className="activity-done">COMPLETE</b>}</span><h3>{activity.title.slice(4)}</h3><p className="activity-objective">{activity.objective}</p><p className="activity-challenge"><b>Challenge:</b> {activity.challenge}</p><button className="text-button" onClick={() => onStart(id)}>{active === id ? 'Resume activity' : completed.includes(id) ? 'Review activity' : 'Start activity'} <ArrowUpRight size={13}/></button></article>; })}</div></section>)}
    <div className="learn-grid concept-grid"><article><span>DATA</span><h3>Noise, overlap, and balance</h3><p>Overlap means examples from different groups occupy nearby feature positions. A noisy label conflicts with the local pattern. Class imbalance means one group has more examples; inspect group counts before reading accuracy alone.</p></article><article><span>MEASUREMENT</span><h3>Dataset size matters</h3><p>Small held-out sets make scores change sharply when a few predictions change. Add or remove examples to explore this; the visible score always uses the current seeded split.</p></article></div><p className="fine-print">Synthetic activities demonstrate model behavior under chosen conditions; they do not establish real-world performance.</p></section>;
}
