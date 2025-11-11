/**
 * Vitestのセットアップファイル
 * 全テストの実行前に実行される
 */

import { vi } from 'vitest';

// localStorageのモック
const localStorageMock = (() => {
  let store = {};

  return {
    getItem: (key) => store[key] || null,
    setItem: (key, value) => {
      store[key] = value.toString();
    },
    removeItem: (key) => {
      delete store[key];
    },
    clear: () => {
      store = {};
    },
  };
})();

global.localStorage = localStorageMock;

// crypto.randomUUID()のモック（Node.js環境用）
if (typeof crypto === 'undefined') {
  global.crypto = {
    randomUUID: () => {
      return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
        const r = (Math.random() * 16) | 0;
        const v = c === 'x' ? r : (r & 0x3) | 0x8;
        return v.toString(16);
      });
    },
  };
}

// alert, confirm のモック
global.alert = vi.fn();
global.confirm = vi.fn(() => true);

// 各テストの前にlocalStorageをクリア
beforeEach(() => {
  localStorage.clear();
  vi.clearAllMocks();
});
