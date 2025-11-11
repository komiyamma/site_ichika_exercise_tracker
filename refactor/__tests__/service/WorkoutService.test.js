/**
 * WorkoutService のテスト
 * 
 * テスト戦略:
 * - ビジネスロジックの正確性検証
 * - リポジトリとの連携テスト
 * - ソート・フィルタリングロジックの検証
 * - エラーハンドリングの検証
 * - バリデーションの統合テスト
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { WorkoutService } from '../../service/WorkoutService.js';
import { WorkoutEntry } from '../../domain/WorkoutEntry.js';

// モックリポジトリ
class MockRepository {
  constructor() {
    this.data = [];
  }

  findAll() {
    return [...this.data];
  }

  saveAll(entries) {
    this.data = [...entries];
  }

  transaction(callback) {
    this.data = callback([...this.data]);
  }

  clear() {
    this.data = [];
  }
}

describe('WorkoutService', () => {
  let service;
  let mockRepository;

  beforeEach(() => {
    mockRepository = new MockRepository();
    service = new WorkoutService(mockRepository);
  });

  describe('constructor', () => {
    it('リポジトリを受け取って初期化できる', () => {
      expect(service.repository).toBe(mockRepository);
    });
  });

  describe('getAllEntries', () => {
    it('エントリが存在しない場合は空配列を返す', () => {
      const entries = service.getAllEntries();

      expect(entries).toEqual([]);
      expect(Array.isArray(entries)).toBe(true);
    });

    it('全てのエントリを取得できる', () => {
      mockRepository.data = [
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
      ];

      const entries = service.getAllEntries();

      expect(entries).toHaveLength(2);
      // createdAtの新しい順でソートされるため、id-2が先
      expect(entries[0].id).toBe('id-2');
      expect(entries[1].id).toBe('id-1');
    });

    it('createdAtの新しい順でソートされる', () => {
      mockRepository.data = [
        new WorkoutEntry({
          id: 'id-1',
          date: '2025-01-15',
          type: 'ランニング',
          minutes: 30,
          value: 5,
          note: '',
          createdAt: 1705305600000, // 古い
        }),
        new WorkoutEntry({
          id: 'id-2',
          date: '2025-01-16',
          type: 'ウォーキング',
          minutes: 45,
          value: 0,
          note: '',
          createdAt: 1705392000000, // 新しい
        }),
        new WorkoutEntry({
          id: 'id-3',
          date: '2025-01-14',
          type: '筋トレ',
          minutes: 20,
          value: 50,
          note: '',
          createdAt: 1705219200000, // 最も古い
        }),
      ];

      const entries = service.getAllEntries();

      expect(entries[0].id).toBe('id-2'); // 最新
      expect(entries[1].id).toBe('id-1');
      expect(entries[2].id).toBe('id-3'); // 最古
    });

    it('元の配列を変更しない（不変性）', () => {
      const originalEntry = new WorkoutEntry({
        id: 'id-1',
        date: '2025-01-15',
        type: 'ランニング',
        minutes: 30,
        value: 5,
        note: '',
        createdAt: 1705305600000,
      });

      mockRepository.data = [originalEntry];

      const entries = service.getAllEntries();
      entries.push(new WorkoutEntry({
        id: 'id-2',
        date: '2025-01-16',
        type: 'ウォーキング',
        minutes: 45,
        value: 0,
        note: '',
        createdAt: 1705392000000,
      }));

      // リポジトリのデータは変更されていない
      expect(mockRepository.data).toHaveLength(1);
    });

    it('リポジトリがエラーをスローした場合は伝播する', () => {
      mockRepository.findAll = vi.fn(() => {
        throw new Error('リポジトリエラー');
      });

      expect(() => {
        service.getAllEntries();
      }).toThrow('リポジトリエラー');
    });
  });

  describe('getEntriesByDate', () => {
    beforeEach(() => {
      mockRepository.data = [
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
          date: '2025-01-15',
          type: '筋トレ',
          minutes: 20,
          value: 50,
          note: '',
          createdAt: 1705309200000,
        }),
      ];
    });

    it('指定した日付のエントリのみを取得できる', () => {
      const entries = service.getEntriesByDate('2025-01-15');

      expect(entries).toHaveLength(2);
      expect(entries[0].date).toBe('2025-01-15');
      expect(entries[1].date).toBe('2025-01-15');
    });

    it('該当する日付がない場合は空配列を返す', () => {
      const entries = service.getEntriesByDate('2025-12-31');

      expect(entries).toEqual([]);
    });

    it('空文字列を渡すと全エントリを返す', () => {
      const entries = service.getEntriesByDate('');

      expect(entries).toHaveLength(3);
    });

    it('フィルタリング後もcreatedAtの新しい順でソートされる', () => {
      const entries = service.getEntriesByDate('2025-01-15');

      expect(entries[0].id).toBe('id-3'); // createdAt: 1705309200000
      expect(entries[1].id).toBe('id-1'); // createdAt: 1705305600000
    });

    it('元の配列を変更しない（不変性）', () => {
      const entries = service.getEntriesByDate('2025-01-15');
      entries.push(new WorkoutEntry({
        id: 'id-4',
        date: '2025-01-15',
        type: 'ヨガ',
        minutes: 30,
        value: 0,
        note: '',
        createdAt: Date.now(),
      }));

      // リポジトリのデータは変更されていない
      expect(mockRepository.data).toHaveLength(3);
    });

    it('日付の完全一致でフィルタリングする', () => {
      const entries = service.getEntriesByDate('2025-01');

      // 部分一致ではないので該当なし
      expect(entries).toEqual([]);
    });

    it('nullを渡すと全エントリを返す', () => {
      const entries = service.getEntriesByDate(null);

      expect(entries).toHaveLength(3);
    });

    it('undefinedを渡すと全エントリを返す', () => {
      const entries = service.getEntriesByDate(undefined);

      expect(entries).toHaveLength(3);
    });
  });

  describe('addEntry', () => {
    it('正常なフォームデータからエントリを追加できる', () => {
      const formData = {
        date: '2025-01-15',
        type: 'ランニング',
        minutes: '30',
        value: '5',
        note: 'テスト',
      };

      service.addEntry(formData);

      const entries = mockRepository.findAll();
      expect(entries).toHaveLength(1);
      expect(entries[0].date).toBe('2025-01-15');
      expect(entries[0].type).toBe('ランニング');
      expect(entries[0].minutes).toBe(30);
      expect(entries[0].value).toBe(5);
      expect(entries[0].note).toBe('テスト');
    });

    it('追加されたエントリにはIDが自動生成される', () => {
      const formData = {
        date: '2025-01-15',
        type: 'ランニング',
        minutes: '30',
        value: '5',
        note: '',
      };

      service.addEntry(formData);

      const entries = mockRepository.findAll();
      expect(entries[0].id).toBeDefined();
      expect(typeof entries[0].id).toBe('string');
      expect(entries[0].id.length).toBeGreaterThan(0);
    });

    it('追加されたエントリにはcreatedAtが自動設定される', () => {
      const formData = {
        date: '2025-01-15',
        type: 'ランニング',
        minutes: '30',
        value: '5',
        note: '',
      };

      const beforeTime = Date.now();
      service.addEntry(formData);
      const afterTime = Date.now();

      const entries = mockRepository.findAll();
      expect(entries[0].createdAt).toBeGreaterThanOrEqual(beforeTime);
      expect(entries[0].createdAt).toBeLessThanOrEqual(afterTime);
    });

    it('既存のエントリに追加される', () => {
      mockRepository.data = [
        new WorkoutEntry({
          id: 'existing-id',
          date: '2025-01-14',
          type: '既存エントリ',
          minutes: 20,
          value: 0,
          note: '',
          createdAt: Date.now(),
        }),
      ];

      const formData = {
        date: '2025-01-15',
        type: 'ランニング',
        minutes: '30',
        value: '5',
        note: '',
      };

      service.addEntry(formData);

      const entries = mockRepository.findAll();
      expect(entries).toHaveLength(2);
    });

    describe('バリデーションエラー', () => {
      it('種目が空の場合はエラーをスローする', () => {
        const formData = {
          date: '2025-01-15',
          type: '',
          minutes: '30',
          value: '5',
          note: '',
        };

        expect(() => {
          service.addEntry(formData);
        }).toThrow('種目は必須です');
      });

      it('日付が空の場合はエラーをスローする', () => {
        const formData = {
          date: '',
          type: 'ランニング',
          minutes: '30',
          value: '5',
          note: '',
        };

        expect(() => {
          service.addEntry(formData);
        }).toThrow('日付は必須です');
      });

      it('日付形式が不正な場合はエラーをスローする', () => {
        const formData = {
          date: '2025/01/15',
          type: 'ランニング',
          minutes: '30',
          value: '5',
          note: '',
        };

        expect(() => {
          service.addEntry(formData);
        }).toThrow('日付の形式が不正です');
      });

      it('複数のバリデーションエラーがある場合は全て含まれる', () => {
        const formData = {
          date: '',
          type: '',
          minutes: '30',
          value: '5',
          note: '',
        };

        expect(() => {
          service.addEntry(formData);
        }).toThrow(/種目は必須です.*日付は必須です/);
      });

      it('バリデーションエラーの場合はデータが保存されない', () => {
        const formData = {
          date: '',
          type: '',
          minutes: '30',
          value: '5',
          note: '',
        };

        try {
          service.addEntry(formData);
        } catch (error) {
          // エラーを無視
        }

        const entries = mockRepository.findAll();
        expect(entries).toHaveLength(0);
      });
    });

    describe('データ変換', () => {
      it('文字列の数値が正しく変換される', () => {
        const formData = {
          date: '2025-01-15',
          type: 'ランニング',
          minutes: '45',
          value: '10',
          note: '',
        };

        service.addEntry(formData);

        const entries = mockRepository.findAll();
        expect(entries[0].minutes).toBe(45);
        expect(entries[0].value).toBe(10);
        expect(typeof entries[0].minutes).toBe('number');
        expect(typeof entries[0].value).toBe('number');
      });

      it('空文字列の数値は0に変換される', () => {
        const formData = {
          date: '2025-01-15',
          type: 'ヨガ',
          minutes: '',
          value: '',
          note: '',
        };

        service.addEntry(formData);

        const entries = mockRepository.findAll();
        expect(entries[0].minutes).toBe(0);
        expect(entries[0].value).toBe(0);
      });

      it('メモの前後の空白がトリムされる', () => {
        const formData = {
          date: '2025-01-15',
          type: 'ランニング',
          minutes: '30',
          value: '5',
          note: '  朝ラン  ',
        };

        service.addEntry(formData);

        const entries = mockRepository.findAll();
        expect(entries[0].note).toBe('朝ラン');
      });
    });
  });

  describe('deleteEntry', () => {
    beforeEach(() => {
      mockRepository.data = [
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
    });

    it('指定したIDのエントリを削除できる', () => {
      service.deleteEntry('id-2');

      const entries = mockRepository.findAll();
      expect(entries).toHaveLength(2);
      expect(entries.find(e => e.id === 'id-2')).toBeUndefined();
    });

    it('削除後も他のエントリは保持される', () => {
      service.deleteEntry('id-2');

      const entries = mockRepository.findAll();
      expect(entries.find(e => e.id === 'id-1')).toBeDefined();
      expect(entries.find(e => e.id === 'id-3')).toBeDefined();
    });

    it('存在しないIDを指定しても エラーにならない', () => {
      expect(() => {
        service.deleteEntry('non-existent-id');
      }).not.toThrow();

      const entries = mockRepository.findAll();
      expect(entries).toHaveLength(3);
    });

    it('空文字列を指定しても何も削除されない', () => {
      service.deleteEntry('');

      const entries = mockRepository.findAll();
      expect(entries).toHaveLength(3);
    });

    it('nullを指定しても何も削除されない', () => {
      service.deleteEntry(null);

      const entries = mockRepository.findAll();
      expect(entries).toHaveLength(3);
    });

    it('undefinedを指定しても何も削除されない', () => {
      service.deleteEntry(undefined);

      const entries = mockRepository.findAll();
      expect(entries).toHaveLength(3);
    });

    it('最後のエントリを削除すると空配列になる', () => {
      mockRepository.data = [
        new WorkoutEntry({
          id: 'only-one',
          date: '2025-01-15',
          type: 'ランニング',
          minutes: 30,
          value: 5,
          note: '',
          createdAt: Date.now(),
        }),
      ];

      service.deleteEntry('only-one');

      const entries = mockRepository.findAll();
      expect(entries).toEqual([]);
    });

    it('複数回削除できる', () => {
      service.deleteEntry('id-1');
      service.deleteEntry('id-2');

      const entries = mockRepository.findAll();
      expect(entries).toHaveLength(1);
      expect(entries[0].id).toBe('id-3');
    });
  });

  describe('clearAllData', () => {
    it('全データを削除できる', () => {
      mockRepository.data = [
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

      service.clearAllData();

      const entries = mockRepository.findAll();
      expect(entries).toEqual([]);
    });

    it('データが存在しない場合でもエラーにならない', () => {
      expect(() => {
        service.clearAllData();
      }).not.toThrow();
    });

    it('クリア後にエントリを追加できる', () => {
      mockRepository.data = [
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

      service.clearAllData();

      const formData = {
        date: '2025-01-16',
        type: 'ウォーキング',
        minutes: '45',
        value: '0',
        note: '',
      };

      service.addEntry(formData);

      const entries = mockRepository.findAll();
      expect(entries).toHaveLength(1);
      expect(entries[0].type).toBe('ウォーキング');
    });
  });

  describe('統合シナリオ', () => {
    it('追加→取得→削除の一連の操作が正しく動作する', () => {
      // 追加
      service.addEntry({
        date: '2025-01-15',
        type: 'ランニング',
        minutes: '30',
        value: '5',
        note: 'テスト1',
      });

      service.addEntry({
        date: '2025-01-16',
        type: 'ウォーキング',
        minutes: '45',
        value: '0',
        note: 'テスト2',
      });

      // 取得
      let entries = service.getAllEntries();
      expect(entries).toHaveLength(2);

      // 削除
      const idToDelete = entries[0].id;
      service.deleteEntry(idToDelete);

      // 再取得
      entries = service.getAllEntries();
      expect(entries).toHaveLength(1);
    });

    it('フィルタリングと削除を組み合わせて使用できる', () => {
      service.addEntry({
        date: '2025-01-15',
        type: 'ランニング',
        minutes: '30',
        value: '5',
        note: '',
      });

      service.addEntry({
        date: '2025-01-15',
        type: 'ウォーキング',
        minutes: '45',
        value: '0',
        note: '',
      });

      service.addEntry({
        date: '2025-01-16',
        type: '筋トレ',
        minutes: '20',
        value: '50',
        note: '',
      });

      // 2025-01-15のエントリを取得
      let filtered = service.getEntriesByDate('2025-01-15');
      expect(filtered).toHaveLength(2);

      // 1つ削除
      service.deleteEntry(filtered[0].id);

      // 再度フィルタリング
      filtered = service.getEntriesByDate('2025-01-15');
      expect(filtered).toHaveLength(1);

      // 全体では2件
      const all = service.getAllEntries();
      expect(all).toHaveLength(2);
    });
  });

  describe('エラーハンドリング', () => {
    it('リポジトリの読み込みエラーを伝播する', () => {
      mockRepository.findAll = vi.fn(() => {
        throw new Error('読み込みエラー');
      });

      expect(() => {
        service.getAllEntries();
      }).toThrow('読み込みエラー');
    });

    it('リポジトリの保存エラーを伝播する', () => {
      mockRepository.transaction = vi.fn(() => {
        throw new Error('保存エラー');
      });

      const formData = {
        date: '2025-01-15',
        type: 'ランニング',
        minutes: '30',
        value: '5',
        note: '',
      };

      expect(() => {
        service.addEntry(formData);
      }).toThrow();
    });
  });
});
