import dotenv from 'dotenv';

dotenv.config();

export const env = {
    port: process.env.PORT || 3000,
    mongodbUri: process.env.MONGODB_URI,
    redisHost: process.env.REDIS_HOST || 'localhost',
    redisPort: process.env.REDIS_PORT ? parseInt(process.env.REDIS_PORT) : 15606,
    redisUsername: process.env.REDIS_USERNAME || 'default',
    redisPassword: process.env.REDIS_PASSWORD || undefined,
    geminiApiKey: process.env.GEMINI_API_KEY || undefined,
    geminiApiUrl: process.env.GEMINI_API_URL || 'https://gemini.api.url'
}

