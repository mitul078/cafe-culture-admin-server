const Admin = require('../../admin/auth/auth.model');
const bcrypt = require('bcrypt');
const generateSnowflakeId = require('../../../utils/snowflake');
const generateSecurePassword = require('../../../utils/generatePassword');

const signup = async (email, password, role = 'ADMIN', username, name) => {
    try {
        const existingAdmin = await Admin.findOne({ email });
        if (existingAdmin) {
            throw new Error('Admin with this email already exists');
        }

        if (role === 'ADMIN' && username) {
            const existingUsername = await Admin.findOne({ username });
            if (existingUsername) {
                throw new Error('Admin with this username already exists');
            }
        }

        let finalPassword = password;
        if (role === 'ADMIN' && !password) {
            finalPassword = generateSecurePassword();
        }

        const hashedPassword = await bcrypt.hash(finalPassword, 10);

        const adminId = generateSnowflakeId();
        const newAdmin = new Admin({
            adminId, // 👈 use snowflake here
            email,
            password: hashedPassword,
            role,
            username,
            name
        });

        await newAdmin.save();

        return {
            id: newAdmin.adminId,
            email: newAdmin.email,
            role: newAdmin.role,
            username: newAdmin.username,
            generatedPassword: finalPassword,
            name: newAdmin.name

        };

    } catch (error) {
        throw error;
    }
};

module.exports = {
    signup
};