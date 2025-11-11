import { getTodayFormatted } from '../utils/dateUtils.js';

/**
 * 運動記録のコントローラー（プレゼンテーション層）
 */
export class WorkoutController {
  constructor(service, view) {
    this.service = service;
    this.view = view;
  }

  /**
   * 初期化
   */
  initialize() {
    this.#setupEventHandlers();
    this.view.setDateInput(getTodayFormatted());
    this.#renderEntries();
  }

  /**
   * イベントハンドラーを設定
   */
  #setupEventHandlers() {
    this.view.attachEventListeners({
      onSubmit: () => this.#handleSubmit(),
      onFilterChange: () => this.#renderEntries(),
      onClearFilter: () => this.#handleClearFilter(),
      onDebugClear: () => this.#handleDebugClear(),
      onDelete: (id) => this.#handleDelete(id),
    });
  }

  /**
   * フォーム送信処理
   */
  #handleSubmit() {
    try {
      const formData = this.view.getFormData();
      this.service.addEntry(formData);

      this.view.resetForm();
      this.view.setDateInput(getTodayFormatted());
      this.#renderEntries();
    } catch (error) {
      this.view.showError(error.message);
    }
  }

  /**
   * フィルタークリア処理
   */
  #handleClearFilter() {
    this.view.clearFilter();
    this.#renderEntries();
  }

  /**
   * デバッグ：全削除処理
   */
  #handleDebugClear() {
    const confirmed = this.view.confirm(
      'localStorageの記録データを全て削除します。よろしいですか？'
    );

    if (!confirmed) return;

    this.service.clearAllData();
    this.view.clearFilter();
    this.#renderEntries();
    this.view.showInfo('データを削除しました。');
  }

  /**
   * 削除処理
   */
  #handleDelete(id) {
    this.service.deleteEntry(id);
    this.#renderEntries();
  }

  /**
   * エントリ一覧を描画
   */
  #renderEntries() {
    const filterDate = this.view.getFilterDate();
    const entries = this.service.getEntriesByDate(filterDate);
    this.view.renderEntries(entries);
  }
}
