const { validateSignin } = require('./auth.validation');
const { signin } = require('./auth.service');

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

module.exports = {
    signinController
};
