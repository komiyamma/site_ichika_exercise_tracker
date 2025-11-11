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
├── app.js                          # アプリケーションエントリーポイント
├── top.html                        # HTMLファイル
├── controller/
│   └── WorkoutController.js        # プレゼンテーション層
├── service/
│   └── WorkoutService.js           # ビジネスロジック層
├── repository/
│   └── WorkoutRepository.js        # データアクセス層
├── domain/
│   ├── WorkoutEntry.js             # ドメインモデル
│   ├── WorkoutEntryFactory.js      # エントリファクトリー
│   ├── IdGenerator.js              # ID生成器
│   └── DateFormatter.js            # 日付フォーマッター
└── view/
    ├── WorkoutView.js              # ビュー層（DOM操作）
    └── NotificationService.js      # 通知サービス
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
- `WorkoutEntryFactory`: エントリの生成ロジック
- `IdGenerator`: ユニークID生成
- `DateFormatter`: 日付フォーマット
- `WorkoutRepository`: localStorage操作
- `WorkoutService`: ビジネスロジック（並び替え、フィルタリング）
- `WorkoutView`: DOM操作
- `NotificationService`: 通知表示
- `WorkoutController`: イベント処理とフロー制御

### 4. EventTarget継承によるイベント設計

`WorkoutView`が`EventTarget`を継承し、標準的なイベント処理を実装：

```javascript
// WorkoutView.js
export class WorkoutView extends EventTarget {
  #attachDOMListeners() {
    this.elements.form.addEventListener('submit', (e) => {
      e.preventDefault();
      this.dispatchEvent(new CustomEvent('submit', {
        detail: this.getFormData()
      }));
    });
  }
}

// WorkoutController.js
#setupEventHandlers() {
  this.view.addEventListener('submit', (e) => {
    this.#handleSubmit(e.detail);
  });
}
```

これにより：

- View/Controller間の疎結合化
- 標準的なイベント処理
- テスタビリティ向上

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
#sortByCreatedAt(entries) {
  return entries.toSorted((a, b) => b.createdAt - a.createdAt);
}
```

### 7. ファクトリーパターン

複雑なオブジェクト生成をファクトリーに委譲：

```javascript
// WorkoutEntryFactory.js
export class WorkoutEntryFactory {
  static fromFormData(formData) {
    return new WorkoutEntry({
      id: IdGenerator.generate(),
      date: formData.date,
      type: formData.type,
      minutes: this.#parseNumber(formData.minutes),
      value: this.#parseNumber(formData.value),
      note: this.#sanitizeNote(formData.note),
      createdAt: Date.now(),
    });
  }
}
```

### 8. トランザクション処理

Repository層でトランザクション的な操作を提供：

```javascript
// WorkoutRepository.js
transaction(callback) {
  const entries = this.findAll();
  const updatedEntries = callback(entries);
  this.saveAll(updatedEntries);
}

// WorkoutService.js
addEntry(formData) {
  const entry = WorkoutEntryFactory.fromFormData(formData);
  
  this.repository.transaction((entries) => {
    entries.push(entry);
    return entries;
  });
}
```

## 主な改善点

### オリジナル版との比較

| 項目 | オリジナル | リファクタリング版 |
|------|-----------|------------------|
| グローバル変数 | 10個以上 | 0個 |
| 関数の責務 | 混在 | 明確に分離 |
| テスト可能性 | 低い | 高い |
| モジュール化 | なし | ES6 modules |
| イベント登録 | `onclick`属性 | EventTarget継承 |
| ID生成 | `Date.now()`（衝突リスク） | `crypto.randomUUID()` |
| データ変換 | Service層で実装 | Factory層で分離 |
| 通知表示 | 直接alert | NotificationService |
| 配列操作 | `sort()` | `toSorted()` |
| エラー処理 | try-catch分散 | 各層で適切に処理 |

## 使用技術

- **ES2025 JavaScript**
- **ES6 Modules** (import/export)
- **Class構文** (private fields含む)
- **Optional Chaining** (`?.`)
- **Nullish Coalescing** (`??`)
- **Array.prototype.toSorted()** (非破壊的ソート)
- **crypto.randomUUID()** (標準的なUUID生成)
- **Error cause option** (エラーチェーン)
- **EventTarget継承** (標準的なイベント処理)
- **CustomEvent** (詳細なイベントデータ)

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

test('バリデーション - 必須項目チェック', () => {
  const entry = new WorkoutEntry({
    id: 'test-id',
    type: '',
    date: '',
    createdAt: Date.now()
  });
  
  const result = entry.validate();
  expect(result.isValid).toBe(false);
  expect(result.errors).toContain('種目は必須です');
  expect(result.errors).toContain('日付は必須です');
});
```

### 2. ファクトリーのテスト

```javascript
// WorkoutEntryFactory.test.js
import { WorkoutEntryFactory } from './domain/WorkoutEntryFactory.js';

test('フォームデータからエントリ作成', () => {
  const formData = {
    date: '2025-01-01',
    type: 'ランニング',
    minutes: '30',
    value: '5',
    note: '  朝ラン  '
  };
  
  const entry = WorkoutEntryFactory.fromFormData(formData);
  
  expect(entry.date).toBe('2025-01-01');
  expect(entry.type).toBe('ランニング');
  expect(entry.minutes).toBe(30);
  expect(entry.value).toBe(5);
  expect(entry.note).toBe('朝ラン'); // トリム済み
  expect(entry.id).toMatch(/^[0-9a-f-]{36}$/i); // UUID形式
});
```

