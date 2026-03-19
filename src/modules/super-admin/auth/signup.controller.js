const { validateSignup } = require('./signup.validation');
const { signup } = require('./signup.service');

const signupController = async (req, res) => {
    try {
        const { email, password, role, username } = req.body;

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


        // Call service
        const result = await signup(email, password, role, username);

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
    signupController
};