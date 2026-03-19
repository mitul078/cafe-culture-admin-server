const cookieParser = require("cookie-parser")
const express = require("express")
const app = express()

app.use(express.json())

app.use(cookieParser())

// Routes
const authRoutes = require('./modules/admin/auth/auth.route');
app.use('/api/v1/admin', authRoutes);

const categoryRoutes = require('./modules/admin/menu/category/category.route');
app.use('/api/v1/admin', categoryRoutes);

const superAdminClientRoutes = require('./modules/super-admin/clients/client.route');
app.use('/api/v1/super-admin', superAdminClientRoutes);

const superAdminAuthRoutes = require('./modules/super-admin/auth/signup.route');
app.use('/api/v1/super-admin', superAdminAuthRoutes);



// Error handling middleware
const { errorHandler } = require('./middlewares/error.middleware');
app.use(errorHandler);

module.exports = app