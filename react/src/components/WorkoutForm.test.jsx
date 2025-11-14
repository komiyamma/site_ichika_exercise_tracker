import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import WorkoutForm from './WorkoutForm';

describe('WorkoutForm', () => {
  let mockOnAddEntry;

  beforeEach(() => {
    mockOnAddEntry = vi.fn();
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2024-11-15T10:00:00Z'));
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('フォームが正しくレンダリングされる', () => {
    render(<WorkoutForm onAddEntry={mockOnAddEntry} />);

    expect(screen.getByLabelText(/種目/)).toBeInTheDocument();
    expect(screen.getByLabelText(/日付/)).toBeInTheDocument();
    expect(screen.getByLabelText(/時間/)).toBeInTheDocument();
    expect(screen.getByLabelText(/回数/)).toBeInTheDocument();
    expect(screen.getByLabelText(/メモ/)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /追加する/ })).toBeInTheDocument();
  });

  it('初期値として今日の日付が設定されている', () => {
    render(<WorkoutForm onAddEntry={mockOnAddEntry} />);

    const dateInput = screen.getByLabelText(/日付/);
    expect(dateInput).toHaveValue('2024-11-15');
  });

  it('必須項目が入力されていない場合はアラートが表示される', () => {
    const alertSpy = vi.spyOn(window, 'alert').mockImplementation(() => {});

    render(<WorkoutForm onAddEntry={mockOnAddEntry} />);

    const form = screen.getByRole('button', { name: /追加する/ }).closest('form');
    fireEvent.submit(form);

    expect(alertSpy).toHaveBeenCalledWith('種類と日付は必須.');
    expect(mockOnAddEntry).not.toHaveBeenCalled();

    alertSpy.mockRestore();
  });

  it('正しく入力された場合、エントリーが追加される', () => {
    vi.setSystemTime(new Date('2024-11-15T10:00:00.000Z'));

    render(<WorkoutForm onAddEntry={mockOnAddEntry} />);

    // フォームに入力
    const typeSelect = screen.getByLabelText(/種目/);
    const minutesInput = screen.getByLabelText(/時間/);
    const valueInput = screen.getByLabelText(/回数/);
    const noteInput = screen.getByLabelText(/メモ/);

    fireEvent.change(typeSelect, { target: { value: 'ランニング' } });
    fireEvent.change(minutesInput, { target: { value: '30' } });
    fireEvent.change(valueInput, { target: { value: '5' } });
    fireEvent.change(noteInput, { target: { value: 'テストメモ' } });

    // 送信
    const form = screen.getByRole('button', { name: /追加する/ }).closest('form');
    fireEvent.submit(form);

    // onAddEntryが正しい引数で呼ばれたか確認
    expect(mockOnAddEntry).toHaveBeenCalledTimes(1);
    const calledEntry = mockOnAddEntry.mock.calls[0][0];
    
    expect(calledEntry).toMatchObject({
      type: 'ランニング',
      date: '2024-11-15',
      minutes: 30,
      value: 5,
      note: 'テストメモ'
    });
    expect(calledEntry.id).toBeDefined();
    expect(calledEntry.createdAt).toBeDefined();
  });

  it('送信後、フォームがリセットされる', () => {
    render(<WorkoutForm onAddEntry={mockOnAddEntry} />);

    // フォームに入力
    const typeSelect = screen.getByLabelText(/種目/);
    const minutesInput = screen.getByLabelText(/時間/);
    const noteInput = screen.getByLabelText(/メモ/);

    fireEvent.change(typeSelect, { target: { value: 'ランニング' } });
    fireEvent.change(minutesInput, { target: { value: '30' } });
    fireEvent.change(noteInput, { target: { value: 'テスト' } });

    // 送信
    const form = screen.getByRole('button', { name: /追加する/ }).closest('form');
    fireEvent.submit(form);

    // フォームがリセットされているか確認
    expect(screen.getByLabelText(/種目/)).toHaveValue('');
    expect(screen.getByLabelText(/時間/)).toHaveValue(null);
    expect(screen.getByLabelText(/メモ/)).toHaveValue('');
  });

  it('数値が入力されていない場合は0として扱われる', () => {
    render(<WorkoutForm onAddEntry={mockOnAddEntry} />);

    const typeSelect = screen.getByLabelText(/種目/);
    fireEvent.change(typeSelect, { target: { value: 'ウォーキング' } });

    const form = screen.getByRole('button', { name: /追加する/ }).closest('form');
    fireEvent.submit(form);

    const calledEntry = mockOnAddEntry.mock.calls[0][0];
    expect(calledEntry.minutes).toBe(0);
    expect(calledEntry.value).toBe(0);
  });
});
