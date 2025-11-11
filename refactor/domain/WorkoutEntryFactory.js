import { WorkoutEntry } from './WorkoutEntry.js';
import { IdGenerator } from './IdGenerator.js';

/**
 * WorkoutEntryのファクトリー
 * 責務: 様々な入力ソースからWorkoutEntryを生成
 */
export class WorkoutEntryFactory {
  /**
   * フォームデータからエントリを作成
   * @param {Object} formData
   * @returns {WorkoutEntry}
   */
  static fromFormData(formData) {
    return new WorkoutEntry({
      id: IdGenerator.generate(),
      date: formData.date,
      type: formData.type,
      minutes: this.#parseNumber(formData.minutes),
      value: this.#parseNumber(formData.value),
      note: this.#sanitizeNote(formData.note),
      createdAt: Date.now(),
    });
  }

  /**
   * 数値をパース（空文字や不正な値は0に）
   * @param {string|number} value
   * @returns {number}
   */
  static #parseNumber(value) {
    const parsed = parseInt(value, 10);
    return isNaN(parsed) ? 0 : Math.max(0, parsed);
  }

  /**
   * メモをサニタイズ
   * @param {string} note
   * @returns {string}
   */
  static #sanitizeNote(note) {
    return String(note || '').trim();
  }
}
