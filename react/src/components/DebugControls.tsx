import { type MouseEvent } from 'react';

/** DebugControlsコンポーネントのProps */
interface DebugControlsProps {
  /** 全データ削除時に呼ばれるコールバック */
  onClearAllData: () => void;
}

/**
 * デバッグ操作コンポーネント
 * 
 * 開発・デバッグ用の操作を提供する。
 * 現在は全データ削除機能のみを含む。
 */
function DebugControls({ onClearAllData }: DebugControlsProps) {
  /**
   * 全削除ボタンのクリックハンドラ
   * 親コンポーネントに全データ削除を通知する
   */
  const handleClick = (e: MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    onClearAllData();
  };

  return (
    <div>
      <button type="button" onClick={handleClick}>Debug: 全削除</button>
    </div>
  );
}

export default DebugControls;
