import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import FilterControls from './FilterControls';

describe('FilterControls', () => {
  it('フィルターコントロールが正しくレンダリングされる', () => {
    const mockOnFilterChange = vi.fn();
    const mockOnClearFilter = vi.fn();

    render(
      <FilterControls
        filterDate=""
        onFilterChange={mockOnFilterChange}
        onClearFilter={mockOnClearFilter}
      />
    );

    expect(screen.getByLabelText(/日付で絞り込み/)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /絞り込み解除/ })).toBeInTheDocument();
  });

  it('日付入力が変更されるとonFilterChangeが呼ばれる', async () => {
    const user = userEvent.setup();
    const mockOnFilterChange = vi.fn();
    const mockOnClearFilter = vi.fn();

    render(
      <FilterControls
        filterDate=""
        onFilterChange={mockOnFilterChange}
        onClearFilter={mockOnClearFilter}
      />
    );

    const dateInput = screen.getByLabelText(/日付で絞り込み/);
    await user.type(dateInput, '2024-11-15');

    expect(mockOnFilterChange).toHaveBeenCalled();
  });

  it('絞り込み解除ボタンをクリックするとonClearFilterが呼ばれる', async () => {
    const user = userEvent.setup();
    const mockOnFilterChange = vi.fn();
    const mockOnClearFilter = vi.fn();

    render(
      <FilterControls
        filterDate="2024-11-15"
        onFilterChange={mockOnFilterChange}
        onClearFilter={mockOnClearFilter}
      />
    );

    const clearButton = screen.getByRole('button', { name: /絞り込み解除/ });
    await user.click(clearButton);

    expect(mockOnClearFilter).toHaveBeenCalledTimes(1);
  });

  it('filterDateの値が正しく表示される', () => {
    const mockOnFilterChange = vi.fn();
    const mockOnClearFilter = vi.fn();

    render(
      <FilterControls
        filterDate="2024-11-15"
        onFilterChange={mockOnFilterChange}
        onClearFilter={mockOnClearFilter}
      />
    );

    const dateInput = screen.getByLabelText(/日付で絞り込み/);
    expect(dateInput).toHaveValue('2024-11-15');
  });
});
