"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ComplianceBalanceValue = exports.EnergyInScope = exports.GHGIntensity = void 0;
const DomainError_1 = require("../errors/DomainError");
class GHGIntensity {
    value;
    constructor(value) {
        this.value = value;
    }
    static create(value) {
        if (!Number.isFinite(value) || value < 0) {
            throw new DomainError_1.DomainError('GHG Intensity must be a finite number >= 0', 'INVALID_GHG_INTENSITY');
        }
        return new GHGIntensity(value);
    }
    isBelow(target) {
        return this.value < target.value;
    }
}
exports.GHGIntensity = GHGIntensity;
class EnergyInScope {
    value;
    constructor(value) {
        this.value = value;
    }
    static create(value) {
        if (!Number.isFinite(value) || value < 0) {
            throw new DomainError_1.DomainError('Energy in scope must be a finite number >= 0', 'INVALID_ENERGY');
        }
        return new EnergyInScope(value);
    }
}
exports.EnergyInScope = EnergyInScope;
class ComplianceBalanceValue {
    value;
    constructor(value) {
        this.value = value;
    }
    static create(value) {
        if (!Number.isFinite(value)) {
            throw new DomainError_1.DomainError('Compliance balance must be a finite number', 'INVALID_COMPLIANCE_BALANCE');
        }
        return new ComplianceBalanceValue(value);
    }
    isSurplus() {
        return this.value > 0;
    }
    isDeficit() {
        return this.value < 0;
    }
    add(amount) {
        return ComplianceBalanceValue.create(this.value + amount);
    }
    subtract(amount) {
        return ComplianceBalanceValue.create(this.value - amount);
    }
}
exports.ComplianceBalanceValue = ComplianceBalanceValue;
