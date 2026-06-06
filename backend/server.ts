import app from "./src/app.js";
import {env} from "./src/config/env.js";
import {connectToDB} from "./src/shared/database/mongodb.js";
import "./src/shared/redis/redis.js";

const startServer = async () => {
    await connectToDB();
    app.listen(env.port, () => {
        console.log(`server is running on port: ${env.port}`);
    })
}

startServer();