const Admin = require('./auth.model');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const generateRandomPassword = () => {
    return Math.random().toString(36).slice(-8) + Math.random().toString(36).slice(-8);
};

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

const signup = async (email, password, role = 'ADMIN', username) => {
    try {
        // Check if admin already exists
        const existingAdmin = await Admin.findOne({ email });
        if (existingAdmin) {
            throw new Error('Admin with this email already exists');
        }

        // If role is ADMIN, check username uniqueness
        if (role === 'ADMIN' && username) {
            const existingUsername = await Admin.findOne({ username });
            if (existingUsername) {
                throw new Error('Admin with this username already exists');
            }
        }

        // Generate password if not provided for ADMIN
        let finalPassword = password;
        if (role === 'ADMIN' && !password) {
            finalPassword = generateRandomPassword();
        }

        // Hash password
        const saltRounds = 10;
        const hashedPassword = await bcrypt.hash(finalPassword, saltRounds);

        // Create new admin
        const newAdmin = new Admin({
            email,
            password: hashedPassword,
            role,
            username
        });

        await newAdmin.save();

        return {
            id: newAdmin._id,
            email: newAdmin.email,
            role: newAdmin.role,
            ...(role === 'ADMIN' && {
                username: newAdmin.username,
                generatedPassword: finalPassword // Return the generated password for ADMIN
            })
        };
    } catch (error) {
        throw error;
    }
};

module.exports = {
    signin,
    signup
};
