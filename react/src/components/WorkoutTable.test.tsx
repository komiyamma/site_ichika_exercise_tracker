import { describe, it, expect, vi, type Mock } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import WorkoutTable from './WorkoutTable';
import type { WorkoutEntry } from '../types/workout';

describe('WorkoutTable', () => {
  const mockEntries: WorkoutEntry[] = [
    {
      id: '1',
      date: '2024-11-15',
      type: 'ランニング',
      minutes: 30,
      value: 5,
      note: 'テストメモ1',
      createdAt: 1700000000000
    },
    {
      id: '2',
      date: '2024-11-14',
      type: 'ウォーキング',
      minutes: 20,
      value: 3,
      note: 'テストメモ2',
      createdAt: 1699900000000
    },
    {
      id: '3',
      date: '2024-11-15',
      type: '筋トレ',
      minutes: 15,
      value: 10,
      note: '',
      createdAt: 1700100000000
    }
  ];

  it('エントリーが正しく表示される', () => {
    const mockOnDelete: Mock = vi.fn();
    render(<WorkoutTable entries={mockEntries} filterDate="" onDeleteEntry={mockOnDelete} />);

    expect(screen.getByText('ランニング')).toBeInTheDocument();
    expect(screen.getByText('ウォーキング')).toBeInTheDocument();
    expect(screen.getByText('筋トレ')).toBeInTheDocument();
  });

  it('合計件数が正しく表示される', () => {
    const mockOnDelete: Mock = vi.fn();
    render(<WorkoutTable entries={mockEntries} filterDate="" onDeleteEntry={mockOnDelete} />);

    const countElement = screen.getByText('合計件数：').nextSibling as HTMLElement;
    expect(countElement).toHaveTextContent('3');
  });

  it('createdAtの降順でソートされる', () => {
    const mockOnDelete: Mock = vi.fn();
    render(<WorkoutTable entries={mockEntries} filterDate="" onDeleteEntry={mockOnDelete} />);

    const rows = screen.getAllByRole('row');
    const dataRows = rows.slice(1);
    
    expect(dataRows[0]).toHaveTextContent('筋トレ');
    expect(dataRows[1]).toHaveTextContent('ランニング');
    expect(dataRows[2]).toHaveTextContent('ウォーキング');
  });

  it('日付フィルターが正しく動作する', () => {
    const mockOnDelete: Mock = vi.fn();
    render(<WorkoutTable entries={mockEntries} filterDate="2024-11-15" onDeleteEntry={mockOnDelete} />);

    expect(screen.getByText('ランニング')).toBeInTheDocument();
    expect(screen.getByText('筋トレ')).toBeInTheDocument();
    expect(screen.queryByText('ウォーキング')).not.toBeInTheDocument();

    expect(screen.getByText('2')).toBeInTheDocument();
  });

  it('エントリーがない場合は空のテーブルが表示される', () => {
    const mockOnDelete: Mock = vi.fn();
    render(<WorkoutTable entries={[]} filterDate="" onDeleteEntry={mockOnDelete} />);

    expect(screen.getByText('0')).toBeInTheDocument();
    const rows = screen.getAllByRole('row');
    expect(rows).toHaveLength(1);
  });

  it('削除ボタンをクリックするとonDeleteEntryが呼ばれる', async () => {
    const user = userEvent.setup();
    const mockOnDelete: Mock = vi.fn();
    render(<WorkoutTable entries={mockEntries} filterDate="" onDeleteEntry={mockOnDelete} />);

    const deleteButtons = screen.getAllByRole('button', { name: /Delete/ });
    await user.click(deleteButtons[0]);

    expect(mockOnDelete).toHaveBeenCalledTimes(1);
    expect(mockOnDelete).toHaveBeenCalledWith('3');
  });

  it('空の値は表示されない', () => {
    const entryWithEmptyValues: WorkoutEntry[] = [{
      id: '1',
      date: '2024-11-15',
      type: 'ランニング',
      minutes: 0,
      value: 0,
      note: '',
      createdAt: 1700000000000
    }];

    const mockOnDelete: Mock = vi.fn();
    render(<WorkoutTable entries={entryWithEmptyValues} filterDate="" onDeleteEntry={mockOnDelete} />);

    const rows = screen.getAllByRole('row');
    const dataRow = rows[1];
    
    const cells = dataRow.querySelectorAll('td');
    expect(cells[2]).toHaveTextContent('');
    expect(cells[3]).toHaveTextContent('');
    expect(cells[4]).toHaveTextContent('');
  });
});
