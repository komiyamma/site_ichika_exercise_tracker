/**
 * ワークアウト1件分のデータを表す型
 *
 * バニラJS版と互換性を持たせておくため、構造は揃えている。
 */
export interface WorkoutEntry {
  /** 一意な識別子（タイムスタンプ由来の文字列など） */
  id: string;
  /** 実施日（YYYY-MM-DD 形式の文字列） */
  date: string;
  /** ワークアウト種目 */
  type: string;
  /** 実施時間（分） */
  minutes: number;
  /** 回数または距離などの値 */
  value: number;
  /** メモ */
  note: string;
  /** 作成日時（Unix タイムスタンプ / ms） */
  createdAt: number;
}

/**
 * 選択可能なワークアウト種目の union 型
 */
export type WorkoutType =
  | 'ウォーキング'
  | 'ランニング'
  | '通学の徒歩'
  | '筋トレ'
  | 'なわとび';

