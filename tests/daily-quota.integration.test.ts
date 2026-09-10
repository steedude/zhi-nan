// @vitest-environment node
import { execFile } from 'node:child_process'
import { promisify } from 'node:util'
import { randomUUID } from 'node:crypto'
import { describe, expect, it } from 'vitest'
import { CONSUME_DAILY_QUOTA } from '@/lib/server/daily-quota'

const container = process.env.REDIS_TEST_CONTAINER
const exec = promisify(execFile)

/** 使用獨立的本機 Redis 容器，不連到產品的 Redis。 */
describe.skipIf(!container)('Redis atomic daily quota', () => {
  async function redis(...args: string[]) {
    const { stdout } = await exec('docker', [
      'exec',
      container!,
      'redis-cli',
      '--raw',
      ...args,
    ])
    return stdout.trim()
  }

  it('admits exactly the allowance under concurrent requests without increasing denied usage', async () => {
    const key = `test:${randomUUID()}:member:2026-09-10`
    const results = await Promise.all(
      Array.from({ length: 20 }, () => redis('EVAL', CONSUME_DAILY_QUOTA, '1', key, '5')),
    )
    expect(results.filter((result) => result === '1')).toHaveLength(5)
    expect(results.filter((result) => result === '0')).toHaveLength(15)
    expect(await redis('GET', key)).toBe('5')
    expect(Number(await redis('TTL', key))).toBeGreaterThan(86_400)
  }, 30_000)

  it('separates users and calendar days', async () => {
    const prefix = `test:${randomUUID()}`
    const consume = (key: string) =>
      redis('EVAL', CONSUME_DAILY_QUOTA, '1', `${prefix}:${key}`, '1')
    expect(await consume('user-1:2026-09-10')).toBe('1')
    expect(await consume('user-1:2026-09-10')).toBe('0')
    expect(await consume('user-2:2026-09-10')).toBe('1')
    expect(await consume('user-1:2026-09-11')).toBe('1')
  }, 30_000)
})
