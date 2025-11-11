/**
 * NotificationService のテスト
 * 
 * テスト戦略:
 * - ブラウザAPIのモック化
 * - 通知表示の検証
 * - テスタビリティの確認
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { NotificationService } from '../../view/NotificationService.js';

describe('NotificationService', () => {
  let service;
  let originalAlert;
  let originalConfirm;

  beforeEach(() => {
    service = new NotificationService();
    
    // グローバル関数をモック化
    originalAlert = global.alert;
    originalConfirm = global.confirm;
    
    global.alert = vi.fn();
    global.confirm = vi.fn();
  });

  afterEach(() => {
    // グローバル関数を復元
    global.alert = originalAlert;
    global.confirm = originalConfirm;
  });

  describe('showError', () => {
    it('エラーメッセージを表示できる', () => {
      service.showError('エラーが発生しました');

      expect(global.alert).toHaveBeenCalledWith('エラーが発生しました');
      expect(global.alert).toHaveBeenCalledTimes(1);
    });

    it('空文字列でも表示できる', () => {
      service.showError('');

      expect(global.alert).toHaveBeenCalledWith('');
    });

    it('長いメッセージも表示できる', () => {
      const longMessage = 'これは非常に長いエラーメッセージです。'.repeat(10);
      service.showError(longMessage);

      expect(global.alert).toHaveBeenCalledWith(longMessage);
    });

    it('特殊文字を含むメッセージも表示できる', () => {
      service.showError('エラー: <script>alert("XSS")</script>');

      expect(global.alert).toHaveBeenCalledWith('エラー: <script>alert("XSS")</script>');
    });

    it('改行を含むメッセージも表示できる', () => {
      service.showError('エラー1\nエラー2\nエラー3');

      expect(global.alert).toHaveBeenCalledWith('エラー1\nエラー2\nエラー3');
    });

    it('数値を渡しても表示できる', () => {
      service.showError(404);

      expect(global.alert).toHaveBeenCalledWith(404);
    });

    it('nullを渡しても表示できる', () => {
      service.showError(null);

      expect(global.alert).toHaveBeenCalledWith(null);
    });

    it('undefinedを渡しても表示できる', () => {
      service.showError(undefined);

      expect(global.alert).toHaveBeenCalledWith(undefined);
    });

    it('複数回呼び出せる', () => {
      service.showError('エラー1');
      service.showError('エラー2');
      service.showError('エラー3');

      expect(global.alert).toHaveBeenCalledTimes(3);
      expect(global.alert).toHaveBeenNthCalledWith(1, 'エラー1');
      expect(global.alert).toHaveBeenNthCalledWith(2, 'エラー2');
      expect(global.alert).toHaveBeenNthCalledWith(3, 'エラー3');
    });
  });

  describe('confirm', () => {
    it('確認ダイアログを表示してtrueを返す', () => {
      global.confirm.mockReturnValue(true);

      const result = service.confirm('削除しますか？');

      expect(global.confirm).toHaveBeenCalledWith('削除しますか？');
      expect(result).toBe(true);
    });

    it('確認ダイアログを表示してfalseを返す', () => {
      global.confirm.mockReturnValue(false);

      const result = service.confirm('削除しますか？');

      expect(global.confirm).toHaveBeenCalledWith('削除しますか？');
      expect(result).toBe(false);
    });

    it('空文字列でも表示できる', () => {
      global.confirm.mockReturnValue(true);

      service.confirm('');

      expect(global.confirm).toHaveBeenCalledWith('');
    });

    it('長いメッセージも表示できる', () => {
      const longMessage = 'これは非常に長い確認メッセージです。'.repeat(10);
      global.confirm.mockReturnValue(true);

      service.confirm(longMessage);

      expect(global.confirm).toHaveBeenCalledWith(longMessage);
    });

    it('改行を含むメッセージも表示できる', () => {
      global.confirm.mockReturnValue(true);

      service.confirm('本当に削除しますか？\nこの操作は取り消せません。');

      expect(global.confirm).toHaveBeenCalledWith('本当に削除しますか？\nこの操作は取り消せません。');
    });

    it('複数回呼び出せる', () => {
      global.confirm.mockReturnValueOnce(true);
      global.confirm.mockReturnValueOnce(false);
      global.confirm.mockReturnValueOnce(true);

      const result1 = service.confirm('確認1');
      const result2 = service.confirm('確認2');
      const result3 = service.confirm('確認3');

      expect(result1).toBe(true);
      expect(result2).toBe(false);
      expect(result3).toBe(true);
      expect(global.confirm).toHaveBeenCalledTimes(3);
    });
  });

  describe('showInfo', () => {
    it('情報メッセージを表示できる', () => {
      service.showInfo('保存しました');

      expect(global.alert).toHaveBeenCalledWith('保存しました');
      expect(global.alert).toHaveBeenCalledTimes(1);
    });

    it('空文字列でも表示できる', () => {
      service.showInfo('');

      expect(global.alert).toHaveBeenCalledWith('');
    });

    it('長いメッセージも表示できる', () => {
      const longMessage = 'これは非常に長い情報メッセージです。'.repeat(10);
      service.showInfo(longMessage);

      expect(global.alert).toHaveBeenCalledWith(longMessage);
    });

    it('改行を含むメッセージも表示できる', () => {
      service.showInfo('処理が完了しました。\n結果: 成功');

      expect(global.alert).toHaveBeenCalledWith('処理が完了しました。\n結果: 成功');
    });

    it('複数回呼び出せる', () => {
      service.showInfo('情報1');
      service.showInfo('情報2');

      expect(global.alert).toHaveBeenCalledTimes(2);
      expect(global.alert).toHaveBeenNthCalledWith(1, '情報1');
      expect(global.alert).toHaveBeenNthCalledWith(2, '情報2');
    });
  });

  describe('メソッドの独立性', () => {
    it('showErrorとshowInfoは同じalertを使用する', () => {
      service.showError('エラー');
      service.showInfo('情報');

      expect(global.alert).toHaveBeenCalledTimes(2);
      expect(global.alert).toHaveBeenNthCalledWith(1, 'エラー');
      expect(global.alert).toHaveBeenNthCalledWith(2, '情報');
    });

    it('confirmは独立したダイアログである', () => {
      global.confirm.mockReturnValue(true);

      service.showError('エラー');
      const result = service.confirm('確認');
      service.showInfo('情報');

      expect(global.alert).toHaveBeenCalledTimes(2);
      expect(global.confirm).toHaveBeenCalledTimes(1);
      expect(result).toBe(true);
    });
  });

  describe('テスタビリティ', () => {
    it('モック化されたalertが正しく動作する', () => {
      const mockAlert = vi.fn();
      global.alert = mockAlert;

      const testService = new NotificationService();
      testService.showError('テスト');

      expect(mockAlert).toHaveBeenCalledWith('テスト');
    });

    it('モック化されたconfirmが正しく動作する', () => {
      const mockConfirm = vi.fn(() => true);
      global.confirm = mockConfirm;

      const testService = new NotificationService();
      const result = testService.confirm('テスト');

      expect(mockConfirm).toHaveBeenCalledWith('テスト');
      expect(result).toBe(true);
    });

    it('カスタム実装に差し替え可能である', () => {
      class CustomNotificationService extends NotificationService {
        constructor() {
          super();
          this.messages = [];
        }

        showError(message) {
          this.messages.push({ type: 'error', message });
        }

        confirm(message) {
          this.messages.push({ type: 'confirm', message });
          return true;
        }

        showInfo(message) {
          this.messages.push({ type: 'info', message });
        }
      }

      const customService = new CustomNotificationService();
      customService.showError('エラー');
      customService.confirm('確認');
      customService.showInfo('情報');

      expect(customService.messages).toHaveLength(3);
      expect(customService.messages[0]).toEqual({ type: 'error', message: 'エラー' });
      expect(customService.messages[1]).toEqual({ type: 'confirm', message: '確認' });
      expect(customService.messages[2]).toEqual({ type: 'info', message: '情報' });
    });
  });

  describe('エッジケース', () => {
    it('オブジェクトを渡した場合の動作', () => {
      const obj = { message: 'エラー' };
      service.showError(obj);

      expect(global.alert).toHaveBeenCalledWith(obj);
    });

    it('配列を渡した場合の動作', () => {
      const arr = ['エラー1', 'エラー2'];
      service.showError(arr);

      expect(global.alert).toHaveBeenCalledWith(arr);
    });

    it('関数を渡した場合の動作', () => {
      const fn = () => 'エラー';
      service.showError(fn);

      expect(global.alert).toHaveBeenCalledWith(fn);
    });
  });
});
