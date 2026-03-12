const mongoose = require("mongoose")

async function connectDB() {
    await mongoose.connect(process.env.MONGO_URI)
        .then(() => console.log("DB CONNECTED"))
        .catch(err => console.log("DB ERROR", err))
}

module.exports = connectDB