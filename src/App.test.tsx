import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import App from './App';

describe('AI Playground workspace', () => {
  it('loads a runnable seeded experiment and trains on held-out data', () => {
    render(<App />);
    expect(screen.getByRole('heading', { name: /Train it\. Test it\./i })).toBeTruthy();
    fireEvent.click(screen.getByRole('button', { name: /Train model/i }));
    expect(screen.getByText(/Model trained on 42 examples/i)).toBeTruthy();
    expect(screen.getByText(/14 HELD-OUT/i)).toBeTruthy();
  });

  it('offers an explicit empty inspector state, then explains a selected point by keyboard', () => {
    render(<App />);
    expect(screen.getByText(/select a point on the map or in the examples table/i)).toBeTruthy();
    fireEvent.click(screen.getByRole('button', { name: /Train model/i }));
    const testPoint = screen.getAllByRole('button', { name: /test example/i })[0]!;
    fireEvent.keyDown(testPoint, { key: 'Enter' });
    expect(screen.getByText('Actual class')).toBeTruthy();
    expect(screen.getByText('Held-out test')).toBeTruthy();
    expect(screen.getByText(/Votes: Group A \d+, Group B \d+/)).toBeTruthy();
    expect(screen.getByText(/Vote shares are not calibrated probabilities/i)).toBeTruthy();
  });

  it('compares two k settings on the same held-out set and invalidates changed settings', () => {
    render(<App />);
    fireEvent.click(screen.getByRole('button', { name: 'Compare settings' }));
    expect(screen.getByText(/Same split: 42 training and 14 held-out examples/i)).toBeTruthy();
    expect(screen.getByRole('article', { name: /Results for k equals 1/i })).toBeTruthy();
    expect(screen.getByRole('article', { name: /Results for k equals 7/i })).toBeTruthy();
    fireEvent.change(screen.getByRole('slider', { name: 'Comparison configuration 2 k' }), { target: { value: '9' } });
    expect(screen.getByText(/Dataset or comparison settings changed/i)).toBeTruthy();
    expect(screen.queryByRole('article', { name: /Results for k equals 7/i })).toBeNull();
    fireEvent.click(screen.getByRole('button', { name: 'Compare settings' }));
    fireEvent.change(screen.getByLabelText('DATASET PRESET'), { target: { value: 'overlap' } });
    expect(screen.getByText(/Dataset or comparison settings changed/i)).toBeTruthy();
    expect(screen.queryByRole('article', { name: /Results for k equals 9/i })).toBeNull();
  });

  it('recomputes and compares the saved experiment without trusting stored metrics', () => {
    window.localStorage.clear();
    render(<App />);
    fireEvent.click(screen.getByRole('button', { name: /Save on this device/i }));
    fireEvent.click(screen.getByRole('button', { name: 'Compare current with saved' }));
    expect(screen.getByText(/The datasets match\. The held-out examples match\./i)).toBeTruthy();
    expect(screen.getAllByText(/Held-out accuracy/)).toHaveLength(2);
    fireEvent.change(screen.getByRole('slider', { name: 'Number of neighbors k' }), { target: { value: '7' } });
    expect(screen.getByText(/An experiment or setting changed\. Recompute this comparison/i)).toBeTruthy();
  });

  it('asks before replacing a different saved snapshot and preserves it when declined', () => {
    window.localStorage.clear();
    const confirm = vi.spyOn(window, 'confirm').mockReturnValue(false);
    render(<App />);
    fireEvent.click(screen.getByRole('button', { name: /Save on this device/i }));
    const storageKey = 'ai-playground.experiment.v1';
    const original = window.localStorage.getItem(storageKey);
    fireEvent.change(screen.getByLabelText('DATASET PRESET'), { target: { value: 'noisy' } });
    fireEvent.click(screen.getByRole('button', { name: /Save on this device/i }));
    expect(confirm).toHaveBeenCalledWith(expect.stringMatching(/overwrite the previous saved snapshot/i));
    expect(window.localStorage.getItem(storageKey)).toBe(original);
    confirm.mockRestore();
  });

  it('switches dataset presets and explains the chosen data', () => {
    render(<App />);
    fireEvent.change(screen.getByLabelText('DATASET PRESET'), { target: { value: 'noisy' } });
    expect(screen.getByText(/misleading labels/i)).toBeTruthy();
    expect(screen.getByText('72 observations')).toBeTruthy();
  });

  it('opens and closes the accessible plot help', () => {
    render(<App />);
    fireEvent.click(screen.getByRole('button', { name: 'Plot help' }));
    expect(screen.getByRole('note').textContent).toMatch(/drag a point to move it/i);
    fireEvent.click(screen.getByRole('button', { name: 'Close plot help' }));
    expect(screen.queryByRole('note')).toBeNull();
  });

  it('commits a point drag once and supports undo and redo', () => {
    render(<App />);
    fireEvent.click(screen.getByRole('button', { name: /Train model/i }));
    const map = screen.getByRole('img', { name: /Interactive feature map/i });
    Object.defineProperty(map, 'getBoundingClientRect', { value: () => ({ left: 0, top: 0, width: 640, height: 430, right: 640, bottom: 430, x: 0, y: 0, toJSON() {} }) });
    const point = screen.getAllByRole('button', { name: /feature 1/i })[0]!;
    const pointer = (type: string, target: Element, x: number, y: number) => {
      const event = new MouseEvent(type, { bubbles: true, cancelable: true, clientX: x, clientY: y });
      Object.defineProperty(event, 'pointerId', { value: 9 }); Object.defineProperty(event, 'pointerType', { value: 'touch' });
      fireEvent(target, event);
    };
    pointer('pointerdown', point, 100, 100);
    pointer('pointermove', point, -10, 500);
    expect(screen.getByText(/previous results are stale/i)).toBeTruthy();
    expect(screen.getByRole('button', { name: /^Undo$/i }).hasAttribute('disabled')).toBe(true);
    pointer('pointerup', point, -10, 500);
    expect(screen.getAllByRole('button', { name: /feature 1 0\.00, feature 2 0\.00/i }).length).toBe(1);
    expect(screen.getByText(/previous results are stale/i)).toBeTruthy();
    fireEvent.click(screen.getByRole('button', { name: /^Undo$/i }));
    expect(screen.queryByRole('button', { name: /feature 1 0\.00, feature 2 0\.00/i })).toBeNull();
    expect(screen.getByRole('button', { name: /^Undo$/i }).hasAttribute('disabled')).toBe(true);
    expect(screen.getByText(/14 HELD-OUT/i)).toBeTruthy();
    fireEvent.click(screen.getByRole('button', { name: /^Redo$/i }));
    expect(screen.getAllByRole('button', { name: /feature 1 0\.00, feature 2 0\.00/i }).length).toBe(1);
    expect(screen.getByText(/previous results are stale/i)).toBeTruthy();
  });

  it('cancels a drag when the pointer is cancelled or a new preset is loaded', () => {
    render(<App />);
    const point = screen.getAllByRole('button', { name: /feature 1/i })[0]!;
    const pointer = (type: string, target: Element, id: number, x: number, y: number) => {
      const event = new MouseEvent(type, { bubbles: true, cancelable: true, clientX: x, clientY: y });
      Object.defineProperty(event, 'pointerId', { value: id }); fireEvent(target, event);
    };
    pointer('pointerdown', point, 3, 10, 10);
    pointer('pointercancel', point, 3, 10, 10);
    expect(screen.getByRole('button', { name: /^Undo$/i }).hasAttribute('disabled')).toBe(true);
    pointer('pointerdown', point, 4, 10, 10);
    fireEvent.change(screen.getByLabelText('DATASET PRESET'), { target: { value: 'overlap' } });
    pointer('pointerup', point, 4, 500, 500);
    expect(screen.getByText('72 observations')).toBeTruthy();
    expect(screen.getAllByRole('button', { name: /feature 1/i })).toHaveLength(72);
  });

  it('saves and restores experiment data locally without restoring model results', () => {
    window.localStorage.clear();
    render(<App />);
    fireEvent.click(screen.getByRole('button', { name: /Train model/i }));
    fireEvent.click(screen.getByRole('button', { name: /Save on this device/i }));
    fireEvent.change(screen.getByLabelText('DATASET PRESET'), { target: { value: 'noisy' } });
    expect(screen.getByText('72 observations')).toBeTruthy();
    fireEvent.click(screen.getByRole('button', { name: /Restore saved/i }));
    expect(screen.getByText('56 observations')).toBeTruthy();
    expect(screen.getByText(/Train the model to see scores/i)).toBeTruthy();
  });

  it('confirms and starts a fresh experiment with empty history and results', () => {
    const confirm = vi.spyOn(window, 'confirm').mockReturnValue(true);
    render(<App />);
    fireEvent.change(screen.getByLabelText('DATASET PRESET'), { target: { value: 'noisy' } });
    fireEvent.click(screen.getByRole('button', { name: 'Start fresh' }));
    expect(screen.getByText('56 observations')).toBeTruthy();
    expect(screen.getByRole('button', { name: /^Undo$/i }).hasAttribute('disabled')).toBe(true);
    expect((screen.getByRole('slider', { name: /Number of neighbors/i }) as HTMLInputElement).value).toBe('5');
    expect(screen.getByText(/Train the model to see scores/i)).toBeTruthy();
    confirm.mockRestore();
  });

  it('completes Teach the Model only after a held-out prediction is inspected', () => {
    render(<App />);
    fireEvent.click(screen.getByRole('button', { name: 'Learn' }));
    fireEvent.click(screen.getAllByRole('button', { name: /Start activity/i })[0]!);
    fireEvent.click(screen.getByRole('button', { name: /Train model/i }));
    expect(screen.getByText(/Completion: Train the model and inspect/i)).toBeTruthy();
    fireEvent.click(screen.getAllByRole('button', { name: /test example/i })[0]!);
    expect(screen.getByText(/Complete · Train the model and inspect/i)).toBeTruthy();
  });
});
