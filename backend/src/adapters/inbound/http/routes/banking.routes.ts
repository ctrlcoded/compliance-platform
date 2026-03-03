import { Router } from 'express';
import { container } from '../../../../infrastructure/di/container';
import { requireAuth } from '../middlewares/auth';
import { idempotency } from '../middlewares/idempotency';
import { strictRateLimiter } from '../middlewares/rateLimiter';

export const bankingRouter = Router();
const bankingController = container.getBankingController();

bankingRouter.use(requireAuth);

bankingRouter.get('/records', (req, res, next) => {
    bankingController.getRecords(req, res).catch(next);
});

// Use idempotency and strict rate limiting for mutable financial actions
bankingRouter.post('/bank', strictRateLimiter, idempotency, (req, res, next) => {
    bankingController.bank(req, res).catch(next);
});

bankingRouter.post('/apply', strictRateLimiter, idempotency, (req, res, next) => {
    bankingController.apply(req, res).catch(next);
});
