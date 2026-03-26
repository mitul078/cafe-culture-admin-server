const { createClient } = require("redis");

let client;

const getRedisClient = () => client;
const canUseRedis = () => client?.isReady === true;

const connectRedis = async () => {
    try {
        client = createClient({ url: process.env.REDIS_URL });

        client.on("error", (err) => console.error("Redis error:", err));
        client.on("connect", () => console.log("✅ Redis connected"));
        client.on("end", () => console.log("🔌 Redis disconnected"));

        await client.connect();
    } catch (err) {
        console.error("❌ Redis connection failed:", err);
    }
};

module.exports = { getRedisClient, canUseRedis, connectRedis };