const sanitizeValue = (value) => {
    if (Array.isArray(value)) return value.map(sanitizeValue);

    if (value && typeof value === "object") {
        const cleanObject = {};
        Object.keys(value).forEach((key) => {
            // Guard against Mongo operators and prototype pollution vectors.
            if (key.startsWith("$") || key.includes(".")) return;
            if (key === "__proto__" || key === "constructor" || key === "prototype") return;
            cleanObject[key] = sanitizeValue(value[key]);
        });
        return cleanObject;
    }

    if (typeof value === "string") {
        return value.replace(/[<>]/g, "");
    }

    return value;
};

const sanitizeRequest = (req, res, next) => {
    if (req.body) req.body = sanitizeValue(req.body);
    if (req.query) req.query = sanitizeValue(req.query);
    if (req.params) req.params = sanitizeValue(req.params);
    next();
};

module.exports = { sanitizeRequest };