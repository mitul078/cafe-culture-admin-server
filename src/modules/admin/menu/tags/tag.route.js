const express = require("express");
const router = express.Router();

const { authenticate } = require("../../../../middlewares/auth.middleware");
const { authorize } = require("../../../../middlewares/role.middleware");

const { createTag, getTags, updateTag, deleteTag } = require("./tag.controller");

router.post(
    "/menu/tags/create",
    authenticate,
    authorize("ADMIN"),
    createTag
);

router.get(
    "/menu/tags/get",
    authenticate,
    authorize("ADMIN"),
    getTags
);

router.patch(
    "/menu/tags/update/:id",
    authenticate,
    authorize("ADMIN"),
    updateTag
);

router.delete(
    "/menu/tags/delete/:id",
    authenticate,
    authorize("ADMIN"),
    deleteTag
);

module.exports = router;

