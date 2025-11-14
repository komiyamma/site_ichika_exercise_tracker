/**
 * フィルタリング操作コンポーネント
 */
function FilterControls({ filterDate, onFilterChange, onClearFilter }) {
  return (
    <div>
      <div>
        <label htmlFor="filter-date">日付で絞り込み</label><br />
        <input
          id="filter-date"
          type="date"
          value={filterDate}
          onChange={(e) => onFilterChange(e.target.value)}
        />
      </div>
      <div>
        <button type="button" onClick={onClearFilter}>絞り込み解除</button>
      </div>
    </div>
  );
}

export default FilterControls;
