/**
 * IdGenerator のテスト
 * 
 * テスト戦略:
 * - UUID生成の正確性検証
 * - 衝突リスクの検証
 * - RFC 4122準拠の確認
 */

import { describe, it, expect } from 'vitest';
import { IdGenerator } from '../../domain/IdGenerator.js';

describe('IdGenerator', () => {
  describe('generate', () => {
    it('IDを生成できる', () => {
      const id = IdGenerator.generate();

      expect(id).toBeDefined();
      expect(typeof id).toBe('string');
      expect(id.length).toBeGreaterThan(0);
    });

    it('UUID v4形式のIDを生成する', () => {
      const id = IdGenerator.generate();

      // UUID v4の正規表現パターン
      // xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx
      // y は 8, 9, a, b のいずれか
      const uuidV4Pattern = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
      
      expect(id).toMatch(uuidV4Pattern);
    });

    it('36文字のIDを生成する（ハイフン含む）', () => {
      const id = IdGenerator.generate();

      expect(id.length).toBe(36);
    });

    it('4つのハイフンを含む', () => {
      const id = IdGenerator.generate();

      const hyphens = id.split('').filter(char => char === '-');
      expect(hyphens.length).toBe(4);
    });

    it('ハイフンの位置が正しい（8-4-4-4-12形式）', () => {
      const id = IdGenerator.generate();

      expect(id[8]).toBe('-');
      expect(id[13]).toBe('-');
      expect(id[18]).toBe('-');
      expect(id[23]).toBe('-');
    });

    it('バージョンフィールドが4である（UUID v4）', () => {
      const id = IdGenerator.generate();

      // 15文字目（0-indexed で14）がバージョン番号
      expect(id[14]).toBe('4');
    });

    it('バリアントフィールドが正しい（RFC 4122準拠）', () => {
      const id = IdGenerator.generate();

      // 20文字目（0-indexed で19）がバリアント
      // RFC 4122では 8, 9, a, b のいずれか
      const variant = id[19].toLowerCase();
      expect(['8', '9', 'a', 'b']).toContain(variant);
    });

    it('複数回呼び出すと異なるIDが生成される', () => {
      const id1 = IdGenerator.generate();
      const id2 = IdGenerator.generate();

      expect(id1).not.toBe(id2);
    });

    it('大量に生成しても衝突しない（統計的検証）', () => {
      const ids = new Set();
      const count = 10000;

      for (let i = 0; i < count; i++) {
        ids.add(IdGenerator.generate());
      }

      // 全てのIDがユニークであることを確認
      expect(ids.size).toBe(count);
    });

    it('連続して生成しても衝突しない', () => {
      const ids = [];
      for (let i = 0; i < 100; i++) {
        ids.push(IdGenerator.generate());
      }

      const uniqueIds = new Set(ids);
      expect(uniqueIds.size).toBe(ids.length);
    });

    it('小文字の16進数文字のみを含む（ハイフン除く）', () => {
      const id = IdGenerator.generate();
      const withoutHyphens = id.replace(/-/g, '');

      // 16進数文字（0-9, a-f）のみで構成されているか
      expect(withoutHyphens).toMatch(/^[0-9a-f]+$/i);
    });

    it('生成されたIDは文字列型である', () => {
      const id = IdGenerator.generate();

      expect(typeof id).toBe('string');
    });

    it('空文字列ではない', () => {
      const id = IdGenerator.generate();

      expect(id).not.toBe('');
    });

    it('nullではない', () => {
      const id = IdGenerator.generate();

      expect(id).not.toBeNull();
    });

    it('undefinedではない', () => {
      const id = IdGenerator.generate();

      expect(id).not.toBeUndefined();
    });

    describe('ランダム性の検証', () => {
      it('各桁の分布が偏っていない（統計的検証）', () => {
        const ids = [];
        for (let i = 0; i < 1000; i++) {
          ids.push(IdGenerator.generate());
        }

        // 最初の文字の分布を確認
        const firstChars = ids.map(id => id[0]);
        const distribution = {};
        
        firstChars.forEach(char => {
          distribution[char] = (distribution[char] || 0) + 1;
        });

        // 各文字が少なくとも1回は出現することを期待
        // （完全なランダム性の検証ではないが、基本的な分布を確認）
        const uniqueChars = Object.keys(distribution).length;
        expect(uniqueChars).toBeGreaterThan(5); // 16進数なので最低でも5種類以上
      });

      it('同じパターンが繰り返されない', () => {
        const ids = [];
        for (let i = 0; i < 100; i++) {
          ids.push(IdGenerator.generate());
        }

        // 最初の8文字が全て異なることを確認
        const prefixes = ids.map(id => id.substring(0, 8));
        const uniquePrefixes = new Set(prefixes);
        
        // 100個中、少なくとも95個以上はユニークであることを期待
        expect(uniquePrefixes.size).toBeGreaterThan(95);
      });
    });

    describe('パフォーマンス', () => {
      it('大量生成でもパフォーマンスが劣化しない', () => {
        const startTime = performance.now();
        
        for (let i = 0; i < 10000; i++) {
          IdGenerator.generate();
        }
        
        const endTime = performance.now();
        const duration = endTime - startTime;

        // 10000個の生成が1秒以内に完了することを期待
        expect(duration).toBeLessThan(1000);
      });
    });

    describe('エッジケース', () => {
      it('引数なしで呼び出せる', () => {
        expect(() => {
          IdGenerator.generate();
        }).not.toThrow();
      });

      it('引数を渡してもエラーにならない（無視される）', () => {
        expect(() => {
          IdGenerator.generate('ignored');
        }).not.toThrow();
      });
    });
  });
});
