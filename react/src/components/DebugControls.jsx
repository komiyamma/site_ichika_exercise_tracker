import PropTypes from 'prop-types';

function DebugControls({ onClearAllData }) {
  return (
    <div>
      <button type="button" onClick={onClearAllData}>Debug: 全削除</button>
    </div>
  );
}

DebugControls.propTypes = {
  onClearAllData: PropTypes.func.isRequired,
};

export default DebugControls;
