class ValidationError extends Error {
    constructor(message, errors) {
        super(message);
        this.name = 'ValidationError';
        this.errors = errors; // Información adicional sobre los errores de validación
    }
}

class UniqueConstraintError extends Error {
    constructor(message, errors) {
        super(message);
        this.name = 'UniqueConstraintError';
        this.errors = errors;
    }
}

module.exports = {
    ValidationError,
    UniqueConstraintError
};
