"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.routesRouter = void 0;
const express_1 = require("express");
const container_1 = require("../../../../infrastructure/di/container");
const auth_1 = require("../middlewares/auth");
exports.routesRouter = (0, express_1.Router)();
const routesController = container_1.container.getRoutesController();
// All route operations require auth
exports.routesRouter.use(auth_1.requireAuth);
exports.routesRouter.get('/', (req, res, next) => {
    routesController.getRoutes(req, res).catch(next);
});
exports.routesRouter.post('/:routeId/baseline', (req, res, next) => {
    routesController.setBaseline(req, res).catch(next);
});
exports.routesRouter.get('/comparison', (req, res, next) => {
    routesController.getComparison(req, res).catch(next);
});
