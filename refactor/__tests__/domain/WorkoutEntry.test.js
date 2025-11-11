/**
 * WorkoutEntry ドメインモデルのテスト
 * 
 * テスト戦略:
 * - 境界値分析（Boundary Value Analysis）
 * - 等価分割（Equivalence Partitioning）
 * - エラーケースの網羅
 * - 不変条件（Invariants）の検証
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { WorkoutEntry } from '../../domain/WorkoutEntry.js';

describe('WorkoutEntry', () => {
  describe('constructor', () => {
    it('正常なデータで初期化できる', () => {
      const data = {
        id: 'test-id-123',
        date: '2025-01-15',
        type: 'ランニング',
        minutes: 30,
        value: 5,
        note: 'テストメモ',
        createdAt: 1705305600000,
      };

      const entry = new WorkoutEntry(data);

      expect(entry.id).toBe('test-id-123');
      expect(entry.date).toBe('2025-01-15');
      expect(entry.type).toBe('ランニング');
      expect(entry.minutes).toBe(30);
      expect(entry.value).toBe(5);
      expect(entry.note).toBe('テストメモ');
      expect(entry.createdAt).toBe(1705305600000);
    });

    it('オプショナルフィールドのデフォルト値が設定される', () => {
      const entry = new WorkoutEntry({
        id: 'test-id',
        date: '2025-01-15',
        type: 'ウォーキング',
        createdAt: Date.now(),
      });

      expect(entry.minutes).toBe(0);
      expect(entry.value).toBe(0);
      expect(entry.note).toBe('');
    });

    it('idが未指定の場合はエラーをスローする', () => {
      expect(() => {
        new WorkoutEntry({
          date: '2025-01-15',
          type: 'ランニング',
          createdAt: Date.now(),
        });
      }).toThrow('id and createdAt are required');
    });

    it('createdAtが未指定の場合はエラーをスローする', () => {
      expect(() => {
        new WorkoutEntry({
          id: 'test-id',
          date: '2025-01-15',
          type: 'ランニング',
        });
      }).toThrow('id and createdAt are required');
    });

    it('idとcreatedAtの両方が未指定の場合はエラーをスローする', () => {
      expect(() => {
        new WorkoutEntry({
          date: '2025-01-15',
          type: 'ランニング',
        });
      }).toThrow('id and createdAt are required');
    });
  });

  describe('toPlainObject', () => {
    it('全フィールドを含むプレーンオブジェクトに変換できる', () => {
      const data = {
        id: 'test-id-456',
        date: '2025-01-20',
        type: '筋トレ',
        minutes: 45,
        value: 100,
        note: 'ベンチプレス',
        createdAt: 1705737600000,
        version: 1,
      };

      const entry = new WorkoutEntry(data);
      const plain = entry.toPlainObject();

      expect(plain).toEqual(data);
      expect(plain).not.toBe(data); // 新しいオブジェクトであることを確認
    });

    it('デフォルト値を持つエントリも正しく変換できる', () => {
      const entry = new WorkoutEntry({
        id: 'test-id',
        date: '2025-01-15',
        type: 'ヨガ',
        createdAt: 1705305600000,
      });

      const plain = entry.toPlainObject();

      expect(plain).toEqual({
        id: 'test-id',
        date: '2025-01-15',
        type: 'ヨガ',
        minutes: 0,
        value: 0,
        note: '',
        createdAt: 1705305600000,
        version: 1,
      });
    });

    it('versionプロパティを含む', () => {
      const entry = new WorkoutEntry({
        id: 'test-id',
        date: '2025-01-15',
        type: 'ランニング',
        createdAt: Date.now(),
      });

      const plain = entry.toPlainObject();

      expect(plain.version).toBe(1);
      expect(plain).toHaveProperty('version');
    });
  });

  describe('fromJSON', () => {
    it('JSONデータからインスタンスを復元できる', () => {
      const json = {
        id: 'restored-id',
        date: '2025-02-01',
        type: 'サイクリング',
        minutes: 60,
        value: 20,
        note: '河川敷',
        createdAt: 1706745600000,
      };

      const entry = WorkoutEntry.fromJSON(json);

      expect(entry).toBeInstanceOf(WorkoutEntry);
      expect(entry.id).toBe('restored-id');
      expect(entry.date).toBe('2025-02-01');
      expect(entry.type).toBe('サイクリング');
      expect(entry.minutes).toBe(60);
      expect(entry.value).toBe(20);
      expect(entry.note).toBe('河川敷');
      expect(entry.createdAt).toBe(1706745600000);
    });

    it('toPlainObject → fromJSON のラウンドトリップが正しく動作する', () => {
      const original = new WorkoutEntry({
        id: 'round-trip-test',
        date: '2025-03-15',
        type: '水泳',
        minutes: 30,
        value: 1000,
        note: 'クロール',
        createdAt: 1710460800000,
      });

      const plain = original.toPlainObject();
      const restored = WorkoutEntry.fromJSON(plain);

      expect(restored.toPlainObject()).toEqual(original.toPlainObject());
    });

    it('versionプロパティを持つデータから復元できる', () => {
      const json = {
        id: 'test-id',
        date: '2025-01-15',
        type: 'ランニング',
        minutes: 30,
        value: 5,
        note: 'テスト',
        createdAt: Date.now(),
        version: 1,
      };

      const entry = WorkoutEntry.fromJSON(json);

      expect(entry.version).toBe(1);
      expect(entry).toBeInstanceOf(WorkoutEntry);
    });

    it('versionプロパティが無いデータも復元できる（後方互換性）', () => {
      const json = {
        id: 'test-id',
        date: '2025-01-15',
        type: 'ランニング',
        minutes: 30,
        value: 5,
        note: 'テスト',
        createdAt: Date.now(),
        // version プロパティなし
      };

      const entry = WorkoutEntry.fromJSON(json);

      expect(entry.version).toBe(1);
      expect(entry).toBeInstanceOf(WorkoutEntry);
    });

    it('versionがnullの場合もデフォルト値が設定される', () => {
      const json = {
        id: 'test-id',
        date: '2025-01-15',
        type: 'ランニング',
        minutes: 30,
        value: 5,
        note: 'テスト',
        createdAt: Date.now(),
        version: null,
      };

      const entry = WorkoutEntry.fromJSON(json);

      expect(entry.version).toBe(1);
    });
  });

  describe('validate', () => {
    describe('必須項目チェック', () => {
      it('全ての必須項目が入力されている場合はバリデーション成功', () => {
        const entry = new WorkoutEntry({
          id: 'valid-entry',
          date: '2025-01-15',
          type: 'ランニング',
          minutes: 30,
          value: 5,
          createdAt: Date.now(),
        });

        const result = entry.validate();

        expect(result.isValid).toBe(true);
        expect(result.errors).toHaveLength(0);
      });

      it('種目が空の場合はエラーを返す', () => {
        const entry = new WorkoutEntry({
          id: 'test-id',
          date: '2025-01-15',
          type: '',
          createdAt: Date.now(),
        });

        const result = entry.validate();

        expect(result.isValid).toBe(false);
        expect(result.errors).toContain('種目は必須です');
      });

      it('日付が空の場合はエラーを返す', () => {
        const entry = new WorkoutEntry({
          id: 'test-id',
          date: '',
          type: 'ランニング',
          createdAt: Date.now(),
        });

        const result = entry.validate();

        expect(result.isValid).toBe(false);
        expect(result.errors).toContain('日付は必須です');
      });

      it('種目と日付の両方が空の場合は両方のエラーを返す', () => {
        const entry = new WorkoutEntry({
          id: 'test-id',
          date: '',
          type: '',
          createdAt: Date.now(),
        });

        const result = entry.validate();

        expect(result.isValid).toBe(false);
        expect(result.errors).toHaveLength(2);
        expect(result.errors).toContain('種目は必須です');
        expect(result.errors).toContain('日付は必須です');
      });
    });

    describe('日付形式チェック', () => {
      const validDates = [
        '2025-01-01',
        '2025-12-31',
        '2000-01-01',
        '9999-12-31',
      ];

      validDates.forEach(date => {
        it(`正しい形式の日付 "${date}" はバリデーション成功`, () => {
          const entry = new WorkoutEntry({
            id: 'test-id',
            date,
            type: 'テスト',
            createdAt: Date.now(),
          });

          const result = entry.validate();

          expect(result.isValid).toBe(true);
          expect(result.errors).not.toContain('日付の形式が不正です（YYYY-MM-DD）');
        });
      });

      const invalidDates = [
        { date: '2025/01/15', desc: 'スラッシュ区切り' },
        { date: '2025-1-15', desc: '月がゼロパディングなし' },
        { date: '2025-01-5', desc: '日がゼロパディングなし' },
        { date: '25-01-15', desc: '年が2桁' },
        { date: '20250115', desc: 'ハイフンなし' },
        { date: 'invalid', desc: '完全に不正' },
        { date: '2025-01', desc: '日が欠落' },
        { date: '01-15', desc: '年が欠落' },
      ];

      invalidDates.forEach(({ date, desc }) => {
        it(`不正な形式の日付 "${date}" (${desc}) はエラーを返す`, () => {
          const entry = new WorkoutEntry({
            id: 'test-id',
            date,
            type: 'テスト',
            createdAt: Date.now(),
          });

          const result = entry.validate();

          expect(result.isValid).toBe(false);
          expect(result.errors).toContain('日付の形式が不正です（YYYY-MM-DD）');
        });
      });
    });

    describe('数値範囲チェック', () => {
      it('時間が負の値の場合はエラーを返す', () => {
        const entry = new WorkoutEntry({
          id: 'test-id',
          date: '2025-01-15',
          type: 'ランニング',
          minutes: -1,
          createdAt: Date.now(),
        });

        const result = entry.validate();

        expect(result.isValid).toBe(false);
        expect(result.errors).toContain('時間は0以上である必要があります');
      });

      it('回数/距離が負の値の場合はエラーを返す', () => {
        const entry = new WorkoutEntry({
          id: 'test-id',
          date: '2025-01-15',
          type: 'ランニング',
          value: -5,
          createdAt: Date.now(),
        });

        const result = entry.validate();

        expect(result.isValid).toBe(false);
        expect(result.errors).toContain('回数/距離は0以上である必要があります');
      });

      it('時間と回数/距離の両方が負の値の場合は両方のエラーを返す', () => {
        const entry = new WorkoutEntry({
          id: 'test-id',
          date: '2025-01-15',
          type: 'ランニング',
          minutes: -10,
          value: -5,
          createdAt: Date.now(),
        });

        const result = entry.validate();

        expect(result.isValid).toBe(false);
        expect(result.errors).toHaveLength(2);
        expect(result.errors).toContain('時間は0以上である必要があります');
        expect(result.errors).toContain('回数/距離は0以上である必要があります');
      });

      it('時間が0の場合はエラーにならない', () => {
        const entry = new WorkoutEntry({
          id: 'test-id',
          date: '2025-01-15',
          type: 'ランニング',
          minutes: 0,
          value: 5,
          createdAt: Date.now(),
        });

        const result = entry.validate();

        expect(result.errors).not.toContain('時間は0以上である必要があります');
      });

      it('回数/距離が0の場合はエラーにならない', () => {
        const entry = new WorkoutEntry({
          id: 'test-id',
          date: '2025-01-15',
          type: 'ランニング',
          minutes: 30,
          value: 0,
          createdAt: Date.now(),
        });

        const result = entry.validate();

        expect(result.errors).not.toContain('回数/距離は0以上である必要があります');
      });

      it('時間が大きな値でも正常に処理できる', () => {
        const entry = new WorkoutEntry({
          id: 'test-id',
          date: '2025-01-15',
          type: 'ウルトラマラソン',
          minutes: 600, // 10時間
          value: 100,
          createdAt: Date.now(),
        });

        const result = entry.validate();

        expect(result.isValid).toBe(true);
      });
    });

    describe('警告チェック', () => {
      it('時間と回数/距離の両方が0の場合は警告を返す', () => {
        const entry = new WorkoutEntry({
          id: 'test-id',
          date: '2025-01-15',
          type: 'ストレッチ',
          minutes: 0,
          value: 0,
          createdAt: Date.now(),
        });

        const result = entry.validate();

        expect(result.isValid).toBe(true); // エラーではない
        expect(result.warnings).toContain('時間または回数/距離のいずれかを入力することを推奨します');
      });

      it('時間のみ入力されている場合は警告なし', () => {
        const entry = new WorkoutEntry({
          id: 'test-id',
          date: '2025-01-15',
          type: 'ヨガ',
          minutes: 30,
          value: 0,
          createdAt: Date.now(),
        });

        const result = entry.validate();

        expect(result.isValid).toBe(true);
        expect(result.warnings).toHaveLength(0);
      });

      it('回数/距離のみ入力されている場合は警告なし', () => {
        const entry = new WorkoutEntry({
          id: 'test-id',
          date: '2025-01-15',
          type: '腕立て伏せ',
          minutes: 0,
          value: 50,
          createdAt: Date.now(),
        });

        const result = entry.validate();

        expect(result.isValid).toBe(true);
        expect(result.warnings).toHaveLength(0);
      });

      it('両方入力されている場合は警告なし', () => {
        const entry = new WorkoutEntry({
          id: 'test-id',
          date: '2025-01-15',
          type: 'ランニング',
          minutes: 30,
          value: 5,
          createdAt: Date.now(),
        });

        const result = entry.validate();

        expect(result.isValid).toBe(true);
        expect(result.warnings).toHaveLength(0);
      });
    });

    describe('複合エラーケース', () => {
      it('全てのバリデーションエラーが同時に発生する場合', () => {
        const entry = new WorkoutEntry({
          id: 'test-id',
          date: 'invalid-date',
          type: '',
          minutes: -10,
          value: -5,
          createdAt: Date.now(),
        });

        const result = entry.validate();

        expect(result.isValid).toBe(false);
        expect(result.errors).toHaveLength(4);
        expect(result.errors).toContain('種目は必須です');
        expect(result.errors).toContain('日付の形式が不正です（YYYY-MM-DD）');
        expect(result.errors).toContain('時間は0以上である必要があります');
        expect(result.errors).toContain('回数/距離は0以上である必要があります');
      });
    });
  });

  describe('不変性（Immutability）', () => {
    it('toPlainObjectで返されたオブジェクトを変更しても元のエントリに影響しない', () => {
      const entry = new WorkoutEntry({
        id: 'immutable-test',
        date: '2025-01-15',
        type: 'ランニング',
        minutes: 30,
        value: 5,
        note: 'オリジナル',
        createdAt: Date.now(),
      });

      const plain = entry.toPlainObject();
      plain.note = '変更後';

      expect(entry.note).toBe('オリジナル');
    });
  });

  describe('version管理', () => {
    it('新規作成時にCURRENT_VERSIONが設定される', () => {
      const entry = new WorkoutEntry({
        id: 'test-id',
        date: '2025-01-15',
        type: 'ランニング',
        createdAt: Date.now(),
      });

      expect(entry.version).toBe(WorkoutEntry.CURRENT_VERSION);
      expect(entry.version).toBe(1);
    });

    it('明示的にversionを指定できる', () => {
      const entry = new WorkoutEntry({
        id: 'test-id',
        date: '2025-01-15',
        type: 'ランニング',
        createdAt: Date.now(),
        version: 2,
      });

      expect(entry.version).toBe(2);
    });

    it('versionが未指定の場合はCURRENT_VERSIONが使用される', () => {
      const entry = new WorkoutEntry({
        id: 'test-id',
        date: '2025-01-15',
        type: 'ランニング',
        createdAt: Date.now(),
        version: undefined,
      });

      expect(entry.version).toBe(WorkoutEntry.CURRENT_VERSION);
    });

    it('versionがnullの場合はCURRENT_VERSIONが使用される', () => {
      const entry = new WorkoutEntry({
        id: 'test-id',
        date: '2025-01-15',
        type: 'ランニング',
        createdAt: Date.now(),
        version: null,
      });

      expect(entry.version).toBe(WorkoutEntry.CURRENT_VERSION);
    });
  });
});
