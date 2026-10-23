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
