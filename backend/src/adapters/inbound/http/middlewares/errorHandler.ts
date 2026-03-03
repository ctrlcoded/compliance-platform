import { Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import { DomainError } from '../../../../core/domain/errors/DomainError';
import { logger } from '../../../../infrastructure/logger';

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
        const statusCode = err.code === 'NOT_FOUND' ? 404 : 422;
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
