/**
 * ユニークID生成器
 * 責務: 衝突しないIDの生成
 */
export class IdGenerator {
  /**
   * UUIDを生成（RFC 4122準拠）
   * @returns {string}
   */
  static generate() {
    // crypto.randomUUID()を使用（モダンブラウザ標準）
    return crypto.randomUUID();
  }
}
