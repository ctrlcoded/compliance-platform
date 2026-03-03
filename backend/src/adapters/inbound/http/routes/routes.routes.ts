import { Router } from 'express';
import { container } from '../../../../infrastructure/di/container';
import { requireAuth } from '../middlewares/auth';
import { requireShipOwnership } from '../middlewares/ownership';
import { idempotency } from '../middlewares/idempotency';

export const routesRouter = Router();
const routesController = container.getRoutesController();

// All route operations require auth
routesRouter.use(requireAuth);
routesRouter.use(requireShipOwnership);

routesRouter.get('/', (req, res, next) => {
    routesController.getRoutes(req, res, next).catch(next);
});

routesRouter.post('/', idempotency, (req, res, next) => {
    routesController.createRoute(req, res, next).catch(next);
});

routesRouter.get('/comparison', (req, res, next) => {
    routesController.getComparison(req, res, next).catch(next);
});

routesRouter.get('/:id', (req, res, next) => {
    routesController.getRouteById(req, res, next).catch(next);
});

routesRouter.post('/:routeId/baseline', idempotency, (req, res, next) => {
    routesController.setBaseline(req, res, next).catch(next);
});

routesRouter.delete('/:id', (req, res, next) => {
    routesController.deleteRoute(req, res, next).catch(next);
});
