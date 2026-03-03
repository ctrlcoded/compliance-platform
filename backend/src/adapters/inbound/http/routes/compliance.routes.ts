import { Router } from 'express';
import { container } from '../../../../infrastructure/di/container';
import { requireAuth } from '../middlewares/auth';
import { requireShipOwnership } from '../middlewares/ownership';

export const complianceRouter = Router();

const complianceController = container.getComplianceController();

complianceRouter.use(requireAuth);
complianceRouter.use(requireShipOwnership);

complianceRouter.get('/cb', (req, res, next) => {
    complianceController.getComplianceBalance(req, res, next).catch(next);
});

complianceRouter.get('/adjusted-cb', (req, res, next) => {
    complianceController.getAdjustedCb(req, res, next).catch(next);
});
