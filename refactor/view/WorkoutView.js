import { escapeHtml } from '../utils/htmlUtils.js';

/**
 * 運動記録のビュー層（画面表示）
 */
export class WorkoutView {
  constructor() {
    this.elements = this.#initializeElements();
  }

  /**
   * DOM要素を取得して保持
   */
  #initializeElements() {
    return {
      form: document.getElementById('entry-form'),
      list: document.getElementById('list'),
      totalCount: document.getElementById('total-count'),
      filterDate: document.getElementById('filter-date'),
      clearFilter: document.getElementById('clear-filter'),
      debugClear: document.getElementById('debug-clear-storage'),
      inputs: {
        date: document.getElementById('date'),
        type: document.getElementById('type'),
        minutes: document.getElementById('minutes'),
        value: document.getElementById('value'),
        note: document.getElementById('note'),
      },
    };
  }

  /**
   * フォームデータを取得
   * @returns {Object}
   */
  getFormData() {
    const { date, type, minutes, value, note } = this.elements.inputs;
    return {
      date: date.value,
      type: type.value,
      minutes: minutes.value,
      value: value.value,
      note: note.value,
    };
  }

  /**
   * フィルター日付を取得
   * @returns {string}
   */
  getFilterDate() {
    return this.elements.filterDate.value;
  }

  /**
   * 日付入力欄に値を設定
   * @param {string} date - YYYY-MM-DD形式
   */
  setDateInput(date) {
    this.elements.inputs.date.value = date;
  }

  /**
   * フォームをリセット
   */
  resetForm() {
    this.elements.form.reset();
  }

  /**
   * フィルターをクリア
   */
  clearFilter() {
    this.elements.filterDate.value = '';
  }

  /**
   * エントリ一覧を描画
   * @param {WorkoutEntry[]} entries
   */
  renderEntries(entries) {
    this.elements.totalCount.textContent = String(entries.length);

    // 既存の行をクリア
    this.elements.list.replaceChildren();

    if (entries.length === 0) {
      const row = this.#createEmptyRow();
      this.elements.list.appendChild(row);
      return;
    }

    // DocumentFragmentで一括追加（パフォーマンス最適化）
    const fragment = document.createDocumentFragment();
    for (const entry of entries) {
      const row = this.#createEntryRow(entry);
      fragment.appendChild(row);
    }
    this.elements.list.appendChild(fragment);
  }

  /**
   * 空の行を作成
   * @returns {HTMLTableRowElement}
   */
  #createEmptyRow() {
    const row = document.createElement('tr');
    const cell = document.createElement('td');
    cell.colSpan = 6;
    cell.className = 'text-center text-muted';
    cell.textContent = '記録がありません';
    row.appendChild(cell);
    return row;
  }

  /**
   * エントリ行のDOM要素を生成
   * @param {WorkoutEntry} entry
   * @returns {HTMLTableRowElement}
   */
  #createEntryRow(entry) {
    const row = document.createElement('tr');

    // 日付
    const dateCell = document.createElement('td');
    dateCell.textContent = entry.date;
    row.appendChild(dateCell);

    // 種目
    const typeCell = document.createElement('td');
    typeCell.textContent = entry.type;
    row.appendChild(typeCell);

    // 時間
    const minutesCell = document.createElement('td');
    minutesCell.className = 'text-end';
    minutesCell.textContent = entry.minutes || '';
    row.appendChild(minutesCell);

    // 回数/距離
    const valueCell = document.createElement('td');
    valueCell.className = 'text-end';
    valueCell.textContent = entry.value || '';
    row.appendChild(valueCell);

    // メモ
    const noteCell = document.createElement('td');
    noteCell.textContent = entry.note || '';
    row.appendChild(noteCell);

    // 削除ボタン
    const actionCell = document.createElement('td');
    actionCell.className = 'text-end';
    const deleteButton = document.createElement('button');
    deleteButton.className = 'btn btn-sm btn-outline-danger';
    deleteButton.dataset.id = entry.id;
    deleteButton.dataset.action = 'delete';
    deleteButton.textContent = 'Delete';
    actionCell.appendChild(deleteButton);
    row.appendChild(actionCell);

    return row;
  }

  /**
   * イベントリスナーを登録
   * @param {Object} handlers
   */
  attachEventListeners(handlers) {
    // フォーム送信
    this.elements.form.addEventListener('submit', (e) => {
      e.preventDefault();
      handlers.onSubmit?.();
    });

    // フィルター変更
    this.elements.filterDate.addEventListener('change', () => {
      handlers.onFilterChange?.();
    });

    // フィルタークリア
    this.elements.clearFilter.addEventListener('click', () => {
      handlers.onClearFilter?.();
    });

    // デバッグ：全削除
    this.elements.debugClear.addEventListener('click', () => {
      handlers.onDebugClear?.();
    });

    // 削除ボタン（イベント委譲）
    this.elements.list.addEventListener('click', (e) => {
      const button = e.target.closest('[data-action="delete"]');
      if (button) {
        const id = button.dataset.id;
        handlers.onDelete?.(id);
      }
    });
  }

  /**
   * エラーメッセージを表示
   * @param {string} message
   */
  showError(message) {
    alert(message);
  }

  /**
   * 確認ダイアログを表示
   * @param {string} message
   * @returns {boolean}
   */
  confirm(message) {
    return window.confirm(message);
  }

  /**
   * 情報メッセージを表示
   * @param {string} message
   */
  showInfo(message) {
    alert(message);
  }
}
