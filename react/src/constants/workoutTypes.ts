import type { WorkoutType } from '../types/workout';

/**
 * 選択可能な運動種目の一覧
 * 
 * フォームの選択肢として使用される。
 * readonlyとas constにより、実行時に変更されないことを保証。
 */
export const WORKOUT_TYPES: readonly WorkoutType[] = [
  'ウォーキング',
  'ランニング',
  '通学の徒歩',
  '筋トレ',
  'なわとび',
] as const;

/**
 * localStorageで使用するキー名
 * 
 * バニラJS版と同じキー名を使用することで、データの互換性を保つ。
 */
export const STORAGE_KEY = 'ichikaWorkoutLogEntries' as const;
