const mongoose = require("mongoose");

const clientSchema = new mongoose.Schema({
    adminId: { type: mongoose.Schema.Types.ObjectId, ref: 'Admin', required: true, unique: true },
    cafeName: { type: String, required: true },
    address: { type: String, required: true },
    isActive: { type: Boolean, default: true },
    subscriptionDetail: {
        status: { type: String, enum: ["ACTIVE", "DISABLED", "EXPIRED"], default: "ACTIVE" },
        amount: { type: Number, default: 9999 },
        maxQr: { type: Number, min: 1, default: 1 },
        tableType: { type: String, enum: ["A", "1"], default: "1" },
        plan: { type: String, default: "" },
        startingDate: { type: Date, required: true , default: Date.now },
        endingDate: { type: Date, required: true },
        dueDate: { type: Date, required: true },
        paymentMethod: { type: String, enum: ["UPI", "CASH", "CHECK"], default: "CASH" },
        paymentStatus: { type: String, enum: ["PENDING", "COMPLETED"], default: "PENDING" }
    }
}, { timestamps: true });

module.exports = mongoose.model("Client", clientSchema);
