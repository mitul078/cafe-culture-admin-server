const mongoose = require("mongoose");
const MenuItem = require("./item.model");
const generateSnowflakeId = require("../../../../utils/snowflake");
const slugify = require("slugify");

const DEFAULT_PROJECTION =
    "name slug description price categoryId image variants addOns tags type isAvailable rating reviewsCount createdAt updatedAt";

const buildSlug = (name) => {
    const baseSlug = slugify(name, { lower: true, strict: true });
    if (!baseSlug) return null;
    return `${baseSlug}-${generateSnowflakeId()}`;
};

const ensureUniqueSkus = (variants = []) => {
    const seen = new Set();
    for (const variant of variants) {
        if (!variant?.sku) continue;
        const sku = variant.sku.trim().toUpperCase();
        if (seen.has(sku)) return false;
        seen.add(sku);
    }
    return true;
};

const buildFilter = (adminId, normalized) => {
    const filter = { adminId, isDeleted: false };
    if (normalized.categoryId) filter.categoryId = normalized.categoryId;
    if (normalized.type) filter.type = normalized.type;
    if (normalized.isAvailable !== undefined) filter.isAvailable = normalized.isAvailable;
    if (normalized.search) filter.$text = { $search: normalized.search };
    if (normalized.tags?.length > 0) filter.tags = { $in: normalized.tags };
    return filter;
};

const buildCursorFilter = (normalized, sortDirection) => {
    if (!normalized.cursor) return {};
    try {
        const decoded = JSON.parse(Buffer.from(normalized.cursor, "base64").toString("utf8"));
        const sortField = normalized.sortBy;
        const cursorValue = decoded.sortValue;
        const cursorId = decoded.id;

        if (!cursorId || !mongoose.Types.ObjectId.isValid(cursorId)) return {};
        const operator = sortDirection === -1 ? "$lt" : "$gt";
        return {
            $or: [
                { [sortField]: { [operator]: cursorValue } },
                { [sortField]: cursorValue, _id: { [operator]: cursorId } },
            ],
        };
    } catch {
        return {};
    }
};

const encodeCursor = (item, sortBy) => {
    if (!item) return null;
    const payload = { id: item._id.toString(), sortValue: item[sortBy] };
    return Buffer.from(JSON.stringify(payload)).toString("base64");
};

const createItemService = async ({ adminId, payload }) => {
    if (!ensureUniqueSkus(payload.variants || [])) {
        const error = new Error("Duplicate SKU found in variants");
        error.status = 400;
        throw error;
    }

    const slug = buildSlug(payload.name);
    if (!slug) {
        const error = new Error("name must produce a valid slug");
        error.status = 400;
        throw error;
    }

    return MenuItem.create({
        ...payload,
        adminId,
        slug,
        createdBy: adminId,
        updatedBy: adminId,
    });
};

const getItemsService = async ({ adminId, normalized }) => {
    const sortDirection = normalized.sortOrder === "desc" ? -1 : 1;
    const sort = { [normalized.sortBy]: sortDirection, _id: sortDirection };
    const filter = buildFilter(adminId, normalized);

    if (normalized.cursor) {
        const cursorFilter = buildCursorFilter(normalized, sortDirection);
        const mergedFilter =
            Object.keys(cursorFilter).length > 0
                ? { ...filter, $and: [...(filter.$and || []), cursorFilter] }
                : filter;

        const docs = await MenuItem.find(mergedFilter)
            .sort(sort)
            .limit(normalized.limit + 1)
            .select(DEFAULT_PROJECTION)
            .populate("categoryId", "name slug")
            .lean();

        const hasNext = docs.length > normalized.limit;
        const items = hasNext ? docs.slice(0, normalized.limit) : docs;
        const nextCursor = hasNext ? encodeCursor(items[items.length - 1], normalized.sortBy) : null;

        return {
            items,
            pagination: {
                limit: normalized.limit,
                nextCursor,
                hasNext,
            },
        };
    }

    const skip = (normalized.page - 1) * normalized.limit;
    const [items, total] = await Promise.all([
        MenuItem.find(filter)
            .sort(sort)
            .skip(skip)
            .limit(normalized.limit)
            .select(DEFAULT_PROJECTION)
            .populate("categoryId", "name slug")
            .lean(),
        MenuItem.countDocuments(filter),
    ]);

    return {
        items,
        pagination: {
            total,
            page: normalized.page,
            limit: normalized.limit,
            totalPages: Math.ceil(total / normalized.limit),
        },
    };
};

const updateItemService = async ({ adminId, itemId, normalized, image, removeImage }) => {
    if (normalized.variants && !ensureUniqueSkus(normalized.variants)) {
        const error = new Error("Duplicate SKU found in variants");
        error.status = 400;
        throw error;
    }

    const menuItem = await MenuItem.findOne({ _id: itemId, adminId, isDeleted: false });
    if (!menuItem) return null;

    menuItem.name = normalized.name;
    if (normalized.description !== undefined) menuItem.description = normalized.description;
    menuItem.price = normalized.price;
    menuItem.categoryId = normalized.categoryId;
    if (normalized.type !== undefined) menuItem.type = normalized.type;
    if (normalized.isAvailable !== undefined) menuItem.isAvailable = normalized.isAvailable;
    if (normalized.variants !== undefined) menuItem.variants = normalized.variants;
    if (normalized.addOns !== undefined) menuItem.addOns = normalized.addOns;
    if (normalized.tags !== undefined) menuItem.tags = normalized.tags;

    if (image) menuItem.image = image;
    if (removeImage) menuItem.image = undefined;

    menuItem.updatedBy = adminId;
    await menuItem.save();
    return menuItem;
};

const deleteItemService = async ({ adminId, itemId }) => {
    const menuItem = await MenuItem.findOne({ _id: itemId, adminId, isDeleted: false });
    if (!menuItem) return null;
    menuItem.isDeleted = true;
    menuItem.updatedBy = adminId;
    await menuItem.save();
    return menuItem;
};

const bulkCreateItemsService = async ({ adminId, items }) => {
    const docs = items.map((payload) => {
        const slug = buildSlug(payload.name);
        if (!slug) {
            const error = new Error(`name "${payload.name}" must produce a valid slug`);
            error.status = 400;
            throw error;
        }
        return {
            ...payload,
            adminId,
            slug,
            createdBy: adminId,
            updatedBy: adminId,
        };
    });
    return MenuItem.insertMany(docs, { ordered: false });
};

const bulkSoftDeleteItemsService = async ({ adminId, itemIds }) => {
    const result = await MenuItem.updateMany(
        { _id: { $in: itemIds }, adminId, isDeleted: false },
        { $set: { isDeleted: true, updatedBy: adminId } }
    );
    return result.modifiedCount || 0;
};

module.exports = {
    createItemService,
    getItemsService,
    updateItemService,
    deleteItemService,
    bulkCreateItemsService,
    bulkSoftDeleteItemsService,
};