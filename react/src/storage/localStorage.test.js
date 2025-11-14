import { describe, it, expect, beforeEach, vi } from 'vitest';
import { loadEntriesFromStorage, saveEntriesToStorage, clearStorage } from './localStorage';

describe('localStorage関数', () => {
  beforeEach(() => {
    // 各テスト前にlocalStorageをクリア
    localStorage.clear();
  });

  describe('loadEntriesFromStorage', () => {
    it('データがない場合は空配列を返す', () => {
      const result = loadEntriesFromStorage();
      expect(result).toEqual([]);
    });

    it('保存されたデータを正しく読み込む', () => {
      const testData = [
        { id: '1', type: 'ランニング', date: '2024-11-15' },
        { id: '2', type: 'ウォーキング', date: '2024-11-14' }
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
        { id: '1', type: 'ランニング', date: '2024-11-15' }
      ];

      saveEntriesToStorage(testData);

      const saved = localStorage.getItem('ichikaWorkoutLogEntries');
      expect(JSON.parse(saved)).toEqual(testData);
    });

    it('空配列を保存できる', () => {
      saveEntriesToStorage([]);

      const saved = localStorage.getItem('ichikaWorkoutLogEntries');
      expect(JSON.parse(saved)).toEqual([]);
    });
  });

  describe('clearStorage', () => {
    it('保存されたデータを削除する', () => {
      const testData = [{ id: '1', type: 'ランニング' }];
      localStorage.setItem('ichikaWorkoutLogEntries', JSON.stringify(testData));

      clearStorage();

      const result = localStorage.getItem('ichikaWorkoutLogEntries');
      expect(result).toBeNull();
    });
  });
});
