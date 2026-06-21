import { Redis } from "ioredis";
import { env } from "../../config/env.js";

export const redis = new Redis({
  host: env.redisHost,
  port: env.redisPort,
  username: env.redisUsername,
  password: env.redisPassword,
  lazyConnect: true,
  maxRetriesPerRequest: 1,
  enableOfflineQueue: false,
});

redis.on("connect", () => {
  console.log("redis connected");
});

redis.on("error", (err) => {
  console.error("redis error: ", err.message);
});

async function ensureRedisConnected() {
  if (redis.status === "ready") return true;
  if (redis.status === "connecting" || redis.status === "connect") return true;

  try {
    await redis.connect();
    return true;
  } catch {
    return false;
  }
}

export const cache = {
  async getJson<T>(key: string): Promise<T | null> {
    try {
      const connected = await ensureRedisConnected();
      if (!connected) return null;

      const value = await redis.get(key);
      return value ? (JSON.parse(value) as T) : null;
    } catch {
      return null;
    }
  },

  async setJson(key: string, value: unknown, ttlSeconds = 60 * 30) {
    try {
      const connected = await ensureRedisConnected();
      if (!connected) return;

      await redis.set(key, JSON.stringify(value), "EX", ttlSeconds);
    } catch {
      return;
    }
  },

  async del(...keys: string[]) {
    try {
      const connected = await ensureRedisConnected();
      if (!connected || keys.length === 0) return;

      await redis.del(...keys);
    } catch {
      return;
    }
  },

  async delPattern(pattern: string) {
    try {
      const connected = await ensureRedisConnected();
      if (!connected) return;

      const stream = redis.scanStream({
        match: pattern,
        count: 100,
      });

      for await (const keys of stream) {
        const batch = keys as string[];
        if (batch.length > 0) {
          await redis.del(...batch);
        }
      }
    } catch {
      return;
    }
  },
};

export const cacheKeys = {
  aiPrompt(promptHash: string) {
    return `ai:prompt:${promptHash}`;
  },
  aiRepositoryQuestion(workspaceId: string, questionHash: string) {
    return `ai:repository:${workspaceId}:${questionHash}`;
  },
  aiFileExplanation(workspaceId: string, filePath: string) {
    return `ai:explain:file:${workspaceId}:${filePath}`;
  },
  aiProjectExplanation(workspaceId: string) {
    return `ai:explain:project:${workspaceId}`;
  },
  embedding(contentHash: string) {
    return `embedding:${contentHash}`;
  },
  queryEmbedding(queryHash: string) {
    return `embedding:query:${queryHash}`;
  },
  graph(workspaceId: string, type: "dependency" | "callgraph" | "projectflow") {
    return `graph:${type}:${workspaceId}`;
  },
};

export async function invalidateWorkspaceCache(workspaceId: string) {
  await Promise.all([
    cache.delPattern(`graph:*:${workspaceId}`),
    cache.delPattern(`ai:*:${workspaceId}:*`),
    cache.delPattern(`ai:*:${workspaceId}`),
  ]);
}
