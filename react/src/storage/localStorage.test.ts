import { describe, it, expect, beforeEach } from 'vitest';
import { loadEntriesFromStorage, saveEntriesToStorage, clearStorage } from './localStorage';

describe('localStorage関数', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  describe('loadEntriesFromStorage', () => {
    it('データがない場合は空配列を返す', () => {
      const result = loadEntriesFromStorage();
      expect(result).toEqual([]);
    });

    it('保存されたデータを正しく読み込む', () => {
      const testData = [
        { id: '1', type: 'ランニング', date: '2024-11-15', minutes: 30, value: 5, note: '', createdAt: 1700000000000 },
        { id: '2', type: 'ウォーキング', date: '2024-11-14', minutes: 20, value: 3, note: '', createdAt: 1699900000000 }
      ];
      localStorage.setItem('ichikaWorkoutLogEntries', JSON.stringify(testData));

      const result = loadEntriesFromStorage();
      expect(result).toEqual(testData);
    });

    it('不正なJSONの場合は空配列を返す', () => {
      localStorage.setItem('ichikaWorkoutLogEntries', 'invalid json');
      
      const result = loadEntriesFromStorage();
      expect(result).toEqual([]);
    });
  });

  describe('saveEntriesToStorage', () => {
    it('データを正しく保存する', () => {
      const testData = [
        { id: '1', type: 'ランニング', date: '2024-11-15', minutes: 30, value: 5, note: '', createdAt: 1700000000000 }
      ];

      saveEntriesToStorage(testData);

      const saved = localStorage.getItem('ichikaWorkoutLogEntries');
      expect(JSON.parse(saved!)).toEqual(testData);
    });

    it('空配列を保存できる', () => {
      saveEntriesToStorage([]);

      const saved = localStorage.getItem('ichikaWorkoutLogEntries');
      expect(JSON.parse(saved!)).toEqual([]);
    });
  });

  describe('clearStorage', () => {
    it('保存されたデータを削除する', () => {
      const testData = [{ id: '1', type: 'ランニング', date: '2024-11-15', minutes: 30, value: 5, note: '', createdAt: 1700000000000 }];
      localStorage.setItem('ichikaWorkoutLogEntries', JSON.stringify(testData));

      clearStorage();

      const result = localStorage.getItem('ichikaWorkoutLogEntries');
      expect(result).toBeNull();
    });
  });
});
