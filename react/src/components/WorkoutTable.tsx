import { useMemo, useCallback, type MouseEvent } from 'react';
import type { WorkoutEntry } from '../types/workout';

/** WorkoutTableコンポーネントのProps */
interface WorkoutTableProps {
  /** 表示する運動記録の配列 */
  entries: WorkoutEntry[];
  /** フィルタリングする日付（空文字列の場合は全件表示） */
  filterDate: string;
  /** 記録削除時に呼ばれるコールバック */
  onDeleteEntry: (id: string) => void;
}

/** テーブルのヘッダー項目（定数として定義） */
const TABLE_HEADERS = ['日付', '種目', '時間(分)', '回数/距離', 'メモ', '操作'] as const;

/**
 * 運動記録一覧テーブルコンポーネント
 * 
 * 運動記録を表形式で表示し、日付フィルタリングと削除機能を提供する。
 * 記録は作成日時の降順（新しい順）でソートされる。
 */
function WorkoutTable({ entries, filterDate, onDeleteEntry }: WorkoutTableProps) {
  /**
   * フィルタリングとソートを適用した記録リストをメモ化
   * entriesまたはfilterDateが変更された場合のみ再計算される
   */
  const filteredEntries = useMemo(() => {
    // 日付フィルターが指定されている場合は該当する記録のみ抽出
    const filtered = filterDate
      ? entries.filter(entry => entry.date === filterDate)
      : entries;
    
    // 作成日時の降順（新しい順）でソート
    // 元の配列を変更しないようにスプレッド演算子でコピーしてからソート
    return [...filtered].sort((a, b) => b.createdAt - a.createdAt);
  }, [entries, filterDate]);

  /**
   * 削除ボタンのクリックハンドラを生成する
   * カリー化により、各記録ごとに最適化されたハンドラを作成
   */
  const handleDelete = useCallback((id: string) => (e: MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    onDeleteEntry(id);
  }, [onDeleteEntry]);

  return (
    <>
      <p>合計件数：<span>{filteredEntries.length}</span></p>
      <table>
        <thead>
          <tr>
            {TABLE_HEADERS.map(header => (
              <th key={header}>{header}</th>
            ))}
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
                <button type="button" onClick={handleDelete(entry.id)}>
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
