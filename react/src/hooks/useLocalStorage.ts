import { useState, useCallback } from 'react';

/** 値の更新関数の型定義（直接値またはupdater関数を受け取る） */
type SetValue<T> = (value: T | ((prev: T) => T)) => void;

/**
 * localStorageと同期するカスタムフック
 * 
 * Reactの状態とlocalStorageを自動的に同期する。
 * 状態が更新されると自動的にlocalStorageにも保存される。
 * 
 * @template T - 保存するデータの型
 * @param key - localStorageのキー名
 * @param initialValue - 初期値（localStorageにデータがない場合に使用）
 * @returns [現在の値, 値を更新する関数, 値を削除する関数]
 * 
 * @example
 * const [data, setData, clearData] = useLocalStorage('myKey', []);
 * setData([...data, newItem]); // 状態とlocalStorageの両方が更新される
 * clearData(); // 状態とlocalStorageの両方がクリアされる
 */
export function useLocalStorage<T>(
  key: string,
  initialValue: T
): [T, SetValue<T>, () => void] {
  // 初期化時にlocalStorageから値を読み込む
  const [storedValue, setStoredValue] = useState<T>(() => {
    try {
      const item = window.localStorage.getItem(key);
      return item ? JSON.parse(item) : initialValue;
    } catch (error) {
      console.error(`Error loading ${key} from localStorage:`, error);
      return initialValue;
    }
  });

  /**
   * 値を更新する関数
   * 状態を更新すると同時にlocalStorageにも保存する
   */
  const setValue: SetValue<T> = useCallback((value) => {
    try {
      setStoredValue((prev) => {
        // 関数が渡された場合は前の値を使って新しい値を計算
        const valueToStore = value instanceof Function ? value(prev) : value;
        window.localStorage.setItem(key, JSON.stringify(valueToStore));
        return valueToStore;
      });
    } catch (error) {
      console.error(`Error saving ${key} to localStorage:`, error);
    }
  }, [key]);

  /**
   * 値を削除する関数
   * localStorageから削除し、状態を初期値にリセットする
   */
  const removeValue = useCallback(() => {
    try {
      window.localStorage.removeItem(key);
      setStoredValue(initialValue);
    } catch (error) {
      console.error(`Error removing ${key} from localStorage:`, error);
    }
  }, [key, initialValue]);

  return [storedValue, setValue, removeValue];
}
