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

    if (data.isActive !== undefined && typeof data.isActive !== 'boolean') {
        errors.push('isActive must be a boolean');
    }

    if (data.color !== undefined) {
        if (typeof data.color !== 'string' || data.color.trim() === '') {
            errors.push('color must be a non-empty string');
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
