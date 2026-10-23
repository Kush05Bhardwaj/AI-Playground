import { useEffect, useMemo, useRef, useState } from 'react';
import type { MouseEvent, PointerEvent, KeyboardEvent } from 'react';
import { Activity, ArrowDownRight, ArrowUpRight, BookOpen, Check, ChevronDown, CircleHelp, FlaskConical, Play, RotateCcw, Sparkles, Trash2, Undo2, Redo2, Save, FolderOpen, X, MoveUp, MoveDown, MoveLeft, MoveRight } from 'lucide-react';
import { makeDataset, type Preset } from './ml/datasets';
import { predictKnn } from './ml/knn';
import { evaluate } from './ml/metrics';
import { splitData } from './ml/split';
import type { Label, Point } from './ml/types';
import { commitHistory, createHistory, redoHistory, undoHistory } from './experiment/history';
import type { DatasetSnapshot, HistoryState } from './experiment/history';
import { browserStorage, clearExperiment, loadExperiment, saveExperiment } from './experiment/persistence';
import type { ActivityId, LoadResult } from './experiment/persistence';
import { activities, emptySignals, isActivityComplete } from './learning/activities';
import type { ActivitySignals } from './learning/activities';

const presetInfo: Record<Preset, { name: string; desc: string }> = {
  separated: { name: 'Separated groups', desc: 'A clear first experiment: nearby examples usually share a label.' },
  overlap: { name: 'Overlapping groups', desc: 'Some examples sit among the other group, so mistakes are possible.' },
  noisy: { name: 'Noisy labels', desc: 'A few examples have misleading labels. See how local votes react.' },
};
const labels: Label[] = ['A', 'B'];
function App() {
  const [history, setHistory] = useState<HistoryState>(() => createHistory({ preset: 'separated', points: makeDataset('separated') }));
  const { preset, points } = history.present;
  const [seed, setSeed] = useState(42);
  const [k, setK] = useState(5);
  const [activeLabel, setActiveLabel] = useState<Label>('A');
  const [selected, setSelected] = useState<string | null>(null);
  const [run, setRun] = useState<{ split: ReturnType<typeof splitData>; evaluation: ReturnType<typeof evaluate>; trainingEvaluation: ReturnType<typeof evaluate>; boundary: { x: number; y: number; label: Label }[] } | null>(null);
  const [tab, setTab] = useState<'experiment' | 'learn'>('experiment');
  const [savedState, setSavedState] = useState<LoadResult>(() => { const storage = browserStorage(); return storage ? loadExperiment(storage) : { status: 'unavailable' }; });
  const [storageMessage, setStorageMessage] = useState('');
  const [showPlotHelp, setShowPlotHelp] = useState(false);
  const [activeActivity, setActiveActivity] = useState<ActivityId | null>(null);
  const [completedActivities, setCompletedActivities] = useState<ActivityId[]>([]);
  const [activitySignals, setActivitySignals] = useState<ActivitySignals>(emptySignals);
  const [dragPreview, setDragPreview] = useState<{ id: string; x: number; y: number } | null>(null);
  const dragRef = useRef<{ id: string; pointerId: number } | null>(null);
  const dataKey = useMemo(() => JSON.stringify({ points, preset, seed }), [points, preset, seed]);
  const runDataKey = useRef('');
  const runK = useRef(k);
  const previewChanged = dragPreview ? points.some(point => point.id === dragPreview.id && (point.x !== dragPreview.x || point.y !== dragPreview.y)) : false;
  const stale = run !== null && (dataKey !== runDataKey.current || k !== runK.current || previewChanged);
  const current = points.find(p => p.id === selected) ?? points[0];
  const liveSplit = useMemo(() => points.length > 1 ? splitData(points) : { train: [], test: [] }, [points]);
  const prediction = run && !stale && current ? predictKnn(current, run.split.train, Math.min(k, run.split.train.length)) : null;
  const counts = useMemo(() => ({ A: points.filter(p => p.label === 'A').length, B: points.filter(p => p.label === 'B').length }), [points]);

  useEffect(() => {
    if (activeActivity && isActivityComplete(activeActivity, activitySignals)) {
      setCompletedActivities(previous => previous.includes(activeActivity) ? previous : [...previous, activeActivity]);
    }
  }, [activeActivity, activitySignals]);
  useEffect(() => {
    function shortcuts(event: globalThis.KeyboardEvent) {
      const target = event.target as HTMLElement;
      if (!(event.ctrlKey || event.metaKey) || ['INPUT', 'TEXTAREA', 'SELECT'].includes(target.tagName) || target.isContentEditable) return;
      if (event.key.toLowerCase() === 'z') { event.preventDefault(); if (event.shiftKey) redo(); else undo(); }
      else if (event.key.toLowerCase() === 'y') { event.preventDefault(); redo(); }
    }
    window.addEventListener('keydown', shortcuts);
    return () => window.removeEventListener('keydown', shortcuts);
  }, []);

  function editDataset(next: DatasetSnapshot, action: string) {
    if (JSON.stringify(history.present) === JSON.stringify(next)) return;
    try {
      setHistory(previous => commitHistory(previous, next, action));
      if (selected && !next.points.some(point => point.id === selected)) setSelected(null);
      setActivitySignals(previous => ({ ...previous, runKs: [], edited: true, editedAfterMistake: previous.editedAfterMistake || previous.inspectedMistake, rerunAfterEdit: false }));
    } catch (error) { setStorageMessage(error instanceof Error ? error.message : 'That edit could not be applied.'); }
  }
  function choosePreset(next: Preset) { cancelDrag(); setSeed(42); editDataset({ preset: next, points: makeDataset(next, 42) }, `Loaded ${presetInfo[next].name}`); setSelected(null); }
  function train() {
    try {
      const split = splitData(points); let safeK = Math.min(k, split.train.length); if (safeK > 1 && safeK % 2 === 0) safeK--;
      const evaluation = evaluate(split.test, p => predictKnn(p, split.train, safeK).label);
      const trainingEvaluation = evaluate(split.train, p => predictKnn(p, split.train, safeK).label);
      const boundary: { x: number; y: number; label: Label }[] = [];
      for (let yi = 0; yi < 24; yi++) for (let xi = 0; xi < 32; xi++) {
        const x = (xi + 0.5) / 32; const y = (yi + 0.5) / 24;
        boundary.push({ x, y, label: predictKnn({ x, y }, split.train, safeK).label });
      }
      runDataKey.current = dataKey; runK.current = safeK; if (safeK !== k) setK(safeK); if (!split.test.some(p => p.id === selected)) setSelected(split.test[0]?.id ?? null); setRun({ split, evaluation, trainingEvaluation, boundary });
      setActivitySignals(previous => ({ ...previous, runKs: [...previous.runKs.slice(-99), safeK], rerunAfterEdit: previous.edited }));
    } catch { setRun(null); }
  }
  function startFresh() {
    if (!window.confirm('Start fresh? This clears the current dataset and its undo history.')) return;
    cancelDrag(); const initial = { preset: 'separated' as const, points: makeDataset('separated', 42) };
    setHistory(createHistory(initial)); setSeed(42); setK(5); setActiveLabel('A'); setRun(null); setSelected(null); setActiveActivity(null); setActivitySignals(emptySignals());
  }
  function addPoint(x: number, y: number) { const point = { id: `custom-${Date.now()}-${Math.random().toString(16).slice(2, 6)}`, x, y, label: activeLabel }; editDataset({ preset, points: [...points, point] }, 'Added a point'); setSelected(point.id); }
  function updatePoint(id: string, patch: Partial<Pick<Point, 'x' | 'y' | 'label'>>, action = 'Edited a point') { editDataset({ preset, points: points.map(p => p.id === id ? { ...p, ...patch } : p) }, action); }
  function removePoint(id: string) { editDataset({ preset, points: points.filter(p => p.id !== id) }, 'Deleted a point'); setSelected(null); }
  function undo() { cancelDrag(); setHistory(previous => undoHistory(previous)); setActivitySignals(previous => ({ ...previous, runKs: [], rerunAfterEdit: false })); }
  function redo() { cancelDrag(); setHistory(previous => redoHistory(previous)); setActivitySignals(previous => ({ ...previous, runKs: [], rerunAfterEdit: false })); }
  function cancelDrag() { dragRef.current = null; setDragPreview(null); }
  function eventPoint(event: PointerEvent<SVGElement>) {
    const svg = event.currentTarget.ownerSVGElement ?? (event.currentTarget as SVGSVGElement);
    const rect = svg.getBoundingClientRect();
    if (!rect.width || !rect.height || !Number.isFinite(event.clientX) || !Number.isFinite(event.clientY)) { const point = points.find(item => item.id === dragRef.current?.id); return { x: dragPreview?.x ?? point?.x ?? .5, y: dragPreview?.y ?? point?.y ?? .5 }; }
    return { x: Math.max(0, Math.min(1, (event.clientX - rect.left) / rect.width)), y: Math.max(0, Math.min(1, 1 - (event.clientY - rect.top) / rect.height)) };
  }
  function onPointPointerDown(event: PointerEvent<SVGGElement>, point: Point) {
    event.stopPropagation(); event.preventDefault(); setSelected(point.id); dragRef.current = { id: point.id, pointerId: event.pointerId }; setDragPreview({ id: point.id, x: point.x, y: point.y });
    try { event.currentTarget.setPointerCapture(event.pointerId); } catch { /* Pointer capture is not available in every embedded browser. */ }
  }
  function onPointPointerMove(event: PointerEvent<SVGGElement>) {
    if (dragRef.current?.pointerId !== event.pointerId) return;
    const position = eventPoint(event); setDragPreview({ id: dragRef.current.id, ...position });
  }
  function onPointPointerUp(event: PointerEvent<SVGGElement>) {
    if (dragRef.current?.pointerId !== event.pointerId) return;
    const id = dragRef.current.id; const position = eventPoint(event); dragRef.current = null; setDragPreview(null);
    const point = points.find(item => item.id === id);
    if (point && (Math.abs(point.x - position.x) > .0001 || Math.abs(point.y - position.y) > .0001)) updatePoint(id, position, 'Moved a point');
  }
  function onPointPointerCancel(event: PointerEvent<SVGGElement>) { if (dragRef.current?.pointerId === event.pointerId) cancelDrag(); }
  function onPointKeyDown(event: KeyboardEvent<SVGGElement>, point: Point) {
    if (event.key === 'Enter' || event.key === ' ') { event.preventDefault(); selectPoint(point); }
    const movement: Record<string, [number, number]> = { ArrowLeft: [-1, 0], ArrowRight: [1, 0], ArrowUp: [0, 1], ArrowDown: [0, -1] };
    if (movement[event.key]) { event.preventDefault(); setSelected(point.id); nudgePoint(point.id, ...movement[event.key]!, event.shiftKey); }
    if (event.key === 'Escape') cancelDrag();
  }
  function selectPoint(point: Point) {
    setSelected(point.id);
    if (run && !stale && run.split.test.some(item => item.id === point.id)) {
      const predicted = run.evaluation.predictions.find(item => item.point.id === point.id)?.predicted;
      setActivitySignals(previous => ({ ...previous, inspectedTest: true, inspectedMistake: previous.inspectedMistake || predicted !== point.label }));
    }
  }
  function onPlotClick(event: MouseEvent<SVGSVGElement>) { if ((event.target as SVGElement).closest('[data-point]') || dragRef.current) return; const rect = event.currentTarget.getBoundingClientRect(); addPoint(Math.max(0, Math.min(1, (event.clientX - rect.left) / rect.width)), Math.max(0, Math.min(1, 1 - (event.clientY - rect.top) / rect.height))); }
  function nudgePoint(id: string, dx: number, dy: number, large = false) { const point = points.find(item => item.id === id); if (!point) return; const step = large ? .05 : .01; updatePoint(id, { x: Math.max(0, Math.min(1, point.x + dx * step)), y: Math.max(0, Math.min(1, point.y + dy * step)) }, 'Moved a point with keyboard'); }
  function startActivity(id: ActivityId) {
    const activity = activities.find(item => item.id === id)!; cancelDrag(); setActiveActivity(id); setActivitySignals(emptySignals()); setK(activity.initialK); setRun(null); setSelected(null); setSeed(42); setTab('experiment');
    editDataset({ preset: activity.preset, points: makeDataset(activity.preset, 42) }, `Started ${activity.title}`); setActivitySignals(emptySignals());
  }
  function resetActivity() { if (!activeActivity) return; const activity = activities.find(item => item.id === activeActivity)!; setK(activity.initialK); setRun(null); setSelected(null); setSeed(42); editDataset({ preset: activity.preset, points: makeDataset(activity.preset, 42) }, `Reset ${activity.title}`); setActivitySignals(emptySignals()); setCompletedActivities(previous => previous.filter(id => id !== activity.id)); }
  function saveCurrent() {
    const storage = browserStorage(); if (!storage) { setStorageMessage('Local storage is unavailable in this browser.'); return; }
    const ok = saveExperiment(storage, { seed, preset, points, k, activeLabel, activeActivity, completedActivities, activityProgress: activitySignals });
    setStorageMessage(ok ? 'Experiment saved on this device.' : 'Could not save. Browser storage may be full or the experiment may be invalid.'); setSavedState(loadExperiment(storage));
  }
  function restoreSaved() {
    if (savedState.status !== 'valid') return; cancelDrag(); const saved = savedState.value;
    try { setHistory(previous => commitHistory(previous, { preset: saved.preset, points: saved.points }, 'Restored saved experiment')); setSeed(saved.seed); setK(saved.k); setActiveLabel(saved.activeLabel); setActiveActivity(saved.activeActivity); setCompletedActivities(saved.completedActivities); setActivitySignals(saved.activityProgress); setRun(null); setSelected(null); setStorageMessage('Saved experiment restored. Train again to calculate current results.'); }
    catch { setStorageMessage('The saved experiment could not be restored.'); }
  }
  function clearSaved() { if (!window.confirm('Delete the saved experiment from this browser?')) return; const storage = browserStorage(); const ok = storage ? clearExperiment(storage) : false; setSavedState(storage ? loadExperiment(storage) : { status: 'unavailable' }); setStorageMessage(ok ? 'Saved experiment removed from this device.' : 'Saved experiment could not be cleared.'); }
  const matrix = run && !stale ? run.evaluation.matrix : null;
  const accuracy = run && !stale ? run.evaluation.accuracy : null;
  const activeDefinition = activities.find(activity => activity.id === activeActivity) ?? null;
  const staleLoadMessage = savedState.status === 'invalid' ? savedState.reason : savedState.status === 'unavailable' ? 'Browser storage is unavailable.' : '';

  return <div className="app-shell">
    <header className="topbar"><a className="brand" href="#top" aria-label="AI Playground home"><span className="brand-mark"><Sparkles size={18}/></span><span>AI <b>Playground</b><small>LEARNING LAB</small></span></a><nav className="topnav"><button className={tab === 'experiment' ? 'nav-link active' : 'nav-link'} onClick={() => setTab('experiment')}><FlaskConical size={15}/> Experiments</button><button className={tab === 'learn' ? 'nav-link active' : 'nav-link'} onClick={() => setTab('learn')}><BookOpen size={15}/> Learn</button></nav><div className="top-right"><span className="local-pill"><i/> Runs locally</span><button className="header-action" onClick={saveCurrent}><Save size={13}/> Save</button><button className="header-action" disabled={savedState.status !== 'valid'} onClick={restoreSaved}><FolderOpen size={13}/> Restore</button><button className="icon-btn" aria-label="Start fresh" title="Start fresh" onClick={startFresh}><RotateCcw size={16}/></button></div></header>
    <main id="top">
      {tab === 'learn' ? <section className="learn-page"><div className="eyebrow"><BookOpen size={14}/> GUIDED EXPERIMENTS / K-NEAREST NEIGHBORS</div><h1>Learning by looking<br/>closely.</h1><p className="learn-lead">Choose a short investigation. Each activity changes the real dataset or model, and completion depends on the experiment you perform.</p><div className="learn-grid">{activities.map((activity, index) => <article className="activity-card" key={activity.id}><span>{String.fromCharCode(65 + index)} / GUIDED ACTIVITY {completedActivities.includes(activity.id) && <b className="activity-done">COMPLETE</b>}</span><h3>{activity.title.slice(4)}</h3><p className="activity-objective">{activity.objective}</p><p className="activity-challenge"><b>Challenge:</b> {activity.challenge}</p><button className="text-button" onClick={() => startActivity(activity.id)}>{activeActivity === activity.id ? 'Resume activity' : 'Start activity'} <ArrowUpRight size={13}/></button></article>)}</div><div className="learn-grid concept-grid"><article><span>01 / FEATURES</span><h3>What can we observe?</h3><p>Each point has two features, horizontal and vertical measurements. Here they are called Feature 1 and Feature 2.</p></article><article><span>02 / LABELS</span><h3>What are we predicting?</h3><p>A label is the category attached to an example. Each example belongs to Group A or Group B.</p></article><article><span>03 / NEIGHBORS</span><h3>What does k change?</h3><p>Small k follows nearby examples closely. Larger k averages over a wider area, which may smooth noise or blur small groups.</p></article><article><span>04 / EVALUATION</span><h3>Why test separately?</h3><p>Held-out examples were not used as neighbors, so they give a first check of how a model behaves on unfamiliar examples.</p></article></div><p className="fine-print">Synthetic activities demonstrate model behavior under chosen conditions; they do not establish real-world performance.</p></section> : <>
        <section className="intro"><div className="eyebrow"><span className="eyebrow-dot"/> INTERACTIVE MACHINE LEARNING LAB <span className="eyebrow-divider">/</span> CLASS 9–12</div><div className="intro-row"><div><h1>Train it. Test it. <em>Understand it.</em></h1><p>Can a model learn the difference between two groups? Shape the data, run k-nearest neighbors, and see why it makes each prediction.</p></div><div className="step-track"><span className="step active"><i>1</i> EXPLORE</span><b/><span className={run && !stale ? 'step active' : 'step'}><i>2</i> TRAIN</span><b/><span className={run && !stale ? 'step active' : 'step'}><i>3</i> INVESTIGATE</span></div></div></section>
        {activeDefinition && <section className="activity-active" aria-live="polite"><div className="activity-active-top"><div><span className="panel-kicker">GUIDED ACTIVITY {completedActivities.includes(activeDefinition.id) ? '· COMPLETE' : ''}</span><h2>{activeDefinition.title}</h2></div><button className="text-button" onClick={resetActivity}><RotateCcw size={13}/> Reset activity</button></div><p><b>Objective:</b> {activeDefinition.objective}</p><p><b>Your challenge:</b> {activeDefinition.challenge}</p><ol>{activeDefinition.steps.map(step => <li key={step}>{step}</li>)}</ol><p className="activity-explain">{activeDefinition.explanation}</p>{activeActivity === 'test-before-trust' && <button className="button secondary" disabled={!run || stale} onClick={() => setActivitySignals(previous => ({ ...previous, comparedEvaluation: true }))}>I reviewed both scores and sample counts</button>}<div className="activity-completion">{completedActivities.includes(activeDefinition.id) ? <><Check size={14}/> Complete · {activeDefinition.completion}</> : <>Completion: {activeDefinition.completion}</>}</div></section>}        <div className="workspace">
          <aside className="panel dataset-panel"><div className="panel-head"><div><div className="panel-kicker">YOUR EXPERIMENT</div><h2>Dataset</h2></div><button className="icon-btn" aria-label="Reset experiment" title="Reset experiment" onClick={startFresh}><RotateCcw size={16}/></button></div>
            <label className="control-label" htmlFor="preset">DATASET PRESET</label><div className="select-wrap"><select id="preset" value={preset} onChange={e => choosePreset(e.target.value as Preset)}>{Object.entries(presetInfo).map(([id, item]) => <option key={id} value={id}>{item.name}</option>)}</select><ChevronDown size={15}/></div><p className="dataset-desc">{presetInfo[preset].desc}</p>
            <div className="divider"/><div className="panel-kicker">CHOOSE A LABEL <span className="hint">for new points</span></div><div className="label-picker">{labels.map(label => <button key={label} onClick={() => setActiveLabel(label)} className={`label-choice ${label.toLowerCase()} ${activeLabel === label ? 'chosen' : ''}`}><span className={`shape ${label.toLowerCase()}`}/><span>Group {label}</span>{activeLabel === label && <Check size={14}/>}</button>)}</div>
            <div className="class-counts"><span><i className="dot a"/> Group A <b>{counts.A}</b></span><span><i className="dot b"/> Group B <b>{counts.B}</b></span></div>
            <div className="divider"/><div className="history-controls"><button className="history-button" disabled={!history.past.length} onClick={undo}><Undo2 size={13}/> Undo</button><button className="history-button" disabled={!history.future.length} onClick={redo}><Redo2 size={13}/> Redo</button><span>{history.lastAction}</span></div><div className="feature-note"><span className="feature-icon">x₂</span><div><b>Two features, one label</b><p>Each dot is an example. Its position shows two measurements; its shape shows the group it belongs to.</p></div></div><div className="dataset-actions"><button className="text-button danger" disabled={!points.length} onClick={() => points.length && window.confirm('Clear all points?') && editDataset({ preset, points: [] }, 'Cleared the dataset')}><Trash2 size={14}/> Clear points</button><span>{points.length} observations</span></div>
            <div className="storage-controls"><button className="text-button" onClick={saveCurrent}><Save size={13}/> Save on this device</button><button className="text-button" disabled={savedState.status !== 'valid'} onClick={restoreSaved}><FolderOpen size={13}/> Restore saved</button><button className="text-button danger" disabled={savedState.status === 'missing'} onClick={clearSaved}><X size={12}/> Clear saved</button><span className="storage-status" aria-live="polite">{storageMessage || staleLoadMessage || (savedState.status === 'valid' ? 'Saved experiment available on this device.' : savedState.status === 'unavailable' ? 'Local storage unavailable.' : 'Not saved yet.')}</span></div>          </aside>
          <section className="panel plot-panel"><div className="plot-head"><div><div className="panel-kicker">DATA SPACE <span className="live-tag"><i/> LIVE</span></div><h2>Feature map</h2></div><div className="plot-tools"><span className="tool-hint"><span className="plus">+</span> Click to add a point</span><button className="small-icon" aria-label="Plot help" aria-expanded={showPlotHelp} title="Plot help" onClick={() => setShowPlotHelp(value => !value)}><CircleHelp size={15}/></button></div></div>{showPlotHelp && <div className="plot-help" role="note"><span>Choose a group, click an empty area to add an example, or drag a point to move it. Focus a point and use arrow keys for keyboard movement. Outlined points are held-out test examples.</span><button className="icon-btn" aria-label="Close plot help" onClick={() => setShowPlotHelp(false)}><X size={13}/></button></div>}
            <div className="plot-wrap"><svg viewBox="0 0 640 430" role="img" aria-label="Interactive feature map. Click to add a point. Group A points are circles and Group B points are diamonds." onClick={onPlotClick} className="plot-svg" preserveAspectRatio="none">
              <defs><pattern id="grid" width="64" height="43" patternUnits="userSpaceOnUse"><path d="M 64 0 L 0 0 0 43" fill="none" stroke="#27313b" strokeWidth="1"/></pattern></defs><rect width="640" height="430" fill="#11171d"/><rect width="640" height="430" fill="url(#grid)"/>
              {run && !stale && run.boundary.map((cell, i) => <rect key={i} x={cell.x * 640 - 10} y={(1-cell.y) * 430 - 9} width="20.2" height="18.2" fill={cell.label === 'A' ? '#40bd9a' : '#f0aa58'} opacity=".11" pointerEvents="none"/>)}
              {[0, .25, .5, .75, 1].map((tick, i) => <g key={tick}><text x={i * 160 + 5} y="419" className="tick">{tick.toFixed(2)}</text><text x="8" y={425 - i * 100} className="tick">{tick.toFixed(2)}</text></g>)}
              {points.map(p => {
                const visible = dragPreview?.id === p.id ? { ...p, x: dragPreview.x, y: dragPreview.y } : p;
                const isTest = run && !stale && run.split.test.some(t => t.id === p.id);
                const wrong = isTest && run.evaluation.predictions.find(v => v.point.id === p.id)?.predicted !== p.label;
                return <g key={p.id} data-point="true" onClick={e => { e.stopPropagation(); selectPoint(p); }} onPointerDown={event => onPointPointerDown(event, p)} onPointerMove={onPointPointerMove} onPointerUp={onPointPointerUp} onPointerCancel={onPointPointerCancel} onLostPointerCapture={onPointPointerCancel} className="point-hit" role="button" tabIndex={0} aria-label={`Group ${p.label}, feature 1 ${visible.x.toFixed(2)}, feature 2 ${visible.y.toFixed(2)}${isTest ? ', test example' : ''}. Drag to move; use arrow keys to move.`} onKeyDown={event => onPointKeyDown(event, p)}>
                  {selected === p.id && <circle cx={visible.x*640} cy={(1-visible.y)*430} r="13" fill="none" stroke="#e5edf2" strokeWidth="1.5"/>}{p.label === 'A' ? <circle cx={visible.x*640} cy={(1-visible.y)*430} r={isTest ? 6.7 : 5.3} fill={isTest ? '#11171d' : '#40bd9a'} stroke={wrong ? '#ff7272' : '#40bd9a'} strokeWidth={isTest ? 2.3 : 1.4}/> : <path d={`M ${visible.x*640} ${(1-visible.y)*430-7} l 7 7 l -7 7 l -7 -7 z`} fill={isTest ? '#11171d' : '#f0aa58'} stroke={wrong ? '#ff7272' : '#f0aa58'} strokeWidth={isTest ? 2.3 : 1.4}/>}
                </g>;
              })}
            </svg><div className="axis-y">FEATURE 2</div><div className="axis-x">FEATURE 1</div></div>
            <div className="plot-legend"><span><i className="legend-circle"/> Group A</span><span><i className="legend-diamond"/> Group B</span><span><i className="legend-test"/> Test example</span>{run && !stale && <span><i className="legend-region"/> Model region</span>}<span className="legend-explain">Outline = held-out test point</span></div>
          </section>
          <aside className="panel model-panel"><div className="panel-head"><div><div className="panel-kicker">MODEL SETTINGS</div><h2>Configure &amp; train</h2></div><span className="algorithm-badge">AVAILABLE</span></div><label className="control-label" htmlFor="algorithm">ALGORITHM</label><div className="select-wrap disabled"><select id="algorithm" disabled value="knn"><option value="knn">k-Nearest Neighbors</option></select><ChevronDown size={15}/></div><p className="dataset-desc algorithm-desc">Classifies a point by looking at the labels of its nearest examples.</p><div className="k-control"><div><label htmlFor="k-slider" className="control-label">NEIGHBORS <span className="k-symbol">k</span></label><p>How many nearby examples vote?</p></div><output htmlFor="k-slider" className="k-value">{k}</output></div><input id="k-slider" type="range" min="1" max="15" step="2" value={k} onChange={e => setK(Number(e.target.value))} aria-label="Number of neighbors k"/><div className="range-labels"><span>1 · more local</span><span>15 · smoother</span></div><div className="parameter-note"><span>ⓘ</span><p>Odd values of <b>k</b> help avoid tied votes. Every vote comes from a training example.</p></div>
            <div className="split-summary"><div className="panel-kicker">REPRODUCIBLE SPLIT <span className="seed-tag">SEED 123</span></div><div className="split-counts"><div><b>{run && !stale ? run.split.train.length : liveSplit.train.length}</b><span>Training</span></div><i/><div><b>{run && !stale ? run.split.test.length : liveSplit.test.length}</b><span>Test</span></div></div><p>Test examples stay out of the model’s neighbor list.</p></div>
            <button className="button primary train-button" onClick={train} disabled={points.length < 4 || points.length - Math.round(points.length * .25) < 1}><Play size={15} fill="currentColor"/> {run && stale ? 'Run again' : run ? 'Train again' : 'Train model'}</button><div className="run-status" aria-live="polite">{points.length < 4 ? 'Add at least four examples to train.' : stale ? 'Experiment changed · previous results are stale.' : run ? <><Check size={13}/> Model trained on {run.split.train.length} examples</> : 'Ready when you are.'}</div>
          </aside>
        </div>
        <section className="results-grid">
          <article className="panel result-panel"><div className="result-head"><div><div className="panel-kicker">MODEL CHECK</div><h2>Training and test scores</h2></div>{run && !stale ? <span className="inspect-tag">{run.split.test.length} HELD-OUT</span> : <span className="not-run">{stale ? 'STALE' : 'NOT RUN'}</span>}</div>
            {run && !stale ? <><div className="score-pair"><div><span>TRAINING · IN-SAMPLE</span><b>{run.trainingEvaluation.accuracy === null ? 'N/A' : `${Math.round(run.trainingEvaluation.accuracy * 100)}%`}</b></div><div><span>TEST · HELD-OUT</span><b>{accuracy === null ? 'N/A' : `${Math.round(accuracy * 100)}%`}</b></div></div><p className="result-sub">Training score includes examples used by the model and can be optimistic. Test score uses examples held aside from training.</p>{matrix && <><div className="matrix-title"><span>ACTUAL ↓ &nbsp; PREDICTED →</span><span>Group A&nbsp;&nbsp;&nbsp; Group B</span></div><div className="matrix"><b>Group A</b><strong>{matrix[0][0]}</strong><strong>{matrix[0][1]}</strong><b>Group B</b><strong>{matrix[1][0]}</strong><strong>{matrix[1][1]}</strong></div></>}<p className="matrix-note">Rows are actual labels; columns are predicted labels. Red outlines mark test mistakes. Small synthetic tests are uncertain.</p></> : <div className="empty-result"><Activity size={18}/><span>{stale ? 'Run the changed experiment to refresh evaluation.' : 'Train the model to see scores on training and held-out examples.'}</span></div>}
          </article>
          <article className="panel result-panel inspector-panel"><div className="result-head"><div><div className="panel-kicker">PREDICTION INSPECTOR</div><h2>Why this prediction?</h2></div><span className="inspect-tag">{current ? 'SELECTED POINT' : 'NO POINT'}</span></div>{current && <div className="nudge-controls"><span>Move selected point</span><button aria-label="Move point up" onClick={() => nudgePoint(current.id,0,1)}><MoveUp size={13}/></button><button aria-label="Move point left" onClick={() => nudgePoint(current.id,-1,0)}><MoveLeft size={13}/></button><button aria-label="Move point down" onClick={() => nudgePoint(current.id,0,-1)}><MoveDown size={13}/></button><button aria-label="Move point right" onClick={() => nudgePoint(current.id,1,0)}><MoveRight size={13}/></button></div>}{prediction && current ? <><div className="prediction-banner"><span className={`shape ${prediction.label.toLowerCase()}`}/><div><small>MODEL PREDICTS</small><b>Group {prediction.label}</b></div><span className="vote-count">{prediction.votes[prediction.label]} of {prediction.neighbors.length} votes</span></div><p className="neighbor-intro">{run!.split.test.some(p => p.id === current.id) ? <>The {prediction.neighbors.length} nearest <b>training examples</b> that influenced the vote:</> : <>This is a <b>training example</b>; it can appear among its own neighbors. Select an outlined test point for an independent check.</>}</p><div className="neighbor-list">{prediction.neighbors.map((n, i) => <div className="neighbor-row" key={n.point.id}><span className="rank">{i+1}</span><span className={`mini-shape ${n.point.label.toLowerCase()}`}/><span>Group {n.point.label}</span><code>{n.distance.toFixed(3)} units</code><span className="neighbor-bar"><i style={{width:`${Math.max(8,(1-n.distance/1.2)*100)}%`}}/></span></div>)}</div><p className="prediction-caption">Closer examples have shorter distances. With k = {prediction.neighbors.length}, the most common label wins. Vote shares are not calibrated probabilities.</p></> : <div className="empty-result"><ArrowDownRight size={18}/><span>{stale ? 'Results describe an older version of this experiment.' : 'Train to inspect the real neighbors for a selected point.'}</span></div>}</article>
          <article className="panel result-panel point-table-panel"><div className="result-head"><div><div className="panel-kicker">ACCESSIBLE DATA EDITOR</div><h2>Examples <span className="title-count">{points.length}</span></h2></div><span className="inspect-tag">SELECT TO INSPECT</span></div><div className="point-table-wrap"><table><caption className="sr-only">Edit or remove dataset examples</caption><thead><tr><th>Group</th><th>Feature 1</th><th>Feature 2</th><th>Role</th><th><span className="sr-only">Actions</span></th></tr></thead><tbody>{points.slice(0, 8).map(p => { const isTest = run && !stale && run.split.test.some(t => t.id === p.id); return <tr key={p.id} className={selected === p.id ? 'selected-row' : ''} onClick={() => selectPoint(p)}><td><button className="table-label" aria-label={`Change ${p.id} label`} onClick={e => {e.stopPropagation(); updatePoint(p.id,{label:p.label==='A'?'B':'A'});}}><i className={`mini-shape ${p.label.toLowerCase()}`}/> {p.label} ↻</button></td><td><input aria-label={`${p.id} Feature 1`} type="number" min="0" max="1" step="0.01" value={p.x.toFixed(2)} onChange={e=>updatePoint(p.id,{x:Math.max(0,Math.min(1,Number(e.target.value)))})}/></td><td><input aria-label={`${p.id} Feature 2`} type="number" min="0" max="1" step="0.01" value={p.y.toFixed(2)} onChange={e=>updatePoint(p.id,{y:Math.max(0,Math.min(1,Number(e.target.value)))})}/></td><td><span className={`role-pill ${isTest ? 'test' : ''}`}>{isTest ? 'TEST' : 'TRAIN'}</span></td><td><button className="row-delete" aria-label={`Delete ${p.id}`} onClick={e=>{e.stopPropagation();removePoint(p.id);}}><Trash2 size={13}/></button></td></tr>;})}</tbody></table>{points.length > 8 && <p className="table-foot">Showing first 8 of {points.length}. Click the map to add an example.</p>}</div></article>
        </section>
        <section className="bottom-notes"><div className="activity-callout"><span className="callout-icon"><Sparkles size={16}/></span><div><b>Try this: make a tricky example</b><p>Add a point near the boundary or flip a label. What changes when you train again?</p></div><button className="text-button" onClick={() => {setActiveLabel(activeLabel==='A'?'B':'A'); window.scrollTo({top:0,behavior:'smooth'});}}>Choose the other label <ArrowUpRight size={13}/></button></div><p className="privacy-note"><span className="shield">◈</span> Your experiment stays in this browser. No account, tracking, or external AI service. <span className="note-dot">·</span> Synthetic examples teach model behavior; they don’t guarantee real-world performance.</p></section>
      </>}
    </main>
    <footer><span>AI PLAYGROUND <b>·</b> HANDS-ON MACHINE LEARNING</span><span>VERSION 0.1 <b>·</b> K-NEAREST NEIGHBORS</span></footer>
  </div>;
}
export default App;
