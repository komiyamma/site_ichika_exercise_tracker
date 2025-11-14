/**
 * デバッグ操作コンポーネント
 */
function DebugControls({ onClearAllData }) {
  return (
    <div>
      <button type="button" onClick={onClearAllData}>Debug: 全削除</button>
    </div>
  );
}

export default DebugControls;
