import dotenv from "dotenv";

dotenv.config();

export const env = {
  port: process.env.PORT || 3000,
  mongodbUri: process.env.MONGODB_URI,
  redisHost: process.env.REDIS_HOST || "localhost",
  redisPort: process.env.REDIS_PORT ? parseInt(process.env.REDIS_PORT) : 15606,
  redisUsername: process.env.REDIS_USERNAME || "default",
  redisPassword: process.env.REDIS_PASSWORD || undefined,
  geminiApiKey: process.env.GEMINI_API_KEY || undefined,
  geminiApiUrl: process.env.GEMINI_API_URL || "https://gemini.api.url",
  githubToken: process.env.GITHUB_TOKEN || undefined,
  frontendUrl: process.env.FRONTEND_URL || "https://cortex-code.vercel.app",
  skipEmbeddings: process.env.SKIP_EMBEDDINGS === "true",
  embeddingMaxChunks: process.env.EMBEDDING_MAX_CHUNKS
    ? parseInt(process.env.EMBEDDING_MAX_CHUNKS, 10)
    : 500,
  embeddingMinChars: process.env.EMBEDDING_MIN_CHARS
    ? parseInt(process.env.EMBEDDING_MIN_CHARS, 10)
    : 80,
  embeddingRequestDelayMs: process.env.EMBEDDING_REQUEST_DELAY_MS
    ? parseInt(process.env.EMBEDDING_REQUEST_DELAY_MS, 10)
    : 350,
  embeddingConcurrency: process.env.EMBEDDING_CONCURRENCY
    ? parseInt(process.env.EMBEDDING_CONCURRENCY, 10)
    : 2,
};
