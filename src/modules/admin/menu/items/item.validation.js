const mongoose = require("mongoose");

const ALLOWED_TYPES = new Set(["VEG", "NON-VEG", "EGGS"]);
const ALLOWED_SORT_BY = new Set([
    "globalOrder",
    "order",
    "price",
    "rating",
    "name",
]);

const normalizeType = (value) => {
    if (value === undefined) return undefined;
    if (value === null) return null;
    if (typeof value !== "string") return null;

    // Accept common casing and forms from clients.
    let t = value.trim().toUpperCase().replace(/\s+/g, "");
    if (t === "NONVEG") t = "NON-VEG";

    return ALLOWED_TYPES.has(t) ? t : null;
};

const coerceBoolean = (value) => {
    if (value === undefined) return undefined;
    if (value === null) return null;
    if (typeof value === "boolean") return value;
    if (typeof value === "string") {
        if (value === "true") return true;
        if (value === "false") return false;
    }
    return null;
};

const coerceNumber = (value) => {
    if (typeof value === "number") return value;
    if (typeof value === "string" && value.trim() !== "") {
        const n = Number(value);
        return Number.isFinite(n) ? n : null;
    }
    return null;
};

const coerceInt = (value) => {
    const n = coerceNumber(value);
    if (n === null) return null;
    return Number.isInteger(n) ? n : null;
};

const parseJsonArray = ({ value, fieldName, errors }) => {
    if (value === undefined || value === null) return undefined;

    let parsed = value;
    if (typeof value === "string") {
        try {
            parsed = JSON.parse(value);
        } catch {
            errors.push(`${fieldName} must be valid JSON`);
            return undefined;
        }
    }

    if (!Array.isArray(parsed)) {
        errors.push(`${fieldName} must be an array`);
        return undefined;
    }

    return parsed;
};

const validateCreateItem = (data) => {
    const errors = [];

    // Name
    if (data.name === undefined || typeof data.name !== "string" || data.name.trim() === "") {
        errors.push("name is required and must be a non-empty string");
    }

    // Description (optional)
    if (data.description !== undefined && typeof data.description !== "string") {
        errors.push("description must be a string");
    }

    // Price
    const price = coerceNumber(data.price);
    if (price === null || price < 0) {
        errors.push("price is required and must be a number >= 0");
    }

    // CategoryId
    if (data.categoryId === undefined || typeof data.categoryId !== "string") {
        errors.push("categoryId is required and must be a valid ObjectId string");
    } else if (!mongoose.Types.ObjectId.isValid(data.categoryId)) {
        errors.push("categoryId must be a valid ObjectId");
    }

    // order & globalOrder (both required in model)
    const order = coerceInt(data.order);
    if (order === null || order < 1) errors.push("order is required and must be an integer >= 1");

    const globalOrder = coerceInt(data.globalOrder);
    if (globalOrder === null || globalOrder < 1) {
        errors.push("globalOrder is required and must be an integer >= 1");
    }

    // Type (optional, model has default)
    const normalizedType = normalizeType(data.type);
    if (data.type !== undefined && normalizedType === null) {
        errors.push("type must be one of: VEG, NON-VEG, EGGS");
    }

    // isAvailable (optional)
    const normalizedIsAvailable = coerceBoolean(data.isAvailable);
    if (data.isAvailable !== undefined && normalizedIsAvailable === null) {
        errors.push("isAvailable must be a boolean (true/false)");
    }

    // Variants (optional)
    const rawVariants = parseJsonArray({
        value: data.variants,
        fieldName: "variants",
        errors,
    }) ?? [];

    const variants = rawVariants.map((v, idx) => {
        const itemErrors = [];

        if (!v || typeof v !== "object" || Array.isArray(v)) {
            errors.push(`variants[${idx}] must be an object`);
            return null;
        }

        const vPrice = coerceNumber(v.price);
        if (vPrice === null || vPrice < 0) {
            errors.push(`variants[${idx}].price must be a number >= 0`);
        }

        if (v.name !== undefined && (typeof v.name !== "string" || v.name.trim() === "")) {
            itemErrors.push(`variants[${idx}].name must be a non-empty string`);
        }

        if (v.size !== undefined && (typeof v.size !== "string" || v.size.trim() === "")) {
            itemErrors.push(`variants[${idx}].size must be a non-empty string`);
        }

        const vSku = v.sku;
        if (vSku !== undefined && (typeof vSku !== "string" || vSku.trim() === "")) {
            itemErrors.push(`variants[${idx}].sku must be a non-empty string`);
        }

        if (v.isActive !== undefined) {
            const coerced = coerceBoolean(v.isActive);
            if (coerced === null) itemErrors.push(`variants[${idx}].isActive must be true/false`);
            v.isActive = coerced;
        }

        if (itemErrors.length > 0) errors.push(...itemErrors);

        return {
            name: v.name !== undefined ? v.name.trim() : undefined,
            size: v.size !== undefined ? v.size.trim() : undefined,
            price: vPrice,
            sku: vSku !== undefined ? vSku.trim() : undefined,
            isActive: v.isActive,
        };
    }).filter(Boolean);

    // Add-ons (optional)
    const rawAddOns = parseJsonArray({
        value: data.addOns,
        fieldName: "addOns",
        errors,
    }) ?? [];

    const addOns = rawAddOns.map((a, idx) => {
        if (!a || typeof a !== "object" || Array.isArray(a)) {
            errors.push(`addOns[${idx}] must be an object`);
            return null;
        }

        if (typeof a.name !== "string" || a.name.trim() === "") {
            errors.push(`addOns[${idx}].name is required and must be a non-empty string`);
        }

        const aPrice = coerceNumber(a.price);
        if (aPrice === null || aPrice < 0) {
            errors.push(`addOns[${idx}].price is required and must be a number >= 0`);
        }

        return {
            name: a.name ? a.name.trim() : a.name,
            price: aPrice,
        };
    }).filter(Boolean);

    // Tags (optional)
    const rawTags = parseJsonArray({
        value: data.tags,
        fieldName: "tags",
        errors,
    }) ?? [];

    const tags = rawTags.map((t, idx) => {
        if (typeof t !== "string" || t.trim() === "") {
            errors.push(`tags[${idx}] must be a non-empty string`);
            return null;
        }
        return t.trim();
    }).filter(Boolean);

    return {
        isValid: errors.length === 0,
        errors,
        normalized: {
            name: data.name?.trim(),
            description: data.description !== undefined ? data.description.trim() : undefined,
            price,
            categoryId: data.categoryId,
            order,
            globalOrder,
            variants,
            addOns,
            tags,
            type: normalizedType,
            isAvailable: normalizedIsAvailable,
        },
    };
};

