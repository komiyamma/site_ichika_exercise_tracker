/**
 * DateFormatter のテスト
 * 
 * テスト戦略:
 * - ISO 8601形式の正確性検証
 * - タイムゾーン処理の確認
 * - 境界値テスト（月末、年末など）
 * - ゼロパディングの検証
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { DateFormatter } from '../../domain/DateFormatter.js';

describe('DateFormatter', () => {
  describe('toISO8601Date', () => {
    it('Dateオブジェクトを YYYY-MM-DD 形式に変換できる', () => {
      const date = new Date('2025-01-15T10:30:00');
      const result = DateFormatter.toISO8601Date(date);

      expect(result).toBe('2025-01-15');
    });

    it('月が1桁の場合はゼロパディングされる', () => {
      const date = new Date('2025-01-05T10:30:00');
      const result = DateFormatter.toISO8601Date(date);

      expect(result).toBe('2025-01-05');
    });

    it('日が1桁の場合はゼロパディングされる', () => {
      const date = new Date('2025-03-07T10:30:00');
      const result = DateFormatter.toISO8601Date(date);

      expect(result).toBe('2025-03-07');
    });

    it('月と日の両方が1桁の場合はゼロパディングされる', () => {
      const date = new Date('2025-02-03T10:30:00');
      const result = DateFormatter.toISO8601Date(date);

      expect(result).toBe('2025-02-03');
    });

    it('年始（1月1日）を正しく処理できる', () => {
      const date = new Date('2025-01-01T00:00:00');
      const result = DateFormatter.toISO8601Date(date);

      expect(result).toBe('2025-01-01');
    });

    it('年末（12月31日）を正しく処理できる', () => {
      const date = new Date('2025-12-31T23:59:59');
      const result = DateFormatter.toISO8601Date(date);

      expect(result).toBe('2025-12-31');
    });

    it('うるう年の2月29日を正しく処理できる', () => {
      const date = new Date('2024-02-29T12:00:00');
      const result = DateFormatter.toISO8601Date(date);

      expect(result).toBe('2024-02-29');
    });

    it('月末の日付を正しく処理できる', () => {
      const testCases = [
        { date: new Date('2025-01-31T12:00:00'), expected: '2025-01-31' },
        { date: new Date('2025-02-28T12:00:00'), expected: '2025-02-28' },
        { date: new Date('2025-03-31T12:00:00'), expected: '2025-03-31' },
        { date: new Date('2025-04-30T12:00:00'), expected: '2025-04-30' },
        { date: new Date('2025-05-31T12:00:00'), expected: '2025-05-31' },
        { date: new Date('2025-06-30T12:00:00'), expected: '2025-06-30' },
        { date: new Date('2025-07-31T12:00:00'), expected: '2025-07-31' },
        { date: new Date('2025-08-31T12:00:00'), expected: '2025-08-31' },
        { date: new Date('2025-09-30T12:00:00'), expected: '2025-09-30' },
        { date: new Date('2025-10-31T12:00:00'), expected: '2025-10-31' },
        { date: new Date('2025-11-30T12:00:00'), expected: '2025-11-30' },
        { date: new Date('2025-12-31T12:00:00'), expected: '2025-12-31' },
      ];

      testCases.forEach(({ date, expected }) => {
        expect(DateFormatter.toISO8601Date(date)).toBe(expected);
      });
    });

    it('時刻情報は無視される', () => {
      const date1 = new Date('2025-01-15T00:00:00');
      const date2 = new Date('2025-01-15T12:30:45');
      const date3 = new Date('2025-01-15T23:59:59');

      expect(DateFormatter.toISO8601Date(date1)).toBe('2025-01-15');
      expect(DateFormatter.toISO8601Date(date2)).toBe('2025-01-15');
      expect(DateFormatter.toISO8601Date(date3)).toBe('2025-01-15');
    });

    it('引数なしの場合は現在日時を使用する', () => {
      const mockDate = new Date('2025-03-20T15:45:30');
      vi.setSystemTime(mockDate);

      const result = DateFormatter.toISO8601Date();

      expect(result).toBe('2025-03-20');

      vi.useRealTimers();
    });

    it('過去の日付も正しく処理できる', () => {
      const date = new Date('2000-01-01T00:00:00');
      const result = DateFormatter.toISO8601Date(date);

      expect(result).toBe('2000-01-01');
    });

    it('未来の日付も正しく処理できる', () => {
      const date = new Date('2099-12-31T23:59:59');
      const result = DateFormatter.toISO8601Date(date);

      expect(result).toBe('2099-12-31');
    });

    it('4桁年を正しく処理できる', () => {
      const date = new Date('9999-12-31T12:00:00');
      const result = DateFormatter.toISO8601Date(date);

      expect(result).toBe('9999-12-31');
    });

    it('結果は常に10文字である', () => {
      const dates = [
        new Date('2025-01-01'),
        new Date('2025-12-31'),
        new Date('2000-06-15'),
        new Date('2099-09-09'),
      ];

      dates.forEach(date => {
        const result = DateFormatter.toISO8601Date(date);
        expect(result.length).toBe(10);
      });
    });

    it('結果は常にハイフン2つを含む', () => {
      const date = new Date('2025-01-15');
      const result = DateFormatter.toISO8601Date(date);

      const hyphens = result.split('').filter(char => char === '-');
      expect(hyphens.length).toBe(2);
    });

    it('結果のハイフン位置が正しい（YYYY-MM-DD）', () => {
      const date = new Date('2025-01-15');
      const result = DateFormatter.toISO8601Date(date);

      expect(result[4]).toBe('-');
      expect(result[7]).toBe('-');
    });
  });

  describe('today', () => {
    it('今日の日付を YYYY-MM-DD 形式で返す', () => {
      const mockDate = new Date('2025-01-15T10:30:00');
      vi.setSystemTime(mockDate);

      const result = DateFormatter.today();

      expect(result).toBe('2025-01-15');

      vi.useRealTimers();
    });

    it('日付が変わると異なる値を返す', () => {
      const date1 = new Date('2025-01-15T23:59:59');
      vi.setSystemTime(date1);
      const result1 = DateFormatter.today();

      const date2 = new Date('2025-01-16T00:00:00');
      vi.setSystemTime(date2);
      const result2 = DateFormatter.today();

      expect(result1).toBe('2025-01-15');
      expect(result2).toBe('2025-01-16');

      vi.useRealTimers();
    });

    it('時刻が異なっても同じ日なら同じ値を返す', () => {
      const date1 = new Date('2025-01-15T00:00:00');
      vi.setSystemTime(date1);
      const result1 = DateFormatter.today();

      const date2 = new Date('2025-01-15T23:59:59');
      vi.setSystemTime(date2);
      const result2 = DateFormatter.today();

      expect(result1).toBe(result2);

      vi.useRealTimers();
    });

    it('月初を正しく処理できる', () => {
      const mockDate = new Date('2025-03-01T12:00:00');
      vi.setSystemTime(mockDate);

      const result = DateFormatter.today();

      expect(result).toBe('2025-03-01');

      vi.useRealTimers();
    });

    it('月末を正しく処理できる', () => {
      const mockDate = new Date('2025-03-31T12:00:00');
      vi.setSystemTime(mockDate);

      const result = DateFormatter.today();

      expect(result).toBe('2025-03-31');

      vi.useRealTimers();
    });

    it('年始を正しく処理できる', () => {
      const mockDate = new Date('2025-01-01T00:00:00');
      vi.setSystemTime(mockDate);

      const result = DateFormatter.today();

      expect(result).toBe('2025-01-01');

      vi.useRealTimers();
    });

    it('年末を正しく処理できる', () => {
      const mockDate = new Date('2025-12-31T23:59:59');
      vi.setSystemTime(mockDate);

      const result = DateFormatter.today();

      expect(result).toBe('2025-12-31');

      vi.useRealTimers();
    });

    it('うるう年の2月29日を正しく処理できる', () => {
      const mockDate = new Date('2024-02-29T12:00:00');
      vi.setSystemTime(mockDate);

      const result = DateFormatter.today();

      expect(result).toBe('2024-02-29');

      vi.useRealTimers();
    });

    it('結果は常に10文字である', () => {
      const mockDate = new Date('2025-01-15T12:00:00');
      vi.setSystemTime(mockDate);

      const result = DateFormatter.today();

      expect(result.length).toBe(10);

      vi.useRealTimers();
    });

    it('toISO8601Date()と同じ結果を返す', () => {
      const mockDate = new Date('2025-01-15T12:00:00');
      vi.setSystemTime(mockDate);

      const todayResult = DateFormatter.today();
      const isoResult = DateFormatter.toISO8601Date();

      expect(todayResult).toBe(isoResult);

      vi.useRealTimers();
    });
  });

  describe('エッジケース', () => {
    it('Invalid Dateを渡した場合の動作', () => {
      const invalidDate = new Date('invalid');
      const result = DateFormatter.toISO8601Date(invalidDate);

      // NaNが含まれる文字列になる
      expect(result).toContain('NaN');
    });

    it('非常に古い日付も処理できる', () => {
      const oldDate = new Date('1900-01-01T00:00:00');
      const result = DateFormatter.toISO8601Date(oldDate);

      expect(result).toBe('1900-01-01');
    });

    it('タイムゾーンに関係なく正しい日付を返す', () => {
      // ローカルタイムゾーンで作成
      const date = new Date(2025, 0, 15); // 月は0始まり
      const result = DateFormatter.toISO8601Date(date);

      expect(result).toBe('2025-01-15');
    });
  });
});
