import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import App from './App';

describe('AI Playground workspace', () => {
  it('loads a runnable seeded experiment and trains on held-out data', () => {
    render(<App />);
    expect(screen.getByRole('heading', { name: /Train it\. Test it\./i })).toBeTruthy();
    fireEvent.click(screen.getByRole('button', { name: /Train model/i }));
    expect(screen.getByText(/Model trained on 42 examples/i)).toBeTruthy();
    expect(screen.getByText(/14 held-out examples/i)).toBeTruthy();
  });

  it('switches dataset presets and explains the chosen data', () => {
    render(<App />);
    fireEvent.change(screen.getByLabelText('DATASET PRESET'), { target: { value: 'noisy' } });
    expect(screen.getByText(/misleading labels/i)).toBeTruthy();
    expect(screen.getByText('72 observations')).toBeTruthy();
  });
});
