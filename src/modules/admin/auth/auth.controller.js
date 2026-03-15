const { validateSignin, validateSignup } = require('./auth.validation');
const { signin, signup } = require('./auth.service');

const signinController = async (req, res) => {
    try {
        const { email, password } = req.body;

        // Validate input
        const validation = validateSignin({ email, password });
        if (!validation.isValid) {
            return res.status(400).json({
                success: false,
                message: 'Validation failed',
                errors: validation.errors
            });
        }

        // Call service
        const result = await signin(email, password);

        // Set token cookie
        const cookieOptions = {
            httpOnly: true,
            sameSite: 'lax'
        };
        if (process.env.NODE_ENV === 'production') {
            cookieOptions.secure = true;
        }
        res.cookie('token', result.token, cookieOptions);

        // Return success response
        res.status(200).json({
            success: true,
            message: 'Signin successful',
            data: result
        });
    } catch (error) {
        res.status(401).json({
            success: false,
            message: error.message
        });
    }
};

const signupController = async (req, res) => {
    try {
        const { email, password, role, username, phone, cafeName, address, subscriptionDetail } = req.body;

        // For ADMIN role, password is optional (will be generated)
        const signupData = { email, role };
        if (role !== 'ADMIN' || password) {
            signupData.password = password;
        }

        // Validate input
        const validation = validateSignup(signupData);
        if (!validation.isValid) {
            return res.status(400).json({
                success: false,
                message: 'Validation failed',
                errors: validation.errors
            });
        }

        // Prepare additional data for ADMIN role
        const additionalData = {};
        if (role === 'ADMIN') {
            additionalData.username = username;
            additionalData.phone = phone;
            additionalData.cafeName = cafeName;
            additionalData.address = address;
            if (subscriptionDetail) {
                additionalData.subscriptionDetail = subscriptionDetail;
            }
        }

        // Call service
        const result = await signup(email, password, role, additionalData);

        // Return success response
        res.status(201).json({
            success: true,
            message: 'Admin created successfully',
            data: result
        });
    } catch (error) {
        res.status(400).json({
            success: false,
            message: error.message
        });
    }
};

module.exports = {
    signinController,
    signupController
};
