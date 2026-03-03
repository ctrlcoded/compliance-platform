import { Router } from 'express';
import { container } from '../../../../infrastructure/di/container';
import { requireAuth } from '../middlewares/auth';
import { requireShipOwnership } from '../middlewares/ownership';
import { idempotency } from '../middlewares/idempotency';
import { strictRateLimiter } from '../middlewares/rateLimiter';

export const bankingRouter = Router();
const bankingController = container.getBankingController();

bankingRouter.use(requireAuth);
bankingRouter.use(requireShipOwnership);

bankingRouter.get('/records', (req, res, next) => {
    bankingController.getRecords(req, res, next).catch(next);
});

// Use idempotency and strict rate limiting for mutable financial actions
bankingRouter.post('/bank', strictRateLimiter, idempotency, (req, res, next) => {
    bankingController.bank(req, res, next).catch(next);
});

bankingRouter.post('/apply', strictRateLimiter, idempotency, (req, res, next) => {
    bankingController.apply(req, res, next).catch(next);
});
