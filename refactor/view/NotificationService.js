/**
 * 通知サービス
 * 責務: ユーザーへの通知表示（テスト可能な設計）
 */
export class NotificationService {
  /**
   * エラーメッセージを表示
   * @param {string} message
   */
  showError(message) {
    alert(message);
  }

  /**
   * 確認ダイアログを表示
   * @param {string} message
   * @returns {boolean}
   */
  confirm(message) {
    return window.confirm(message);
  }

  /**
   * 情報メッセージを表示
   * @param {string} message
   */
  showInfo(message) {
    alert(message);
  }
}
