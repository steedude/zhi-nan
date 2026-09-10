/** Redis 在同一次操作內檢查並扣額度，避免並行請求超額。
 * key 包含台北日期；保留兩天後清除，不在 UTC 午夜重置同一天的額度。
 */
export const CONSUME_DAILY_QUOTA = `
local used = tonumber(redis.call('GET', KEYS[1]) or '0')
local limit = tonumber(ARGV[1])
if used >= limit then return 0 end
local next = redis.call('INCR', KEYS[1])
if next == 1 then redis.call('EXPIRE', KEYS[1], 172800) end
return 1
`
