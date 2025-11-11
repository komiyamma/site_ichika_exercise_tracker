import { WorkoutRepository } from './repository/WorkoutRepository.js';
import { WorkoutService } from './service/WorkoutService.js';
import { WorkoutView } from './view/WorkoutView.js';
import { WorkoutController } from './controller/WorkoutController.js';

/**
 * アプリケーションのエントリーポイント
 */
class App {
  constructor() {
    // 依存性の注入（DI）
    const repository = new WorkoutRepository();
    const service = new WorkoutService(repository);
    const view = new WorkoutView();
    const controller = new WorkoutController(service, view);

    this.controller = controller;
  }

  /**
   * アプリケーション起動
   */
  start() {
    this.controller.initialize();
  }
}

// DOMContentLoaded後にアプリケーション起動
document.addEventListener('DOMContentLoaded', () => {
  const app = new App();
  app.start();
});
