import rateLimit from 'express-rate-limit';
import { Request, Response } from 'express';

export const globalRateLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // Limit each IP to 100 requests per `window` (here, per 15 minutes)
    standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
    legacyHeaders: false, // Disable the `X-RateLimit-*` headers
    handler: (req: Request, res: Response) => {
        res.status(429).json({
            error: {
                code: 'TOO_MANY_REQUESTS',
                message: 'Too many requests from this IP, please try again later.',
            },
        });
    },
});

export const strictRateLimiter = rateLimit({
    windowMs: 1 * 60 * 1000, // 1 minute
    max: 10,
    handler: (req: Request, res: Response) => {
        res.status(429).json({
            error: {
                code: 'TOO_MANY_REQUESTS',
                message: 'Too many mutable requests, please slow down.',
            },
        });
    },
});
