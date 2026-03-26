const express = require("express");
const router = express.Router();
const multer = require("multer");

const { createItem, getItems, updateItem, deleteItem } = require("./item.controller");
const upload = require("../../../../utils/uploadImage");
const { authenticate } = require("../../../../middlewares/auth.middleware");
const { authorize } = require("../../../../middlewares/role.middleware");
const { readCache } = require("../../../../middlewares/cache.middleware");

const handleMulterError = (err, req, res, next) => {
    if (err instanceof multer.MulterError) {
        if (err.code === "LIMIT_FILE_SIZE") {
            return res.status(400).json({
                success: false,
                message: "Image must be 5 MB or smaller",
            });
        }
        return res.status(400).json({ success: false, message: err.message });
    }
    if (err) {
        return res.status(400).json({ success: false, message: err.message });
    }
    next();
};

router.post(
    "/menu/item/create",
    upload.single("image"),
    handleMulterError,
    authenticate,
    authorize("ADMIN"),
    createItem
);

router.get(
    "/menu/item/get",
    authenticate,
    authorize("ADMIN"),
    readCache("menu-items", 60),
    getItems
);

router.patch(
    "/menu/item/update/:id",
    upload.single("image"),
    handleMulterError,
    authenticate,
    authorize("ADMIN"),
    updateItem
);

router.delete(
    "/menu/item/delete/:id",
    authenticate,
    authorize("ADMIN"),
    deleteItem
);

module.exports = router;