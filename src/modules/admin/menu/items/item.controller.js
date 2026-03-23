const MenuItem = require("./item.model");
const uploadToS3 = require("../../../../utils/s3Upload");
const generateSnowflakeId = require("../../../../utils/snowflake");
const slugify = require("slugify");
const { validateCreateItem, validateGetItems, validateUpdateItem, validateDeleteItem } = require("./item.validation");

const buildImageUrl = (key) => {
    if (!key) return null
    return `${process.env.CDN_URL}/${key}`
}

const createItem = async (req, res) => {
    try {
        const adminId = req.admin.id;

        const validation = validateCreateItem(req.body);
        if (!validation.isValid) {
            return res.status(400).json({
                success: false,
                message: "Validation failed",
                errors: validation.errors,
            });
        }

        const {
            name,
            description,
            price,
            categoryId,
            order,
            globalOrder,
            variants,
            addOns,
            tags,
            type,
            isAvailable,
        } = validation.normalized;

        // Build slug from name + unique suffix to avoid collisions
        const baseSlug = slugify(name, { lower: true, strict: true });
        if (!baseSlug) {
            return res.status(400).json({
                success: false,
                message: "Validation failed",
                errors: ["name must produce a valid slug"],
            });
        }
        const uniqueSuffix = generateSnowflakeId();
        const slug = `${baseSlug}-${uniqueSuffix}`;

        // Upload image to S3 if provided
        let image;
        if (req.file) {
            const key = await uploadToS3(req.file, `clients/${adminId}/items`);
            image = {
                url: buildImageUrl(key),
                publicId: key,
            };
        }

        const payload = {
            adminId,
            name,
            slug,
            ...(description !== undefined ? { description } : {}),
            price,
            categoryId,
            order,
            globalOrder,
            variants,
            addOns,
            tags,
            ...(image ? { image } : {}),
            ...(type !== undefined ? { type } : {}),
            ...(isAvailable !== undefined ? { isAvailable } : {}),
        };

        const menuItem = await MenuItem.create(payload);

        return res.status(201).json({
            success: true,
            message: "Menu item created successfully",
            data: menuItem,
        });
    } catch (error) {
        // Duplicate slug edge-case (race condition)
        if (error.code === 11000) {
            return res.status(409).json({
                success: false,
                message: "A menu item with this name already exists. Try a different name.",
            });
        }

        if (error.name === "ValidationError") {
            const errors = Object.values(error.errors).map((val) => val.message);
            return res.status(400).json({
                success: false,
                message: "Validation Error",
                errors,
            });
        }

        console.error("createItem failed:", error);
        return res.status(500).json({
            success: false,
            message: "Failed to create menu item",
        });
    }
};

// ─── GET ITEMS ────────────────────────────────────────────────────────────────
const getItems = async (req, res) => {
    try {
        const adminId = req.admin.id;

        const validation = validateGetItems(req.query);
        if (!validation.isValid) {
            return res.status(400).json({
                success: false,
                message: "Validation failed",
                errors: validation.errors,
            });
        }

        const {
            page,
            limit,
            categoryId,
            type,
            isAvailable,
            search,
            tags,
            sortBy,
            sortOrder,
        } = validation.normalized;

        // Base filter — never return deleted items
        const filter = { adminId, isDeleted: false };

        if (categoryId) filter.categoryId = categoryId;
        if (type) filter.type = type;
        if (isAvailable !== undefined) filter.isAvailable = isAvailable === "true";

        // Full-text search on name + description
        if (search) {
            filter.$text = { $search: search };
        }

        if (tags && tags.length > 0) {
            filter.tags = { $in: tags };
        }

        const skip = (page - 1) * limit;
        const sort = { [sortBy]: sortOrder === "desc" ? -1 : 1 };

        const [items, total] = await Promise.all([
            MenuItem.find(filter)
                .sort(sort)
                .skip(skip)
                .limit(limit)
                .populate("categoryId", "name slug"),
            MenuItem.countDocuments(filter),
        ]);

        return res.status(200).json({
            success: true,
            data: items,
            pagination: {
                total,
                page,
                limit,
                totalPages: Math.ceil(total / limit),
            },
        });
    } catch (error) {
        console.error("getItems failed:", error);
        return res.status(500).json({
            success: false,
            message: "Failed to fetch menu items",
        });
    }
};

