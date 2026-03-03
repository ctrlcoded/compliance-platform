"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.bankingRouter = void 0;
const express_1 = require("express");
const container_1 = require("../../../../infrastructure/di/container");
const auth_1 = require("../middlewares/auth");
const idempotency_1 = require("../middlewares/idempotency");
const rateLimiter_1 = require("../middlewares/rateLimiter");
exports.bankingRouter = (0, express_1.Router)();
const bankingController = container_1.container.getBankingController();
exports.bankingRouter.use(auth_1.requireAuth);
exports.bankingRouter.get('/records', (req, res, next) => {
    bankingController.getRecords(req, res).catch(next);
});
// Use idempotency and strict rate limiting for mutable financial actions
exports.bankingRouter.post('/bank', rateLimiter_1.strictRateLimiter, idempotency_1.idempotency, (req, res, next) => {
    bankingController.bank(req, res).catch(next);
});
exports.bankingRouter.post('/apply', rateLimiter_1.strictRateLimiter, idempotency_1.idempotency, (req, res, next) => {
    bankingController.apply(req, res).catch(next);
});
