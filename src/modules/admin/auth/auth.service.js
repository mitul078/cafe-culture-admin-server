const Admin = require('./auth.model');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const signin = async (email, password) => {
    try {
        // Find admin by email
        const admin = await Admin.findOne({ email }).select('+password');
        if (!admin) {
            throw new Error('Invalid email or password');
        }

        // Compare password
        const isPasswordValid = await bcrypt.compare(password, admin.password);
        if (!isPasswordValid) {
            throw new Error('Invalid email or password');
        }

        // Generate JWT token
        const token = jwt.sign(
            { id: admin._id, email: admin.email, role: admin.role },
            process.env.JWT_SECRET,
            { expiresIn: '72h' }
        );

        return {
            token,
            admin: {
                id: admin._id,
                email: admin.email,
                role: admin.role
            }
        };
    } catch (error) {
        throw error;
    }
};

module.exports = {
    signin
};
