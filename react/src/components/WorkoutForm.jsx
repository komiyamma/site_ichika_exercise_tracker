import { useState, useCallback, useMemo } from 'react';
import PropTypes from 'prop-types';
import { getTodayString } from '../date/formatter';
import { WORKOUT_TYPES } from '../constants/workoutTypes';

const getInitialFormState = () => ({
  type: '',
  date: getTodayString(),
  minutes: '',
  value: '',
  note: '',
});

function WorkoutForm({ onAddEntry }) {
  const [formData, setFormData] = useState(getInitialFormState);

  const handleChange = useCallback((field) => (e) => {
    setFormData(prev => ({ ...prev, [field]: e.target.value }));
  }, []);

  const handleSubmit = useCallback((e) => {
    e.preventDefault();

    if (!formData.type || !formData.date) {
      alert('種類と日付は必須.');
      return;
    }

    const timestamp = Date.now();
    const entry = {
      id: String(timestamp),
      date: formData.date,
      type: formData.type,
      minutes: parseInt(formData.minutes, 10) || 0,
      value: parseInt(formData.value, 10) || 0,
      note: formData.note.trim(),
      createdAt: timestamp,
    };

    onAddEntry(entry);
    setFormData(getInitialFormState());
  }, [formData, onAddEntry]);

  const workoutOptions = useMemo(() => (
    WORKOUT_TYPES.map(type => <option key={type}>{type}</option>)
  ), []);

  return (
    <>
      <h2>新しい記録</h2>
      <form onSubmit={handleSubmit}>
        <div>
          <label htmlFor="type" className="required">種目</label><br />
          <select
            id="type"
            value={formData.type}
            onChange={handleChange('type')}
            required
          >
            <option value="">選択してください</option>
            {workoutOptions}
          </select>
        </div>

        <div>
          <label htmlFor="date" className="required">日付</label><br />
          <input
            id="date"
            type="date"
            value={formData.date}
            onChange={handleChange('date')}
            required
          />
        </div>

        <div>
          <label htmlFor="minutes">時間（分）</label><br />
          <input
            id="minutes"
            type="number"
            min="0"
            value={formData.minutes}
            onChange={handleChange('minutes')}
            placeholder="例: 30"
          />
        </div>

        <div>
          <label htmlFor="value">回数 / 距離</label><br />
          <input
            id="value"
            type="number"
            min="0"
            value={formData.value}
            onChange={handleChange('value')}
            placeholder="例: 回数=20 / 距離=5"
          />
        </div>

        <div>
          <label htmlFor="note">メモ</label><br />
          <input
            id="note"
            type="text"
            value={formData.note}
            onChange={handleChange('note')}
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

WorkoutForm.propTypes = {
  onAddEntry: PropTypes.func.isRequired,
};

export default WorkoutForm;