### 3. リポジトリのモック

```javascript
// WorkoutService.test.js
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
  
  clear() {
    this.data = [];
  }
}

test('エントリ追加', () => {
  const mockRepo = new MockRepository();
  const service = new WorkoutService(mockRepo);
  
  const formData = {
    date: '2025-01-01',
    type: 'ウォーキング',
    minutes: '30',
    value: '0',
    note: 'テスト'
  };
  
  service.addEntry(formData);
  
  const entries = service.getAllEntries();
  expect(entries).toHaveLength(1);
  expect(entries[0].type).toBe('ウォーキング');
});
```

### 4. ビューのモック

```javascript
// WorkoutController.test.js
class MockNotificationService {
  constructor() {
    this.messages = [];
  }
  
  showError(message) {
    this.messages.push({ type: 'error', message });
  }
  
  confirm(message) {
    this.messages.push({ type: 'confirm', message });
    return true;
  }
}

class MockView extends EventTarget {
  constructor(notificationService) {
    super();
    this.notification = notificationService;
    this.formData = {};
  }
  
  getFormData() {
    return this.formData;
  }
  
  resetForm() {}
  renderEntries(entries) {}
  
  showError(message) {
    this.notification.showError(message);
  }
}

test('フォーム送信エラーハンドリング', () => {
  const mockNotification = new MockNotificationService();
  const mockView = new MockView(mockNotification);
  const mockService = {
    addEntry: jest.fn(() => {
      throw new Error('バリデーションエラー');
    })
  };
  
  const controller = new WorkoutController(mockService, mockView);
  controller.initialize();
  
  mockView.formData = { type: '', date: '' };
  mockView.dispatchEvent(new CustomEvent('submit', {
    detail: mockView.formData
  }));
  
  expect(mockNotification.messages).toHaveLength(1);
  expect(mockNotification.messages[0].type).toBe('error');
});
```

## 今後の拡張性

この設計により、以下の拡張が容易です：

### 1. バックエンドAPI連携

```javascript
// repository/WorkoutApiRepository.js
export class WorkoutApiRepository {
  constructor(apiClient) {
    this.apiClient = apiClient;
  }
  
  async findAll() {
    const response = await this.apiClient.get('/workouts');
    return response.data.map(item => WorkoutEntry.fromJSON(item));
  }
  
  async transaction(callback) {
    const entries = await this.findAll();
    const updatedEntries = callback(entries);
    await this.saveAll(updatedEntries);
  }
}

// app.jsで差し替え
const repository = new WorkoutApiRepository(apiClient);
```

### 2. TypeScript化

```typescript
// domain/WorkoutEntry.ts
export interface WorkoutEntryData {
  id: string;
  date: string;
  type: string;
  minutes: number;
  value: number;
  note: string;
  createdAt: number;
}

export interface ValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
}

export class WorkoutEntry {
  constructor(private data: WorkoutEntryData) {}
  
  get id(): string { return this.data.id; }
  get date(): string { return this.data.date; }
  
  validate(): ValidationResult {
    // ...
  }
}
```

### 3. フレームワーク移行（React）

```jsx
// components/WorkoutApp.jsx
import { useWorkoutService } from '../hooks/useWorkoutService';

export function WorkoutApp() {
  const { entries, addEntry, deleteEntry } = useWorkoutService();
  
  return (
    <div className="container">
      <WorkoutForm onSubmit={addEntry} />
      <WorkoutList entries={entries} onDelete={deleteEntry} />
    </div>
  );
}

// hooks/useWorkoutService.js
export function useWorkoutService() {
  const [service] = useState(() => new WorkoutService(repository));
  const [entries, setEntries] = useState([]);
  
  const loadEntries = () => {
    setEntries(service.getAllEntries());
  };
  
  useEffect(loadEntries, []);
  
  return { entries, addEntry, deleteEntry };
}
```

## まとめ

このリファクタリング版は、教材版の機能を保ちながら：

✅ **アーキテクチャ**: クリーンアーキテクチャの原則を完全に遵守  
✅ **テスタビリティ**: 全レイヤーでユニットテストが容易  
✅ **保守性**: 各クラスが単一責任を持ち、変更の影響範囲が限定的  
✅ **拡張性**: 新機能の追加や既存機能の変更が容易  
✅ **モダン**: ES2025の最新機能を活用  

### 主な設計上の改善点

1. **ID生成の衝突リスク解消** → `crypto.randomUUID()`で完全解決
2. **Repository層の責務明確化** → フィルタリングをService層へ移動
3. **Domain層の責務分離** → FactoryパターンでService層から分離
4. **View層のテスタビリティ向上** → NotificationService注入で解決
5. **Controller/View間の疎結合化** → EventTarget継承で実現
6. **エラーハンドリングの統一** → causeオプションで統一
7. **日付フォーマット処理の統一** → DateFormatterクラスで集約

