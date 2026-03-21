const validateSignin = (data) => {
    const errors = [];

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!data.email || !emailRegex.test(data.email)) {
        errors.push('Valid email is required');
    }

    if (!data.password || data.password.length < 6) {
        errors.push('Password must be at least 6 characters long');
    }

    return {
        isValid: errors.length === 0,
        errors
    };
};

module.exports = {
    validateSignin
};