const validateGetItems = (query) => {
    const errors = [];

    const page = coerceInt(query.page ?? 1);
    if (page === null || page < 1) errors.push("page must be an integer >= 1");

    const limit = coerceInt(query.limit ?? 20);
    // Hard cap to avoid heavy queries
    if (limit === null || limit < 1 || limit > 100) errors.push("limit must be an integer between 1 and 100");

    const type = normalizeType(query.type);
    if (query.type !== undefined && type === null) errors.push("type must be one of: VEG, NON-VEG, EGGS");

    const isAvailableRaw = query.isAvailable;
    const isAvailable = coerceBoolean(isAvailableRaw);
    if (isAvailableRaw !== undefined && isAvailable === null) {
        errors.push("isAvailable must be a boolean (true/false)");
    }

    const categoryId = query.categoryId;
    if (categoryId !== undefined) {
        if (typeof categoryId !== "string" || !mongoose.Types.ObjectId.isValid(categoryId)) {
            errors.push("categoryId must be a valid ObjectId");
        }
    }

    const search = query.search;
    if (search !== undefined && (typeof search !== "string" || search.trim().length === 0)) {
        errors.push("search must be a non-empty string");
    }

    const tagsRaw = query.tags;
    let tags;
    if (tagsRaw !== undefined) {
        // Supports: "bestseller", "special", "bestseller,special", or '["bestseller","special"]'
        let parsed = tagsRaw;
        if (typeof tagsRaw === "string") {
            const trimmed = tagsRaw.trim();
            if (trimmed.startsWith("[") && trimmed.endsWith("]")) {
                try {
                    parsed = JSON.parse(trimmed);
                } catch {
                    errors.push("tags must be a valid JSON array or comma-separated list");
                }
            } else if (trimmed.includes(",")) {
                parsed = trimmed.split(",").map((s) => s.trim());
            } else if (trimmed.length > 0) {
                parsed = [trimmed];
            } else {
                parsed = [];
            }
        }

        if (errors.length === 0) {
            if (!Array.isArray(parsed)) {
                errors.push("tags must be an array of strings");
            } else {
                const normalizedTags = parsed
                    .filter((t) => typeof t === "string")
                    .map((t) => t.trim())
                    .filter(Boolean);

                if (normalizedTags.length === 0 && parsed.length > 0) {
                    errors.push("tags must contain non-empty strings");
                }

                tags = normalizedTags;
            }
        }
    }

    const sortByCandidate = (query.sortBy ?? "globalOrder").toString();
    if (!ALLOWED_SORT_BY.has(sortByCandidate)) errors.push(`sortBy must be one of: ${Array.from(ALLOWED_SORT_BY).join(", ")}`);

    const sortOrderCandidate = (query.sortOrder ?? "asc").toString().toLowerCase();
    if (!["asc", "desc"].includes(sortOrderCandidate)) errors.push("sortOrder must be 'asc' or 'desc'");

    return {
        isValid: errors.length === 0,
        errors,
        normalized: {
            page: page ?? 1,
            limit: limit ?? 20,
            categoryId,
            type,
            isAvailable,
            search: search !== undefined ? search.trim() : undefined,
            tags,
            sortBy: sortByCandidate,
            sortOrder: sortOrderCandidate,
        },
    };
};

