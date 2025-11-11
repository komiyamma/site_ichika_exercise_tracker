/**
 * HTML関連のユーティリティ関数
 */

/**
 * XSS対策：HTMLエスケープ
 * @param {string|number} value
 * @returns {string}
 */
export function escapeHtml(value) {
  if (value === undefined || value === null) {
    return '';
  }

  return String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}
