import { useState, useEffect } from 'react';
import './App.css';
import WorkoutForm from './components/WorkoutForm';
import FilterControls from './components/FilterControls';
import WorkoutTable from './components/WorkoutTable';
import DebugControls from './components/DebugControls';
import { loadEntriesFromStorage, saveEntriesToStorage, clearStorage } from './storage/localStorage';

/**
 * メインアプリケーションコンポーネント
 */
function App() {
  const [entries, setEntries] = useState([]);
  const [filterDate, setFilterDate] = useState('');

  // マウント時にlocalStorageからデータを読み込む
  useEffect(() => {
    const loadedEntries = loadEntriesFromStorage();
    setEntries(loadedEntries);
  }, []);

  // 記録を追加
  const addEntry = (entry) => {
    const newEntries = [...entries, entry];
    setEntries(newEntries);
    saveEntriesToStorage(newEntries);
  };

  // 記録を削除
  const deleteEntry = (id) => {
    const newEntries = entries.filter(entry => entry.id !== id);
    setEntries(newEntries);
    saveEntriesToStorage(newEntries);
  };

  // 全データ削除
  const clearAllData = () => {
    const message = 'localStorageの「このアプリ関連」の「記録データ全て」を削除します。よろしいですか？';
    if (!window.confirm(message)) {
      return;
    }
    setEntries([]);
    setFilterDate('');
    clearStorage();
    window.alert('データを削除しました。');
  };

  return (
    <div>
      <h1>毎日の運動トラッカー</h1>
      <p>とてもシンプルな HTML だけの画面です。</p>

      <WorkoutForm onAddEntry={addEntry} />

      <h2>記録を確認</h2>
      <FilterControls
        filterDate={filterDate}
        onFilterChange={setFilterDate}
        onClearFilter={() => setFilterDate('')}
      />

      <WorkoutTable
        entries={entries}
        filterDate={filterDate}
        onDeleteEntry={deleteEntry}
      />

      <DebugControls onClearAllData={clearAllData} />
    </div>
  );
}

export default App;
