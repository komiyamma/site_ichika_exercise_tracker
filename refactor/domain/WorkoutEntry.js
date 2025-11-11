/**
 * 運動記録エントリのドメインモデル
 * 責務: ビジネスルールとバリデーション
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
    if (!id || !createdAt) {
      throw new Error('id and createdAt are required');
    }

    this.id = id;
    this.date = date;
    this.type = type;
    this.minutes = minutes;
    this.value = value;
    this.note = note;
    this.createdAt = createdAt;
  }

  /**
   * プレーンオブジェクトに変換
   */
  toPlainObject() {
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
   * @returns {{isValid: boolean, errors: string[], warnings: string[]}}
   */
  validate() {
    const errors = [];
    const warnings = [];

    // 必須項目チェック
    if (!this.type) {
      errors.push('種目は必須です');
    }

    if (!this.date) {
      errors.push('日付は必須です');
    } else if (!/^\d{4}-\d{2}-\d{2}$/.test(this.date)) {
      errors.push('日付の形式が不正です（YYYY-MM-DD）');
    }

    // 数値範囲チェック
    if (this.minutes < 0) {
      errors.push('時間は0以上である必要があります');
    }

    if (this.value < 0) {
      errors.push('回数/距離は0以上である必要があります');
    }

    // 警告チェック
    if (this.minutes === 0 && this.value === 0) {
      warnings.push('時間または回数/距離のいずれかを入力することを推奨します');
    }

    return {
      isValid: errors.length === 0,
      errors,
      warnings,
    };
  }
}
