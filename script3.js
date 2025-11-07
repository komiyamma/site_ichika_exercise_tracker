/**
 * localStorage 内で使うキー名をまとめておく定数。
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

// ===================================================================================
// データ操作 (Storage)
// localStorageとのやり取りに特化したオブジェクトを作成するファクトリ関数。
// ===================================================================================

/**
 * ストレージ操作用オブジェクトを作成します。
 * @param {string} storageKey localStorageで使うキー
 * @returns {{loadEntries: () => WorkoutEntry[], saveEntries: (entries: WorkoutEntry[]) => void, clear: () => void}}
 */
function createWorkoutStorage(storageKey) {
    return {
        /**
         * ローカルストレージからすべての運動記録エントリを読み込みます。
         * @returns {WorkoutEntry[]} 読み込んだ運動記録エントリの配列。ストレージに何もない場合や、データの読み込みに失敗した場合は空の配列。
         */
        loadEntries() {
            try {
                const entriesJson = localStorage.getItem(storageKey);
                return entriesJson ? JSON.parse(entriesJson) : [];
            } catch (e) {
                console.error('ストレージからのデータ読み込みに失敗しました:', e);
                return [];
            }
        },

        /**
         * 指定された運動記録エントリの配列をローカルストレージに保存します。
         * @param {WorkoutEntry[]} entries - 保存する運動記録エントリの配列。
         */
        saveEntries(entries) {
            try {
                const entriesJson = JSON.stringify(entries);
                localStorage.setItem(storageKey, entriesJson);
            } catch (e) {
                console.error('ストレージへのデータ保存に失敗しました:', e);
            }
        },

        /**
         * ストレージを空にします。
         */
        clear() {
            localStorage.removeItem(storageKey);
        }
    };
}

// ===================================================================================
// アプリケーションロジック (ドメイン)
// DOMやストレージから独立した、アプリケーションの中心的なロジックを担うオブジェクト。
// ===================================================================================

/**
 * アプリケーションロジックを管理するオブジェクトを作成します。
 * @param {ReturnType<typeof createWorkoutStorage>} storage データの永続化を担当するストレージオブジェクト
 * @returns {{addEntry: (entryData: Omit<WorkoutEntry, 'id' | 'createdAt'>) => {success: boolean, message: string}, removeEntry: (entryId: string) => void, getFilteredEntries: (filterDate: string) => WorkoutEntry[], clearAllEntries: () => void}}
 */
function createWorkoutApp(storage) {
    let entries = storage.loadEntries();

    /**
     * エントリーを区別するための一意な ID を作成します。
     * Date.now() はミリ秒単位で変化するため、同じ値になる可能性が極めて低いです。
     * @returns {number} 作成時刻のタイムスタンプ。
     */
    function generateEntryId() {
        return Date.now();
    }

    const app = {
        /**
         * 新しいエントリーを追加します。
         * @param {Omit<WorkoutEntry, 'id' | 'createdAt'>} entryData
         * @returns {{success: boolean, message: string}}
         */
        addEntry(entryData) {
            if (!entryData.type || !entryData.date) {
                return { success: false, message: '種類と日付は必須.' };
            }
            const timestamp = generateEntryId();
            const newEntry = {
                ...entryData,
                id: String(timestamp),
                createdAt: timestamp,
            };
            entries.push(newEntry);
            storage.saveEntries(entries);
            return { success: true, message: '' };
        },

        /**
         * IDを指定してエントリーを削除します。
         * @param {string} entryId
         */
        removeEntry(entryId) {
            entries = entries.filter(entry => entry.id !== entryId);
            storage.saveEntries(entries);
        },

        /**
         * フィルタリングとソートを適用したエントリーのリストを取得します。
         * @param {string} filterDate YYYY-MM-DD形式の日付フィルター
         * @returns {WorkoutEntry[]}
         */
        getFilteredEntries(filterDate) {
            let filtered = entries;
            if (filterDate) {
                filtered = entries.filter(entry => entry.date === filterDate);
            }
            return filtered.sort((a, b) => b.createdAt - a.createdAt);
        },

        /**
         * すべてのデータを削除します。
         */
        clearAllEntries() {
            entries = [];
            storage.clear();
        }
    };

    return app;
}

// ===================================================================================
// UI / DOM操作 (ビュー)
// ユーザーインターフェースの描画とイベント処理に責任を持つオブジェクト。
// ===================================================================================

/**
 * UI操作を管理するオブジェクトを作成します。
 * @param {ReturnType<typeof createWorkoutApp>} app アプリケーションロジックのオブジェクト
 * @param {Object} elements DOM要素のマップ
 * @param {Function} confirmFn 確認ダイアログを表示する関数
 * @param {Function} alertFn アラートを表示する関数
 * @returns {{initialize: () => void}}
 */
