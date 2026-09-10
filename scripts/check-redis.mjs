import { lookup } from 'node:dns/promises'

// 只檢查 DNS 與 PING，不讀寫業務資料，也不扣除解讀額度。
async function checkRedis() {
  const endpoint = process.env.UPSTASH_REDIS_REST_URL
  const token = process.env.UPSTASH_REDIS_REST_TOKEN
  if (!endpoint || !token) {
    throw new Error('請設定 UPSTASH_REDIS_REST_URL 與 UPSTASH_REDIS_REST_TOKEN。')
  }

  let url
  try {
    url = new URL(endpoint)
  } catch {
    throw new Error('UPSTASH_REDIS_REST_URL 不是有效網址。')
  }
  if (url.protocol !== 'https:' || url.username || url.password) {
    throw new Error('請使用 Upstash 後台的 HTTPS REST URL，Token 需另外設定。')
  }
  try {
    await lookup(url.hostname)
  } catch {
    throw new Error(
      `Redis DNS 無法解析：${url.hostname}。請核對 Upstash 資料庫狀態與 REST URL。`,
    )
  }

  let response
  try {
    response = await fetch(new URL('/ping', url), {
      headers: { Authorization: `Bearer ${token}` },
      signal: AbortSignal.timeout(10_000),
    })
  } catch {
    throw new Error('Redis REST 連線失敗或逾時，請檢查資料庫與網路狀態。')
  }
  if (!response.ok) {
    throw new Error(
      `Redis 回應 HTTP ${response.status}。請核對同一個資料庫的 REST URL 與 Token。`,
    )
  }
  const data = await response.json().catch(() => null)
  if (data?.result !== 'PONG') throw new Error('Redis PING 回應異常，請核對 REST URL。')
  process.stdout.write(`Redis 連線正常：${url.hostname}（PONG）。\n`)
}

checkRedis().catch((error) => {
  // 只輸出上方產生的診斷訊息，不印出 Token、請求標頭或遠端回應。
  console.error(error.message)
  process.exitCode = 1
})
