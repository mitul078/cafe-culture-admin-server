const MenuTag = require("./tag.model");
const MenuItem = require("../items/item.model");
const { validateTagName } = require("./tag.validation");
const logger = require("../../../../utils/logger");
const { invalidateItemCache } = require("../../../../middlewares/cache.middleware");
const mongoose = require("mongoose");

const getAdminId = (req) => req.admin?.id;

const createTag = async (req, res, next) => {
    try {
        const adminId = getAdminId(req);
        const { name } = req.body || {};

        const validation = validateTagName(name);
        if (!validation.isValid) {
            return res.status(400).json({ success: false, message: "Validation failed", errors: validation.errors });
        }

        const existing = await MenuTag.findOne({ adminId, name: validation.normalizedName });
        if (existing) {
            return res.status(400).json({ success: false, message: "Tag already exists" });
        }

        const tag = await MenuTag.create({ adminId, name: validation.normalizedName });

        // Tags do not directly change existing item tags, but cache can be based on tag filters.
        await invalidateItemCache(adminId);

        return res.status(201).json({
            success: true,
            data: { id: tag._id, name: tag.name, isActive: tag.isActive },
        });
    } catch (error) {
        logger.warn({ error }, "createTag failed");
        next(error);
    }
};

const getTags = async (req, res, next) => {
    try {
        const adminId = getAdminId(req);
        const tags = await MenuTag.find({ adminId, isActive: true }).sort({ name: 1 }).lean();

        return res.status(200).json({
            success: true,
            data: tags.map((t) => ({ id: t._id, name: t.name, isActive: t.isActive })),
        });
    } catch (error) {
        logger.warn({ error }, "getTags failed");
        next(error);
    }
};

const updateTag = async (req, res, next) => {
    try {
        const adminId = getAdminId(req);
        const tagId = req.params.id;
        const { name } = req.body || {};

        if (!mongoose.Types.ObjectId.isValid(tagId)) {
            return res.status(400).json({ success: false, message: "Invalid tag id" });
        }

        const validation = validateTagName(name);
        if (!validation.isValid) {
            return res.status(400).json({ success: false, message: "Validation failed", errors: validation.errors });
        }

        const tag = await MenuTag.findOne({ _id: tagId, adminId });
        if (!tag) return res.status(404).json({ success: false, message: "Tag not found" });

        const existing = await MenuTag.findOne({ adminId, name: validation.normalizedName, _id: { $ne: tagId } });
        if (existing) return res.status(400).json({ success: false, message: "Tag already exists" });

        const oldName = tag.name;
        tag.name = validation.normalizedName;
        await tag.save();

        // If any items used the old tag name, keep them in sync.
        await MenuItem.updateMany({ adminId, tags: oldName }, { $addToSet: { tags: validation.normalizedName } }).catch(() => {});
        await MenuItem.updateMany({ adminId, tags: oldName }, { $pull: { tags: oldName } }).catch(() => {});

        await invalidateItemCache(adminId);

        return res.status(200).json({
            success: true,
            data: { id: tag._id, name: tag.name, isActive: tag.isActive },
        });
    } catch (error) {
        logger.warn({ error }, "updateTag failed");
        next(error);
    }
};

const deleteTag = async (req, res, next) => {
    try {
        const adminId = getAdminId(req);
        const tagId = req.params.id;

        if (!mongoose.Types.ObjectId.isValid(tagId)) {
            return res.status(400).json({ success: false, message: "Invalid tag id" });
        }

        const tag = await MenuTag.findOne({ _id: tagId, adminId });
        if (!tag) return res.status(404).json({ success: false, message: "Tag not found" });

        const deletedName = tag.name;
        await MenuTag.deleteOne({ _id: tagId });

        // Remove deleted tag from any existing items.
        await MenuItem.updateMany({ adminId, tags: deletedName }, { $pull: { tags: deletedName } });

        await invalidateItemCache(adminId);

        return res.status(200).json({
            success: true,
            message: "Tag deleted",
        });
    } catch (error) {
        logger.warn({ error }, "deleteTag failed");
        next(error);
    }
};

module.exports = { createTag, getTags, updateTag, deleteTag };

