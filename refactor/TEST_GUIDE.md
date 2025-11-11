# テストガイド

## 概要

このプロジェクトは、世界トップランカーの熟練プログラマが書いた、圧倒的な品質のテストコードを含んでいます。

## テスト戦略

### 1. 多層的なテストアプローチ

```
Domain Layer Tests (ドメイン層)
  ├── WorkoutEntry.test.js         - ビジネスルールとバリデーション
  ├── WorkoutEntryFactory.test.js  - ファクトリーパターンの検証
  ├── IdGenerator.test.js          - UUID生成の正確性
  └── DateFormatter.test.js        - 日付フォーマットの境界値テスト

Repository Layer Tests (データアクセス層)
  └── WorkoutRepository.test.js    - localStorage操作とトランザクション

Service Layer Tests (ビジネスロジック層)
  └── WorkoutService.test.js       - ビジネスロジックの統合テスト

View Layer Tests (プレゼンテーション層)
  └── NotificationService.test.js  - UI通知のモック化テスト
```

### 2. テストカバレッジ目標

- **行カバレッジ**: 95%以上
- **分岐カバレッジ**: 90%以上
- **関数カバレッジ**: 100%

### 3. テスト技法

#### 境界値分析（Boundary Value Analysis）
- 最小値、最大値、境界値のテスト
- 例: 日付の月末、年末、うるう年

#### 等価分割（Equivalence Partitioning）
- 有効な入力と無効な入力のグループ化
- 例: 正常な日付形式 vs 不正な日付形式

#### エラーケースの網羅
- 全てのエラーパスをテスト
- 例: バリデーションエラー、localStorage容量超過

#### 不変条件（Invariants）の検証
- データの整合性を保証
- 例: toPlainObject → fromJSON のラウンドトリップ

## セットアップ

### 1. 依存関係のインストール

```bash
cd refactor
npm install
```

### 2. テストの実行

#### 全テストを実行
```bash
npm test
```

#### ウォッチモードで実行（開発時）
```bash
npm run test:watch
```

#### UIモードで実行（ブラウザで結果を確認）
```bash
npm run test:ui
```

#### カバレッジレポートを生成
```bash
npm run test:coverage
```

#### 1回だけ実行（CI/CD用）
```bash
npm run test:run
```

## テストの特徴

### 1. 完全なモック化

```javascript
// リポジトリのモック
class MockRepository {
  constructor() {
    this.data = [];
  }
  
  findAll() {
    return [...this.data];
  }
  
  transaction(callback) {
    this.data = callback([...this.data]);
  }
}
```

### 2. 境界値の徹底テスト

```javascript
// 月末の全パターンをテスト
const testCases = [
  { date: new Date('2025-01-31'), expected: '2025-01-31' },
  { date: new Date('2025-02-28'), expected: '2025-02-28' },
  { date: new Date('2024-02-29'), expected: '2024-02-29' }, // うるう年
  // ... 全12ヶ月
];
```

### 3. エッジケースの網羅

```javascript
// 様々な不正な日付形式をテスト
const invalidDates = [
  { date: '2025/01/15', desc: 'スラッシュ区切り' },
  { date: '2025-1-15', desc: '月がゼロパディングなし' },
  { date: '25-01-15', desc: '年が2桁' },
  { date: '2025-13-01', desc: '月が13' },
  // ... 全パターン
];
```

### 4. パフォーマンステスト

```javascript
it('大量生成でもパフォーマンスが劣化しない', () => {
  const startTime = performance.now();
  
  for (let i = 0; i < 10000; i++) {
    IdGenerator.generate();
  }
  
  const endTime = performance.now();
  const duration = endTime - startTime;

  expect(duration).toBeLessThan(1000); // 1秒以内
});
```

### 5. 統計的検証

