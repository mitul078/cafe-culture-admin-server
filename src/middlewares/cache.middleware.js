const { getRedisClient, canUseRedis } = require("../config/redis");
const logger = require("../utils/logger");

const buildCacheKey = (prefix, req) => {
    const query = Object.keys(req.query || {})
        .sort()
        .map((key) => `${encodeURIComponent(key)}:${encodeURIComponent(req.query[key])}`)
        .join("|");

    return `${prefix}:${req.admin?.id || "anonymous"}:${query}`;
};

const readCache = (prefix, ttlSeconds = 60) => {
    return async (req, res, next) => {
        try {
            if (!canUseRedis()) return next();

            const redis = getRedisClient();
            const cacheKey = buildCacheKey(prefix, req);
            const cached = await redis.get(cacheKey);

            if (!cached) {
                req.cacheMeta = { cacheKey, ttlSeconds };
                return next();
            }

            return res.status(200).json(JSON.parse(cached));
        } catch (error) {
            logger.warn({ error }, "Cache read failed");
            return next();
        }
    };
};

const writeCache = async (cacheMeta, payload) => {
    if (!cacheMeta || !canUseRedis()) return;

    try {
        const redis = getRedisClient();
        await redis.set(cacheMeta.cacheKey, JSON.stringify(payload), {
            EX: cacheMeta.ttlSeconds,
        });
    } catch (error) {
        logger.warn({ error }, "Cache write failed");
    }
};

const invalidateItemCache = async (adminId) => {
    if (!canUseRedis() || !adminId) return;
    try {
        const redis = getRedisClient();
        const pattern = `menu-items:${adminId}:*`;
        const keys = await redis.keys(pattern);
        if (keys.length > 0) {
            await redis.del(keys);
        }
    } catch (error) {
        logger.warn({ error }, "Cache invalidation failed");
    }
};

module.exports = { readCache, writeCache, invalidateItemCache };