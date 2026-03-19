const validateSignup = (data) => {
    const errors = [];

    if (!data.email || typeof data.email !== 'string' || !data.email.includes('@')) {
        errors.push('Valid email is required');
    }

    // Password is required only for non-ADMIN roles or if explicitly provided
    if (data.role !== 'ADMIN' && (!data.password || typeof data.password !== 'string' || data.password.length < 6)) {
        errors.push('Password must be at least 6 characters long');
    }

    if (data.role && !['SUPER_ADMIN', 'ADMIN', 'CUSTOMER'].includes(data.role)) {
        errors.push('Invalid role. Must be SUPER_ADMIN, ADMIN, or CUSTOMER');
    }

    // Additional validations for ADMIN role
    if (data.role === 'ADMIN') {
        if (!data.username || typeof data.username !== 'string' || data.username.trim().length < 3) {
            errors.push('Username is required and must be at least 3 characters long');
        }
    }

    return {
        isValid: errors.length === 0,
        errors
    };
};

module.exports = {
    validateSignup
};