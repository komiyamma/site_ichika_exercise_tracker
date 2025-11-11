# リファクタリング版コードレビュー

## 🔴 重大な問題

### 1. Repository層の責務違反

**問題：**
`WorkoutRepository.findByDate()`がフィルタリングロジックを持っている。

```javascript
// WorkoutRepository.js
findByDate(date) {
  return this.findAll().filter(entry => entry.date === date);
}
```

**なぜ問題か：**
- Repository層はデータアクセスのみを担当すべき
- フィルタリングはビジネスロジック（Service層の責務）
- localStorageには「日付でフィルタリング」という概念がない
- 将来的にAPIに切り替えた場合、この設計は破綻する

**修正案：**
```javascript
// WorkoutRepository.js - findByDateを削除

// WorkoutService.js
getEntriesByDate(date) {
  const entries = this.repository.findAll();
  if (!date) {
    return entries.toSorted((a, b) => b.createdAt - a.createdAt);
  }
  return entries
    .filter(entry => entry.date === date)
    .toSorted((a, b) => b.createdAt - a.createdAt);
}
```

### 2. Repository層のパフォーマンス問題

**問題：**
`save()`と`delete()`が毎回全データを読み込んでいる。

```javascript
save(entry) {
  const entries = this.findAll();  // 全データ読み込み
  entries.push(entry);
  this.saveAll(entries);
}

delete(id) {
  const entries = this.findAll();  // 全データ読み込み
  this.saveAll(entries);
}
```

**なぜ問題か：**
- 1件の追加/削除のために全データをパース
- O(n)の無駄な処理
- データ量が増えるとパフォーマンス劣化

**修正案：**
```javascript
// save()とdelete()を削除し、saveAll()のみ提供
// Service層で全データを管理させる
```

### 3. Domain層の責務過剰

**問題：**
`WorkoutEntry.createFromForm()`がフォームデータの変換を担当している。

```javascript
static createFromForm({ date, type, minutes, value, note }) {
  const timestamp = Date.now();
  return new WorkoutEntry({
    id: String(timestamp),
    date,
    type,
    minutes: parseInt(minutes, 10) || 0,  // フォーム固有の処理
    value: parseInt(value, 10) || 0,      // フォーム固有の処理
    note: note.trim(),                     // フォーム固有の処理
    createdAt: timestamp,
  });
}
```

**なぜ問題か：**
- Domain層はビジネスルールのみを持つべき
- フォームの存在を知るべきではない
- APIから受け取る場合、`createFromApi()`も作る？
- 入力ソースごとにファクトリーメソッドが増殖する

**修正案：**
```javascript
// WorkoutEntry.js - createFromFormを削除
constructor({ id, date, type, minutes = 0, value = 0, note = '', createdAt }) {
  // バリデーション
  if (!id || !createdAt) {
    throw new Error('id and createdAt are required');
  }
  
  this.id = id;
  this.date = date;
  this.type = type;
  this.minutes = minutes;
  this.value = value;
  this.note = note;
  this.createdAt = createdAt;
}

// Service層で変換
addEntry(formData) {
  const timestamp = Date.now();
  const entry = new WorkoutEntry({
    id: String(timestamp),
    date: formData.date,
    type: formData.type,
    minutes: parseInt(formData.minutes, 10) || 0,
    value: parseInt(formData.value, 10) || 0,
    note: formData.note.trim(),
    createdAt: timestamp,
  });
  
  if (!entry.isValid()) {
    throw new Error('種類と日付は必須です');
  }
  
  this.repository.save(entry);
}
```

---

## 🟡 中程度の問題

### 4. View層がビジネスロジックを知りすぎている

**問題：**
`WorkoutView.attachEventListeners()`がコールバックを受け取る設計。

```javascript
attachEventListeners(handlers) {
  this.elements.form.addEventListener('submit', (e) => {
    e.preventDefault();
    handlers.onSubmit?.();  // Controllerに依存
  });
}
```

**なぜ問題か：**
- ViewがControllerの存在を前提としている
- 単体テストが書きにくい
- イベントの登録タイミングが不明確

**より良い設計：**
```javascript
// View層はイベントを発火するだけ
class WorkoutView extends EventTarget {
  constructor() {
    super();
    this.elements = this.#initializeElements();
    this.#attachDOMListeners();
  }
  
  #attachDOMListeners() {
    this.elements.form.addEventListener('submit', (e) => {
      e.preventDefault();
      this.dispatchEvent(new CustomEvent('submit'));
    });
  }
}

// Controller層でリスン
initialize() {
  this.view.addEventListener('submit', () => this.#handleSubmit());
}
```

