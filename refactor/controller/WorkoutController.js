import { DateFormatter } from '../domain/DateFormatter.js';

/**
 * 運動記録のコントローラー（プレゼンテーション層）
 * 責務: ユーザー操作の制御とエラーハンドリング
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
    this.view.setDateInput(DateFormatter.today());
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
      this.view.setDateInput(DateFormatter.today());
      this.#renderEntries();
    } catch (error) {
      this.view.showError(error.message);
      console.error('エントリ追加エラー:', error);
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

    try {
      this.service.clearAllData();
      this.view.clearFilter();
      this.#renderEntries();
      this.view.showInfo('データを削除しました。');
    } catch (error) {
      this.view.showError('データの削除に失敗しました');
      console.error('データ削除エラー:', error);
    }
  }

  /**
   * 削除処理
   */
  #handleDelete(id) {
    try {
      this.service.deleteEntry(id);
      this.#renderEntries();
    } catch (error) {
      this.view.showError('削除に失敗しました');
      console.error('削除エラー:', error);
    }
  }

  /**
   * エントリ一覧を描画
   */
  #renderEntries() {
    try {
      const filterDate = this.view.getFilterDate();
      const entries = this.service.getEntriesByDate(filterDate);
      this.view.renderEntries(entries);
    } catch (error) {
      this.view.showError('データの取得に失敗しました');
      console.error('データ取得エラー:', error);
    }
  }
}
