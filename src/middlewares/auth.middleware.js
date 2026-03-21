const jwt = require('jsonwebtoken');

const authenticate = (req, res, next) => {
    try {
        const token = req.cookies?.accessToken || req.cookies?.token;
        if (!token) {
            return res.status(401).json({
                success: false,
                message: 'Access denied. No token provided.'
            });
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.admin = decoded;
        next();
    } catch (error) {
        res.status(401).json({
            success: false,
            message: 'Invalid token.'
        });
    }
};

module.exports = {
    authenticate
};
