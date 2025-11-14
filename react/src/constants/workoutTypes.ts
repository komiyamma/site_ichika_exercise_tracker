import type { WorkoutType } from '../types/workout';

export const WORKOUT_TYPES: readonly WorkoutType[] = [
  'ウォーキング',
  'ランニング',
  '通学の徒歩',
  '筋トレ',
  'なわとび',
] as const;

export const STORAGE_KEY = 'ichikaWorkoutLogEntries' as const;
