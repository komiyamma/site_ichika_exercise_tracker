/**
 * リポジトリエラー
 * データの永続化・取得時の失敗時にスローされる
 */
export class RepositoryError extends Error {
  constructor(message, options = {}) {
    super(message, options);
    this.name = 'RepositoryError';
  }
}
