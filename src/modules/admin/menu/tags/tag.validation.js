const validateTagName = (name) => {
    if (name === undefined || name === null) {
        return { isValid: false, errors: ["name is required"] };
    }

    if (typeof name !== "string") {
        return { isValid: false, errors: ["name must be a string"] };
    }

    const trimmed = name.trim();
    if (!trimmed) return { isValid: false, errors: ["name must be a non-empty string"] };
    if (trimmed.length > 30) return { isValid: false, errors: ["name must be 30 characters or less"] };

    return { isValid: true, normalizedName: trimmed.toLowerCase() };
};

module.exports = { validateTagName };

