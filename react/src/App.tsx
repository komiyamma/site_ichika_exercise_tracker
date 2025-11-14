import { useState, useCallback } from 'react';
import './App.css';
import WorkoutForm from './components/WorkoutForm';
import FilterControls from './components/FilterControls';
import WorkoutTable from './components/WorkoutTable';
import DebugControls from './components/DebugControls';
import { useLocalStorage } from './hooks/useLocalStorage';
import { STORAGE_KEY } from './constants/workoutTypes';
import type { WorkoutEntry } from './types/workout';

function App() {
  const [entries, setEntries, clearEntries] = useLocalStorage<WorkoutEntry[]>(STORAGE_KEY, []);
  const [filterDate, setFilterDate] = useState<string>('');

  const handleAddEntry = useCallback((entry: WorkoutEntry) => {
    setEntries(prev => [...prev, entry]);
  }, [setEntries]);

  const handleDeleteEntry = useCallback((id: string) => {
    setEntries(prev => prev.filter(entry => entry.id !== id));
  }, [setEntries]);

  const handleClearAllData = useCallback(() => {
    if (!window.confirm('localStorageの「このアプリ関連」の「記録データ全て」を削除します。よろしいですか？')) {
      return;
    }
    clearEntries();
    setFilterDate('');
    window.alert('データを削除しました。');
  }, [clearEntries]);

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