const updateItem = async (req, res) => {
    try {
        const adminId = req.admin.id;
        const itemId = req.params.id;

        const idValidation = validateDeleteItem(itemId);
        if (!idValidation.isValid) {
            return res.status(400).json({
                success: false,
                message: "Validation failed",
                errors: idValidation.errors,
            });
        }

        const validation = validateUpdateItem(req.body);
        if (!validation.isValid) {
            return res.status(400).json({
                success: false,
                message: "Validation failed",
                errors: validation.errors,
            });
        }

        const { normalized } = validation;

        const menuItem = await MenuItem.findOne({ _id: itemId, adminId, isDeleted: false });
        if (!menuItem) {
            return res.status(404).json({
                success: false,
                message: "Menu item not found",
            });
        }

        // Keep slug/order/globalOrder untouched to avoid unique collisions & required fields.
        menuItem.name = normalized.name;
        if (normalized.description !== undefined) menuItem.description = normalized.description;
        menuItem.price = normalized.price;
        menuItem.categoryId = normalized.categoryId;

        if (normalized.type !== undefined) menuItem.type = normalized.type;
        if (normalized.isAvailable !== undefined) menuItem.isAvailable = normalized.isAvailable;

        if (normalized.variants !== undefined) menuItem.variants = normalized.variants;
        if (normalized.addOns !== undefined) menuItem.addOns = normalized.addOns;
        if (normalized.tags !== undefined) menuItem.tags = normalized.tags;

        // Upload image to S3 if provided
        if (req.file) {
            const key = await uploadToS3(req.file, `clients/${adminId}/items`);
            menuItem.image = {
                url: buildImageUrl(key),
                publicId: key,
            };
        } else {
            // Allow clearing the image (frontend sends removeImage=true)
            const removeImageRaw = req.body?.removeImage;
            const shouldRemoveImage =
                removeImageRaw === true || removeImageRaw === "true" || removeImageRaw === 1 || removeImageRaw === "1";
            if (shouldRemoveImage) {
                menuItem.image = undefined;
            }
        }

        await menuItem.save();

        return res.status(200).json({
            success: true,
            message: "Menu item updated successfully",
            data: menuItem,
        });
    } catch (error) {
        if (error && error.name === "ValidationError") {
            const errors = Object.values(error.errors).map((val) => val.message);
            return res.status(400).json({
                success: false,
                message: "Validation Error",
                errors,
            });
        }

        if (error && error.code === 11000) {
            return res.status(409).json({
                success: false,
                message: "Duplicate menu item",
            });
        }

        console.error("updateItem failed:", error);
        return res.status(500).json({
            success: false,
            message: "Failed to update menu item",
        });
    }
};

const deleteItem = async (req, res) => {
    try {
        const adminId = req.admin.id;
        const itemId = req.params.id;

        const idValidation = validateDeleteItem(itemId);
        if (!idValidation.isValid) {
            return res.status(400).json({
                success: false,
                message: "Validation failed",
                errors: idValidation.errors,
            });
        }

        const menuItem = await MenuItem.findOne({ _id: itemId, adminId, isDeleted: false });
        if (!menuItem) {
            return res.status(404).json({
                success: false,
                message: "Menu item not found",
            });
        }

        menuItem.isDeleted = true;
        await menuItem.save();

        return res.status(200).json({
            success: true,
            message: "Menu item deleted successfully",
        });
    } catch (error) {
        console.error("deleteItem failed:", error);
        return res.status(500).json({
            success: false,
            message: "Failed to delete menu item",
        });
    }
};

module.exports = { createItem, getItems, updateItem, deleteItem };