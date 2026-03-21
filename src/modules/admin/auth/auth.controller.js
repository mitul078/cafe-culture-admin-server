const { validateSignin } = require('./auth.validation');
const { signin, signout } = require('./auth.service');

const signinController = async (req, res) => {
    try {
        const { email, password } = req.body;
        const isProduction = process.env.NODE_ENV === "production";

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
            secure: isProduction,
            sameSite: isProduction ? 'none' : 'lax',
            maxAge: 15 * 60 * 1000 // 15 min
        });

        res.cookie('refreshToken', result.refreshToken, {
            httpOnly: true,
            secure: isProduction,
            sameSite: isProduction ? 'none' : 'lax',
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

const getMe = (req, res) => {
    res.json({
        admin: req.admin
    });
};

const signoutController = async (req, res) => {
    try {
        const isProduction = process.env.NODE_ENV === "production";

        await signout(req.admin?.id);

        res.clearCookie('accessToken', {
            httpOnly: true,
            secure: isProduction,
            sameSite: isProduction ? 'none' : 'lax'
        });

        res.clearCookie('refreshToken', {
            httpOnly: true,
            secure: isProduction,
            sameSite: isProduction ? 'none' : 'lax'
        });

        return res.status(200).json({
            success: true,
            message: 'Signout successful'
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: 'Signout failed'
        });
    }
};

module.exports = {
    signinController,
    getMe,
    signoutController
};
