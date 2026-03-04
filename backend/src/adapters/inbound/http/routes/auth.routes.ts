import { Router } from 'express';
import jwt from 'jsonwebtoken';
import { env } from '../../../../infrastructure/config/env';

export const authRouter = Router();

/**
 * DEV-ONLY: Generate a JWT token for local development and demo purposes.
 * This endpoint should be removed or disabled in production.
 *
 * Returns a token containing all seeded ship IDs so the ownership
 * middleware passes for every ship in the demo database.
 */
authRouter.post('/dev-token', (req, res) => {
    if (env.NODE_ENV === 'production') {
        return res.status(404).json({ error: { code: 'NOT_FOUND', message: 'Not available' } });
    }

    const payload = {
        sub: 'dev-user-001',
        email: 'dev@fueleu-demo.com',
        role: 'admin',
        shipIds: [
            'IMO-1111111',
            'IMO-2222222',
            'IMO-3333333',
            'IMO-4444444',
            'IMO-5555555',
            'IMO-6666666',
        ],
    };

    const token = jwt.sign(payload, env.JWT_SECRET, {
        expiresIn: '24h',
        algorithm: 'HS256',
    });

    res.json({
        success: true,
        data: {
            token,
            expiresIn: '24h',
            user: {
                id: payload.sub,
                email: payload.email,
                role: payload.role,
                shipCount: payload.shipIds.length,
            },
        },
    });
});
