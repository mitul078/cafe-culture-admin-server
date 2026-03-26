const { createClient } = require("redis");

let client;
let isConnected = false;

const getRedisClient = () => client;
const canUseRedis = () => isConnected && client?.isReady;

const connectRedis = async () => {
    try {
        client = createClient({ url: process.env.REDIS_URL });

        client.on("error", (err) => console.error("Redis error:", err));
        client.on("connect", () => {
            isConnected = true;
            console.log("✅ Redis connected");
        });

        await client.connect();
    } catch (err) {
        console.error("❌ Redis connection failed:", err);
        isConnected = false;
    }
};

module.exports = { getRedisClient, canUseRedis, connectRedis };