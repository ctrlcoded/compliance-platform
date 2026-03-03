"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.errorHandler = void 0;
const zod_1 = require("zod");
const DomainError_1 = require("../../../../core/domain/errors/DomainError");
const logger_1 = require("../../../../infrastructure/logger");
const errorHandler = (err, req, res, next) => {
    if (err instanceof zod_1.z.ZodError) {
        return res.status(400).json({
            error: {
                code: 'VALIDATION_ERROR',
                message: 'Invalid input parameters',
                details: err.errors,
            },
        });
    }
    if (err instanceof DomainError_1.DomainError) {
        const statusCode = err.code === 'NOT_FOUND' ? 404 : 422;
        return res.status(statusCode).json({
            error: {
                code: err.code,
                message: err.message,
            },
        });
    }
    logger_1.logger.error(err, 'Unhandled exception');
    return res.status(500).json({
        error: {
            code: 'INTERNAL_SERVER_ERROR',
            message: 'An unexpected error occurred',
        },
    });
};
exports.errorHandler = errorHandler;
