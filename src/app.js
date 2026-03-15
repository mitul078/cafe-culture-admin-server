const cookieParser = require("cookie-parser")
const express = require("express")
const app = express()

app.use(express.json())

app.use(cookieParser())

// Routes
const authRoutes = require('./modules/admin/auth/auth.route');
app.use('/api/v1/admin/auth', authRoutes);

// Error handling middleware
const { errorHandler } = require('./middlewares/error.middleware');
app.use(errorHandler);

module.exports = app