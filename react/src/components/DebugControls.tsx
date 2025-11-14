import { type MouseEvent } from 'react';

interface DebugControlsProps {
  onClearAllData: () => void;
}

function DebugControls({ onClearAllData }: DebugControlsProps) {
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