### 5. エラーハンドリングの一貫性欠如

**問題：**
Repository層とService層でエラー処理が異なる。

```javascript
// Repository - エラーを握りつぶす
findAll() {
  try {
    // ...
  } catch (error) {
    console.error('データ読み込みエラー:', error);
    return [];  // エラーを隠蔽
  }
}

// Repository - エラーを投げる
saveAll(entries) {
  try {
    // ...
  } catch (error) {
    console.error('データ保存エラー:', error);
    throw error;  // エラーを伝播
  }
}
```

**なぜ問題か：**
- 読み込みエラーは隠蔽、保存エラーは伝播という不一致
- 呼び出し側が予測できない
- デバッグが困難

**修正案：**
```javascript
// 一貫してエラーを投げる
findAll() {
  try {
    const json = localStorage.getItem(this.storageKey);
    if (!json) return [];
    return JSON.parse(json).map(item => WorkoutEntry.fromJSON(item));
  } catch (error) {
    throw new Error(`データ読み込み失敗: ${error.message}`);
  }
}

// Controller層で統一的にハンドリング
#renderEntries() {
  try {
    const filterDate = this.view.getFilterDate();
    const entries = this.service.getEntriesByDate(filterDate);
    this.view.renderEntries(entries);
  } catch (error) {
    this.view.showError('データの取得に失敗しました');
    console.error(error);
  }
}
```

### 6. Service層の重複コード

**問題：**
`getAllEntries()`と`getEntriesByDate()`でソート処理が重複。

```javascript
getAllEntries() {
  return this.repository
    .findAll()
    .toSorted((a, b) => b.createdAt - a.createdAt);
}

getEntriesByDate(date) {
  if (!date) return this.getAllEntries();
  return this.repository
    .findByDate(date)
    .toSorted((a, b) => b.createdAt - a.createdAt);  // 重複
}
```

**修正案：**
```javascript
#sortByCreatedAt(entries) {
  return entries.toSorted((a, b) => b.createdAt - a.createdAt);
}

getAllEntries() {
  return this.#sortByCreatedAt(this.repository.findAll());
}

getEntriesByDate(date) {
  const entries = this.repository.findAll();
  const filtered = date ? entries.filter(e => e.date === date) : entries;
  return this.#sortByCreatedAt(filtered);
}
```

### 7. View層のalert依存

**問題：**
`showError()`, `confirm()`, `showInfo()`が直接`alert`/`confirm`を呼んでいる。

```javascript
showError(message) {
  alert(message);  // テスト不可能
}
```

**なぜ問題か：**
- ユニットテストが書けない
- UIの変更（モーダルに変更など）が困難
- ブラウザ依存

**修正案：**
```javascript
// Notification Serviceを注入
constructor(notificationService = window) {
  this.notification = notificationService;
  this.elements = this.#initializeElements();
}

showError(message) {
  this.notification.alert(message);
}

// テスト時
const mockNotification = {
  alert: jest.fn(),
  confirm: jest.fn(() => true),
};
const view = new WorkoutView(mockNotification);
```

---

## 🟢 軽微な問題

### 8. 空のutilsディレクトリ

**問題：**
`refactor/utils/`が空ディレクトリとして残っている。

**修正：**
削除する。

### 9. App.jsの不要なクラス化

**問題：**
`App`クラスが1回しか使われない。

```javascript
class App {
  constructor() {
    const repository = new WorkoutRepository();
    const service = new WorkoutService(repository);
    const view = new WorkoutView();
    const controller = new WorkoutController(service, view);
    this.controller = controller;
  }
  
  start() {
    this.controller.initialize();
  }
}

document.addEventListener('DOMContentLoaded', () => {
  const app = new App();
  app.start();
});
```

**修正案：**
```javascript
// シンプルな関数で十分
function initializeApp() {
  const repository = new WorkoutRepository();
  const service = new WorkoutService(repository);
  const view = new WorkoutView();
  const controller = new WorkoutController(service, view);
  
  controller.initialize();
}

document.addEventListener('DOMContentLoaded', initializeApp);
```

### 10. WorkoutEntry.isValid()の不完全性

**問題：**
`isValid()`が`type`と`date`のみチェック。

```javascript
isValid() {
  return Boolean(this.type && this.date);
}
```

**なぜ問題か：**
- `id`や`createdAt`の検証がない
- 日付フォーマットの検証がない
- 数値の範囲チェックがない