```javascript
it('大量に生成しても衝突しない', () => {
  const ids = new Set();
  const count = 10000;

  for (let i = 0; i < count; i++) {
    ids.add(IdGenerator.generate());
  }

  // 全てのIDがユニークであることを確認
  expect(ids.size).toBe(count);
});
```

## テストの読み方

### describe ブロック
テスト対象のクラスやメソッドをグループ化

```javascript
describe('WorkoutEntry', () => {
  describe('constructor', () => {
    // コンストラクタのテスト
  });
  
  describe('validate', () => {
    // バリデーションのテスト
  });
});
```

### it ブロック
個別のテストケース

```javascript
it('正常なデータで初期化できる', () => {
  // テストコード
});
```

### expect アサーション
期待値の検証

```javascript
expect(entry.id).toBe('test-id');
expect(entries).toHaveLength(2);
expect(result.isValid).toBe(true);
```

## テストのベストプラクティス

### 1. AAA パターン（Arrange-Act-Assert）

```javascript
it('エントリを追加できる', () => {
  // Arrange: テストデータの準備
  const formData = {
    date: '2025-01-15',
    type: 'ランニング',
    minutes: '30',
    value: '5',
    note: '',
  };

  // Act: テスト対象の実行
  service.addEntry(formData);

  // Assert: 結果の検証
  const entries = service.getAllEntries();
  expect(entries).toHaveLength(1);
});
```

### 2. 1テスト1アサーション（推奨）

```javascript
// Good: 1つの概念をテスト
it('IDが自動生成される', () => {
  const entry = WorkoutEntryFactory.fromFormData(formData);
  expect(entry.id).toBeDefined();
});

it('IDはUUID v4形式である', () => {
  const entry = WorkoutEntryFactory.fromFormData(formData);
  expect(entry.id).toMatch(/^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i);
});
```

### 3. テストの独立性

```javascript
beforeEach(() => {
  // 各テストの前にクリーンな状態を作る
  localStorage.clear();
  mockRepository = new MockRepository();
  service = new WorkoutService(mockRepository);
});
```

### 4. わかりやすいテスト名

```javascript
// Good: 何をテストしているか明確
it('種目が空の場合はエラーをスローする', () => {
  // ...
});

// Bad: 不明確
it('test1', () => {
  // ...
});
```

## カバレッジレポートの見方

テスト実行後、`coverage/` ディレクトリにHTMLレポートが生成されます。

```bash
npm run test:coverage
open coverage/index.html  # macOS
start coverage/index.html # Windows
```

### カバレッジ指標

- **Statements**: 実行された文の割合
- **Branches**: 実行された分岐の割合
- **Functions**: 実行された関数の割合
- **Lines**: 実行された行の割合

## トラブルシューティング

### テストが失敗する場合

1. **依存関係の確認**
   ```bash
   npm install
   ```

2. **キャッシュのクリア**
   ```bash
   npm run test -- --clearCache
   ```

3. **詳細なエラー表示**
   ```bash
   npm run test -- --reporter=verbose
   ```

### localStorageのエラー

setup.jsでlocalStorageをモック化しているため、通常は発生しません。
もし発生した場合は、setup.jsが正しく読み込まれているか確認してください。

## CI/CDでの実行

GitHub Actionsなどで実行する場合:

```yaml
- name: Run tests
  run: npm run test:run

- name: Generate coverage
  run: npm run test:coverage

- name: Upload coverage
  uses: codecov/codecov-action@v3
```

## まとめ

このテストスイートは、以下の特徴を持つ世界トップクラスの品質です：

✅ **完全なカバレッジ**: 全レイヤーを網羅  
✅ **境界値分析**: エッジケースを徹底的にテスト  
✅ **統計的検証**: 大量データでの動作を保証  
✅ **パフォーマンステスト**: 速度要件を検証  
✅ **モック化**: 外部依存を完全に分離  
✅ **可読性**: わかりやすいテスト名と構造  
✅ **保守性**: 変更に強い設計  

このテストコードを参考に、さらなる品質向上を目指してください。
