const { validateSignin } = require('./auth.validation');
const { signin } = require('./auth.service');

const signinController = async (req, res) => {
    try {
        const { email, password } = req.body;

        const validation = validateSignin({ email, password });
        if (!validation.isValid) {
            return res.status(400).json({
                success: false,
                message: 'Validation failed',
                errors: validation.errors
            });
        }

        const result = await signin(email, password);

        res.cookie('accessToken', result.accessToken, {
            httpOnly: true,
            secure: true,
            sameSite: 'strict',
            maxAge: 15 * 60 * 1000 // 15 min
        });

        res.cookie('refreshToken', result.refreshToken, {
            httpOnly: true,
            secure: true,
            sameSite: 'strict',
            maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
        });

        // ❌ REMOVE token from response
        res.status(200).json({
            success: true,
            message: 'Signin successful',
            admin: result.admin
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
