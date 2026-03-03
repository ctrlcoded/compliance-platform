import { Router } from 'express';
import { container } from '../../../../infrastructure/di/container';
import { requireAuth } from '../middlewares/auth';

export const routesRouter = Router();
const routesController = container.getRoutesController();

// All route operations require auth
routesRouter.use(requireAuth);

routesRouter.get('/', (req, res, next) => {
    routesController.getRoutes(req, res).catch(next);
});

routesRouter.post('/:routeId/baseline', (req, res, next) => {
    routesController.setBaseline(req, res).catch(next);
});

routesRouter.get('/comparison', (req, res, next) => {
    routesController.getComparison(req, res).catch(next);
});
