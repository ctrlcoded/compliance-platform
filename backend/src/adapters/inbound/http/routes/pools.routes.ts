import { Router } from 'express';
import { container } from '../../../../infrastructure/di/container';
import { requireAuth } from '../middlewares/auth';
import { requireShipOwnership } from '../middlewares/ownership';
import { idempotency } from '../middlewares/idempotency';
import { strictRateLimiter } from '../middlewares/rateLimiter';

export const poolsRouter = Router();
const poolsController = container.getPoolsController();

poolsRouter.use(requireAuth);
poolsRouter.use(requireShipOwnership);

poolsRouter.post('/', strictRateLimiter, idempotency, (req, res, next) => {
    poolsController.createPool(req, res, next).catch(next);
});

poolsRouter.get('/:poolId', (req, res, next) => {
    poolsController.getPool(req, res, next).catch(next);
});

poolsRouter.post('/:poolId/join', strictRateLimiter, idempotency, (req, res, next) => {
    poolsController.joinPool(req, res, next).catch(next);
});

poolsRouter.post('/:poolId/leave', strictRateLimiter, (req, res, next) => {
    poolsController.leavePool(req, res, next).catch(next);
});
