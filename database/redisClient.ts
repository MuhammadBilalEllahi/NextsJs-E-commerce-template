// lib/RedisClient.ts
import Redis from "ioredis";
import type { Redis as RedisType } from "ioredis";

class RedisClient {
  private static instance: RedisType;

  private constructor() {}

  private static getClient(): RedisType {
    if (!RedisClient.instance) {
      RedisClient.instance = new Redis(
        process.env.REDIS_URL || "redis://localhost:6379"
      );
    }

    return RedisClient.instance;
  }

  // STRING
  static async get(key: string): Promise<string | null> {
    return await this.getClient().get(key);
  }

  static async set(
    key: string,
    value: string,
    expirySeconds?: number
  ): Promise<"OK"> {
    const client = this.getClient();
    if (expirySeconds) {
      return await client.set(key, value, "EX", expirySeconds);
    }
    return await client.set(key, value);
  }

  static async del(key: string): Promise<number> {
    return await this.getClient().del(key);
  }

  // HASH
  static async hset(
    key: string,
    field: string,
    value: string
  ): Promise<number> {
    return await this.getClient().hset(key, field, value);
  }

  static async hget(key: string, field: string): Promise<string | null> {
    return await this.getClient().hget(key, field);
  }

  static async hdel(key: string, field: string): Promise<number> {
    return await this.getClient().hdel(key, field);
  }

  static async hgetall(key: string): Promise<Record<string, string>> {
    return await this.getClient().hgetall(key);
  }

  // LIST
  static async lpush(key: string, ...values: string[]): Promise<number> {
    return await this.getClient().lpush(key, ...values);
  }

  static async rpush(key: string, ...values: string[]): Promise<number> {
    return await this.getClient().rpush(key, ...values);
  }

  static async lpop(key: string): Promise<string | null> {
    return await this.getClient().lpop(key);
  }

  static async rpop(key: string): Promise<string | null> {
    return await this.getClient().rpop(key);
  }

  static async lrange(
    key: string,
    start: number,
    stop: number
  ): Promise<string[]> {
    return await this.getClient().lrange(key, start, stop);
  }

  // KEYS
  static async exists(key: string): Promise<number> {
    return await this.getClient().exists(key);
  }

  static async expire(key: string, seconds: number): Promise<number> {
    return await this.getClient().expire(key, seconds);
  }

  static async ttl(key: string): Promise<number> {
    return await this.getClient().ttl(key);
  }

  static async keys(pattern: string): Promise<string[]> {
    return await this.getClient().keys(pattern);
  }

  // PUB/SUB (optional)
  static async publish(channel: string, message: string): Promise<number> {
    return await this.getClient().publish(channel, message);
  }

  static async subscribe(
    channel: string,
    callback: (message: string) => void
  ): Promise<void> {
    const sub = new Redis(process.env.REDIS_URL || "redis://localhost:6379");
    await sub.subscribe(channel);
    sub.on("message", (_channel, message) => {
      if (_channel === channel) callback(message);
    });
  }

  // Close connection (for cleanup, testing, etc.)
  static async disconnect(): Promise<void> {
    await this.getClient().quit();
    RedisClient.instance = null as any;
  }
}

export default RedisClient;
