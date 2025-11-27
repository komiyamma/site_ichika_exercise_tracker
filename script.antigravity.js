/**
 * localStorage 内で使うキー名をまとめておく定数。
 * 同じ値をコードのあちこちに書かないことで、修正時のミスを防げます。
 * @type {string}
 */
const WORKOUT_STORAGE_KEY = 'ichikaWorkoutLogEntries';

/**
 * 1 件分の運動記録を表すオブジェクトの形をまとめて定義しておきます。
 * @typedef {Object} WorkoutEntry
 * @property {string} id 削除などで使う一意な ID（作成時刻のタイムスタンプを文字列化したもの）。
 * @property {string} date YYYY-MM-DD 形式の日付。
 * @property {string} type 実施したメニューの種別。
 * @property {number} minutes 所要時間（分）。未入力時は 0。
 * @property {number} value 回数や距離など、タイプに応じた値。未入力時は 0。
 * @property {string} note メモ欄の内容。空文字の場合もあります。
 * @property {number} createdAt 追加されたタイミングのタイムスタンプ（ミリ秒）。
 */

/**
 * 画面上の主な要素を保持する変数。
 */
let entryFormElement;
let listContainerElement; // Changed from entryListElement (table) to listContainerElement (div)
let totalCountDisplayElement; // New for the stats card
let totalMinutesDisplayElement; // New for the stats card
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
 * @returns {void}
 */
function initializePage() {
    assignElementReferences();
    attachEventListeners();
    dateInputElement.value = formatDateForInput(getTodayString());
    renderEntryList(); // Changed function name
}

/**
 * HTML から必要な要素を取得して、上部で宣言した変数に代入します。
 * @returns {void}
 */
