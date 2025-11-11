/**
 * バリデーションエラー
 * ビジネスルール違反時にスローされる
 */
export class ValidationError extends Error {
  constructor(errors) {
    super(errors.join(', '));
    this.name = 'ValidationError';
    this.errors = errors;
  }
}
