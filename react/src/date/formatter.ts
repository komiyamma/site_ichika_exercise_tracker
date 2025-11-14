/**
 * 数値を2桁の0埋め文字列に変換する
 * 
 * @param num - 変換する数値
 * @returns 2桁の0埋め文字列（例: 3 → "03", 12 → "12"）
 */
const padZero = (num: number): string => String(num).padStart(2, '0');

/**
 * 今日の日付をYYYY-MM-DD形式の文字列で取得する
 * 
 * @returns YYYY-MM-DD形式の日付文字列（例: "2024-11-15"）
 */
export const getTodayString = (): string => {
  const today = new Date();
  const year = today.getFullYear();
  const month = padZero(today.getMonth() + 1);  // 月は0始まりなので+1
  const day = padZero(today.getDate());
  return `${year}-${month}-${day}`;
};

/**
 * 日付をYYYY-MM-DD形式の文字列にフォーマットする
 * 
 * @param date - フォーマットする日付（Date、文字列、またはタイムスタンプ）
 * @returns YYYY-MM-DD形式の日付文字列
 */
export const formatDate = (date: Date | string | number): string => {
  const dateObj = date instanceof Date ? date : new Date(date);
  const year = dateObj.getFullYear();
  const month = padZero(dateObj.getMonth() + 1);
  const day = padZero(dateObj.getDate());
  return `${year}-${month}-${day}`;
};
