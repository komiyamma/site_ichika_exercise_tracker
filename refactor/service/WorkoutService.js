import { WorkoutEntry } from '../domain/WorkoutEntry.js';

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
   * @throws {Error} バリデーションエラーまたは保存失敗時
   */
  addEntry(formData) {
    // フォームデータからドメインモデルを構築
    const timestamp = Date.now();
    const entry = new WorkoutEntry({
      id: String(timestamp),
      date: formData.date,
      type: formData.type,
      minutes: parseInt(formData.minutes, 10) || 0,
      value: parseInt(formData.value, 10) || 0,
      note: formData.note.trim(),
      createdAt: timestamp,
    });

    // バリデーション
    const validation = entry.validate();
    if (!validation.isValid) {
      throw new Error(validation.errors.join(', '));
    }

    // 保存
    const entries = this.repository.findAll();
    entries.push(entry);
    this.repository.saveAll(entries);
  }

  /**
   * エントリを削除
   * @param {string} id
   * @throws {Error} データ保存失敗時
   */
  deleteEntry(id) {
    if (!id) return;

    const entries = this.repository.findAll();
    const filtered = entries.filter(entry => entry.id !== id);
    this.repository.saveAll(filtered);
  }

  /**
   * 全データを削除
   */
  clearAllData() {
    this.repository.clear();
  }
}
