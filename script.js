/**
 * localStorage 内で使うキー名をまとめておく定数。
 * 同じ値をコードのあちこちに書かないことで、修正時のミスを防げます。
 * @type {string}
 */
const WORKOUT_STORAGE_KEY = 'ichikaWorkoutLogEntries';

/**
 * 1 件分の運動記録を表すオブジェクトの形をまとめて定義しておきます。
 * 項目の意味を再確認したいときにここを見るだけで済むようにしています。
 * @typedef {Object} WorkoutEntry
 * @property {string} id 削除などで使う一意な ID。
 * @property {string} date YYYY-MM-DD 形式の日付。
 * @property {string} type 実施したメニューの種別。
 * @property {number} minutes 所要時間（分）。未入力時は 0。
 * @property {number} value 回数や距離など、タイプに応じた値。未入力時は 0。
 * @property {string} note メモ欄の内容。空文字の場合もあります。
 * @property {number} createdAt 追加されたタイミングのタイムスタンプ（ミリ秒）。
 */

/**
 * 画面上の主な要素を保持する変数。
 * ページが読み込まれた後に実際の DOM 要素を代入します。
 * 再検索を繰り返さなくて済むので、コードが読みやすくなります。
 */
let entryFormElement;
let entryListElement;
let totalCountElement;
let filterDateInputElement;
let clearFilterButtonElement;
let debugClearStorageButtonElement;
let dateInputElement;
let typeInputElement;
let minutesInputElement;
let valueInputElement;
let noteInputElement;

// ===================================================================================
// 初期化・エントリーポイント (処理の起点)
// ===================================================================================

/**
 * ページ読み込み完了後に一度だけ実行する初期化処理です。
 * DOM 要素の取得、イベント設定、日付初期値の設定、一覧描画をまとめています。
 * @returns {void}
 */
function initializePage() {
    assignElementReferences();
    attachEventListeners();
    dateInputElement.value = formatDateForInput(getTodayString());
    renderEntryTable();
}

/**
 * HTML から必要な要素を取得して、上部で宣言した変数に代入します。
 * こうすることで他の関数から同じ要素を簡単に参照できます。
 * @returns {void}
 */
function assignElementReferences() {
    entryFormElement = document.getElementById('entry-form');
    entryListElement = document.getElementById('list');
    totalCountElement = document.getElementById('total-count');
    filterDateInputElement = document.getElementById('filter-date');
    clearFilterButtonElement = document.getElementById('clear-filter');
    debugClearStorageButtonElement = document.getElementById('debug-clear-storage');
    dateInputElement = document.getElementById('date');
    typeInputElement = document.getElementById('type');
    minutesInputElement = document.getElementById('minutes');
    valueInputElement = document.getElementById('value');
    noteInputElement = document.getElementById('note');
}

/**
 * ボタンやフォームにイベントリスナーを登録します。
 * イベントが発生したときにどの関数を呼び出すかをここでまとめて管理します。
 * @returns {void}
 */
function attachEventListeners() {
    entryFormElement.addEventListener('submit', handleFormSubmit);
    filterDateInputElement.addEventListener('change', renderEntryTable);
    clearFilterButtonElement.addEventListener('click', handleFilterClearButtonClick);
    debugClearStorageButtonElement.addEventListener('click', handleDebugClearStorageClick);
}

// ===================================================================================
// イベントハンドラ (ユーザー操作への反応)
// ===================================================================================

/**
 * フォーム送信時の処理。
 * 入力値を集めてエントリーを作成し、localStorage に保存して一覧を更新します。
 * @param {SubmitEvent} event フォーム送信イベント。
 * @returns {void}
 */
function handleFormSubmit(event) {
    event.preventDefault();

    /** @type {WorkoutEntry} */
    const entry = {
        id: generateEntryId(),
        date: dateInputElement.value,
        type: typeInputElement.value,
        minutes: parseInt(minutesInputElement.value, 10) || 0,
        value: parseInt(valueInputElement.value, 10) || 0,
        note: noteInputElement.value.trim(),
        createdAt: Date.now()
    };

    if (!entry.type || !entry.date) {
        alert('種類と日付は必須.');
        return;
    }

    const entries = loadEntriesFromStorage();
    entries.push(entry);
    saveEntriesToStorage(entries);

    event.target.reset();
    dateInputElement.value = formatDateForInput(getTodayString());
    renderEntryTable();
}

/**
 * 日付フィルターを解除するボタンの処理。
 * 入力欄を空に戻して、全てのエントリーを再表示します。
 * @returns {void}
 */
function handleFilterClearButtonClick() {
    filterDateInputElement.value = '';
    renderEntryTable();
}

/**
 * localStorage のデータを全削除するデバッグボタンの処理。
 * 間違って押してしまったときのために確認ダイアログを表示しています。
 * @returns {void}
 */
function handleDebugClearStorageClick() {
    const message = 'localStorage の「このアプリ関連」の「記録データ全て」を削除します。よろしいですか？';
    if (!window.confirm(message)) {
        return;
    }

    localStorage.removeItem(WORKOUT_STORAGE_KEY);
    filterDateInputElement.value = '';
    renderEntryTable();
    window.alert('データを削除しました。');
}

/**
 * 削除ボタンから呼び出され、対応するエントリーを削除します。
 * ボタンの HTML で `onclick="removeButtonClick('id')"` のように利用します。
 * @param {string} entryId 削除したいエントリーの ID。
 * @returns {void}
 */
