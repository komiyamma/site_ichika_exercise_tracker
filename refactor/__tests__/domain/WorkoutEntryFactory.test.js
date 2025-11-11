/**
 * WorkoutEntryFactory のテスト
 * 
 * テスト戦略:
 * - ファクトリーパターンの正確性検証
 * - データ変換ロジックの境界値テスト
 * - サニタイゼーション処理の検証
 * - エッジケースの網羅
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { WorkoutEntryFactory } from '../../domain/WorkoutEntryFactory.js';
import { WorkoutEntry } from '../../domain/WorkoutEntry.js';

describe('WorkoutEntryFactory', () => {
  describe('fromFormData', () => {
    let originalDateNow;
    const mockTimestamp = 1705305600000;

    beforeEach(() => {
      // Date.now()をモック
      originalDateNow = Date.now;
      Date.now = vi.fn(() => mockTimestamp);
    });

    afterEach(() => {
      // Date.now()を復元
      Date.now = originalDateNow;
    });

    it('正常なフォームデータからエントリを生成できる', () => {
      const formData = {
        date: '2025-01-15',
        type: 'ランニング',
        minutes: '30',
        value: '5',
        note: 'テストメモ',
      };

      const entry = WorkoutEntryFactory.fromFormData(formData);

      expect(entry).toBeInstanceOf(WorkoutEntry);
      expect(entry.date).toBe('2025-01-15');
      expect(entry.type).toBe('ランニング');
      expect(entry.minutes).toBe(30);
      expect(entry.value).toBe(5);
      expect(entry.note).toBe('テストメモ');
      expect(entry.createdAt).toBe(mockTimestamp);
    });

    it('IDが自動生成される', () => {
      const formData = {
        date: '2025-01-15',
        type: 'ランニング',
        minutes: '30',
        value: '5',
        note: '',
      };

      const entry = WorkoutEntryFactory.fromFormData(formData);

      expect(entry.id).toBeDefined();
      expect(typeof entry.id).toBe('string');
      expect(entry.id.length).toBeGreaterThan(0);
    });

    it('生成されるIDはUUID v4形式である', () => {
      const formData = {
        date: '2025-01-15',
        type: 'ランニング',
        minutes: '30',
        value: '5',
        note: '',
      };

      const entry = WorkoutEntryFactory.fromFormData(formData);

      // UUID v4の正規表現パターン
      const uuidV4Pattern = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
      expect(entry.id).toMatch(uuidV4Pattern);
    });

    it('複数回呼び出すと異なるIDが生成される', () => {
      const formData = {
        date: '2025-01-15',
        type: 'ランニング',
        minutes: '30',
        value: '5',
        note: '',
      };

      const entry1 = WorkoutEntryFactory.fromFormData(formData);
      const entry2 = WorkoutEntryFactory.fromFormData(formData);

      expect(entry1.id).not.toBe(entry2.id);
    });

    describe('数値パース処理', () => {
      it('文字列の数値を正しくパースする', () => {
        const formData = {
          date: '2025-01-15',
          type: 'ランニング',
          minutes: '45',
          value: '10',
          note: '',
        };

        const entry = WorkoutEntryFactory.fromFormData(formData);

        expect(entry.minutes).toBe(45);
        expect(entry.value).toBe(10);
        expect(typeof entry.minutes).toBe('number');
        expect(typeof entry.value).toBe('number');
      });

      it('空文字列は0に変換される', () => {
        const formData = {
          date: '2025-01-15',
          type: 'ヨガ',
          minutes: '',
          value: '',
          note: '',
        };

        const entry = WorkoutEntryFactory.fromFormData(formData);

        expect(entry.minutes).toBe(0);
        expect(entry.value).toBe(0);
      });

      it('nullは0に変換される', () => {
        const formData = {
          date: '2025-01-15',
          type: 'ヨガ',
          minutes: null,
          value: null,
          note: '',
        };

        const entry = WorkoutEntryFactory.fromFormData(formData);

        expect(entry.minutes).toBe(0);
        expect(entry.value).toBe(0);
      });

      it('undefinedは0に変換される', () => {
        const formData = {
          date: '2025-01-15',
          type: 'ヨガ',
          minutes: undefined,
          value: undefined,
          note: '',
        };

        const entry = WorkoutEntryFactory.fromFormData(formData);

        expect(entry.minutes).toBe(0);
        expect(entry.value).toBe(0);
      });

      it('数値型の値もそのまま処理できる', () => {
        const formData = {
          date: '2025-01-15',
          type: 'ランニング',
          minutes: 30,
          value: 5,
          note: '',
        };

        const entry = WorkoutEntryFactory.fromFormData(formData);

        expect(entry.minutes).toBe(30);
        expect(entry.value).toBe(5);
      });

      it('小数点を含む文字列は整数に変換される', () => {
        const formData = {
          date: '2025-01-15',
          type: 'ランニング',
          minutes: '30.7',
          value: '5.9',
          note: '',
        };

        const entry = WorkoutEntryFactory.fromFormData(formData);

        expect(entry.minutes).toBe(30);
        expect(entry.value).toBe(5);
      });

      it('負の数値は0に変換される', () => {
        const formData = {
          date: '2025-01-15',
          type: 'ランニング',
          minutes: '-10',
          value: '-5',
          note: '',
        };

        const entry = WorkoutEntryFactory.fromFormData(formData);

        expect(entry.minutes).toBe(0);
        expect(entry.value).toBe(0);
      });

      it('数値以外の文字列は0に変換される', () => {
        const formData = {
          date: '2025-01-15',
          type: 'ランニング',
          minutes: 'abc',
          value: 'xyz',
          note: '',
        };

        const entry = WorkoutEntryFactory.fromFormData(formData);

        expect(entry.minutes).toBe(0);
        expect(entry.value).toBe(0);
      });

      it('先頭に数値がある文字列は数値部分のみパースされる', () => {
        const formData = {
          date: '2025-01-15',
          type: 'ランニング',
          minutes: '30分',
          value: '5km',
          note: '',
        };

        const entry = WorkoutEntryFactory.fromFormData(formData);

        expect(entry.minutes).toBe(30);
        expect(entry.value).toBe(5);
      });

      it('0は正しく処理される', () => {
        const formData = {
          date: '2025-01-15',
          type: 'ストレッチ',
          minutes: '0',
          value: '0',
          note: '',
        };

        const entry = WorkoutEntryFactory.fromFormData(formData);

        expect(entry.minutes).toBe(0);
        expect(entry.value).toBe(0);
      });

      it('非常に大きな数値も正しく処理される', () => {
        const formData = {
          date: '2025-01-15',
          type: 'ウルトラマラソン',
          minutes: '999999',
          value: '999999',
          note: '',
        };

        const entry = WorkoutEntryFactory.fromFormData(formData);

        expect(entry.minutes).toBe(999999);
        expect(entry.value).toBe(999999);
      });
    });

    describe('メモのサニタイゼーション', () => {
      it('前後の空白がトリムされる', () => {
        const formData = {
          date: '2025-01-15',
          type: 'ランニング',
          minutes: '30',
          value: '5',
          note: '  朝ラン  ',
        };

        const entry = WorkoutEntryFactory.fromFormData(formData);

        expect(entry.note).toBe('朝ラン');
      });

      it('タブ文字もトリムされる', () => {
        const formData = {
          date: '2025-01-15',
          type: 'ランニング',
          minutes: '30',
          value: '5',
          note: '\t\t朝ラン\t\t',
        };

        const entry = WorkoutEntryFactory.fromFormData(formData);

        expect(entry.note).toBe('朝ラン');
      });

      it('改行文字もトリムされる', () => {
        const formData = {
          date: '2025-01-15',
          type: 'ランニング',
          minutes: '30',
          value: '5',
          note: '\n\n朝ラン\n\n',
        };

        const entry = WorkoutEntryFactory.fromFormData(formData);

        expect(entry.note).toBe('朝ラン');
      });

      it('空文字列は空文字列のまま', () => {
        const formData = {
          date: '2025-01-15',
          type: 'ランニング',
          minutes: '30',
          value: '5',
          note: '',
        };

        const entry = WorkoutEntryFactory.fromFormData(formData);

        expect(entry.note).toBe('');
      });

      it('空白のみの文字列は空文字列になる', () => {
        const formData = {
          date: '2025-01-15',
          type: 'ランニング',
          minutes: '30',
          value: '5',
          note: '   ',
        };

        const entry = WorkoutEntryFactory.fromFormData(formData);

        expect(entry.note).toBe('');
      });

      it('nullは空文字列に変換される', () => {
        const formData = {
          date: '2025-01-15',
          type: 'ランニング',
          minutes: '30',
          value: '5',
          note: null,
        };

        const entry = WorkoutEntryFactory.fromFormData(formData);

        expect(entry.note).toBe('');
      });

      it('undefinedは空文字列に変換される', () => {
        const formData = {
          date: '2025-01-15',
          type: 'ランニング',
          minutes: '30',
          value: '5',
          note: undefined,
        };

        const entry = WorkoutEntryFactory.fromFormData(formData);

        expect(entry.note).toBe('');
      });

      it('中間の空白は保持される', () => {
        const formData = {
          date: '2025-01-15',
          type: 'ランニング',
          minutes: '30',
          value: '5',
          note: '  朝  ラン  ',
        };

        const entry = WorkoutEntryFactory.fromFormData(formData);

        expect(entry.note).toBe('朝  ラン');
      });

      it('日本語の全角スペースも正しく処理される', () => {
        const formData = {
          date: '2025-01-15',
          type: 'ランニング',
          minutes: '30',
          value: '5',
          note: '　朝ラン　',
        };

        const entry = WorkoutEntryFactory.fromFormData(formData);

        // JavaScriptのtrim()は全角スペースもトリムする
        expect(entry.note).toBe('朝ラン');
      });

      it('長いメモも正しく処理される', () => {
        const longNote = 'これは非常に長いメモです。'.repeat(10);
        const formData = {
          date: '2025-01-15',
          type: 'ランニング',
          minutes: '30',
          value: '5',
          note: `  ${longNote}  `,
        };

        const entry = WorkoutEntryFactory.fromFormData(formData);

        expect(entry.note).toBe(longNote);
      });

      it('特殊文字を含むメモも正しく処理される', () => {
        const formData = {
          date: '2025-01-15',
          type: 'ランニング',
          minutes: '30',
          value: '5',
          note: '  <script>alert("test")</script>  ',
        };

        const entry = WorkoutEntryFactory.fromFormData(formData);

        expect(entry.note).toBe('<script>alert("test")</script>');
      });
    });

    describe('エッジケース', () => {
      it('全てのフィールドが空の場合も処理できる', () => {
        const formData = {
          date: '',
          type: '',
          minutes: '',
          value: '',
          note: '',
        };

        const entry = WorkoutEntryFactory.fromFormData(formData);

        expect(entry).toBeInstanceOf(WorkoutEntry);
        expect(entry.date).toBe('');
        expect(entry.type).toBe('');
        expect(entry.minutes).toBe(0);
        expect(entry.value).toBe(0);
        expect(entry.note).toBe('');
      });

      it('日本語の種目名も正しく処理される', () => {
        const formData = {
          date: '2025-01-15',
          type: 'ランニング',
          minutes: '30',
          value: '5',
          note: '朝ラン',
        };

        const entry = WorkoutEntryFactory.fromFormData(formData);

        expect(entry.type).toBe('ランニング');
        expect(entry.note).toBe('朝ラン');
      });

      it('絵文字を含むデータも正しく処理される', () => {
        const formData = {
          date: '2025-01-15',
          type: 'ランニング🏃',
          minutes: '30',
          value: '5',
          note: '朝ラン💪',
        };

        const entry = WorkoutEntryFactory.fromFormData(formData);

        expect(entry.type).toBe('ランニング🏃');
        expect(entry.note).toBe('朝ラン💪');
      });
    });

    describe('データ整合性', () => {
      it('生成されたエントリはバリデーション可能である', () => {
        const formData = {
          date: '2025-01-15',
          type: 'ランニング',
          minutes: '30',
          value: '5',
          note: 'テスト',
        };

        const entry = WorkoutEntryFactory.fromFormData(formData);
        const validation = entry.validate();

        // バリデーションメソッドが正常に動作することを確認
        expect(validation).toHaveProperty('isValid');
        expect(validation).toHaveProperty('errors');
        expect(validation).toHaveProperty('warnings');
      });

      it('生成されたエントリはtoPlainObject可能である', () => {
        const formData = {
          date: '2025-01-15',
          type: 'ランニング',
          minutes: '30',
          value: '5',
          note: 'テスト',
        };

        const entry = WorkoutEntryFactory.fromFormData(formData);
        const plain = entry.toPlainObject();

        expect(plain).toHaveProperty('id');
        expect(plain).toHaveProperty('date');
        expect(plain).toHaveProperty('type');
        expect(plain).toHaveProperty('minutes');
        expect(plain).toHaveProperty('value');
        expect(plain).toHaveProperty('note');
        expect(plain).toHaveProperty('createdAt');
      });
    });
  });
});
