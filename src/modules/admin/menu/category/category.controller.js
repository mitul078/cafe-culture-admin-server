const Category = require("./category.model")
const { validateCreateCategory, validateUpdateCategory } = require("./category.validation")

exports.createCategory = async (req, res, next) => {
    try {
        const adminId = req.admin.id
        let { categoryName, order } = req.body

        const validation = validateCreateCategory({ categoryName, order })
        if (!validation.isValid) {
            return res.status(400).json({
                success: false,
                message: 'Validation failed',
                errors: validation.errors
            })
        }

        categoryName = categoryName.trim()

        // Duplicate check
        const existing = await Category.findOne({ adminId, categoryName })
        if (existing) return res.status(400).json({ success: false, message: 'Category already exists' })

        // 🔥 SHIFT ORDERS
        await Category.updateMany(
            { adminId, order: { $gte: order } },
            { $inc: { order: 1 } }
        )

        const category = await Category.create({
            categoryName,
            order,
            adminId
        })

        res.status(201).json({
            success: true,
            data: {
                id: category._id,
                categoryName,
                order
            }
        })

    } catch (error) {
        next(error)
    }
}

exports.updateCategory = async (req, res, next) => {
    try {
        const adminId = req.admin.id
        const categoryId = req.params.id
        let { categoryName, order } = req.body

        const validation = validateUpdateCategory({ categoryName, order })
        if (!validation.isValid) {
            return res.status(400).json({
                success: false,
                message: 'Validation failed',
                errors: validation.errors
            })
        }

        const category = await Category.findOne({ _id: categoryId, adminId })
        if (!category) return res.status(404).json({ success: false, message: 'Category not found' })

        const oldOrder = category.order

        // Name update
        if (categoryName !== undefined) {
            if (typeof categoryName !== "string" || categoryName.trim() === "") {
                throw new Error("Invalid category name")
            }

            categoryName = categoryName.trim()


            const existing = await Category.findOne({
                adminId,
                categoryName,
                _id: { $ne: categoryId }
            })

            if (existing) return res.status(400).json({ success: false, message: 'Category already exists' })

            category.categoryName = categoryName
        }

        // 🔥 ORDER UPDATE LOGIC
        if (order !== undefined && order !== oldOrder) {

            if (typeof order !== "number" || order < 0) {
                throw new Error("Invalid order")
            }

            if (order > oldOrder) {
                // Move down → shift others up
                await Category.updateMany(
                    {
                        adminId,
                        order: { $gt: oldOrder, $lte: order }
                    },
                    { $inc: { order: -1 } }
                )
            } else {
                // Move up → shift others down
                await Category.updateMany(
                    {
                        adminId,
                        order: { $gte: order, $lt: oldOrder }
                    },
                    { $inc: { order: 1 } }
                )
            }

            category.order = order
        }

        await category.save()

        res.status(200).json({
            success: true,
            data: {
                id: category._id,
                categoryName: category.categoryName,
                order: category.order
            }
        })

    } catch (error) {
        next(error)
    }
}

exports.deleteCategory = async (req, res, next) => {
    try {
        const adminId = req.admin.id
        const categoryId = req.params.id

        const category = await Category.findOne({ _id: categoryId, adminId })
        if (!category) return res.status(404).json({ success: false, message: 'Category not found' })

        const deletedOrder = category.order

        await Category.deleteOne({ _id: categoryId })

        // 🔥 FIX ORDER
        await Category.updateMany(
            { adminId, order: { $gt: deletedOrder } },
            { $inc: { order: -1 } }
        )

        res.status(200).json({
            success: true,
            message: "CATEGORY DELETED"
        })

    } catch (error) {
        next(error)
    }
}

exports.getCategories = async (req, res, next) => {
    try {
        const adminId = req.admin.id

        const categories = await Category.find({
            adminId,
            isActive: true
        }).sort({ order: 1 })

        res.status(200).json({
            success: true,
            data: categories.map(cat => ({
                id: cat._id,
                categoryName: cat.categoryName,
                order: cat.order
            }))
        })

    } catch (error) {
        next(error)
    }
}