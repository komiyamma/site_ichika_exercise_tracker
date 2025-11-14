import { describe, it, expect, vi, type Mock } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import DebugControls from './DebugControls';

describe('DebugControls', () => {
  it('デバッグコントロールが正しくレンダリングされる', () => {
    const mockOnClearAllData: Mock = vi.fn();

    render(<DebugControls onClearAllData={mockOnClearAllData} />);

    expect(screen.getByRole('button', { name: /Debug: 全削除/ })).toBeInTheDocument();
  });

  it('全削除ボタンをクリックするとonClearAllDataが呼ばれる', async () => {
    const user = userEvent.setup();
    const mockOnClearAllData: Mock = vi.fn();

    render(<DebugControls onClearAllData={mockOnClearAllData} />);

    const clearButton = screen.getByRole('button', { name: /Debug: 全削除/ });
    await user.click(clearButton);

    expect(mockOnClearAllData).toHaveBeenCalledTimes(1);
  });
});
