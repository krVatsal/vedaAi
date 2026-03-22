import IORedis from 'ioredis';

let redisConnection: IORedis | null = null;

export function getRedisConnection(): IORedis {
  if (!redisConnection) {
    const redisUrl = process.env.REDIS_URL || 'redis://localhost:6379';
    redisConnection = new IORedis(redisUrl, {
      maxRetriesPerRequest: null,
      enableReadyCheck: false,
    });

    redisConnection.on('connect', () => {
      console.log('✅ Redis connected');
    });

    redisConnection.on('error', (err) => {
      console.error('Redis error:', err.message);
    });
  }
  return redisConnection;
}

export async function cacheSet(
  key: string,
  value: unknown,
  ttl = 3600
): Promise<void> {
  const redis = getRedisConnection();
  await redis.setex(key, ttl, JSON.stringify(value));
}

export async function cacheGet<T>(key: string): Promise<T | null> {
  const redis = getRedisConnection();
  const value = await redis.get(key);
  if (!value) return null;
  try {
    return JSON.parse(value) as T;
  } catch {
    return null;
  }
}

export async function cacheDel(key: string): Promise<void> {
  const redis = getRedisConnection();
  await redis.del(key);
}
