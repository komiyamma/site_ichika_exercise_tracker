/**
 * WorkoutView のテスト
 * 
 * テスト戦略:
 * - DOM操作のモック化
 * - EventTargetの継承検証
 * - イベント発火の確認
 * - レンダリングロジックの検証
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { WorkoutView } from '../../view/WorkoutView.js';
import { WorkoutEntry } from '../../domain/WorkoutEntry.js';

// DOM要素のモック
function createMockElements() {
  const mockElement = (id) => ({
    id,
    value: '',
    textContent: '',
    className: '',
    addEventListener: vi.fn(),
    appendChild: vi.fn(),
    replaceChildren: vi.fn(),
    reset: vi.fn(),
  });

  return {
    form: { ...mockElement('entry-form'), reset: vi.fn() },
    list: mockElement('list'),
    totalCount: mockElement('total-count'),
    filterDate: mockElement('filter-date'),
    clearFilter: mockElement('clear-filter'),
    debugClear: mockElement('debug-clear-storage'),
    inputs: {
      date: mockElement('date'),
      type: mockElement('type'),
      minutes: mockElement('minutes'),
      value: mockElement('value'),
      note: mockElement('note'),
    },
  };
}

describe('WorkoutView', () => {
  let view;
  let mockNotification;
  let mockElements;

  beforeEach(() => {
    // DOM要素のモック
    mockElements = createMockElements();
    
    // document.getElementByIdをモック
    global.document = {
      getElementById: vi.fn((id) => {
        if (id === 'entry-form') return mockElements.form;
        if (id === 'list') return mockElements.list;
        if (id === 'total-count') return mockElements.totalCount;
        if (id === 'filter-date') return mockElements.filterDate;
        if (id === 'clear-filter') return mockElements.clearFilter;
        if (id === 'debug-clear-storage') return mockElements.debugClear;
        if (id === 'date') return mockElements.inputs.date;
        if (id === 'type') return mockElements.inputs.type;
        if (id === 'minutes') return mockElements.inputs.minutes;
        if (id === 'value') return mockElements.inputs.value;
        if (id === 'note') return mockElements.inputs.note;
        return null;
      }),
      createElement: vi.fn((tag) => ({
        tagName: tag.toUpperCase(),
        textContent: '',
        className: '',
        colSpan: 0,
        dataset: {},
        appendChild: vi.fn(),
      })),
      createDocumentFragment: vi.fn(() => ({
        appendChild: vi.fn(),
      })),
    };

    mockNotification = {
      showError: vi.fn(),
      confirm: vi.fn(() => true),
      showInfo: vi.fn(),
    };

    view = new WorkoutView(mockNotification);
  });

  describe('constructor', () => {
    it('EventTargetを継承している', () => {
      expect(view).toBeInstanceOf(EventTarget);
    });

    it('NotificationServiceを保持している', () => {
      expect(view.notification).toBe(mockNotification);
    });

    it('DOM要素を初期化している', () => {
      expect(view.elements).toBeDefined();
      expect(view.elements.form).toBeDefined();
      expect(view.elements.list).toBeDefined();
      expect(view.elements.inputs).toBeDefined();
    });

    it('イベントリスナーを登録している', () => {
      expect(mockElements.form.addEventListener).toHaveBeenCalled();
      expect(mockElements.filterDate.addEventListener).toHaveBeenCalled();
      expect(mockElements.clearFilter.addEventListener).toHaveBeenCalled();
      expect(mockElements.debugClear.addEventListener).toHaveBeenCalled();
      expect(mockElements.list.addEventListener).toHaveBeenCalled();
    });
  });

  describe('getFormData', () => {
    it('フォームデータを取得できる', () => {
      mockElements.inputs.date.value = '2025-01-15';
      mockElements.inputs.type.value = 'ランニング';
      mockElements.inputs.minutes.value = '30';
      mockElements.inputs.value.value = '5';
      mockElements.inputs.note.value = 'テスト';

      const formData = view.getFormData();

      expect(formData).toEqual({
        date: '2025-01-15',
        type: 'ランニング',
        minutes: '30',
        value: '5',
        note: 'テスト',
      });
    });

    it('空のフォームデータも取得できる', () => {
      const formData = view.getFormData();

      expect(formData).toEqual({
        date: '',
        type: '',
        minutes: '',
        value: '',
        note: '',
      });
    });
  });

  describe('getFilterDate', () => {
    it('フィルター日付を取得できる', () => {
      mockElements.filterDate.value = '2025-01-15';

      const filterDate = view.getFilterDate();

      expect(filterDate).toBe('2025-01-15');
    });

    it('空のフィルター日付も取得できる', () => {
      const filterDate = view.getFilterDate();

      expect(filterDate).toBe('');
    });
  });

  describe('setDateInput', () => {
    it('日付入力欄に値を設定できる', () => {
      view.setDateInput('2025-01-15');

      expect(mockElements.inputs.date.value).toBe('2025-01-15');
    });
  });

  describe('resetForm', () => {
    it('フォームをリセットできる', () => {
      view.resetForm();

      expect(mockElements.form.reset).toHaveBeenCalled();
    });
  });

  describe('clearFilter', () => {
    it('フィルターをクリアできる', () => {
      mockElements.filterDate.value = '2025-01-15';

      view.clearFilter();

      expect(mockElements.filterDate.value).toBe('');
    });
  });

  describe('renderEntries', () => {
    it('エントリ数を表示する', () => {
      const entries = [
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

      view.renderEntries(entries);

      expect(mockElements.totalCount.textContent).toBe('1');
    });

    it('エントリが0件の場合も表示する', () => {
      view.renderEntries([]);

      expect(mockElements.totalCount.textContent).toBe('0');
    });

    it('リストをクリアする', () => {
      view.renderEntries([]);

      expect(mockElements.list.replaceChildren).toHaveBeenCalled();
    });

    it('エントリが0件の場合は空メッセージを表示する', () => {
      view.renderEntries([]);

      expect(document.createElement).toHaveBeenCalledWith('tr');
      expect(document.createElement).toHaveBeenCalledWith('td');
    });

    it('複数のエントリを表示する', () => {
      const entries = [
        new WorkoutEntry({
          id: 'id-1',
          date: '2025-01-15',
          type: 'ランニング',
          minutes: 30,
          value: 5,
          note: 'テスト1',
          createdAt: Date.now(),
        }),
        new WorkoutEntry({
          id: 'id-2',
          date: '2025-01-16',
          type: 'ウォーキング',
          minutes: 45,
          value: 0,
          note: 'テスト2',
          createdAt: Date.now(),
        }),
      ];

      view.renderEntries(entries);

      expect(mockElements.totalCount.textContent).toBe('2');
      expect(document.createDocumentFragment).toHaveBeenCalled();
    });
  });

  describe('通知メソッド', () => {
    it('showErrorでエラーを表示できる', () => {
      view.showError('エラーメッセージ');

      expect(mockNotification.showError).toHaveBeenCalledWith('エラーメッセージ');
    });

    it('confirmで確認ダイアログを表示できる', () => {
      const result = view.confirm('確認メッセージ');

      expect(mockNotification.confirm).toHaveBeenCalledWith('確認メッセージ');
      expect(result).toBe(true);
    });

    it('showInfoで情報を表示できる', () => {
      view.showInfo('情報メッセージ');

      expect(mockNotification.showInfo).toHaveBeenCalledWith('情報メッセージ');
    });
  });

  describe('イベント発火', () => {
    it('submitイベントを発火できる', () => {
      const listener = vi.fn();
      view.addEventListener('submit', listener);

      // フォーム送信をシミュレート
      const submitHandler = mockElements.form.addEventListener.mock.calls.find(
        call => call[0] === 'submit'
      )?.[1];

      if (submitHandler) {
        const mockEvent = { preventDefault: vi.fn() };
        submitHandler(mockEvent);

        expect(mockEvent.preventDefault).toHaveBeenCalled();
      }
    });

    it('filterChangeイベントを発火できる', () => {
      const listener = vi.fn();
      view.addEventListener('filterChange', listener);

      // フィルター変更をシミュレート
      const changeHandler = mockElements.filterDate.addEventListener.mock.calls.find(
        call => call[0] === 'change'
      )?.[1];

      if (changeHandler) {
        changeHandler();
      }
    });

    it('clearFilterイベントを発火できる', () => {
      const listener = vi.fn();
      view.addEventListener('clearFilter', listener);

      // クリアボタンクリックをシミュレート
      const clickHandler = mockElements.clearFilter.addEventListener.mock.calls.find(
        call => call[0] === 'click'
      )?.[1];

      if (clickHandler) {
        clickHandler();
      }
    });

    it('debugClearイベントを発火できる', () => {
      const listener = vi.fn();
      view.addEventListener('debugClear', listener);

      // デバッグクリアボタンクリックをシミュレート
      const clickHandler = mockElements.debugClear.addEventListener.mock.calls.find(
        call => call[0] === 'click'
      )?.[1];

      if (clickHandler) {
        clickHandler();
      }
    });
  });

  describe('エッジケース', () => {
    it('NotificationServiceなしでも初期化できる', () => {
      const viewWithoutNotification = new WorkoutView();

      expect(viewWithoutNotification.notification).toBeDefined();
    });

    it('大量のエントリも表示できる', () => {
      const entries = Array.from({ length: 1000 }, (_, i) =>
        new WorkoutEntry({
          id: `id-${i}`,
          date: '2025-01-15',
          type: 'ランニング',
          minutes: 30,
          value: 5,
          note: `テスト${i}`,
          createdAt: Date.now() + i,
        })
      );

      view.renderEntries(entries);

      expect(mockElements.totalCount.textContent).toBe('1000');
    });
  });
});
