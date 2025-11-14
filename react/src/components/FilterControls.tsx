import { useCallback, type ChangeEvent, type MouseEvent } from 'react';

interface FilterControlsProps {
  filterDate: string;
  onFilterChange: (date: string) => void;
  onClearFilter: () => void;
}

function FilterControls({ filterDate, onFilterChange, onClearFilter }: FilterControlsProps) {
  const handleChange = useCallback((e: ChangeEvent<HTMLInputElement>) => {
    onFilterChange(e.target.value);
  }, [onFilterChange]);

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
