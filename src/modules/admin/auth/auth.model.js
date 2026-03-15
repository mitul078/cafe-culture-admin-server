const mongoose = require("mongoose")

const adminSchema = new mongoose.Schema({
    email: { type: String, required: true, unique: true, index: true },
    password: { type: String, required: true, select: false },
    role: { type: String, enum: ['SUPER_ADMIN', 'ADMIN', 'CUSTOMER'], default: 'ADMIN' },
    username: {
        type: String,
        required: function() { return this.role === 'ADMIN'; },
        unique: true,
        index: true
    },
    phone: {
        type: String,
        required: function() { return this.role === 'ADMIN'; }
    },
    cafeName: {
        type: String,
        required: function() { return this.role === 'ADMIN'; }
    },
    address: {
        type: String,
        required: function() { return this.role === 'ADMIN'; }
    },
    isActive: { type: Boolean, default: true },
    subscriptionDetail: {
        status: { type: String, enum: ["ACTIVE", "DISABLED", "EXPIRED"], default: "ACTIVE" },
        amount: { type: Number, default: 999 },
        maxQr: { type: Number, min: 1, default: 1 },
        tableType: { type: String, enum: ["A", "1"], default: "1" },
        plan: { type: String, default: "" },
        startingDate: { type: Date },
        endingDate: { type: Date },
        dueDate: { type: Date },
        paymentMethod: { type: String, enum: ["UPI", "CASH", "CHECK"], default: "CASH" },
        paymentStatus: { type: String, enum: ["PENDING", "COMPLETED"], default: "PENDING" }
    }
}, { timestamps: true })

module.exports = mongoose.model("Admin", adminSchema)