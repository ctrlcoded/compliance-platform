import { Request, Response, NextFunction } from 'express';
import { PrismaClient } from '@prisma/client';

// Dedicated Prisma Client instance for middleware resolution
const prisma = new PrismaClient();

export const idempotency = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    if (req.method === 'GET') {
        return next();
    }

    const idempotencyKey = req.header('Idempotency-Key');

    if (!idempotencyKey) {
        return next(); // Strictly this could return 400 for mutation endpoints
    }

    try {
        // Attempt an atomic insert. A unique constraint ensures identical keys block.
        await prisma.idempotencyKey.create({
            data: { key: idempotencyKey }
        });

        // Let the request proceed on success
        next();
    } catch (error: any) {
        // P2002 is the Prisma specific unique constraint violation code
        if (error.code === 'P2002') {
            res.status(409).json({
                error: {
                    code: 'IDEMPOTENCY_CONFLICT',
                    message: 'A request with this Idempotency-Key has already been processed.',
                },
            });
            return;
        }

        // Pass system failures down to the global error handler gracefully
        next(error);
    }
};
