import type { WorkoutType } from '../types/workout';

/**
 * ワークアウト種目の一覧
 */
export const WORKOUT_TYPES: readonly WorkoutType[] = [
  'ウォーキング',
  'ランニング',
  '通学の徒歩',
  '筋トレ',
  'なわとび',
] as const;

