"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.complianceRouter = void 0;
const express_1 = require("express");
const container_1 = require("../../../../infrastructure/di/container");
exports.complianceRouter = (0, express_1.Router)();
const complianceController = container_1.container.getComplianceController();
exports.complianceRouter.get('/cb', (req, res, next) => {
    complianceController.getComplianceBalance(req, res).catch(next);
});
exports.complianceRouter.get('/adjusted-cb', (req, res, next) => {
    complianceController.getAdjustedCb(req, res).catch(next);
});
