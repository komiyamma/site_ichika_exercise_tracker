import { useState } from 'react';
import { getTodayString } from '../date/formatter';

/**
 * 運動記録入力フォームコンポーネント
 */
function WorkoutForm({ onAddEntry }) {
  const [type, setType] = useState('');
  const [date, setDate] = useState(getTodayString());
  const [minutes, setMinutes] = useState('');
  const [value, setValue] = useState('');
  const [note, setNote] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!type || !date) {
      alert('種類と日付は必須.');
      return;
    }

    const timestamp = Date.now();
    const entry = {
      id: String(timestamp),
      date: date,
      type: type,
      minutes: parseInt(minutes, 10) || 0,
      value: parseInt(value, 10) || 0,
      note: note.trim(),
      createdAt: timestamp
    };

    onAddEntry(entry);
    resetForm();
  };

  const resetForm = () => {
    setType('');
    setDate(getTodayString());
    setMinutes('');
    setValue('');
    setNote('');
  };

  return (
    <>
      <h2>新しい記録</h2>
      <form onSubmit={handleSubmit}>
        <div>
          <label htmlFor="type" className="required">種目</label><br />
          <select
            id="type"
            value={type}
            onChange={(e) => setType(e.target.value)}
            required
          >
            <option value="">選択してください</option>
            <option>ウォーキング</option>
            <option>ランニング</option>
            <option>通学の徒歩</option>
            <option>筋トレ</option>
            <option>なわとび</option>
          </select>
        </div>

        <div>
          <label htmlFor="date" className="required">日付</label><br />
          <input
            id="date"
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            required
          />
        </div>

        <div>
          <label htmlFor="minutes">時間（分）</label><br />
          <input
            id="minutes"
            type="number"
            min="0"
            value={minutes}
            onChange={(e) => setMinutes(e.target.value)}
            placeholder="例: 30"
          />
        </div>

        <div>
          <label htmlFor="value">回数 / 距離</label><br />
          <input
            id="value"
            type="number"
            min="0"
            value={value}
            onChange={(e) => setValue(e.target.value)}
            placeholder="例: 回数=20 / 距離=5"
          />
        </div>

        <div>
          <label htmlFor="note">メモ</label><br />
          <input
            id="note"
            type="text"
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder="ひとことメモ"
          />
        </div>

        <div>
          <button type="submit">追加する</button>
        </div>
      </form>
    </>
  );
}

export default WorkoutForm;
