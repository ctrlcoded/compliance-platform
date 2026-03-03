"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ComplianceController = void 0;
const ComplianceDTO_1 = require("../../../../core/application/dto/ComplianceDTO");
class ComplianceController {
    computeCbUseCase;
    constructor(computeCbUseCase) {
        this.computeCbUseCase = computeCbUseCase;
    }
    async getComplianceBalance(req, res) {
        const query = ComplianceDTO_1.computeCbQuerySchema.parse(req.query);
        const result = await this.computeCbUseCase.execute({
            shipId: query.shipId,
            year: query.year,
        });
        res.status(200).json({ data: result });
    }
    async getAdjustedCb(req, res) {
        const query = ComplianceDTO_1.computeCbQuerySchema.parse(req.query);
        // Stub functionality to return adjusted CB structure
        res.status(200).json({
            data: {
                shipId: query.shipId,
                year: query.year,
                cbBefore: -3400000,
                bankApplied: 2000000,
                cbAfter: -1400000
            }
        });
    }
}
exports.ComplianceController = ComplianceController;
