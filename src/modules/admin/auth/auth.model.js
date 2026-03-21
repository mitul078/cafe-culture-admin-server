const mongoose = require("mongoose")

const adminSchema = new mongoose.Schema({
    adminId: { type: String, unique: true },

    email: { type: String, required: true, unique: true, index: true },

    password: { type: String, required: true, select: false },

    name: { type: String },

    role: {
        type: String,
        enum: ['SUPER_ADMIN', 'ADMIN'],
        default: 'ADMIN'
    },

    username: { type: String, unique: true, index: true },

    // ✅ NEW FIELDS
    refreshToken: String,
    failedAttempts: { type: Number, default: 0 },
    lockUntil: Date

}, { timestamps: true });

module.exports = mongoose.model("Admin", adminSchema)