import dotenv from 'dotenv';

dotenv.config();

export const env = {
    port: process.env.PORT || 3000,
    mongodbUri: process.env.MONGODB_URI || 'mongodb+srv://singhgaya031_db_user:vKWPkblypwTuhxvA@cluster0.a7zxvcd.mongodb.net/ai-code-editor',
    redisHost: process.env.REDIS_HOST || 'localhost',
    redisPort: process.env.REDIS_PORT ? parseInt(process.env.REDIS_PORT) : 15606,
    redisUsername: process.env.REDIS_USERNAME || 'default',
    redisPassword: process.env.REDIS_PASSWORD || undefined,
    geminiApiKey: process.env.GEMINI_API_KEY || undefined,
    geminiApiUrl: process.env.GEMINI_API_URL || 'https://gemini.api.url'
}

