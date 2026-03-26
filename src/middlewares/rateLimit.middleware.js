const rateLimit = require("express-rate-limit");

const menuItemRateLimiter = rateLimit({
    windowMs: 60 * 1000,
    max: 120,
    standardHeaders: true,
    legacyHeaders: false,
    message: {
        success: false,
        message: "Too many requests. Please try again shortly.",
    },
});

module.exports = { menuItemRateLimiter };
