import { env } from '@/env'

/**
 * 額度與限流設定(僅伺服器端使用)
 *
 * 環境變數的讀取統一集中在 configs/,其他模組不直接碰 process.env,
 * 之後要加付費方案時只需要改這裡與額度檢查處。
 */

/** 訪客每日解讀次數，以 IP 在 Redis 計數。 */
export const ANON_DAILY_LIMIT = env.ANON_DAILY_LIMIT

/** 會員每日解讀次數，以 user id 在 Redis 計數。 */
export const MEMBER_DAILY_LIMIT = env.MEMBER_DAILY_LIMIT

/** 每 IP 每分鐘請求上限 */
export const PER_MINUTE_LIMIT = env.PER_MINUTE_LIMIT
