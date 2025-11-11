import { WorkoutEntry } from '../domain/WorkoutEntry.js';

/**
 * 運動記録のビジネスロジック層
 */
export class WorkoutService {
  constructor(repository) {
    this.repository = repository;
  }

  /**
   * 全エントリを新しい順で取得
   * @returns {WorkoutEntry[]}
   */
  getAllEntries() {
    return this.repository
      .findAll()
      .toSorted((a, b) => b.createdAt - a.createdAt);
  }

  /**
   * 日付でフィルタリングして取得
   * @param {string} date - YYYY-MM-DD形式
   * @returns {WorkoutEntry[]}
   */
  getEntriesByDate(date) {
    if (!date) return this.getAllEntries();

    return this.repository
      .findByDate(date)
      .toSorted((a, b) => b.createdAt - a.createdAt);
  }

  /**
   * 新規エントリを追加
   * @param {Object} formData
   * @throws {Error} バリデーションエラー
   */
  addEntry(formData) {
    const entry = WorkoutEntry.createFromForm(formData);

    if (!entry.isValid()) {
      throw new Error('種類と日付は必須です');
    }

    this.repository.save(entry);
  }

  /**
   * エントリを削除
   * @param {string} id
   */
  deleteEntry(id) {
    if (!id) return;
    this.repository.delete(id);
  }

  /**
   * 全データを削除
   */
  clearAllData() {
    this.repository.clear();
  }
}
