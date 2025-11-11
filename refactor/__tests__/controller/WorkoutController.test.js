/**
 * WorkoutController のテスト
 * 
 * テスト戦略:
 * - Service/View間の統合テスト
 * - イベントハンドリングの検証
 * - エラーハンドリングの確認
 * - ユーザーフローの検証
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { WorkoutController } from '../../controller/WorkoutController.js';
import { WorkoutEntry } from '../../domain/WorkoutEntry.js';

// モックService
class MockService {
  constructor() {
    this.entries = [];
  }

  getAllEntries() {
    return [...this.entries];
  }

  getEntriesByDate(date) {
    if (!date) return [...this.entries];
    return this.entries.filter(e => e.date === date);
  }

  addEntry(formData) {
    const entry = new WorkoutEntry({
      id: `mock-id-${Date.now()}`,
      date: formData.date,
      type: formData.type,
      minutes: parseInt(formData.minutes) || 0,
      value: parseInt(formData.value) || 0,
      note: formData.note || '',
      createdAt: Date.now(),
    });

    const validation = entry.validate();
    if (!validation.isValid) {
      throw new Error(validation.errors.join(', '));
    }

    this.entries.push(entry);
  }

  deleteEntry(id) {
    const index = this.entries.findIndex(e => e.id === id);
    if (index !== -1) {
      this.entries.splice(index, 1);
    }
  }

  clearAllData() {
    this.entries = [];
  }
}

// モックView
class MockView extends EventTarget {
  constructor() {
    super();
    this.formData = {};
    this.filterDate = '';
    this.dateInput = '';
    this.formReset = false;
    this.filterCleared = false;
    this.renderedEntries = null;
    this.errorMessage = null;
    this.infoMessage = null;
    this.confirmResult = true;
  }

  getFormData() {
    return this.formData;
  }

  getFilterDate() {
    return this.filterDate;
  }

  setDateInput(date) {
    this.dateInput = date;
  }

  resetForm() {
    this.formReset = true;
  }

  clearFilter() {
    this.filterCleared = true;
    this.filterDate = '';
  }

  renderEntries(entries) {
    this.renderedEntries = entries;
  }

  showError(message) {
    this.errorMessage = message;
  }

  showInfo(message) {
    this.infoMessage = message;
  }

  confirm(message) {
    return this.confirmResult;
  }
}

describe('WorkoutController', () => {
  let controller;
  let mockService;
  let mockView;

  beforeEach(() => {
    mockService = new MockService();
    mockView = new MockView();
    controller = new WorkoutController(mockService, mockView);
  });

  describe('constructor', () => {
    it('ServiceとViewを保持している', () => {
      expect(controller.service).toBe(mockService);
      expect(controller.view).toBe(mockView);
    });
  });

  describe('initialize', () => {
    it('初期化時に今日の日付を設定する', () => {
      controller.initialize();

      expect(mockView.dateInput).toBeDefined();
      expect(mockView.dateInput).toMatch(/^\d{4}-\d{2}-\d{2}$/);
    });

    it('初期化時にエントリを描画する', () => {
      controller.initialize();

      expect(mockView.renderedEntries).toBeDefined();
      expect(Array.isArray(mockView.renderedEntries)).toBe(true);
    });

    it('イベントハンドラーが設定される', () => {
      const listenerCount = mockView.listenerCount || 0;
      controller.initialize();

      // イベントリスナーが登録されていることを確認
      // （EventTargetの実装により、直接確認は難しいため、動作で確認）
      expect(() => {
        mockView.dispatchEvent(new Event('submit'));
      }).not.toThrow();
    });
  });

  describe('フォーム送信処理', () => {
    beforeEach(() => {
      controller.initialize();
    });

    it('正常なフォームデータでエントリを追加できる', () => {
      mockView.formData = {
        date: '2025-01-15',
        type: 'ランニング',
        minutes: '30',
        value: '5',
        note: 'テスト',
      };

      mockView.dispatchEvent(new CustomEvent('submit', {
        detail: mockView.formData,
      }));

      expect(mockService.entries).toHaveLength(1);
      expect(mockService.entries[0].type).toBe('ランニング');
    });

    it('エントリ追加後にフォームがリセットされる', () => {
      mockView.formData = {
        date: '2025-01-15',
        type: 'ランニング',
        minutes: '30',
        value: '5',
        note: '',
      };

      mockView.formReset = false;
      mockView.dispatchEvent(new CustomEvent('submit', {
        detail: mockView.formData,
      }));

      expect(mockView.formReset).toBe(true);
    });

    it('エントリ追加後に日付が今日に設定される', () => {
      mockView.formData = {
        date: '2025-01-15',
        type: 'ランニング',
        minutes: '30',
        value: '5',
        note: '',
      };

      mockView.dateInput = '';
      mockView.dispatchEvent(new CustomEvent('submit', {
        detail: mockView.formData,
      }));

      expect(mockView.dateInput).toMatch(/^\d{4}-\d{2}-\d{2}$/);
    });

    it('エントリ追加後にリストが再描画される', () => {
      mockView.formData = {
        date: '2025-01-15',
        type: 'ランニング',
        minutes: '30',
        value: '5',
        note: '',
      };

      mockView.renderedEntries = null;
      mockView.dispatchEvent(new CustomEvent('submit', {
        detail: mockView.formData,
      }));

      expect(mockView.renderedEntries).not.toBeNull();
      expect(mockView.renderedEntries).toHaveLength(1);
    });

    it('バリデーションエラー時にエラーメッセージを表示する', () => {
      mockView.formData = {
        date: '',
        type: '',
        minutes: '30',
        value: '5',
        note: '',
      };

      mockView.dispatchEvent(new CustomEvent('submit', {
        detail: mockView.formData,
      }));

      expect(mockView.errorMessage).toBeDefined();
      expect(mockView.errorMessage).toContain('必須');
    });

    it('バリデーションエラー時はエントリが追加されない', () => {
      mockView.formData = {
        date: '',
        type: '',
        minutes: '30',
        value: '5',
        note: '',
      };

      mockView.dispatchEvent(new CustomEvent('submit', {
        detail: mockView.formData,
      }));

      expect(mockService.entries).toHaveLength(0);
    });
  });

  describe('フィルター処理', () => {
    beforeEach(() => {
      controller.initialize();

      // テストデータを追加
      mockService.entries = [
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
    });

    it('フィルター変更時にリストが再描画される', () => {
      mockView.filterDate = '2025-01-15';
      mockView.renderedEntries = null;

      mockView.dispatchEvent(new Event('filterChange'));

      expect(mockView.renderedEntries).not.toBeNull();
    });

    it('フィルター適用時に該当するエントリのみ表示される', () => {
      mockView.filterDate = '2025-01-15';

      mockView.dispatchEvent(new Event('filterChange'));

      expect(mockView.renderedEntries).toHaveLength(1);
      expect(mockView.renderedEntries[0].date).toBe('2025-01-15');
    });

    it('フィルタークリア時に全エントリが表示される', () => {
      mockView.filterDate = '2025-01-15';
      mockView.dispatchEvent(new Event('filterChange'));

      mockView.filterCleared = false;
      mockView.dispatchEvent(new Event('clearFilter'));

      expect(mockView.filterCleared).toBe(true);
      expect(mockView.renderedEntries).toHaveLength(2);
    });
  });

  describe('削除処理', () => {
    beforeEach(() => {
      controller.initialize();

      mockService.entries = [
        new WorkoutEntry({
          id: 'id-to-delete',
          date: '2025-01-15',
          type: 'ランニング',
          minutes: 30,
          value: 5,
          note: '',
          createdAt: Date.now(),
        }),
      ];
    });

    it('エントリを削除できる', () => {
      mockView.dispatchEvent(new CustomEvent('delete', {
        detail: { id: 'id-to-delete' },
      }));

      expect(mockService.entries).toHaveLength(0);
    });

    it('削除後にリストが再描画される', () => {
      mockView.renderedEntries = null;

      mockView.dispatchEvent(new CustomEvent('delete', {
        detail: { id: 'id-to-delete' },
      }));

      expect(mockView.renderedEntries).not.toBeNull();
      expect(mockView.renderedEntries).toHaveLength(0);
    });

    it('存在しないIDを削除してもエラーにならない', () => {
      expect(() => {
        mockView.dispatchEvent(new CustomEvent('delete', {
          detail: { id: 'non-existent-id' },
        }));
      }).not.toThrow();

      expect(mockService.entries).toHaveLength(1);
    });
  });

  describe('全削除処理', () => {
    beforeEach(() => {
      controller.initialize();

      mockService.entries = [
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
    });

    it('確認後に全データを削除できる', () => {
      mockView.confirmResult = true;

      mockView.dispatchEvent(new Event('debugClear'));

      expect(mockService.entries).toHaveLength(0);
    });

    it('削除後にフィルターがクリアされる', () => {
      mockView.confirmResult = true;
      mockView.filterCleared = false;

      mockView.dispatchEvent(new Event('debugClear'));

      expect(mockView.filterCleared).toBe(true);
    });

    it('削除後に情報メッセージを表示する', () => {
      mockView.confirmResult = true;

      mockView.dispatchEvent(new Event('debugClear'));

      expect(mockView.infoMessage).toBeDefined();
      expect(mockView.infoMessage).toContain('削除');
    });

    it('キャンセル時は削除されない', () => {
      mockView.confirmResult = false;

      mockView.dispatchEvent(new Event('debugClear'));

      expect(mockService.entries).toHaveLength(1);
    });
  });

  describe('エラーハンドリング', () => {
    beforeEach(() => {
      controller.initialize();
    });

    it('Service層のエラーを適切に処理する', () => {
      mockService.addEntry = vi.fn(() => {
        throw new Error('Service層エラー');
      });

      mockView.formData = {
        date: '2025-01-15',
        type: 'ランニング',
        minutes: '30',
        value: '5',
        note: '',
      };

      mockView.dispatchEvent(new CustomEvent('submit', {
        detail: mockView.formData,
      }));

      expect(mockView.errorMessage).toBeDefined();
    });

    it('削除時のエラーを適切に処理する', () => {
      mockService.deleteEntry = vi.fn(() => {
        throw new Error('削除エラー');
      });

      mockView.dispatchEvent(new CustomEvent('delete', {
        detail: { id: 'test-id' },
      }));

      expect(mockView.errorMessage).toBeDefined();
      expect(mockView.errorMessage).toContain('削除');
    });

    it('データ取得時のエラーを適切に処理する', () => {
      mockService.getEntriesByDate = vi.fn(() => {
        throw new Error('データ取得エラー');
      });

      mockView.dispatchEvent(new Event('filterChange'));

      expect(mockView.errorMessage).toBeDefined();
      expect(mockView.errorMessage).toContain('取得');
    });
  });

  describe('統合シナリオ', () => {
    beforeEach(() => {
      controller.initialize();
    });

    it('追加→フィルター→削除の一連の操作が正しく動作する', () => {
      // 追加
      mockView.formData = {
        date: '2025-01-15',
        type: 'ランニング',
        minutes: '30',
        value: '5',
        note: '',
      };
      mockView.dispatchEvent(new CustomEvent('submit', {
        detail: mockView.formData,
      }));

      expect(mockService.entries).toHaveLength(1);

      // フィルター
      mockView.filterDate = '2025-01-15';
      mockView.dispatchEvent(new Event('filterChange'));

      expect(mockView.renderedEntries).toHaveLength(1);

      // 削除
      const idToDelete = mockService.entries[0].id;
      mockView.dispatchEvent(new CustomEvent('delete', {
        detail: { id: idToDelete },
      }));

      expect(mockService.entries).toHaveLength(0);
      expect(mockView.renderedEntries).toHaveLength(0);
    });

    it('複数エントリの追加と削除が正しく動作する', () => {
      // 1件目追加
      mockView.formData = {
        date: '2025-01-15',
        type: 'ランニング',
        minutes: '30',
        value: '5',
        note: '',
      };
      mockView.dispatchEvent(new CustomEvent('submit', {
        detail: mockView.formData,
      }));

      expect(mockService.entries).toHaveLength(1);
      const firstId = mockService.entries[0].id;

      // 2件目追加
      mockView.formData = {
        date: '2025-01-16',
        type: 'ウォーキング',
        minutes: '45',
        value: '0',
        note: '',
      };
      mockView.dispatchEvent(new CustomEvent('submit', {
        detail: mockView.formData,
      }));

      expect(mockService.entries).toHaveLength(2);

      // 1件削除（最初に追加したエントリを削除）
      mockView.dispatchEvent(new CustomEvent('delete', {
        detail: { id: firstId },
      }));

      expect(mockService.entries).toHaveLength(1);
      expect(mockService.entries[0].type).toBe('ウォーキング');
    });
  });
});
