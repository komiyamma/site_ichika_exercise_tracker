import { useCallback, type ChangeEvent, type MouseEvent } from 'react';

/** FilterControlsコンポーネントのProps */
interface FilterControlsProps {
  /** 現在のフィルター日付 */
  filterDate: string;
  /** フィルター日付変更時に呼ばれるコールバック */
  onFilterChange: (date: string) => void;
  /** フィルタークリア時に呼ばれるコールバック */
  onClearFilter: () => void;
}

/**
 * フィルタリング操作コンポーネント
 * 
 * 日付による記録のフィルタリング機能を提供する。
 * 日付入力フィールドとフィルタークリアボタンを含む。
 */
function FilterControls({ filterDate, onFilterChange, onClearFilter }: FilterControlsProps) {
  /**
   * 日付入力フィールドの変更ハンドラ
   * 入力値を親コンポーネントに通知する
   */
  const handleChange = useCallback((e: ChangeEvent<HTMLInputElement>) => {
    onFilterChange(e.target.value);
  }, [onFilterChange]);

  /**
   * フィルタークリアボタンのクリックハンドラ
   * フィルターをリセットして全件表示に戻す
   */
  const handleClear = useCallback((e: MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    onClearFilter();
  }, [onClearFilter]);

  return (
    <div>
      <div>
        <label htmlFor="filter-date">日付で絞り込み</label><br />
        <input
          id="filter-date"
          type="date"
          value={filterDate}
          onChange={handleChange}
        />
      </div>
      <div>
        <button type="button" onClick={handleClear}>絞り込み解除</button>
      </div>
    </div>
  );
}

export default FilterControls;
