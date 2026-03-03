"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.app = void 0;
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const helmet_1 = __importDefault(require("helmet"));
const pino_http_1 = __importDefault(require("pino-http"));
const logger_1 = require("../logger");
const compliance_routes_1 = require("../../adapters/inbound/http/routes/compliance.routes");
const routes_routes_1 = require("../../adapters/inbound/http/routes/routes.routes");
const banking_routes_1 = require("../../adapters/inbound/http/routes/banking.routes");
const pools_routes_1 = require("../../adapters/inbound/http/routes/pools.routes");
const errorHandler_1 = require("../../adapters/inbound/http/middlewares/errorHandler");
const rateLimiter_1 = require("../../adapters/inbound/http/middlewares/rateLimiter");
exports.app = (0, express_1.default)();
exports.app.use((0, helmet_1.default)());
exports.app.use((0, cors_1.default)());
exports.app.use(express_1.default.json());
exports.app.use((0, pino_http_1.default)({ logger: logger_1.logger }));
// Global Rate Limiting
exports.app.use(rateLimiter_1.globalRateLimiter);
// Health Check
exports.app.get('/health', (req, res) => {
    res.status(200).json({ status: 'OK' });
});
// API Routes
exports.app.use('/api/v1/compliance', compliance_routes_1.complianceRouter);
exports.app.use('/api/v1/routes', routes_routes_1.routesRouter);
exports.app.use('/api/v1/banking', banking_routes_1.bankingRouter);
exports.app.use('/api/v1/pools', pools_routes_1.poolsRouter);
// Error Handling (Must be last)
exports.app.use(errorHandler_1.errorHandler);
