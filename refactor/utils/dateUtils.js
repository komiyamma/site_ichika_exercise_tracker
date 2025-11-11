/**
 * 日付関連のユーティリティ関数
 */

/**
 * 今日の日付をYYYY-MM-DD形式で取得
 * @returns {string}
 */
export function getTodayFormatted() {
  const today = new Date();
  const year = today.getFullYear();
  const month = String(today.getMonth() + 1).padStart(2, '0');
  const day = String(today.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}
