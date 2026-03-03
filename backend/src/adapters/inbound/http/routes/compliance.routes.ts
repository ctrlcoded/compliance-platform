import { Router } from 'express';
import { container } from '../../../../infrastructure/di/container';

export const complianceRouter = Router();

const complianceController = container.getComplianceController();

complianceRouter.get('/cb', (req, res, next) => {
    complianceController.getComplianceBalance(req, res).catch(next);
});

complianceRouter.get('/adjusted-cb', (req, res, next) => {
    complianceController.getAdjustedCb(req, res).catch(next);
});
