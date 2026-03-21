const Admin = require('./auth.model');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const signin = async (email, password) => {
    const admin = await Admin.findOne({ email }).select('+password');
    if (!admin) throw new Error('Invalid email or password');

    const isPasswordValid = await bcrypt.compare(password, admin.password);
    if (!isPasswordValid) throw new Error('Invalid email or password');

    const payload = {
        id: admin._id,
        email: admin.email,
        role: admin.role
    };

    // ✅ Access Token (short life)
    const accessToken = jwt.sign(payload, process.env.JWT_SECRET, {
        expiresIn: '15m'
    });

    // ✅ Refresh Token (long life)
    const refreshToken = jwt.sign(payload, process.env.JWT_REFRESH_SECRET, {
        expiresIn: '7d'
    });

    // ✅ OPTIONAL: store refresh token in DB
    admin.refreshToken = refreshToken;
    await admin.save();

    return {
        accessToken,
        refreshToken,
        admin: {
            id: admin._id,
            email: admin.email,
            role: admin.role
        }
    };
};

module.exports = {
    signin
};
