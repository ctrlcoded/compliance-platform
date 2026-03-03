import { GHGIntensity, EnergyInScope, ComplianceBalanceValue } from '../value-objects';

export class ComplianceCalculator {
    /**
     * Computes Compliance Balance based on Annex IV formula
     * CB = (Target - Actual) * Energy
     */
    public calculate(
        target: GHGIntensity,
        actual: GHGIntensity,
        energy: EnergyInScope
    ): ComplianceBalanceValue {
        const rawCb = (target.value - actual.value) * energy.value;
        return ComplianceBalanceValue.create(rawCb);
    }
}
