"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ComplianceCalculator = void 0;
const value_objects_1 = require("../value-objects");
class ComplianceCalculator {
    /**
     * Computes Compliance Balance based on Annex IV formula
     * CB = (Target - Actual) * Energy
     */
    calculate(target, actual, energy) {
        const rawCb = (target.value - actual.value) * energy.value;
        return value_objects_1.ComplianceBalanceValue.create(rawCb);
    }
}
exports.ComplianceCalculator = ComplianceCalculator;
