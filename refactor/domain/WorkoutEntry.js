/**
 * 運動記録エントリのドメインモデル
 */
export class WorkoutEntry {
  /**
   * @param {Object} data
   * @param {string} data.id
   * @param {string} data.date - YYYY-MM-DD形式
   * @param {string} data.type
   * @param {number} data.minutes
   * @param {number} data.value
   * @param {string} data.note
   * @param {number} data.createdAt - タイムスタンプ
   */
  constructor({ id, date, type, minutes = 0, value = 0, note = '', createdAt }) {
    this.id = id;
    this.date = date;
    this.type = type;
    this.minutes = minutes;
    this.value = value;
    this.note = note;
    this.createdAt = createdAt;
  }

  /**
   * フォームデータから新規エントリを作成
   */
  static createFromForm({ date, type, minutes, value, note }) {
    const timestamp = Date.now();
    return new WorkoutEntry({
      id: String(timestamp),
      date,
      type,
      minutes: parseInt(minutes, 10) || 0,
      value: parseInt(value, 10) || 0,
      note: note.trim(),
      createdAt: timestamp,
    });
  }

  /**
   * プレーンオブジェクトに変換
   */
  toJSON() {
    return {
      id: this.id,
      date: this.date,
      type: this.type,
      minutes: this.minutes,
      value: this.value,
      note: this.note,
      createdAt: this.createdAt,
    };
  }

  /**
   * プレーンオブジェクトからインスタンスを復元
   */
  static fromJSON(data) {
    return new WorkoutEntry(data);
  }

  /**
   * バリデーション
   */
  isValid() {
    return Boolean(this.type && this.date);
  }
}
