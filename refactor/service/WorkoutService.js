import { WorkoutEntryFactory } from '../domain/WorkoutEntryFactory.js';
import { ValidationError } from '../domain/errors/ValidationError.js';

/**
 * 運動記録のビジネスロジック層
 * 責務: ビジネスルール、フィルタリング、ソート
 */
export class WorkoutService {
  constructor(repository) {
    this.repository = repository;
  }

  /**
   * エントリを作成日時の新しい順でソート
   * @param {WorkoutEntry[]} entries
   * @returns {WorkoutEntry[]}
   */
  #sortByCreatedAt(entries) {
    return entries.toSorted((a, b) => b.createdAt - a.createdAt);
  }

  /**
   * 全エントリを新しい順で取得
   * @returns {WorkoutEntry[]}
   * @throws {Error} データ取得失敗時
   */
  getAllEntries() {
    const entries = this.repository.findAll();
    return this.#sortByCreatedAt(entries);
  }

  /**
   * 日付でフィルタリングして取得
   * @param {string} date - YYYY-MM-DD形式（空文字の場合は全件）
   * @returns {WorkoutEntry[]}
   * @throws {Error} データ取得失敗時
   */
  getEntriesByDate(date) {
    const entries = this.repository.findAll();
    const filtered = date ? entries.filter(e => e.date === date) : entries;
    return this.#sortByCreatedAt(filtered);
  }

  /**
   * 新規エントリを追加
   * @param {Object} formData
   * @throws {ValidationError} バリデーションエラー時
   * @throws {RepositoryError} 保存失敗時
   */
  addEntry(formData) {
    // ファクトリーでエントリを生成
    const entry = WorkoutEntryFactory.fromFormData(formData);

    // バリデーション
    const validation = entry.validate();
    if (!validation.isValid) {
      throw new ValidationError(validation.errors);
    }

    // トランザクション的に保存
    this.repository.transaction((entries) => {
      entries.push(entry);
      return entries;
    });
  }

  /**
   * エントリを削除
   * @param {string} id
   * @throws {Error} データ保存失敗時
   */
  deleteEntry(id) {
    if (!id) return;

    // トランザクション的に削除
    this.repository.transaction((entries) => {
      return entries.filter(entry => entry.id !== id);
    });
  }

  /**
   * 全データを削除
   */
  clearAllData() {
    this.repository.clear();
  }
}
