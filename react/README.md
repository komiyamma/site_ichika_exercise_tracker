# 毎日の運動トラッカー（React版）

このプロジェクトは、ルートディレクトリにある `index.html` + `script.js` のバニラJavaScript実装を、React + Viteで再実装したものです。

## 概要

元のバニラJS版と**完全に同じ機能**を提供します：

- ✅ 運動記録の追加（種目、日付、時間、回数/距離、メモ）
- ✅ 記録の一覧表示（新しい順にソート）
- ✅ 日付によるフィルタリング
- ✅ 個別記録の削除
- ✅ 全データ削除（デバッグ機能）
- ✅ localStorageでのデータ永続化

## データ互換性

localStorageのキー名（`ichikaWorkoutLogEntries`）とデータ構造は元の実装と完全に同一です。
そのため、バニラJS版とReact版でデータを共有できます。

## 技術スタック

- **React 19** - UIライブラリ
- **TypeScript** - 型安全性
- **Vite** - ビルドツール
- **Vitest** - テストフレームワーク
- **React Testing Library** - コンポーネントテスト
- **バニラCSS** - スタイリング（元の実装と同じスタイル）

## プロジェクト構成

```
react/
├── src/
│   ├── components/          # Reactコンポーネント
│   │   ├── WorkoutForm.tsx      # 記録入力フォーム
│   │   ├── FilterControls.tsx   # フィルタリング操作
│   │   ├── WorkoutTable.tsx     # 記録一覧テーブル
│   │   └── DebugControls.tsx    # デバッグ操作
│   ├── hooks/               # カスタムフック
│   │   └── useLocalStorage.ts   # localStorage同期フック
│   ├── storage/             # データ永続化
│   │   └── localStorage.ts      # localStorage操作
│   ├── date/                # 日付処理
│   │   └── formatter.ts         # 日付フォーマット関数
│   ├── constants/           # 定数定義
│   │   └── workoutTypes.ts      # 運動種目の定数
│   ├── types/               # 型定義
│   │   └── workout.ts           # WorkoutEntry型
│   ├── App.tsx              # メインアプリケーション
│   ├── App.css              # スタイル（元の実装と同じ）
│   └── main.tsx             # エントリーポイント
├── index.html               # HTMLテンプレート
└── package.json             # 依存関係
```

## セットアップ

```bash
# 依存関係のインストール
npm install

# 開発サーバーの起動
npm run dev

# 本番ビルド
npm run build

# ビルドのプレビュー
npm run preview
```

## 開発サーバー

開発サーバーを起動すると、通常 http://localhost:5173/ でアクセスできます。
（ポートが使用中の場合は自動的に別のポートが割り当てられます）

## 元の実装との違い

### 構造的な違い

| 項目 | バニラJS版 | React版 |
|------|-----------|---------|
| DOM操作 | 直接操作（getElementById等） | 宣言的UI（JSX） |
| 状態管理 | グローバル変数 | React state |
| イベント処理 | addEventListener | JSXイベントハンドラ |
| レンダリング | innerHTML直接操作 | Reactの仮想DOM |

### 保持される要素

- UI/UXは完全に同一
- CSSスタイルも同一
- 全ての機能が同じ動作
- データ構造とlocalStorageキーも同一

## ライセンス

元の実装と同じライセンスが適用されます。
