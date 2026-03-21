const mongoose = require("mongoose")
const categorySchema = new mongoose.Schema({
    adminId: { type: mongoose.Schema.Types.ObjectId, ref: "Admin", required: true },
    categoryName: { type: String, required: true },
    order: { type: Number, min: 0 },
    isActive: { type: Boolean, default: true },
    color: { type: String }
}, { timestamps: true })


categorySchema.index({ adminId: 1, categoryName: 1 }, { unique: true })

module.exports = mongoose.model("Category", categorySchema)