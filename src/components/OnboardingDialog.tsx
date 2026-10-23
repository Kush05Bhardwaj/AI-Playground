import { useEffect, useRef, useState } from 'react';
import { ArrowLeft, ArrowRight, X } from 'lucide-react';

const pages = [
  { title: 'Explore how a model learns', body: 'AI Playground is a small, local machine-learning lab. Change examples, train two classifiers, and inspect what they learned. Your experiments stay in this browser.', action: 'Start by choosing a dataset preset.' },
  { title: 'Read the feature map', body: 'Each shape is one labeled example. Position shows Feature 1 and Feature 2. Outlined examples are set aside for testing and stay out of model fitting.', action: 'Choose a preset and inspect where the two groups sit.' },
  { title: 'Choose and train a model', body: 'k-NN votes among nearby training examples. A decision tree asks feature-threshold questions. Their controls affect how each model behaves.', action: 'Pick an algorithm and make a prediction guess before training.' },
  { title: 'Check the explanation and scores', body: 'Inspect neighbors or the tree decision path. Training scores describe examples used to fit the model; held-out scores describe examples kept aside for a check.', action: 'Select a test example and compare the result with your expectation.' },
];
export const ONBOARDING_KEY = 'ai-playground.onboarding.dismissed.v1';

interface Props { open: boolean; onClose: () => void }
export default function OnboardingDialog({ open, onClose }: Props) {
  const [page, setPage] = useState(0);
  const closeRef = useRef<HTMLButtonElement>(null);
  const onCloseRef = useRef(onClose);
  onCloseRef.current = onClose;
  useEffect(() => { if (open) setPage(0); }, [open]);
  useEffect(() => {
    if (!open) return;
    const previousFocus = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    closeRef.current?.focus();
    function onKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') { onCloseRef.current(); return; }
      if (event.key !== 'Tab') return;
      const dialog = document.querySelector('.onboarding-dialog');
      const items = dialog?.querySelectorAll<HTMLElement>('button:not([disabled]), a[href], input:not([disabled]), select:not([disabled]), [tabindex]:not([tabindex="-1"])');
      if (!items?.length) return;
      const first = items[0]!; const last = items[items.length - 1]!;
      if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last.focus(); }
      else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus(); }
    }
    window.addEventListener('keydown', onKeyDown);
    return () => { window.removeEventListener('keydown', onKeyDown); previousFocus?.focus(); };
  }, [open]);
  if (!open) return null;
  const content = pages[page]!;
  return <div className="onboarding-backdrop" onMouseDown={event => { if (event.target === event.currentTarget) onClose(); }}>
    <section className="onboarding-dialog" style={{ width: 'min(560px, calc(100vw - 36px))', maxWidth: 'calc(100vw - 36px)', minWidth: 0 }} role="dialog" aria-modal="true" aria-labelledby="onboarding-title" aria-describedby="onboarding-body">
      <div className="result-head"><div><div className="panel-kicker">FIRST STEPS · {page + 1} OF {pages.length}</div><h2 id="onboarding-title">{content.title}</h2></div><button ref={closeRef} className="icon-btn" aria-label="Close introduction" onClick={onClose}><X size={16}/></button></div>
      <p id="onboarding-body">{content.body}</p><p className="onboarding-action">{content.action}</p>
      <div className="onboarding-footer"><button className="button secondary" onClick={() => setPage(index => Math.max(0, index - 1))} disabled={page === 0}><ArrowLeft size={14}/> Back</button><span aria-live="polite">{page + 1} / {pages.length}</span>{page < pages.length - 1 ? <button className="button primary" onClick={() => setPage(index => Math.min(pages.length - 1, index + 1))}>Next <ArrowRight size={14}/></button> : <button className="button primary" onClick={onClose}>Start exploring</button>}</div>
    </section>
  </div>;
}
