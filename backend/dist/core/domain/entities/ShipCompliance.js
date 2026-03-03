"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ShipCompliance = void 0;
const value_objects_1 = require("../value-objects");
const DomainError_1 = require("../errors/DomainError");
class ShipCompliance {
    id;
    shipId;
    year;
    targetIntensity;
    actualIntensity;
    energyInScope;
    complianceBalance;
    adjustedComplianceBalance;
    bankedSurplus;
    constructor(id, // null if not persisted yet
    shipId, year, targetIntensity, actualIntensity, energyInScope, complianceBalance, adjustedComplianceBalance, bankedSurplus = 0) {
        this.id = id;
        this.shipId = shipId;
        this.year = year;
        this.targetIntensity = targetIntensity;
        this.actualIntensity = actualIntensity;
        this.energyInScope = energyInScope;
        this.complianceBalance = complianceBalance;
        this.adjustedComplianceBalance = adjustedComplianceBalance;
        this.bankedSurplus = bankedSurplus;
        if (year < 2025) {
            throw new DomainError_1.DomainError('Year must be >= 2025', 'INVALID_REPORTING_YEAR');
        }
    }
    static create(id, shipId, year, targetIntensity, actualIntensity, energyInScope, complianceBalance, adjustedComplianceBalance = null, bankedSurplus = 0) {
        return new ShipCompliance(id, shipId, year, value_objects_1.GHGIntensity.create(targetIntensity), value_objects_1.GHGIntensity.create(actualIntensity), value_objects_1.EnergyInScope.create(energyInScope), value_objects_1.ComplianceBalanceValue.create(complianceBalance), adjustedComplianceBalance !== null ? value_objects_1.ComplianceBalanceValue.create(adjustedComplianceBalance) : null, bankedSurplus);
    }
}
exports.ShipCompliance = ShipCompliance;
