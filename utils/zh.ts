/** 中文字處理 */

/** lunar-typescript 輸出為簡體,轉為繁體(僅涵蓋十神與生肖用字) */
const S2T: Record<string, string> = {
  财: '財',
  杀: '殺',
  伤: '傷',
  龙: '龍',
  马: '馬',
  鸡: '雞',
  猪: '豬',
}

export function toTraditional(text: string): string {
  return text.replace(/[财杀伤龙马鸡猪]/g, (ch) => S2T[ch])
}
