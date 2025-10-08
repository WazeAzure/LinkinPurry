import { createClient } from 'redis';
import { config } from './environment';

export const redisClient = createClient({
  url: config.REDIS_URL,
});

redisClient.on('error', (err) => console.error('Redis Client Error', err));
redisClient.on('connect', () => console.log('Redis Client Connected'));

// Connect to Redis
await redisClient.connect();