function createWorkoutUI(app, elements, confirmFn = window.confirm, alertFn = window.alert) {

    // --- UI内部でのみ使うヘルパー関数 ---
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
     * innerHTML に入れる前に危険な文字をエスケープします。
     * @param {string|number} value 表示したい内容。
     * @returns {string} HTML エスケープ済みの文字列。
     */
    function escapeHtml(value) {
        if (value === undefined || value === null) return '';
        return String(value).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#39;');
    }
    // ---

    const ui = {
        /**
         * フォーム送信時の処理。
         * 入力値を集めてエントリーを作成し、一覧を更新します。
         * @param {SubmitEvent} event フォーム送信イベント。
         */
        handleFormSubmit(event) {
            event.preventDefault();
            const form = event.target;

            const entryData = {
                date: elements.dateInput.value,
                type: elements.typeInput.value,
                minutes: parseInt(elements.minutesInput.value, 10) || 0,
                value: parseInt(elements.valueInput.value, 10) || 0,
                note: elements.noteInput.value.trim(),
            };

            const result = app.addEntry(entryData);

            if (result.success) {
                form.reset();
                elements.dateInput.value = formatDateForInput(getTodayString());
                ui.render();
            } else {
                alertFn(result.message);
            }
        },

        /**
         * 日付フィルターを解除するボタンの処理。
         * 入力欄を空に戻して、全てのエントリーを再表示します。
         */
        handleFilterClear() {
            elements.filterDateInput.value = '';
            ui.render();
        },

        /**
         * localStorage のデータを全削除するデバッグボタンの処理。
         * 間違って押してしまったときのために確認ダイアログを表示しています。
         */
        handleDebugClearStorage() {
            const message = 'localStorage の「このアプリ関連」の「記録データ全て」を削除します。よろしいですか？';
            if (!confirmFn(message)) {
                return;
            }
            app.clearAllEntries();
            elements.filterDateInput.value = '';
            ui.render();
            alertFn('データを削除しました。');
        },

        /**
         * エントリーリストのクリックイベントを処理します（イベント委譲）。
         * 削除ボタンがクリックされた場合、対応するエントリーを削除します。
         * @param {MouseEvent} event
         */
        handleListClick(event) {
            const deleteButton = event.target.closest('.delete-button');
            if (deleteButton) {
                const entryId = deleteButton.dataset.id;
                if (entryId) {
                    app.removeEntry(entryId);
                    ui.render();
                }
            }
        },

        /**
         * テーブル表示を最新状態に更新します。
         * フィルターの日付が入力されていればその日だけを表示し、作成日時の新しい順に並べます。
         */
        render() {
            const selectedDate = elements.filterDateInput.value;
            const filteredEntries = app.getFilteredEntries(selectedDate);

            elements.totalCount.textContent = String(filteredEntries.length);

            let tableHtml = '';
            for (const entry of filteredEntries) {
                tableHtml += `<tr>
                    <td>${escapeHtml(entry.date)}</td>
                    <td>${escapeHtml(entry.type)}</td>
                    <td class="text-end">${escapeHtml(entry.minutes || '')}</td>
                    <td class="text-end">${escapeHtml(entry.value || '')}</td>
                    <td>${escapeHtml(entry.note || '')}</td>
                    <td class="text-end">
                        <button class="delete-button btn btn-sm btn-outline-danger" data-id="${entry.id}">Delete</button>
                    </td>
                </tr>`;
            }
            elements.entryList.innerHTML = tableHtml;
        },

        /**
         * ページ読み込み完了後に一度だけ実行する初期化処理です。
         * DOM 要素の取得、イベント設定、日付初期値の設定、一覧描画をまとめています。
         */
        initialize() {
            elements.entryForm.addEventListener('submit', ui.handleFormSubmit);
            elements.filterDateInput.addEventListener('change', ui.render);
            elements.clearFilterButton.addEventListener('click', ui.handleFilterClear);
            elements.debugClearStorageButton.addEventListener('click', ui.handleDebugClearStorage);
            elements.entryList.addEventListener('click', ui.handleListClick);

            elements.dateInput.value = formatDateForInput(getTodayString());
            ui.render();
        }
    };

    return ui;
}

// ===================================================================================
// アプリケーションの起動
// ===================================================================================

/**
 * ページの HTML が全て読み込まれたタイミングで初期化処理を呼び出します。
 */
document.addEventListener('DOMContentLoaded', () => {
    // 1. 依存関係を解決（オブジェクトを作成）
    const storage = createWorkoutStorage(WORKOUT_STORAGE_KEY);
    const app = createWorkoutApp(storage);

    // 2. DOM要素を一度だけ取得
    const elements = {
        entryForm: document.getElementById('entry-form'),
        entryList: document.getElementById('list'),
        totalCount: document.getElementById('total-count'),
        filterDateInput: document.getElementById('filter-date'),
        clearFilterButton: document.getElementById('clear-filter'),
        debugClearStorageButton: document.getElementById('debug-clear-storage'),
        dateInput: document.getElementById('date'),
        typeInput: document.getElementById('type'),
        minutesInput: document.getElementById('minutes'),
        valueInput: document.getElementById('value'),
        noteInput: document.getElementById('note'),
    };

    // 3. UIを初期化
    const ui = createWorkoutUI(app, elements, window.confirm, window.alert);
    ui.initialize();
});