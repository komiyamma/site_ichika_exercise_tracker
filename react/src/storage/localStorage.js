/**
 * localStorage 内で使うキー名
 */
const WORKOUT_STORAGE_KEY = 'ichikaWorkoutLogEntries';

/**
 * localStorageからデータを読み込む
 * @returns {Array} 運動記録の配列
 */
export function loadEntriesFromStorage() {
  try {
    const entriesJson = localStorage.getItem(WORKOUT_STORAGE_KEY);
    return entriesJson ? JSON.parse(entriesJson) : [];
  } catch (e) {
    console.error('ストレージからのデータ読み込みに失敗しました:', e);
    return [];
  }
}

/**
 * localStorageにデータを保存する
 * @param {Array} entries - 保存する運動記録の配列
 */
export function saveEntriesToStorage(entries) {
  try {
    const entriesJson = JSON.stringify(entries);
    localStorage.setItem(WORKOUT_STORAGE_KEY, entriesJson);
  } catch (e) {
    console.error('ストレージへのデータ保存に失敗しました:', e);
  }
}

/**
 * localStorageから全データを削除する
 */
export function clearStorage() {
  localStorage.removeItem(WORKOUT_STORAGE_KEY);
}
