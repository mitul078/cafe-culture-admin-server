const validateCreateCategory = (data) => {
    const errors = [];

    if (data.categoryName === undefined || typeof data.categoryName !== 'string' || data.categoryName.trim() === '') {
        errors.push('categoryName is required and must be a non-empty string');
    }

    if (data.order === undefined || typeof data.order !== 'number' || data.order < 0) {
        errors.push('order is required and must be a non-negative number');
    }

    return {
        isValid: errors.length === 0,
        errors
    };
};

const validateUpdateCategory = (data) => {
    const errors = [];

    if (data.categoryName !== undefined) {
        if (typeof data.categoryName !== 'string' || data.categoryName.trim() === '') {
            errors.push('categoryName must be a non-empty string');
        }
    }

    if (data.order !== undefined) {
        if (typeof data.order !== 'number' || data.order < 0) {
            errors.push('order must be a non-negative number');
        }
    }

    return {
        isValid: errors.length === 0,
        errors
    };
};

module.exports = {
    validateCreateCategory,
    validateUpdateCategory
};
