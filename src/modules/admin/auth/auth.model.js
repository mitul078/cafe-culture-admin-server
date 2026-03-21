const mongoose = require("mongoose")

const adminSchema = new mongoose.Schema({
    adminId: { type: String,  unique:true },
    email: { type: String, required: true, unique: true, index: true },
    password: { type: String, required: true, select: false },
    role: { type: String, enum: ['SUPER_ADMIN', 'ADMIN', 'CUSTOMER'], default: 'ADMIN' },
    username: {
        type: String,
        required: function () { return this.role === 'ADMIN'; },
        unique: true,
        index: true
    }
}, { timestamps: true })

module.exports = mongoose.model("Admin", adminSchema)