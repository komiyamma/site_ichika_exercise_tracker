import { useCallback } from 'react';
import PropTypes from 'prop-types';

function FilterControls({ filterDate, onFilterChange, onClearFilter }) {
  const handleChange = useCallback((e) => {
    onFilterChange(e.target.value);
  }, [onFilterChange]);

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
        <button type="button" onClick={onClearFilter}>絞り込み解除</button>
      </div>
    </div>
  );
}

FilterControls.propTypes = {
  filterDate: PropTypes.string,
  onFilterChange: PropTypes.func.isRequired,
  onClearFilter: PropTypes.func.isRequired,
};

FilterControls.defaultProps = {
  filterDate: '',
};

export default FilterControls;
