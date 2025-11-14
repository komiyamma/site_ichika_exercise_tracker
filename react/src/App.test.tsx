import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import App from './App';

const localStorageMock = (() => {
  let store: Record<string, string> = {};
  return {
    getItem: (key: string) => store[key] || null,
    setItem: (key: string, value: string) => { store[key] = value.toString(); },
    removeItem: (key: string) => { delete store[key]; },
    clear: () => { store = {}; }
  };
})();

Object.defineProperty(window, 'localStorage', {
  value: localStorageMock
});

describe('App統合テスト', () => {
  beforeEach(() => {
    localStorage.clear();
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2024-11-15T10:00:00Z'));
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('アプリが正しくレンダリングされる', () => {
    render(<App />);

    expect(screen.getByText('毎日の運動トラッカー')).toBeInTheDocument();
    expect(screen.getByText('新しい記録')).toBeInTheDocument();
    expect(screen.getByText('記録を確認')).toBeInTheDocument();
  });

  it('記録を追加できる', () => {
    render(<App />);

    const typeSelect = screen.getByLabelText(/種目/);
    const minutesInput = screen.getByLabelText(/時間/);
    const valueInput = screen.getByLabelText(/回数/);
    const noteInput = screen.getByLabelText(/メモ/);

    fireEvent.change(typeSelect, { target: { value: 'ランニング' } });
    fireEvent.change(minutesInput, { target: { value: '30' } });
    fireEvent.change(valueInput, { target: { value: '5' } });
    fireEvent.change(noteInput, { target: { value: 'テスト記録' } });

    const form = screen.getByRole('button', { name: /追加する/ }).closest('form');
    fireEvent.submit(form!);

    const table = screen.getByRole('table');
    expect(table).toHaveTextContent('ランニング');
    expect(table).toHaveTextContent('30');
    expect(table).toHaveTextContent('5');
    expect(table).toHaveTextContent('テスト記録');
  });

  it('記録を削除できる', () => {
    render(<App />);

    const typeSelect = screen.getByLabelText(/種目/);
    fireEvent.change(typeSelect, { target: { value: 'ウォーキング' } });
    const form = screen.getByRole('button', { name: /追加する/ }).closest('form');
    fireEvent.submit(form!);

    const deleteButton = screen.getByRole('button', { name: /Delete/ });
    fireEvent.click(deleteButton);

    const table = screen.getByRole('table');
    expect(table).not.toHaveTextContent('ウォーキング');
  });

  it('日付フィルターが動作する', () => {
    render(<App />);

    const typeSelect = screen.getByLabelText(/種目/);
    fireEvent.change(typeSelect, { target: { value: 'ランニング' } });
    const form = screen.getByRole('button', { name: /追加する/ }).closest('form');
    fireEvent.submit(form!);

    const dateInputs = screen.getAllByLabelText(/日付/);
    const formDateInput = dateInputs[0];
    fireEvent.change(formDateInput, { target: { value: '2024-11-14' } });
    
    fireEvent.change(typeSelect, { target: { value: 'ウォーキング' } });
    fireEvent.submit(form!);

    const filterInput = dateInputs[1];
    fireEvent.change(filterInput, { target: { value: '2024-11-15' } });

    const table = screen.getByRole('table');
    expect(table).toHaveTextContent('ランニング');
    expect(table).not.toHaveTextContent('ウォーキング');
  });

  it('フィルタークリアボタンが動作する', () => {
    render(<App />);

    const typeSelect = screen.getByLabelText(/種目/);
    fireEvent.change(typeSelect, { target: { value: 'ランニング' } });
    const form = screen.getByRole('button', { name: /追加する/ }).closest('form');
    fireEvent.submit(form!);

    const filterInput = screen.getAllByLabelText(/日付/)[1];
    fireEvent.change(filterInput, { target: { value: '2024-11-14' } });

    const table = screen.getByRole('table');
    expect(table).not.toHaveTextContent('ランニング');

    const clearButton = screen.getByRole('button', { name: /絞り込み解除/ });
    fireEvent.click(clearButton);

    expect(table).toHaveTextContent('ランニング');
  });

  it('localStorageにデータが保存される', () => {
    render(<App />);

    const typeSelect = screen.getByLabelText(/種目/);
    fireEvent.change(typeSelect, { target: { value: 'ランニング' } });
    const form = screen.getByRole('button', { name: /追加する/ }).closest('form');
    fireEvent.submit(form!);

    const saved = localStorage.getItem('ichikaWorkoutLogEntries');
    expect(saved).toBeTruthy();
    const entries = JSON.parse(saved!);
    expect(entries).toHaveLength(1);
    expect(entries[0].type).toBe('ランニング');
  });

  it('全データ削除が動作する', () => {
    const confirmSpy = vi.spyOn(window, 'confirm').mockReturnValue(true);
    const alertSpy = vi.spyOn(window, 'alert').mockImplementation(() => {});

    render(<App />);

    const typeSelect = screen.getByLabelText(/種目/);
    fireEvent.change(typeSelect, { target: { value: 'ランニング' } });
    const form = screen.getByRole('button', { name: /追加する/ }).closest('form');
    fireEvent.submit(form!);

    const clearAllButton = screen.getByRole('button', { name: /Debug: 全削除/ });
    fireEvent.click(clearAllButton);

    expect(confirmSpy).toHaveBeenCalled();

    const table = screen.getByRole('table');
    expect(table).not.toHaveTextContent('ランニング');
    expect(localStorage.getItem('ichikaWorkoutLogEntries')).toBeNull();

    confirmSpy.mockRestore();
    alertSpy.mockRestore();
  });
});
