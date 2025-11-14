# テストガイド

このReactアプリケーションのテストについての説明です。

## テスト環境

- **テストフレームワーク**: Vitest
- **テストライブラリ**: React Testing Library
- **DOM環境**: jsdom

## セットアップ

テストに必要な依存関係をインストールします：

```bash
npm install
```

## テストの実行

### 全テストを実行
```bash
npm test
```

### UIモードでテストを実行（推奨）
```bash
npm run test:ui
```

ブラウザでテスト結果を視覚的に確認できます。

### カバレッジレポートを生成
```bash
npm run test:coverage
```

## テストファイルの構成

```
react/src/
├── test/
│   └── setup.ts                    # テストのセットアップファイル
├── storage/
│   ├── localStorage.ts
│   └── localStorage.test.ts        # localStorageのテスト
├── date/
│   ├── formatter.ts
│   └── formatter.test.ts           # 日付フォーマット関数のテスト
├── components/
│   ├── WorkoutForm.tsx
│   ├── WorkoutForm.test.tsx        # フォームコンポーネントのテスト
│   ├── WorkoutTable.tsx
│   ├── WorkoutTable.test.tsx       # テーブルコンポーネントのテスト
│   ├── FilterControls.tsx
│   ├── FilterControls.test.tsx     # フィルターコンポーネントのテスト
│   ├── DebugControls.tsx
│   └── DebugControls.test.tsx      # デバッグコンポーネントのテスト
├── App.tsx
└── App.test.tsx                    # 統合テスト
```

## テストの内容

### 1. localStorage関数のテスト (`localStorage.test.js`)
- データの読み込み
- データの保存
- データの削除
- エラーハンドリング

### 2. 日付フォーマット関数のテスト (`formatter.test.js`)
- 今日の日付の取得
- 日付のフォーマット（YYYY-MM-DD）
- 0埋め処理

### 3. WorkoutFormコンポーネントのテスト (`WorkoutForm.test.jsx`)
- フォームのレンダリング
- 初期値の設定
- バリデーション
- データの送信
- フォームのリセット

### 4. WorkoutTableコンポーネントのテスト (`WorkoutTable.test.jsx`)
- エントリーの表示
- ソート機能
- フィルター機能
- 削除機能
- 空の状態の表示

### 5. App統合テスト (`App.test.jsx`)
- アプリ全体の動作
- 記録の追加・削除
- フィルター機能
- localStorageとの連携
- 全データ削除

## テストのベストプラクティス

### 1. ユーザーの視点でテストを書く
```javascript
// ❌ 実装の詳細に依存
expect(component.state.entries).toHaveLength(1);

// ✅ ユーザーが見るものをテスト
expect(screen.getByText('ランニング')).toBeInTheDocument();
```

### 2. アクセシビリティを意識する
```javascript
// ラベルでフォーム要素を取得
screen.getByLabelText(/種目/);

// ロールでボタンを取得
screen.getByRole('button', { name: /追加する/ });
```

### 3. 非同期処理を適切に扱う
```javascript
// waitForを使って非同期処理を待つ
await waitFor(() => {
  expect(screen.getByText('ランニング')).toBeInTheDocument();
});
```

### 4. テストの独立性を保つ
```javascript
beforeEach(() => {
  // 各テスト前にlocalStorageをクリア
  localStorage.clear();
});
```

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

3. **特定のテストのみ実行**
   ```bash
   npm test -- WorkoutForm.test.jsx
   ```

### よくあるエラー

#### `ReferenceError: localStorage is not defined`
→ `vite.config.js`で`environment: 'jsdom'`が設定されているか確認

#### `Cannot find module '@testing-library/react'`
→ 依存関係をインストール: `npm install`

## 参考リンク

- [Vitest公式ドキュメント](https://vitest.dev/)
- [React Testing Library公式ドキュメント](https://testing-library.com/react)
- [Testing Library クエリの優先順位](https://testing-library.com/docs/queries/about/#priority)
