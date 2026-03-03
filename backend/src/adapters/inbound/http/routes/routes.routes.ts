import { Router } from 'express';
import { container } from '../../../../infrastructure/di/container';
import { requireAuth } from '../middlewares/auth';
import { requireShipOwnership } from '../middlewares/ownership';

export const routesRouter = Router();
const routesController = container.getRoutesController();

// All route operations require auth
routesRouter.use(requireAuth);
routesRouter.use(requireShipOwnership);

routesRouter.get('/', (req, res, next) => {
    routesController.getRoutes(req, res, next).catch(next);
});

routesRouter.post('/:routeId/baseline', (req, res, next) => {
    routesController.setBaseline(req, res, next).catch(next);
});

routesRouter.get('/comparison', (req, res, next) => {
    routesController.getComparison(req, res, next).catch(next);
});
