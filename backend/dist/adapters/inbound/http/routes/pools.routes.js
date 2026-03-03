"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.poolsRouter = void 0;
const express_1 = require("express");
const container_1 = require("../../../../infrastructure/di/container");
const auth_1 = require("../middlewares/auth");
const idempotency_1 = require("../middlewares/idempotency");
const rateLimiter_1 = require("../middlewares/rateLimiter");
exports.poolsRouter = (0, express_1.Router)();
const poolsController = container_1.container.getPoolsController();
exports.poolsRouter.use(auth_1.requireAuth);
exports.poolsRouter.post('/', rateLimiter_1.strictRateLimiter, idempotency_1.idempotency, (req, res, next) => {
    poolsController.createPool(req, res).catch(next);
});
exports.poolsRouter.get('/:poolId', (req, res, next) => {
    poolsController.getPool(req, res).catch(next);
});
