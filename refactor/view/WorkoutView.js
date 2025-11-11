import { NotificationService } from './NotificationService.js';

/**
 * 運動記録のビュー層（画面表示）
 */
export class WorkoutView extends EventTarget {
  constructor(notificationService = new NotificationService()) {
    super();
    this.notification = notificationService;
    this.elements = this.#initializeElements();
    this.#attachDOMListeners();
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

    // データセルの定義
    const cells = [
      { text: entry.date },
      { text: entry.type },
      { text: entry.minutes || '', className: 'text-end' },
      { text: entry.value || '', className: 'text-end' },
      { text: entry.note || '' },
    ];

    // セルを一括生成
    cells.forEach(({ text, className }) => {
      const cell = document.createElement('td');
      cell.textContent = text;
      if (className) cell.className = className;
      row.appendChild(cell);
    });

    // アクションセル（削除ボタン）
    row.appendChild(this.#createActionCell(entry.id));

    return row;
  }

  /**
   * アクションセル（削除ボタン）を生成
   * @param {string} id
   * @returns {HTMLTableCellElement}
   */
  #createActionCell(id) {
    const cell = document.createElement('td');
    cell.className = 'text-end';

    const button = document.createElement('button');
    button.className = 'btn btn-sm btn-outline-danger';
    button.dataset.id = id;
    button.dataset.action = 'delete';
    button.textContent = 'Delete';

    cell.appendChild(button);
    return cell;
  }

  /**
   * DOMイベントリスナーを登録（内部用）
   */
  #attachDOMListeners() {
    // フォーム送信
    this.elements.form.addEventListener('submit', (e) => {
      e.preventDefault();
      this.dispatchEvent(new CustomEvent('submit', {
        detail: this.getFormData(),
      }));
    });

    // フィルター変更
    this.elements.filterDate.addEventListener('change', () => {
      this.dispatchEvent(new CustomEvent('filterChange', {
        detail: this.getFilterDate(),
      }));
    });

    // フィルタークリア
    this.elements.clearFilter.addEventListener('click', () => {
      this.dispatchEvent(new Event('clearFilter'));
    });

    // デバッグ：全削除
    this.elements.debugClear.addEventListener('click', () => {
      this.dispatchEvent(new Event('debugClear'));
    });

    // 削除ボタン（イベント委譲）
    this.elements.list.addEventListener('click', (e) => {
      const button = e.target.closest('[data-action="delete"]');
      if (button) {
        this.dispatchEvent(new CustomEvent('delete', {
          detail: { id: button.dataset.id },
        }));
      }
    });
  }

  /**
   * エラーメッセージを表示
   * @param {string} message
   */
  showError(message) {
    this.notification.showError(message);
  }

  /**
   * 確認ダイアログを表示
   * @param {string} message
   * @returns {boolean}
   */
  confirm(message) {
    return this.notification.confirm(message);
  }

  /**
   * 情報メッセージを表示
   * @param {string} message
   */
  showInfo(message) {
    this.notification.showInfo(message);
  }
}