function removeButtonClick(entryId) {
    if (!entryId) {
        return;
    }
    removeEntryById(entryId);
}

// ===================================================================================
// DOM描画 (画面の更新)
// ===================================================================================

/**
 * テーブル表示を最新状態に更新します。
 * フィルターの日付が入力されていればその日だけを表示し、作成日時の新しい順に並べます。
 * @returns {void}
 */
function renderEntryTable() {
    const entries = loadEntriesFromStorage();
    const selectedDate = filterDateInputElement.value;
    // 日付が指定されていれば一致するものだけ抽出、空ならそのまま全件を使う
    let filteredEntries = entries;
    if (selectedDate) {
        filteredEntries = entries.filter(entry => entry.date === selectedDate);
    }

    filteredEntries.sort((a, b) =>  b.createdAt - a.createdAt);

    totalCountElement.textContent = String(filteredEntries.length);

    let tableHtml = '';
    for (const currentEntry of filteredEntries) {
        const { id, date, type, minutes, value, note} = currentEntry;
        // 1行ずつ HTML を組み立てる（Delete ボタンには data-id を付与）
        tableHtml +=
            `<tr>
                <td>${escapeHtml(date)}</td>
                <td>${escapeHtml(type)}</td>
                <td class="text-end">${escapeHtml(minutes || '')}</td>
                <td class="text-end">${escapeHtml(value || '')}</td>
                <td>${escapeHtml(note || '')}</td>
                <td class="text-end">
                    <button class="delete-button btn btn-sm btn-outline-danger" data-id="${id}" onclick="removeButtonClick('${id}')">Delete</button>
                </td>
            </tr>`;
    }

    entryListElement.innerHTML = tableHtml;
}

// ===================================================================================
// データ操作 (データの読み書き)
// ===================================================================================

/**
 * ローカルストレージからすべての運動記録エントリを読み込みます。
 * @returns {ExerciseEntry[]} 読み込んだ運動記録エントリの配列。ストレージに何もない場合や、データの読み込みに失敗した場合は空の配列。
 */
function loadEntriesFromStorage() {
    try {
        const entriesJson = localStorage.getItem(WORKOUT_STORAGE_KEY);
        return entriesJson ? JSON.parse(entriesJson) : [];
    } catch (e) {
        console.error('ストレージからのデータ読み込みに失敗しました:', e);
        return [];
    }
}

/**
 * 指定された運動記録エントリの配列をローカルストレージに保存します。
 * @param {ExerciseEntry[]} entries - 保存する運動記録エントリの配列。
 */
function saveEntriesToStorage(entries) {
    try {
        const entriesJson = JSON.stringify(entries);
        localStorage.setItem(WORKOUT_STORAGE_KEY, entriesJson);
    } catch (e) {
        console.error('ストレージへのデータ保存に失敗しました:', e);
    }
}

/**
 * 指定された ID のエントリーを localStorage から削除し、一覧を更新します。
 * @param {string} entryId 削除したいエントリーの ID。
 * @returns {void}
 */
function removeEntryById(entryId) {
    const entries = loadEntriesFromStorage();
    const filteredEntries = entries.filter(entry => entry.id !== entryId);
    saveEntriesToStorage(filteredEntries);
    renderEntryTable();
}

// ===================================================================================
// ユーティリティ / ヘルパー関数 (便利ツール)
// ===================================================================================

/**
 * 数値を必ず 2 桁の文字列にそろえます。
 * 例: 3 -> "03" / 12 -> "12"
 * @param {number|string} value 2 桁に整形したい値。
 * @returns {string} 2 桁の文字列。
 */
function padToTwoDigits(value) {
    return String(value).padStart(2, '0');
}

/**
 * YYYYMMDD 形式の文字列を、input[type="date"] 用の YYYY-MM-DD に変換します。
 * @param {string} value 8 桁の日付文字列 (例: "20240131")。
 * @returns {string} HTML の日付入力に使える形式の文字列。
 */
function formatDateForInput(value) {
    const year = value.slice(0, 4);
    const month = value.slice(4, 6);
    const day = value.slice(6, 8);
    return `${year}-${month}-${day}`;
}

/**
 * 今日の日付を YYYYMMDD の文字列で取得します。
 * @returns {string} 現在の日付を表す 8 桁の文字列。
 */
function getTodayString() {
    const today = new Date();
    const year = today.getFullYear();
    const month = padToTwoDigits(today.getMonth() + 1);
    const day = padToTwoDigits(today.getDate());
    return `${year}${month}${day}`;
}

/**
 * エントリーを区別するための一意な ID を作成します。
 * Date.now() はミリ秒単位で変化するため、同じ値になる可能性が極めて低いです。
 * @returns {string} 新しいエントリー ID。
 */
function generateEntryId() {
    return String(Date.now());
}

/**
 * innerHTML に入れる前に危険な文字をエスケープします。
 * @param {string|number} value 表示したい内容。
 * @returns {string} HTML エスケープ済みの文字列。
 */
function escapeHtml(value) {
    if (value === undefined || value === null) {
        return '';
    }

    return String(value)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#39;');
}

// ===================================================================================
// アプリケーションの起動
// ===================================================================================

/**
 * ページの HTML が全て読み込まれたタイミングで初期化処理を呼び出します。
 */
document.addEventListener('DOMContentLoaded', initializePage);