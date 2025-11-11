import { WorkoutRepository } from './repository/WorkoutRepository.js';
import { WorkoutService } from './service/WorkoutService.js';
import { WorkoutView } from './view/WorkoutView.js';
import { NotificationService } from './view/NotificationService.js';
import { WorkoutController } from './controller/WorkoutController.js';

/**
 * アプリケーションの初期化
 * 依存性の注入（DI）を行い、アプリケーションを起動
 */
function initializeApp() {
  // 依存性の注入
  const repository = new WorkoutRepository();
  const service = new WorkoutService(repository);
  const notificationService = new NotificationService();
  const view = new WorkoutView(notificationService);
  const controller = new WorkoutController(service, view);

  // アプリケーション起動
  controller.initialize();
}

// DOMContentLoaded後にアプリケーション起動
document.addEventListener('DOMContentLoaded', initializeApp);
