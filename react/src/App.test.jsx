import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import App from './App';

// localStorageのモック
const localStorageMock = (() => {
  let store = {};
  return {
    getItem: (key) => store[key] || null,
    setItem: (key, value) => { store[key] = value.toString(); },
    removeItem: (key) => { delete store[key]; },
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

    // フォームに入力
    const typeSelect = screen.getByLabelText(/種目/);
    const minutesInput = screen.getByLabelText(/時間/);
    const valueInput = screen.getByLabelText(/回数/);
    const noteInput = screen.getByLabelText(/メモ/);

    fireEvent.change(typeSelect, { target: { value: 'ランニング' } });
    fireEvent.change(minutesInput, { target: { value: '30' } });
    fireEvent.change(valueInput, { target: { value: '5' } });
    fireEvent.change(noteInput, { target: { value: 'テスト記録' } });

    // 送信
    const form = screen.getByRole('button', { name: /追加する/ }).closest('form');
    fireEvent.submit(form);

    // テーブルに表示される
    const table = screen.getByRole('table');
    expect(table).toHaveTextContent('ランニング');
    expect(table).toHaveTextContent('30');
    expect(table).toHaveTextContent('5');
    expect(table).toHaveTextContent('テスト記録');
  });

  it('記録を削除できる', () => {
    render(<App />);

    // 記録を追加
    const typeSelect = screen.getByLabelText(/種目/);
    fireEvent.change(typeSelect, { target: { value: 'ウォーキング' } });
    const form = screen.getByRole('button', { name: /追加する/ }).closest('form');
    fireEvent.submit(form);

    // 削除ボタンをクリック
    const deleteButton = screen.getByRole('button', { name: /Delete/ });
    fireEvent.click(deleteButton);

    // 記録が削除される（テーブル内を確認）
    const table = screen.getByRole('table');
    expect(table).not.toHaveTextContent('ウォーキング');
  });

  it('日付フィルターが動作する', () => {
    render(<App />);

    // 2つの記録を追加（異なる日付）
    const typeSelect = screen.getByLabelText(/種目/);
    fireEvent.change(typeSelect, { target: { value: 'ランニング' } });
    const form = screen.getByRole('button', { name: /追加する/ }).closest('form');
    fireEvent.submit(form);

    // 日付を変更
    const dateInputs = screen.getAllByLabelText(/日付/);
    const formDateInput = dateInputs[0]; // フォームの日付入力
    fireEvent.change(formDateInput, { target: { value: '2024-11-14' } });
    
    fireEvent.change(typeSelect, { target: { value: 'ウォーキング' } });
    fireEvent.submit(form);

    // フィルターを適用
    const filterInput = dateInputs[1]; // フィルターの日付入力
    fireEvent.change(filterInput, { target: { value: '2024-11-15' } });

    // 2024-11-15の記録のみ表示される（テーブル内を確認）
    const table = screen.getByRole('table');
    expect(table).toHaveTextContent('ランニング');
    expect(table).not.toHaveTextContent('ウォーキング');
  });

  it('フィルタークリアボタンが動作する', () => {
    render(<App />);

    // 記録を追加
    const typeSelect = screen.getByLabelText(/種目/);
    fireEvent.change(typeSelect, { target: { value: 'ランニング' } });
    const form = screen.getByRole('button', { name: /追加する/ }).closest('form');
    fireEvent.submit(form);

    // フィルターを適用
    const filterInput = screen.getAllByLabelText(/日付/)[1];
    fireEvent.change(filterInput, { target: { value: '2024-11-14' } });

    // 記録が非表示になる（テーブル内を確認）
    const table = screen.getByRole('table');
    expect(table).not.toHaveTextContent('ランニング');

    // フィルタークリア
    const clearButton = screen.getByRole('button', { name: /絞り込み解除/ });
    fireEvent.click(clearButton);

    // 記録が再表示される（テーブル内を確認）
    expect(table).toHaveTextContent('ランニング');
  });

  it('localStorageにデータが保存される', () => {
    render(<App />);

    // 記録を追加
    const typeSelect = screen.getByLabelText(/種目/);
    fireEvent.change(typeSelect, { target: { value: 'ランニング' } });
    const form = screen.getByRole('button', { name: /追加する/ }).closest('form');
    fireEvent.submit(form);

    // localStorageに保存されているか確認
    const saved = localStorage.getItem('ichikaWorkoutLogEntries');
    expect(saved).toBeTruthy();
    const entries = JSON.parse(saved);
    expect(entries).toHaveLength(1);
    expect(entries[0].type).toBe('ランニング');
  });

  it('全データ削除が動作する', () => {
    const confirmSpy = vi.spyOn(window, 'confirm').mockReturnValue(true);
    const alertSpy = vi.spyOn(window, 'alert').mockImplementation(() => {});

    render(<App />);

    // 記録を追加
    const typeSelect = screen.getByLabelText(/種目/);
    fireEvent.change(typeSelect, { target: { value: 'ランニング' } });
    const form = screen.getByRole('button', { name: /追加する/ }).closest('form');
    fireEvent.submit(form);

    // 全削除ボタンをクリック
    const clearAllButton = screen.getByRole('button', { name: /Debug: 全削除/ });
    fireEvent.click(clearAllButton);

    // 確認ダイアログが表示される
    expect(confirmSpy).toHaveBeenCalled();

    // データが削除される（テーブル内を確認）
    const table = screen.getByRole('table');
    expect(table).not.toHaveTextContent('ランニング');
    expect(localStorage.getItem('ichikaWorkoutLogEntries')).toBeNull();

    confirmSpy.mockRestore();
    alertSpy.mockRestore();
  });
});
