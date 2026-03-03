import { Router } from 'express';
import { container } from '../../../../infrastructure/di/container';
import { requireAuth } from '../middlewares/auth';
import { idempotency } from '../middlewares/idempotency';
import { strictRateLimiter } from '../middlewares/rateLimiter';

export const poolsRouter = Router();
const poolsController = container.getPoolsController();

poolsRouter.use(requireAuth);

poolsRouter.post('/', strictRateLimiter, idempotency, (req, res, next) => {
    poolsController.createPool(req, res).catch(next);
});

poolsRouter.get('/:poolId', (req, res, next) => {
    poolsController.getPool(req, res).catch(next);
});
