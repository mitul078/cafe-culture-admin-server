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

        if (!data.phone || typeof data.phone !== 'string' || !/^\d{10}$/.test(data.phone)) {
            errors.push('Valid 10-digit phone number is required');
        }

        if (!data.cafeName || typeof data.cafeName !== 'string' || data.cafeName.trim().length < 2) {
            errors.push('Cafe name is required and must be at least 2 characters long');
        }

        if (!data.address || typeof data.address !== 'string' || data.address.trim().length < 5) {
            errors.push('Address is required and must be at least 5 characters long');
        }
    }

    return {
        isValid: errors.length === 0,
        errors
    };
};

module.exports = {
    validateSignin,
    validateSignup
};