**修正案：**
```javascript
isValid() {
  // 必須フィールド
  if (!this.id || !this.type || !this.date || !this.createdAt) {
    return false;
  }
  
  // 日付フォーマット（YYYY-MM-DD）
  if (!/^\d{4}-\d{2}-\d{2}$/.test(this.date)) {
    return false;
  }
  
  // 数値の範囲
  if (this.minutes < 0 || this.value < 0) {
    return false;
  }
  
  return true;
}

// または、より詳細なバリデーション結果を返す
validate() {
  const errors = [];
  
  if (!this.type) errors.push('種目は必須です');
  if (!this.date) errors.push('日付は必須です');
  if (!/^\d{4}-\d{2}-\d{2}$/.test(this.date)) {
    errors.push('日付の形式が不正です');
  }
  if (this.minutes < 0) errors.push('時間は0以上である必要があります');
  
  return {
    isValid: errors.length === 0,
    errors,
  };
}
```

### 11. Controller層の日付フォーマット処理

**問題：**
`#getTodayFormatted()`がController層にある。

```javascript
#getTodayFormatted() {
  const today = new Date();
  const year = today.getFullYear();
  const month = String(today.getMonth() + 1).padStart(2, '0');
  const day = String(today.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}
```

**なぜ問題か：**
- 日付フォーマットはドメイン知識
- 他の場所でも使う可能性がある
- テストしにくい

**修正案：**
```javascript
// domain/DateFormatter.js
export class DateFormatter {
  static toYYYYMMDD(date = new Date()) {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }
  
  static today() {
    return this.toYYYYMMDD();
  }
}

// Controller
import { DateFormatter } from '../domain/DateFormatter.js';

initialize() {
  this.#setupEventHandlers();
  this.view.setDateInput(DateFormatter.today());
  this.#renderEntries();
}
```

### 12. WorkoutEntry.toJSON()の命名

**問題：**
`toJSON()`という名前だが、実際はプレーンオブジェクトを返している。

```javascript
toJSON() {
  return {
    id: this.id,
    // ...
  };
}
```

**なぜ問題か：**
- `JSON.stringify(entry)`を呼ぶと自動的に`toJSON()`が呼ばれる
- しかし、このメソッドは手動で呼ばれることを想定している
- 命名が誤解を招く

**修正案：**
```javascript
// オプション1: 名前を変更
toPlainObject() {
  return { /* ... */ };
}

// オプション2: 本当にJSON文字列を返す
toJSON() {
  return JSON.stringify({
    id: this.id,
    // ...
  });
}

// オプション3: そのまま（JSON.stringifyで自動呼び出しされる仕様を活用）
// この場合は問題なし
```

---

## 📊 アーキテクチャ評価

### 良い点

1. **レイヤー分離** - 各層の責務が明確
2. **依存性の注入** - テスト可能な設計
3. **ES6 Modules** - モダンなモジュール化
4. **DOM構築** - `textContent`でXSS対策
5. **イベント委譲** - パフォーマンス最適化
6. **不変性** - `toSorted()`の使用

### 改善が必要な点

1. **Repository層の責務違反** - フィルタリングロジックの混入
2. **Domain層の責務過剰** - フォーム変換の混入
3. **エラーハンドリング** - 一貫性の欠如
4. **View層の設計** - コールバック依存

---

## 🎯 優先度付き改善リスト

### 最優先（アーキテクチャの根幹）

1. Repository層からフィルタリングロジックを削除
2. Domain層からフォーム変換ロジックを削除
3. Repository層のsave/deleteメソッドを見直し

### 高優先度（保守性・テスタビリティ）

4. エラーハンドリングの統一
5. View層のイベント設計見直し
6. Service層の重複コード削除

### 中優先度（コード品質）

7. バリデーションの強化
8. 日付フォーマット処理の分離
9. App.jsのシンプル化

### 低優先度（クリーンアップ）

10. 空のutilsディレクトリ削除
11. alert依存の解消
12. toJSON()の命名見直し

---

## 💡 総評

このリファクタリング版は、オリジナル版と比較して大幅に改善されていますが、
**クリーンアーキテクチャの原則を完全には守れていません**。

特に以下の3点が重大な問題です：

1. **Repository層がビジネスロジックを持っている**
2. **Domain層がインフラ層（フォーム）を知っている**
3. **各層の責務が曖昧な部分がある**

30年のベテランプログラマーとしては、これらの問題を修正することで、
真の意味での「最高設計」に到達できると評価します。

現状は **70点** です。上記の改善を行えば **95点** になります。
