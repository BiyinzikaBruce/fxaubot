import { Redis } from "@upstash/redis"

const isConfigured = !!(process.env.UPSTASH_REDIS_URL && process.env.UPSTASH_REDIS_TOKEN)

const redis = isConfigured
  ? new Redis({ url: process.env.UPSTASH_REDIS_URL!, token: process.env.UPSTASH_REDIS_TOKEN! })
  : null

const DEFAULT_TTL = 60 * 5

export async function getCachedOrFetch<T>(
  key: string,
  fetcher: () => Promise<T>,
  ttl = DEFAULT_TTL,
): Promise<T> {
  if (!redis) return fetcher()
  const cached = await redis.get<T>(key)
  if (cached !== null) return cached
  const data = await fetcher()
  await redis.set(key, data, { ex: ttl })
  return data
}

export async function invalidateTag(pattern: string): Promise<void> {
  if (!redis) return
  const keys = await redis.keys(pattern)
  if (keys.length > 0) await redis.del(...keys)
}

export async function invalidateKey(key: string): Promise<void> {
  if (!redis) return
  await redis.del(key)
}

export { redis }
