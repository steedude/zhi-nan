/** AI 解讀文字的解析 */

export interface Section {
  title: string | null
  body: string
}

/**
 * 把「前言【標題A】內文A【標題B】內文B⋯」切成段落陣列。
 * 串流中最後一段可能不完整,一樣照常回傳,由畫面逐字補上。
 */
export function parseSections(text: string): Section[] {
  const parts = text.split(/(?=【)/)
  return parts
    .map((part) => {
      const match = part.match(/^【([^】]+)】([\s\S]*)$/)
      if (match) return { title: match[1], body: match[2].trim() }
      return { title: null, body: part.trim() }
    })
    .filter((s) => s.title !== null || s.body.length > 0)
}
