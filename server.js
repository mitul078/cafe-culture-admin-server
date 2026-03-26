const path = require("path")
require("dotenv").config({ path: path.join(__dirname, ".env") })

const app = require("./src/app")

const connectDB  = require("./src/config/db")
const { connectRedis } = require("./src/config/redis")

connectDB()
connectRedis()

app.listen(process.env.PORT , () => {
    console.log("SERVER STARTED")
})