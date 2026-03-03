"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ComputeComplianceBalance = void 0;
const DomainError_1 = require("../../domain/errors/DomainError");
class ComputeComplianceBalance {
    repository;
    constructor(repository) {
        this.repository = repository;
    }
    async execute(input) {
        const complianceEntity = await this.repository.findByShipIdAndYear(input.shipId, input.year);
        if (!complianceEntity) {
            throw new DomainError_1.DomainError(`Compliance record not found for ship ${input.shipId} in ${input.year}`, 'NOT_FOUND');
        }
        // In a full implementation, this might dynamically fetch routes,
        // apply ComplianceCalculator, and update the repository.
        // For this example, we return the calculated entity directly.
        return {
            shipId: complianceEntity.shipId,
            year: complianceEntity.year,
            targetIntensity: complianceEntity.targetIntensity.value,
            actualIntensity: complianceEntity.actualIntensity.value,
            energyInScope: complianceEntity.energyInScope.value,
            complianceBalance: complianceEntity.complianceBalance.value,
        };
    }
}
exports.ComputeComplianceBalance = ComputeComplianceBalance;
