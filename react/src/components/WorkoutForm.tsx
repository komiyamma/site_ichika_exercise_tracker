import { useState, useCallback, useMemo, type FormEvent, type ChangeEvent } from 'react';
import { getTodayString } from '../date/formatter';
import { WORKOUT_TYPES } from '../constants/workoutTypes';
import type { WorkoutEntry } from '../types/workout';

/** フォームの入力データの型定義 */
interface FormData {
  type: string;      // 運動種目
  date: string;      // 日付（YYYY-MM-DD形式）
  minutes: string;   // 時間（分）- 文字列で保持
  value: string;     // 回数または距離 - 文字列で保持
  note: string;      // メモ
}

/** WorkoutFormコンポーネントのProps */
interface WorkoutFormProps {
  /** 新しい記録が追加されたときに呼ばれるコールバック */
  onAddEntry: (entry: WorkoutEntry) => void;
}

/**
 * フォームの初期状態を生成する
 * 関数として定義することで、呼び出し時に最新の日付を取得できる
 */
const getInitialFormState = (): FormData => ({
  type: '',
  date: getTodayString(),
  minutes: '',
  value: '',
  note: '',
});

/**
 * 運動記録入力フォームコンポーネント
 * 
 * ユーザーが新しい運動記録を入力するためのフォーム。
 * 種目、日付、時間、回数/距離、メモを入力できる。
 */
function WorkoutForm({ onAddEntry }: WorkoutFormProps) {
  // フォームの入力状態を管理
  const [formData, setFormData] = useState<FormData>(getInitialFormState);

  /**
   * フォームフィールドの変更ハンドラを生成する
   * カリー化により、各フィールドごとに最適化されたハンドラを作成
   */
  const handleChange = useCallback((field: keyof FormData) => (e: ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData(prev => ({ ...prev, [field]: e.target.value }));
  }, []);

  /**
   * フォーム送信時の処理
   * バリデーション、データ変換、親コンポーネントへの通知、フォームリセットを行う
   */
  const handleSubmit = useCallback((e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    // 必須項目のバリデーション
    if (!formData.type || !formData.date) {
      alert('種類と日付は必須.');
      return;
    }

    // タイムスタンプを生成（IDと作成日時の両方に使用）
    const timestamp = Date.now();
    
    // WorkoutEntry型のオブジェクトを作成
    const entry: WorkoutEntry = {
      id: `${timestamp}-${crypto.randomUUID()}`,      // タイムスタンプ-UUIDを文字列化してIDとする 
      date: formData.date,
      type: formData.type,
      minutes: parseInt(formData.minutes, 10) || 0,   // 空文字列の場合は0
      value: parseInt(formData.value, 10) || 0,       // 空文字列の場合は0
      note: formData.note.trim(),                     // 前後の空白を削除
      createdAt: timestamp,
    };

    // 親コンポーネントに新しい記録を通知
    onAddEntry(entry);
    
    // フォームを初期状態にリセット（日付は今日の日付に設定）
    setFormData(getInitialFormState());
  }, [formData, onAddEntry]);

  /**
   * 運動種目の選択肢をメモ化
   * WORKOUT_TYPESが変更されない限り、再計算されない
   */
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

export default WorkoutForm;
