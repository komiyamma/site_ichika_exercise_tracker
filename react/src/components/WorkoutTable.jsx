/**
 * 運動記録一覧テーブルコンポーネント
 */
function WorkoutTable({ entries, filterDate, onDeleteEntry }) {
  // フィルタリングとソート
  const getFilteredEntries = () => {
    let filtered = entries;
    if (filterDate) {
      filtered = entries.filter(entry => entry.date === filterDate);
    }
    return filtered.sort((a, b) => b.createdAt - a.createdAt);
  };

  const filteredEntries = getFilteredEntries();

  return (
    <>
      <p>合計件数：<span>{filteredEntries.length}</span></p>
      <table>
        <thead>
          <tr>
            <th>日付</th>
            <th>種目</th>
            <th>時間(分)</th>
            <th>回数/距離</th>
            <th>メモ</th>
            <th>操作</th>
          </tr>
        </thead>
        <tbody>
          {filteredEntries.map(entry => (
            <tr key={entry.id}>
              <td>{entry.date}</td>
              <td>{entry.type}</td>
              <td>{entry.minutes || ''}</td>
              <td>{entry.value || ''}</td>
              <td>{entry.note || ''}</td>
              <td>
                <button
                  type="button"
                  onClick={() => onDeleteEntry(entry.id)}
                >
                  Delete
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </>
  );
}

export default WorkoutTable;
