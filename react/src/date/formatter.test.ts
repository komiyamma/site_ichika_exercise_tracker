import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { getTodayString } from './formatter';

describe('getTodayString', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2024-11-15T10:00:00Z'));
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('今日の日付をYYYY-MM-DD形式で返す', () => {
    const result = getTodayString();
    expect(result).toBe('2024-11-15');
  });

  it('月が1桁の場合は0埋めされる', () => {
    vi.setSystemTime(new Date('2024-01-05T10:00:00Z'));
    const result = getTodayString();
    expect(result).toBe('2024-01-05');
  });

  it('日が1桁の場合は0埋めされる', () => {
    vi.setSystemTime(new Date('2024-12-01T10:00:00Z'));
    const result = getTodayString();
    expect(result).toBe('2024-12-01');
  });
});
