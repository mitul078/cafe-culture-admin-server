const express = require("express")
const { authenticate } = require("../../../../middlewares/auth.middleware")
const { authorize } = require("../../../../middlewares/role.middleware")
const { createCategory, getCategories, updateCategory, deleteCategory } = require("./category.controller")
const router = express.Router()

router.post("/menu/category/create", authenticate, authorize("ADMIN"), createCategory)
router.get("/menu/category/get", authenticate, authorize("ADMIN"), getCategories)
router.patch("/menu/category/update/:id", authenticate, authorize("ADMIN"), updateCategory)
router.delete("/menu/category/delete/:id", authenticate, authorize("ADMIN"), deleteCategory)


module.exports = router