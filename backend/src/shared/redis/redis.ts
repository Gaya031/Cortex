import {Redis} from "ioredis";
import {env} from "../../config/env.js";
import { error } from "node:console";

export const redis = new Redis({
    host: env.redisHost,
    port: env.redisPort,
    username: env.redisUsername,
    password: env.redisPassword,
});

redis.on("connect", () => {
    console.log("redis connected");
})

redis.on("error", (err) => {
    console.error("redis error: ", err);
})

