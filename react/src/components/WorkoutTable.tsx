import { useMemo, useCallback, type MouseEvent } from 'react';
import type { WorkoutEntry } from '../types/workout';

interface WorkoutTableProps {
  entries: WorkoutEntry[];
  filterDate: string;
  onDeleteEntry: (id: string) => void;
}

const TABLE_HEADERS = ['日付', '種目', '時間(分)', '回数/距離', 'メモ', '操作'] as const;

function WorkoutTable({ entries, filterDate, onDeleteEntry }: WorkoutTableProps) {
  const filteredEntries = useMemo(() => {
    const filtered = filterDate
      ? entries.filter(entry => entry.date === filterDate)
      : entries;
    
    return [...filtered].sort((a, b) => b.createdAt - a.createdAt);
  }, [entries, filterDate]);

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
