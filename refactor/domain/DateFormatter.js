/**
 * 日付フォーマットのドメインロジック
 */
export class DateFormatter {
  /**
   * DateオブジェクトをYYYY-MM-DD形式に変換
   * @param {Date} date
   * @returns {string}
   */
  static toYYYYMMDD(date = new Date()) {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  /**
   * 今日の日付をYYYY-MM-DD形式で取得
   * @returns {string}
   */
  static today() {
    return this.toYYYYMMDD();
  }
}