function assignElementReferences() {
    entryFormElement = document.getElementById('entry-form');
    listContainerElement = document.getElementById('list-container');
    totalCountDisplayElement = document.getElementById('total-count-display');
    totalMinutesDisplayElement = document.getElementById('total-minutes-display');
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
 * @returns {void}
 */
function attachEventListeners() {
    entryFormElement.addEventListener('submit', handleFormSubmit);
    filterDateInputElement.addEventListener('change', renderEntryList);
    clearFilterButtonElement.addEventListener('click', handleFilterClearButtonClick);
    debugClearStorageButtonElement.addEventListener('click', handleDebugClearStorageClick);
}

// ===================================================================================
// イベントハンドラ (ユーザー操作への反応)
// ===================================================================================

/**
 * フォーム送信時の処理。
 * @param {SubmitEvent} event フォーム送信イベント。
 * @returns {void}
 */
function handleFormSubmit(event) {
    event.preventDefault();

    const timestamp = generateEntryId();

    /** @type {WorkoutEntry} */
    const entry = {
        id: String(timestamp),
        date: dateInputElement.value,
        type: typeInputElement.value,
        minutes: parseInt(minutesInputElement.value, 10) || 0,
        value: parseInt(valueInputElement.value, 10) || 0,
        note: noteInputElement.value.trim(),
        createdAt: timestamp
    };

    if (!entry.type || !entry.date) {
        alert('種類と日付は必須です。');
        return;
    }

    const entries = loadEntriesFromStorage();
    entries.push(entry);
    saveEntriesToStorage(entries);

    event.target.reset();
    dateInputElement.value = formatDateForInput(getTodayString());
    renderEntryList();
}

/**
 * 日付フィルターを解除するボタンの処理。
 * @returns {void}
 */
function handleFilterClearButtonClick() {
    filterDateInputElement.value = '';
    renderEntryList();
}

/**
 * localStorage のデータを全削除するデバッグボタンの処理。
 * @returns {void}
 */
function handleDebugClearStorageClick() {
    const message = 'localStorage の「このアプリ関連」の「記録データ全て」を削除します。よろしいですか？';
    if (!window.confirm(message)) {
        return;
    }

    localStorage.removeItem(WORKOUT_STORAGE_KEY);
    filterDateInputElement.value = '';
    renderEntryList();
    // window.alert('データを削除しました。'); // Removed alert for smoother UX
}

/**
 * 削除ボタンから呼び出され、対応するエントリーを削除します。
 * @param {string} entryId 削除したいエントリーの ID。
 * @returns {void}
 */
function removeButtonClick(entryId) {
    if (!entryId) {
        return;
    }
    // Confirm deletion
    if (!confirm('この記録を削除しますか？')) return;

    removeEntryById(entryId);
}

// ===================================================================================
// DOM描画 (画面の更新)
// ===================================================================================

/**
 * リスト表示を最新状態に更新します。
 * @returns {void}
 */
function renderEntryList() {
    const entries = loadEntriesFromStorage();
    const selectedDate = filterDateInputElement.value;

    let filteredEntries = entries;
    if (selectedDate) {
        filteredEntries = entries.filter(entry => entry.date === selectedDate);
    }

    filteredEntries.sort((a, b) => b.createdAt - a.createdAt);

    // Update stats
    const totalCount = filteredEntries.length;
    const totalMinutes = filteredEntries.reduce((sum, entry) => sum + (entry.minutes || 0), 0);

    if (totalCountDisplayElement) totalCountDisplayElement.textContent = String(totalCount);
    if (totalMinutesDisplayElement) totalMinutesDisplayElement.textContent = String(totalMinutes);

    if (filteredEntries.length === 0) {
        listContainerElement.innerHTML = `
            <div class="text-center p-5 text-muted animate-fade-in">
                <i class="bi bi-inbox fs-1 d-block mb-2 opacity-50"></i>
                <p>記録がありません。</p>
            </div>`;
        return;
    }

    let listHtml = '';
    for (const currentEntry of filteredEntries) {
        const { id, date, type, minutes, value, note } = currentEntry;

        // Determine badge class based on type
        let badgeClass = 'type-other';
        if (type.includes('ウォーキング')) badgeClass = 'type-walking';
        else if (type.includes('ランニング')) badgeClass = 'type-running';
        else if (type.includes('通学')) badgeClass = 'type-walking';
        else if (type.includes('筋トレ')) badgeClass = 'type-training';
        else if (type.includes('なわとび')) badgeClass = 'type-training';

        // Format date nicely (e.g., 2023-10-27 -> 10/27)
        const dateObj = new Date(date);
        const dateFormatted = `${dateObj.getMonth() + 1}/${dateObj.getDate()}`;

        listHtml += `
            <div class="list-group-item p-3 border-0 border-bottom workout-item animate-fade-in">
                <div class="d-flex justify-content-between align-items-center">
                    <div class="d-flex align-items-center gap-3">
                        <div class="text-center" style="min-width: 50px;">
                            <div class="small text-muted fw-bold">${dateFormatted}</div>
                        </div>
                        <div class="workout-details">
                            <div class="d-flex align-items-center gap-2 flex-wrap">
                                <span class="workout-type-badge ${badgeClass}">${escapeHtml(type)}</span>
                                ${minutes ? `<span class="small text-muted d-inline-flex align-items-center"><i class="bi bi-clock me-1"></i>${escapeHtml(minutes)} 分</span>` : ''}
                                ${value ? `<span class="small text-muted d-inline-flex align-items-center"><i class="bi bi-repeat me-1"></i>${escapeHtml(value)}</span>` : ''}
                            </div>
                            ${note ? `<div class="small text-muted"><i class="bi bi-chat-left-text me-1"></i>${escapeHtml(note)}</div>` : ''}
                        </div>
                    </div>
                    <button class="btn btn-icon btn-sm text-danger opacity-50 hover-opacity-100" onclick="removeButtonClick('${id}')" title="削除">
                        <i class="bi bi-trash"></i>
                    </button>
                </div>
            </div>
        `;
    }

    listContainerElement.innerHTML = listHtml;
}

// ===================================================================================
// データ操作 (データの読み書き)
// ===================================================================================

/**
 * ローカルストレージからすべての運動記録エントリを読み込みます。
 * @returns {WorkoutEntry[]}
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
 * @param {WorkoutEntry[]} entries
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
 * 指定された ID のエントリーを削除します。
 * @param {string} entryId
 * @returns {void}
 */
function removeEntryById(entryId) {
    const entries = loadEntriesFromStorage();
    const filteredEntries = entries.filter(entry => entry.id !== entryId);
    saveEntriesToStorage(filteredEntries);
    renderEntryList();
}

// ===================================================================================
// ユーティリティ / ヘルパー関数
// ===================================================================================

function padToTwoDigits(value) {
    return String(value).padStart(2, '0');
}

function formatDateForInput(value) {
    const year = value.slice(0, 4);
    const month = value.slice(4, 6);
    const day = value.slice(6, 8);
    return `${year}-${month}-${day}`;
}

function getTodayString() {
    const today = new Date();
    const year = today.getFullYear();
    const month = padToTwoDigits(today.getMonth() + 1);
    const day = padToTwoDigits(today.getDate());
    return `${year}${month}${day}`;
}

function generateEntryId() {
    return Date.now();
}

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

document.addEventListener('DOMContentLoaded', initializePage);
