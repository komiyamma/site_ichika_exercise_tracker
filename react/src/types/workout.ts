export interface WorkoutEntry {
  id: string;
  date: string;
  type: string;
  minutes: number;
  value: number;
  note: string;
  createdAt: number;
}

export type WorkoutType = 
  | 'ウォーキング'
  | 'ランニング'
  | '通学の徒歩'
  | '筋トレ'
  | 'なわとび';
