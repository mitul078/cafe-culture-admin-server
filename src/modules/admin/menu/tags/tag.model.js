const mongoose = require("mongoose");

const tagSchema = new mongoose.Schema(
    {
        adminId: {
            type: String,
            required: true,
            index: true,
        },
        name: {
            type: String,
            required: true,
            trim: true,
            lowercase: true,
            index: true,
        },
        isActive: {
            type: Boolean,
            default: true,
            index: true,
        },
    },
    { timestamps: true, versionKey: false }
);

tagSchema.index({ adminId: 1, name: 1 }, { unique: true });

module.exports = mongoose.model("MenuTag", tagSchema);

