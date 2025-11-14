import { STORAGE_KEY } from '../constants/workoutTypes';
import type { WorkoutEntry } from '../types/workout';

export const loadEntriesFromStorage = (): WorkoutEntry[] => {
  try {
    const entriesJson = localStorage.getItem(STORAGE_KEY);
    return entriesJson ? JSON.parse(entriesJson) : [];
  } catch (error) {
    console.error('ストレージからのデータ読み込みに失敗しました:', error);
    return [];
  }
};

export const saveEntriesToStorage = (entries: WorkoutEntry[]): void => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(entries));
  } catch (error) {
    console.error('ストレージへのデータ保存に失敗しました:', error);
  }
};

export const clearStorage = (): void => {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch (error) {
    console.error('ストレージのクリアに失敗しました:', error);
  }
};
