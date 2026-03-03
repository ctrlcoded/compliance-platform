import { Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import { DomainError } from '../../../../core/domain/errors/DomainError';
import { logger } from '../../../../infrastructure/logger';

const domainErrorStatusMap: Record<string, number> = {
    NOT_FOUND: 404,
    NO_SURPLUS: 400,
    INVALID_BANK_AMOUNT: 400,
    INSUFFICIENT_SURPLUS: 409,
    SURPLUS_YEAR: 409,
    INVALID_APPLY_AMOUNT: 400,
    INSUFFICIENT_BANK: 409,
    INVALID_POOL_SIZE: 400,
    NEGATIVE_POOL_SUM: 409,
    INVALID_GHG_INTENSITY: 400,
    INVALID_ENERGY: 400,
    INVALID_COMPLIANCE_BALANCE: 400,
    INVALID_REPORTING_YEAR: 400,
};

export const errorHandler = (err: Error, req: Request, res: Response, next: NextFunction) => {
    if (err instanceof z.ZodError) {
        return res.status(400).json({
            error: {
                code: 'VALIDATION_ERROR',
                message: 'Invalid input parameters',
                details: err.errors,
            },
        });
    }

    if (err instanceof DomainError) {
        const statusCode = domainErrorStatusMap[err.code] || 422;
        return res.status(statusCode).json({
            error: {
                code: err.code,
                message: err.message,
            },
        });
    }

    logger.error(err, 'Unhandled exception');

    return res.status(500).json({
        error: {
            code: 'INTERNAL_SERVER_ERROR',
            message: 'An unexpected error occurred',
        },
    });
};