const validateUpdateItem = (data) => {
    const errors = [];

    // Name
    if (data.name === undefined || typeof data.name !== "string" || data.name.trim() === "") {
        errors.push("name is required and must be a non-empty string");
    }

    // Description (optional)
    if (data.description !== undefined && typeof data.description !== "string") {
        errors.push("description must be a string");
    }

    // Price
    const price = coerceNumber(data.price);
    if (price === null || price < 0) {
        errors.push("price is required and must be a number >= 0");
    }

    // CategoryId
    if (data.categoryId === undefined || typeof data.categoryId !== "string") {
        errors.push("categoryId is required and must be a valid ObjectId string");
    } else if (!mongoose.Types.ObjectId.isValid(data.categoryId)) {
        errors.push("categoryId must be a valid ObjectId");
    }

    const normalizedType = normalizeType(data.type);
    if (data.type !== undefined && normalizedType === null) {
        errors.push("type must be one of: VEG, NON-VEG, EGGS");
    }

    const normalizedIsAvailable = coerceBoolean(data.isAvailable);
    if (data.isAvailable !== undefined && normalizedIsAvailable === null) {
        errors.push("isAvailable must be a boolean (true/false)");
    }

    const rawVariants = parseJsonArray({
        value: data.variants,
        fieldName: "variants",
        errors,
    });

    const variants =
        rawVariants === undefined
            ? undefined
            : rawVariants.map((v, idx) => {
                if (!v || typeof v !== "object" || Array.isArray(v)) {
                    errors.push(`variants[${idx}] must be an object`);
                    return null;
                }

                const vPrice = coerceNumber(v.price);
                if (vPrice === null || vPrice < 0) {
                    errors.push(`variants[${idx}].price must be a number >= 0`);
                }

                if (v.name !== undefined && (typeof v.name !== "string" || v.name.trim() === "")) {
                    errors.push(`variants[${idx}].name must be a non-empty string`);
                }

                const coerced = {
                    name: typeof v.name === "string" ? v.name.trim() : v.name,
                    size: typeof v.size === "string" ? v.size.trim() : v.size,
                    price: vPrice,
                    sku: typeof v.sku === "string" ? v.sku.trim().toUpperCase() : v.sku,
                    isActive: v.isActive !== undefined ? coerceBoolean(v.isActive) : undefined,
                };

                if (coerced.isActive === null) {
                    errors.push(`variants[${idx}].isActive must be true/false`);
                }

                return coerced;
            }).filter(Boolean);

    const rawAddOns = parseJsonArray({
        value: data.addOns,
        fieldName: "addOns",
        errors,
    });

    const addOns =
        rawAddOns === undefined
            ? undefined
            : rawAddOns.map((a, idx) => {
                if (!a || typeof a !== "object" || Array.isArray(a)) {
                    errors.push(`addOns[${idx}] must be an object`);
                    return null;
                }

                if (typeof a.name !== "string" || a.name.trim() === "") {
                    errors.push(`addOns[${idx}].name is required and must be a non-empty string`);
                }

                const aPrice = coerceNumber(a.price);
                if (aPrice === null || aPrice < 0) {
                    errors.push(`addOns[${idx}].price is required and must be a number >= 0`);
                }

                return {
                    name: a.name.trim(),
                    price: aPrice,
                };
            }).filter(Boolean);

    const rawTags = parseJsonArray({
        value: data.tags,
        fieldName: "tags",
        errors,
    });

    const tags =
        rawTags === undefined
            ? undefined
            : rawTags
                .filter((t) => typeof t === "string")
                .map((t) => t.trim())
                .filter(Boolean);

    return {
        isValid: errors.length === 0,
        errors,
        normalized: {
            name: data.name.trim(),
            description: data.description !== undefined ? data.description.trim() : undefined,
            price,
            categoryId: data.categoryId,
            variants,
            addOns,
            tags,
            type: normalizedType,
            isAvailable: normalizedIsAvailable,
        },
    };
};

const validateDeleteItem = (itemId) => {
    if (!itemId || typeof itemId !== "string" || !mongoose.Types.ObjectId.isValid(itemId)) {
        return {
            isValid: false,
            errors: ["id must be a valid ObjectId"],
        };
    }

    return { isValid: true, errors: [] };
};

module.exports = { validateCreateItem, validateGetItems, validateUpdateItem, validateDeleteItem };

