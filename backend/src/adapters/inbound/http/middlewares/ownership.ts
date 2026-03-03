import { Request, Response, NextFunction } from 'express';
import { DomainError } from '../../../../core/domain/errors/DomainError';

/**
 * Middleware to enforce resource-level authorization.
 * Ensures the authenticated user has ownership rights over the requested shipId.
 * Scrapes shipId from req.body, req.query, or req.params dynamically.
 */
export const requireShipOwnership = (req: Request, res: Response, next: NextFunction) => {
    // 1. Extract the target ship ID(s) from the request depending on the method
    const targetShipId: string | undefined =
        req.body?.shipId || req.query?.shipId || req.params?.shipId;

    const targetShipIds: string[] | undefined = req.body?.shipIds; // Used in pools

    // If the route doesn't deal with ships, skip ownership check
    if (!targetShipId && (!targetShipIds || targetShipIds.length === 0)) {
        return next();
    }

    // 2. Extract allowed ship IDs from the user's JWT payload
    // In a real system, the JWT payload or a fast Redis cache would hold the user's authorized ship associations
    const userPayload = req.user as any;

    // Fallback defensively: if user has no shipIds, they own nothing
    const allowedShipIds: string[] = userPayload?.shipIds || [];

    // 3. Verify ownership
    if (targetShipId && !allowedShipIds.includes(targetShipId)) {
        return res.status(403).json({
            error: {
                code: 'FORBIDDEN',
                message: `You do not have authorization to access or modify data for shipId: ${targetShipId}`,
            },
        });
    }

    if (targetShipIds) {
        const unauthorizedShips = targetShipIds.filter(id => !allowedShipIds.includes(id));
        if (unauthorizedShips.length > 0) {
            return res.status(403).json({
                error: {
                    code: 'FORBIDDEN',
                    message: `You do not have authorization for the following ships: ${unauthorizedShips.join(', ')}`,
                },
            });
        }
    }

    next();
};
