# これは教育教材リポジトリです

（別リポジトリへの投稿データ用です）

## 簡易 index.html

- https://komiyamma.github.io/site_ichika_exercise_tracker/index.html

<img src="ichika_exercise_tracker_character_base.png" width="300"/>

## Bootstrap 版 index.bootstrap.html

- https://komiyamma.github.io/site_ichika_exercise_tracker/index.bootstrap.html

<img src="ichika_exercise_tracker_character_bootstrap.png" width="800"/>


## この解説で登場させる予定の中核キャラクター
<img src="ichika_exercise_tracker_character_image.png" alt="Ichika Exercise Tracker Character Image" width="200"/>

---

# 毎日の運動トラッカー

こんにちは！ この「毎日の運動トラッカー」は、JavaScriptとlocalStorage（Webブラウザの保存機能）だけで作った、シンプルなアプリです。
`index.html` や `index.bootstrap.html` をブラウザで開くとすぐに使えます。

## このアプリでできること

* **日々の運動を記録**
    * 種目、日付、時間、回数や距離、短いメモを残せます。
* **記録した内容を一覧表示**
    * テーブル形式で見やすく表示します。
* **日付での絞り込み**
    * 「あの日の運動、何したっけ？」と思い出すのに便利です。
* **記録の削除**
    * 間違えて入力しても大丈夫！

## 2つのHTMLファイルについて

このプロジェクトには `index.html` と `index.bootstrap.html` の2つのファイルがあります。

* **`index.html`**
    * こちらは[Bootstrap](https://getbootstrap.jp/)という、見た目をキレイに整えるための「ライブラリ」を使っています。
    * 多くのWebサイトで使われているので、どんなものか見てみるのも面白いですよ。
* **`index.bootstrap.html`**
    * こちらはBootstrapを使わず、HTMLと少しのCSSだけで作られています。
    * JavaScriptの動きだけに集中したいときは、こちらを見るとコードがシンプルで分かりやすいです。

**`script.js`はどちらのHTMLからも共通で使われています。**
見た目が違っても、裏側で動いているJavaScriptは同じ、ということを体験してみてください。

## JavaScript学習のヒント

`script.js` の中には、あなたが最近覚えた `map` や `filter` と似たような考え方を使うコードがたくさんあります。

* **`loadEntriesFromStorage()`** と **`saveEntriesToStorage()`**
    * localStorageは文字列しか保存できません。
    * でも、アプリの中ではデータを「オブジェクトの配列」として扱いたい...
    * この2つの関数が、`JSON.stringify` と `JSON.parse` を使って、文字列とオブジェクトの「変換」をしています。
    * これは `map` が配列の各要素を別の形に「変換」するのと、少し似ているかも？

* **`renderEntryTable()`**
    * この関数の中では、`for...of` ループを使って、記録されたデータ（`entries`）を1つずつ取り出し、HTMLのテーブルの行（`<tr>`）に変換しています。
    * もし `map` を使って書くとどうなるか、想像してみるのも良い練習になります。
    * さらに、日付での絞り込み機能では、`filter` と同じように「条件に合うものだけを選ぶ」という処理をしています。
        * `if (!selectedDate || entry.date === selectedDate)` の部分が、その条件を決めている場所です。

* **`removeEntryById()`**
    * ここでは `filter` を使って、「指定されたID以外のもの」という条件で新しい配列を作っています。
    * まさに `filter` の使いどころですね！

---
