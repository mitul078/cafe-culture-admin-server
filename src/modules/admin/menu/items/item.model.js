const mongoose = require("mongoose");

const variantSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            trim: true,
            default: "Regular",
        },
        size: {
            type: String,
            trim: true,
            default: "Regular",

        },
        price: {
            type: Number,
            required: true,
            min: 0,
        },
        sku: {
            type: String,
            trim: true,
            uppercase: true,
        },
        isActive: {
            type: Boolean,
            default: true,
        },
    },
    { _id: false }
);

const addOnSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: true,
            trim: true,

        },
        price: {
            type: Number,
            required: true,
            min: 0,
        },
    },
    { _id: false }
);

const menuItemSchema = new mongoose.Schema(
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
            index: true,
        },

        slug: {
            type: String,
            lowercase: true,
            unique: true,
            index: true,
        },

        description: {
            type: String,
            trim: true,
        },

        price: {
            type: Number,
            required: true,
            min: 0,
        },

        categoryId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Category",
            required: true,
            index: true,
        },

        order: {
            type: Number,
            required: true,
            min: 1,
        },

        globalOrder: {
            type: Number,
            required: true,
            min: 1,
            index: true,
        },

        image: {
            url: { type: String },
            publicId: { type: String },
        },

        variants: {
            type: [variantSchema],
            default: [],
        },

        addOns: {
            type: [addOnSchema],
            default: [],
        },

        tags: {
            type: [String],
            index: true,
        },

        rating: {
            type: Number,
            min: 0,
            max: 5,
            default: 0,
        },

        reviewsCount: {
            type: Number,
            default: 0,
        },

        isAvailable: {
            type: Boolean,
            default: true,
            index: true,
        },

        isDeleted: {
            type: Boolean,
            default: false,
            index: true,
        },

        type: {
            type: String,
            enum: ["VEG", "NON-VEG", "EGGS"],
            default: "VEG",
            index: true,
        },
    },
    {
        timestamps: true,
        versionKey: false,
    }
);

/* ---------------- INDEXES ---------------- */

// Fast search
menuItemSchema.index({ name: "text", description: "text" });

// Sorting & filtering
menuItemSchema.index({ categoryId: 1, isAvailable: 1 });
menuItemSchema.index({ adminId: 1, isDeleted: 1 });

/* ---------------- EXPORT ---------------- */
module.exports = mongoose.model("MenuItem", menuItemSchema);