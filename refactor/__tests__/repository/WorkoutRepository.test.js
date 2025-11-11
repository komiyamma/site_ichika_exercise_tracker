/**
 * WorkoutRepository のテスト
 * 
 * テスト戦略:
 * - localStorage操作の正確性検証
 * - エラーハンドリングの検証
 * - トランザクション処理の検証
 * - データ整合性の確認
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { WorkoutRepository } from '../../repository/WorkoutRepository.js';
import { WorkoutEntry } from '../../domain/WorkoutEntry.js';

describe('WorkoutRepository', () => {
  let repository;
  const testStorageKey = 'test-workout-entries';

  beforeEach(() => {
    // localStorageをクリア
    localStorage.clear();
    repository = new WorkoutRepository(testStorageKey);
  });

  afterEach(() => {
    localStorage.clear();
  });

  describe('constructor', () => {
    it('デフォルトのストレージキーで初期化できる', () => {
      const repo = new WorkoutRepository();
      expect(repo.storageKey).toBe('ichikaWorkoutLogEntries');
    });

    it('カスタムストレージキーで初期化できる', () => {
      const customKey = 'custom-key';
      const repo = new WorkoutRepository(customKey);
      expect(repo.storageKey).toBe(customKey);
    });
  });

  describe('findAll', () => {
    it('データが存在しない場合は空配列を返す', () => {
      const entries = repository.findAll();

      expect(entries).toEqual([]);
      expect(Array.isArray(entries)).toBe(true);
    });

    it('保存されたエントリを全て取得できる', () => {
      const testData = [
        {
          id: 'test-id-1',
          date: '2025-01-15',
          type: 'ランニング',
          minutes: 30,
          value: 5,
          note: 'テスト1',
          createdAt: 1705305600000,
        },
        {
          id: 'test-id-2',
          date: '2025-01-16',
          type: 'ウォーキング',
          minutes: 45,
          value: 0,
          note: 'テスト2',
          createdAt: 1705392000000,
        },
      ];

      localStorage.setItem(testStorageKey, JSON.stringify(testData));

      const entries = repository.findAll();

      expect(entries).toHaveLength(2);
      expect(entries[0]).toBeInstanceOf(WorkoutEntry);
      expect(entries[1]).toBeInstanceOf(WorkoutEntry);
      expect(entries[0].id).toBe('test-id-1');
      expect(entries[1].id).toBe('test-id-2');
    });

    it('取得したエントリはWorkoutEntryインスタンスである', () => {
      const testData = [
        {
          id: 'test-id',
          date: '2025-01-15',
          type: 'ランニング',
          minutes: 30,
          value: 5,
          note: '',
          createdAt: Date.now(),
        },
      ];

      localStorage.setItem(testStorageKey, JSON.stringify(testData));

      const entries = repository.findAll();

      expect(entries[0]).toBeInstanceOf(WorkoutEntry);
      expect(entries[0].validate).toBeDefined();
      expect(entries[0].toPlainObject).toBeDefined();
    });

    it('不正なJSONの場合はエラーをスローする', () => {
      localStorage.setItem(testStorageKey, 'invalid json');

      expect(() => {
        repository.findAll();
      }).toThrow('データ読み込み失敗');
    });

    it('エラーに元のエラーがcauseとして含まれる', () => {
      localStorage.setItem(testStorageKey, 'invalid json');

      try {
        repository.findAll();
        expect.fail('エラーがスローされるべき');
      } catch (error) {
        expect(error.cause).toBeDefined();
        expect(error.cause).toBeInstanceOf(Error);
      }
    });

    it('空のJSONデータの場合は空配列を返す', () => {
      localStorage.setItem(testStorageKey, '[]');

      const entries = repository.findAll();

      expect(entries).toEqual([]);
    });

    it('大量のエントリも正しく取得できる', () => {
      const testData = Array.from({ length: 1000 }, (_, i) => ({
        id: `test-id-${i}`,
        date: '2025-01-15',
        type: 'ランニング',
        minutes: 30,
        value: 5,
        note: `テスト${i}`,
        createdAt: Date.now() + i,
      }));

      localStorage.setItem(testStorageKey, JSON.stringify(testData));

      const entries = repository.findAll();

      expect(entries).toHaveLength(1000);
      expect(entries[0].id).toBe('test-id-0');
      expect(entries[999].id).toBe('test-id-999');
    });
  });

  describe('saveAll', () => {
    it('エントリを保存できる', () => {
      const entries = [
        new WorkoutEntry({
          id: 'test-id-1',
          date: '2025-01-15',
          type: 'ランニング',
          minutes: 30,
          value: 5,
          note: 'テスト',
          createdAt: Date.now(),
        }),
      ];

      repository.saveAll(entries);

      const saved = localStorage.getItem(testStorageKey);
      expect(saved).toBeDefined();
      
      const parsed = JSON.parse(saved);
      expect(parsed).toHaveLength(1);
      expect(parsed[0].id).toBe('test-id-1');
    });

    it('複数のエントリを保存できる', () => {
      const entries = [
        new WorkoutEntry({
          id: 'test-id-1',
          date: '2025-01-15',
          type: 'ランニング',
          minutes: 30,
          value: 5,
          note: '',
          createdAt: Date.now(),
        }),
        new WorkoutEntry({
          id: 'test-id-2',
          date: '2025-01-16',
          type: 'ウォーキング',
          minutes: 45,
          value: 0,
          note: '',
          createdAt: Date.now(),
        }),
      ];

      repository.saveAll(entries);

      const saved = localStorage.getItem(testStorageKey);
      const parsed = JSON.parse(saved);
      
      expect(parsed).toHaveLength(2);
      expect(parsed[0].id).toBe('test-id-1');
      expect(parsed[1].id).toBe('test-id-2');
    });

    it('空配列を保存できる', () => {
      repository.saveAll([]);

      const saved = localStorage.getItem(testStorageKey);
      const parsed = JSON.parse(saved);
      
      expect(parsed).toEqual([]);
    });

    it('既存のデータを上書きする', () => {
      const initialEntries = [
        new WorkoutEntry({
          id: 'old-id',
          date: '2025-01-01',
          type: '古いデータ',
          minutes: 10,
          value: 0,
          note: '',
          createdAt: Date.now(),
        }),
      ];

      repository.saveAll(initialEntries);

      const newEntries = [
        new WorkoutEntry({
          id: 'new-id',
          date: '2025-01-15',
          type: '新しいデータ',
          minutes: 30,
          value: 5,
          note: '',
          createdAt: Date.now(),
        }),
      ];

      repository.saveAll(newEntries);

      const saved = localStorage.getItem(testStorageKey);
      const parsed = JSON.parse(saved);
      
      expect(parsed).toHaveLength(1);
      expect(parsed[0].id).toBe('new-id');
    });

    it('プレーンオブジェクトとして保存される', () => {
      const entry = new WorkoutEntry({
        id: 'test-id',
        date: '2025-01-15',
        type: 'ランニング',
        minutes: 30,
        value: 5,
        note: 'テスト',
        createdAt: 1705305600000,
      });

      repository.saveAll([entry]);

      const saved = localStorage.getItem(testStorageKey);
      const parsed = JSON.parse(saved);
      
      expect(parsed[0]).toEqual({
        id: 'test-id',
        date: '2025-01-15',
        type: 'ランニング',
        minutes: 30,
        value: 5,
        note: 'テスト',
        createdAt: 1705305600000,
      });
    });

    it('localStorageの容量制限を超えた場合はエラーをスローする', () => {
      // localStorageの容量制限をシミュレート
      const originalSetItem = Storage.prototype.setItem;
      Storage.prototype.setItem = vi.fn(() => {
        throw new Error('QuotaExceededError');
      });

      const entries = [
        new WorkoutEntry({
          id: 'test-id',
          date: '2025-01-15',
          type: 'ランニング',
          minutes: 30,
          value: 5,
          note: '',
          createdAt: Date.now(),
        }),
      ];

      expect(() => {
        repository.saveAll(entries);
      }).toThrow('データ保存失敗');

      Storage.prototype.setItem = originalSetItem;
    });

    it('大量のエントリも保存できる', () => {
      const entries = Array.from({ length: 1000 }, (_, i) =>
        new WorkoutEntry({
          id: `test-id-${i}`,
          date: '2025-01-15',
          type: 'ランニング',
          minutes: 30,
          value: 5,
          note: `テスト${i}`,
          createdAt: Date.now() + i,
        })
      );

      repository.saveAll(entries);

      const saved = localStorage.getItem(testStorageKey);
      const parsed = JSON.parse(saved);
      
      expect(parsed).toHaveLength(1000);
    });
  });

  describe('transaction', () => {
    it('トランザクション内でエントリを追加できる', () => {
      const newEntry = new WorkoutEntry({
        id: 'new-id',
        date: '2025-01-15',
        type: 'ランニング',
        minutes: 30,
        value: 5,
        note: '',
        createdAt: Date.now(),
      });

      repository.transaction((entries) => {
        entries.push(newEntry);
        return entries;
      });

      const saved = repository.findAll();
      expect(saved).toHaveLength(1);
      expect(saved[0].id).toBe('new-id');
    });

    it('トランザクション内でエントリを削除できる', () => {
      const initialEntries = [
        new WorkoutEntry({
          id: 'id-1',
          date: '2025-01-15',
          type: 'ランニング',
          minutes: 30,
          value: 5,
          note: '',
          createdAt: Date.now(),
        }),
        new WorkoutEntry({
          id: 'id-2',
          date: '2025-01-16',
          type: 'ウォーキング',
          minutes: 45,
          value: 0,
          note: '',
          createdAt: Date.now(),
        }),
      ];

      repository.saveAll(initialEntries);

      repository.transaction((entries) => {
        return entries.filter(e => e.id !== 'id-1');
      });

      const saved = repository.findAll();
      expect(saved).toHaveLength(1);
      expect(saved[0].id).toBe('id-2');
    });

    it('トランザクション内でエントリを更新できる', () => {
      const initialEntry = new WorkoutEntry({
        id: 'test-id',
        date: '2025-01-15',
        type: 'ランニング',
        minutes: 30,
        value: 5,
        note: '更新前',
        createdAt: Date.now(),
      });

      repository.saveAll([initialEntry]);

      repository.transaction((entries) => {
        return entries.map(e => {
          if (e.id === 'test-id') {
            return new WorkoutEntry({
              ...e.toPlainObject(),
              note: '更新後',
            });
          }
          return e;
        });
      });

      const saved = repository.findAll();
      expect(saved[0].note).toBe('更新後');
    });

    it('トランザクション内で複数の操作を実行できる', () => {
      const initialEntries = [
        new WorkoutEntry({
          id: 'id-1',
          date: '2025-01-15',
          type: 'ランニング',
          minutes: 30,
          value: 5,
          note: '',
          createdAt: Date.now(),
        }),
      ];

      repository.saveAll(initialEntries);

      repository.transaction((entries) => {
        // 削除
        const filtered = entries.filter(e => e.id !== 'id-1');
        
        // 追加
        filtered.push(new WorkoutEntry({
          id: 'id-2',
          date: '2025-01-16',
          type: 'ウォーキング',
          minutes: 45,
          value: 0,
          note: '',
          createdAt: Date.now(),
        }));

        return filtered;
      });

      const saved = repository.findAll();
      expect(saved).toHaveLength(1);
      expect(saved[0].id).toBe('id-2');
    });

    it('コールバックがエラーをスローした場合は保存されない', () => {
      const initialEntry = new WorkoutEntry({
        id: 'test-id',
        date: '2025-01-15',
        type: 'ランニング',
        minutes: 30,
        value: 5,
        note: '',
        createdAt: Date.now(),
      });

      repository.saveAll([initialEntry]);

      expect(() => {
        repository.transaction(() => {
          throw new Error('トランザクションエラー');
        });
      }).toThrow('トランザクションエラー');

      // 元のデータが保持されていることを確認
      const saved = repository.findAll();
      expect(saved).toHaveLength(1);
      expect(saved[0].id).toBe('test-id');
    });

    it('空のトランザクションも実行できる', () => {
      repository.transaction((entries) => entries);

      const saved = repository.findAll();
      expect(saved).toEqual([]);
    });
  });

  describe('clear', () => {
    it('全データを削除できる', () => {
      const entries = [
        new WorkoutEntry({
          id: 'test-id',
          date: '2025-01-15',
          type: 'ランニング',
          minutes: 30,
          value: 5,
          note: '',
          createdAt: Date.now(),
        }),
      ];

      repository.saveAll(entries);
      repository.clear();

      const saved = localStorage.getItem(testStorageKey);
      expect(saved).toBeNull();
    });

    it('データが存在しない場合でもエラーにならない', () => {
      expect(() => {
        repository.clear();
      }).not.toThrow();
    });

    it('クリア後にfindAllを呼ぶと空配列を返す', () => {
      const entries = [
        new WorkoutEntry({
          id: 'test-id',
          date: '2025-01-15',
          type: 'ランニング',
          minutes: 30,
          value: 5,
          note: '',
          createdAt: Date.now(),
        }),
      ];

      repository.saveAll(entries);
      repository.clear();

      const result = repository.findAll();
      expect(result).toEqual([]);
    });
  });

  describe('データ整合性', () => {
    it('保存→取得のラウンドトリップでデータが保持される', () => {
      const originalEntry = new WorkoutEntry({
        id: 'round-trip-test',
        date: '2025-01-15',
        type: 'ランニング',
        minutes: 30,
        value: 5,
        note: 'テストメモ',
        createdAt: 1705305600000,
      });

      repository.saveAll([originalEntry]);
      const retrieved = repository.findAll();

      expect(retrieved[0].toPlainObject()).toEqual(originalEntry.toPlainObject());
    });

    it('複数エントリの順序が保持される', () => {
      const entries = [
        new WorkoutEntry({
          id: 'id-1',
          date: '2025-01-15',
          type: 'ランニング',
          minutes: 30,
          value: 5,
          note: '',
          createdAt: 1705305600000,
        }),
        new WorkoutEntry({
          id: 'id-2',
          date: '2025-01-16',
          type: 'ウォーキング',
          minutes: 45,
          value: 0,
          note: '',
          createdAt: 1705392000000,
        }),
        new WorkoutEntry({
          id: 'id-3',
          date: '2025-01-17',
          type: '筋トレ',
          minutes: 20,
          value: 50,
          note: '',
          createdAt: 1705478400000,
        }),
      ];

      repository.saveAll(entries);
      const retrieved = repository.findAll();

      expect(retrieved[0].id).toBe('id-1');
      expect(retrieved[1].id).toBe('id-2');
      expect(retrieved[2].id).toBe('id-3');
    });
  });

  describe('分離性（Isolation）', () => {
    it('異なるストレージキーのリポジトリは独立している', () => {
      const repo1 = new WorkoutRepository('key-1');
      const repo2 = new WorkoutRepository('key-2');

      const entry1 = new WorkoutEntry({
        id: 'id-1',
        date: '2025-01-15',
        type: 'ランニング',
        minutes: 30,
        value: 5,
        note: '',
        createdAt: Date.now(),
      });

      const entry2 = new WorkoutEntry({
        id: 'id-2',
        date: '2025-01-16',
        type: 'ウォーキング',
        minutes: 45,
        value: 0,
        note: '',
        createdAt: Date.now(),
      });

      repo1.saveAll([entry1]);
      repo2.saveAll([entry2]);

      const saved1 = repo1.findAll();
      const saved2 = repo2.findAll();

      expect(saved1).toHaveLength(1);
      expect(saved2).toHaveLength(1);
      expect(saved1[0].id).toBe('id-1');
      expect(saved2[0].id).toBe('id-2');
    });
  });
});
