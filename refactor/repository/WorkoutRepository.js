import { WorkoutEntry } from '../domain/WorkoutEntry.js';

/**
 * 運動記録のリポジトリ（データアクセス層）
 */
export class WorkoutRepository {
  constructor(storageKey = 'ichikaWorkoutLogEntries') {
    this.storageKey = storageKey;
  }

  /**
   * 全エントリを取得
   * @returns {WorkoutEntry[]}
   */
  findAll() {
    try {
      const json = localStorage.getItem(this.storageKey);
      if (!json) return [];

      const data = JSON.parse(json);
      return data.map(item => WorkoutEntry.fromJSON(item));
    } catch (error) {
      console.error('データ読み込みエラー:', error);
      return [];
    }
  }

  /**
   * 日付でフィルタリング
   * @param {string} date - YYYY-MM-DD形式
   * @returns {WorkoutEntry[]}
   */
  findByDate(date) {
    return this.findAll().filter(entry => entry.date === date);
  }

  /**
   * エントリを保存
   * @param {WorkoutEntry} entry
   */
  save(entry) {
    const entries = this.findAll();
    entries.push(entry);
    this.saveAll(entries);
  }

  /**
   * エントリを削除
   * @param {string} id
   */
  delete(id) {
    const entries = this.findAll().filter(entry => entry.id !== id);
    this.saveAll(entries);
  }

  /**
   * 全エントリを保存
   * @param {WorkoutEntry[]} entries
   */
  saveAll(entries) {
    try {
      const data = entries.map(entry => entry.toJSON());
      localStorage.setItem(this.storageKey, JSON.stringify(data));
    } catch (error) {
      console.error('データ保存エラー:', error);
      throw error;
    }
  }

  /**
   * 全データを削除
   */
  clear() {
    localStorage.removeItem(this.storageKey);
  }
}
