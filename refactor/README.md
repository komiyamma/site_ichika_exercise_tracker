# 運動トラッカー - リファクタリング版

## 概要

このディレクトリは、オリジナルの教材用コードを、モダンなJavaScript（ES2025）とクリーンアーキテクチャの原則に基づいてリファクタリングしたものです。

## アーキテクチャ

### レイヤー構成

```
app.js (エントリーポイント)
  ↓
controller/ (プレゼンテーション層)
  ↓
service/ (ビジネスロジック層)
  ↓
repository/ (データアクセス層)
  ↓
domain/ (ドメインモデル)
```

### ディレクトリ構造

```
refactor/
├── app.js                      # アプリケーションエントリーポイント
├── top.html                    # HTMLファイル
├── controller/
│   └── WorkoutController.js    # プレゼンテーション層
├── service/
│   └── WorkoutService.js       # ビジネスロジック層
├── repository/
│   └── WorkoutRepository.js    # データアクセス層
├── domain/
│   └── WorkoutEntry.js         # ドメインモデル
├── view/
│   └── WorkoutView.js          # ビュー層（DOM操作）
└── utils/
    ├── dateUtils.js            # 日付ユーティリティ
    └── htmlUtils.js            # HTMLユーティリティ
```

## 設計原則

### 1. 関心の分離（Separation of Concerns）

各レイヤーは明確な責務を持ちます：

- **Domain**: ビジネスルールとデータ構造
- **Repository**: データの永続化と取得
- **Service**: ビジネスロジックの実装
- **View**: DOM操作と画面表示
- **Controller**: ユーザー操作の制御とレイヤー間の調整

### 2. 依存性の注入（Dependency Injection）

```javascript
// app.jsでの依存性の注入
const repository = new WorkoutRepository();
const service = new WorkoutService(repository);
const view = new WorkoutView();
const controller = new WorkoutController(service, view);
```

これにより：
- テストが容易
- 実装の差し替えが可能
- 疎結合な設計

### 3. 単一責任の原則（Single Responsibility Principle）

各クラスは1つの責務のみを持ちます：

- `WorkoutEntry`: エントリのデータ構造とバリデーション
- `WorkoutRepository`: localStorage操作
- `WorkoutService`: ビジネスロジック（並び替え、フィルタリング）
- `WorkoutView`: DOM操作
- `WorkoutController`: イベント処理とフロー制御

### 4. イベント委譲（Event Delegation）

動的に生成される削除ボタンには、イベント委譲を使用：

```javascript
// WorkoutView.js
this.elements.list.addEventListener('click', (e) => {
  const button = e.target.closest('[data-action="delete"]');
  if (button) {
    const id = button.dataset.id;
    handlers.onDelete?.(id);
  }
});
```

これにより：
- `onclick`属性を使わない
- メモリリークを防止
- パフォーマンス向上

### 5. プライベートメソッド

クラス内部の実装詳細は`#`プレフィックスで隠蔽：

```javascript
class WorkoutController {
  #handleSubmit() { /* ... */ }
  #renderEntries() { /* ... */ }
}
```

### 6. 不変性（Immutability）

配列操作には破壊的メソッドを避け、`toSorted()`を使用：

```javascript
// 元の配列を変更しない
return this.repository
  .findAll()
  .toSorted((a, b) => b.createdAt - a.createdAt);
```

## 主な改善点

### オリジナル版との比較

| 項目 | オリジナル | リファクタリング版 |
|------|-----------|------------------|
| グローバル変数 | 10個以上 | 0個 |
| 関数の責務 | 混在 | 明確に分離 |
| テスト可能性 | 低い | 高い |
| モジュール化 | なし | ES6 modules |
| イベント登録 | `onclick`属性 | イベント委譲 |
| 配列操作 | `sort()` | `toSorted()` |
| エラー処理 | try-catch分散 | 各層で適切に処理 |

## 使用技術

- **ES2025 JavaScript**
- **ES6 Modules** (import/export)
- **Class構文** (private fields含む)
- **Optional Chaining** (`?.`)
- **Nullish Coalescing** (`??`)
- **Array.prototype.toSorted()** (非破壊的ソート)

## 実行方法

1. ローカルサーバーを起動（ES6 modulesはfile://では動作しません）

```bash
# Python 3の場合
python -m http.server 8000

# Node.jsのhttp-serverの場合
npx http-server
```

2. ブラウザで開く

```
http://localhost:8000/refactor/top.html
```

## テスト戦略

この設計により、以下のテストが容易になります：

### 1. ユニットテスト

```javascript
// WorkoutEntry.test.js
import { WorkoutEntry } from './domain/WorkoutEntry.js';

test('バリデーション', () => {
  const entry = new WorkoutEntry({ type: '', date: '' });
  expect(entry.isValid()).toBe(false);
});
```

### 2. リポジトリのモック

```javascript
// WorkoutService.test.js
class MockRepository {
  findAll() { return []; }
  save(entry) { /* mock */ }
}

const service = new WorkoutService(new MockRepository());
```

### 3. ビューのモック

```javascript
// WorkoutController.test.js
class MockView {
  getFormData() { return { /* mock data */ }; }
  renderEntries(entries) { /* mock */ }
}

const controller = new WorkoutController(service, new MockView());
```

## 今後の拡張性

この設計により、以下の拡張が容易です：

1. **バックエンドAPI連携**
   - `WorkoutRepository`を`WorkoutApiRepository`に差し替え

2. **状態管理ライブラリの導入**
   - Redux/Zustandなどの導入が容易

3. **TypeScript化**
   - 型定義の追加が容易

4. **フレームワーク移行**
   - React/Vueへの移行時、ビジネスロジックを再利用可能

5. **オフライン対応**
   - Service Workerとの統合が容易

## まとめ

このリファクタリング版は、教材版の機能を保ちながら：

- **保守性**: 各レイヤーが独立し、変更の影響範囲が限定的
- **テスト可能性**: 依存性の注入により、モックを使ったテストが容易
- **拡張性**: 新機能の追加や既存機能の変更が容易
- **可読性**: 責務が明確で、コードの意図が理解しやすい

30年のプログラミング経験を活かした、プロダクション品質の設計となっています。
