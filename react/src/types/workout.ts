/**
 * 運動記録エントリーの型定義
 * 
 * バニラJS版と同じデータ構造を使用することで、
 * localStorageでのデータ互換性を保つ。
 */
export interface WorkoutEntry {
  /** 一意な識別子（タイムスタンプを文字列化したもの） */
  id: string;
  /** 運動を行った日付（YYYY-MM-DD形式） */
  date: string;
  /** 運動の種目 */
  type: string;
  /** 運動時間（分） */
  minutes: number;
  /** 回数または距離 */
  value: number;
  /** メモ */
  note: string;
  /** 記録作成日時（Unixタイムスタンプ、ミリ秒） */
  createdAt: number;
}

/**
 * 運動種目の型定義
 * 
 * 選択可能な運動種目を型レベルで制限する。
 */
export type WorkoutType = 
  | 'ウォーキング'
  | 'ランニング'
  | '通学の徒歩'
  | '筋トレ'
  | 'なわとび';
