const validateSignin = (data) => {
    const errors = [];

    if (!data.email || typeof data.email !== 'string' || !data.email.includes('@')) {
        errors.push('Valid email is required');
    }

    if (!data.password || typeof data.password !== 'string' || data.password.length < 6) {
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
