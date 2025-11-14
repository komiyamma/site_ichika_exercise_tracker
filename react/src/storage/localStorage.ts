import { STORAGE_KEY } from './constants';
import type { WorkoutEntry } from '../types/workout';

/**
 * localStorageから運動記録を読み込む
 * 
 * @returns 保存されている運動記録の配列。データがない場合や読み込みに失敗した場合は空配列
 */
export const loadEntriesFromStorage = (): WorkoutEntry[] => {
  try {
    const entriesJson = localStorage.getItem(STORAGE_KEY);
    return entriesJson ? JSON.parse(entriesJson) : [];
  } catch (error) {
    console.error('ストレージからのデータ読み込みに失敗しました:', error);
    return [];
  }
};

/**
 * localStorageに運動記録を保存する
 * 
 * @param entries - 保存する運動記録の配列
 */
export const saveEntriesToStorage = (entries: WorkoutEntry[]): void => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(entries));
  } catch (error) {
    console.error('ストレージへのデータ保存に失敗しました:', error);
  }
};

/**
 * localStorageから運動記録を削除する
 * 
 * アプリケーションのデータを完全にクリアする際に使用
 */
export const clearStorage = (): void => {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch (error) {
    console.error('ストレージのクリアに失敗しました:', error);
  }
};
