import { WorkoutEntry } from '../domain/WorkoutEntry.js';
import { RepositoryError } from '../domain/errors/RepositoryError.js';

/**
 * 運動記録のリポジトリ（データアクセス層）
 * 責務: localStorageへの読み書きのみ
 */
export class WorkoutRepository {
  constructor(storageKey = 'ichikaWorkoutLogEntries') {
    this.storageKey = storageKey;
  }

  /**
   * 全エントリを取得
   * @returns {WorkoutEntry[]}
   * @throws {RepositoryError} データ読み込み失敗時
   */
  findAll() {
    try {
      const json = localStorage.getItem(this.storageKey);
      if (!json) return [];

      const data = JSON.parse(json);
      return data.map(item => WorkoutEntry.fromJSON(item));
    } catch (error) {
      throw new RepositoryError(`データ読み込み失敗: ${error.message}`, {
        cause: error,
      });
    }
  }

  /**
   * 全エントリを保存
   * @param {WorkoutEntry[]} entries
   * @throws {RepositoryError} データ保存失敗時
   */
  saveAll(entries) {
    try {
      const data = entries.map(entry => entry.toPlainObject());
      localStorage.setItem(this.storageKey, JSON.stringify(data));
    } catch (error) {
      throw new RepositoryError(`データ保存失敗: ${error.message}`, {
        cause: error,
      });
    }
  }

  /**
   * トランザクション的な操作
   * @param {Function} callback - (entries) => updatedEntries
   * @throws {Error} データ操作失敗時
   */
  transaction(callback) {
    const entries = this.findAll();
    const updatedEntries = callback(entries);
    this.saveAll(updatedEntries);
  }

  /**
   * 全データを削除
   */
  clear() {
    localStorage.removeItem(this.storageKey);
  }
}
