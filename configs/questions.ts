/**
 * 問題類別設定
 *
 * 類別值以繁中為「標準值」(canonical value):前端表單、API 驗證、
 * 資料庫紀錄、AI 提示詞都使用這組字串;各語系的顯示文字在 locales/ 中翻譯。
 */

export const QUESTION_CATEGORIES = [
  '綜合運勢',
  '事業工作',
  '感情婚姻',
  '財運',
  '學業考試',
] as const

export type QuestionCategory = (typeof QUESTION_CATEGORIES)[number]
