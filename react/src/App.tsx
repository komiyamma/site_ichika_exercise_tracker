import { useState, useCallback } from 'react';
import './App.css';
import WorkoutForm from './components/WorkoutForm';
import FilterControls from './components/FilterControls';
import WorkoutTable from './components/WorkoutTable';
import DebugControls from './components/DebugControls';
import { useLocalStorage } from './hooks/useLocalStorage';
import { STORAGE_KEY } from './constants/workoutTypes';
import type { WorkoutEntry } from './types/workout';

/**
 * メインアプリケーションコンポーネント
 * 
 * 運動記録の管理を行うアプリケーションのルートコンポーネント。
 * localStorageを使用してデータを永続化し、記録の追加・削除・フィルタリング機能を提供する。
 */
function App() {
  // localStorageと同期する運動記録の配列
  const [entries, setEntries, clearEntries] = useLocalStorage<WorkoutEntry[]>(STORAGE_KEY, []);
  
  // 日付フィルターの状態（空文字列の場合は全件表示）
  const [filterDate, setFilterDate] = useState<string>('');

  /**
   * 新しい運動記録を追加する
   * @param entry 追加する運動記録
   */
  const handleAddEntry = useCallback((entry: WorkoutEntry) => {
    setEntries(prev => [...prev, entry]);
  }, [setEntries]);

  /**
   * 指定されたIDの運動記録を削除する
   * @param id 削除する記録のID
   */
  const handleDeleteEntry = useCallback((id: string) => {
    setEntries(prev => prev.filter(entry => entry.id !== id));
  }, [setEntries]);

  /**
   * 全ての運動記録を削除する（デバッグ用）
   * ユーザーに確認ダイアログを表示してから削除を実行
   */
  const handleClearAllData = useCallback(() => {
    if (!window.confirm('localStorageの「このアプリ関連」の「記録データ全て」を削除します。よろしいですか？')) {
      return;
    }
    clearEntries();
    setFilterDate('');
    window.alert('データを削除しました。');
  }, [clearEntries]);

  /**
   * 日付フィルターをクリアする
   */
  const handleClearFilter = useCallback(() => {
    setFilterDate('');
  }, []);

  return (
    <div>
      <h1>毎日の運動トラッカー</h1>
      <p>とてもシンプルな HTML だけの画面です。</p>

      <WorkoutForm onAddEntry={handleAddEntry} />

      <h2>記録を確認</h2>
      <FilterControls
        filterDate={filterDate}
        onFilterChange={setFilterDate}
        onClearFilter={handleClearFilter}
      />

      <WorkoutTable
        entries={entries}
        filterDate={filterDate}
        onDeleteEntry={handleDeleteEntry}
      />

      <DebugControls onClearAllData={handleClearAllData} />
    </div>
  );
}

export default App;
