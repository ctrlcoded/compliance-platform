import { GHGIntensity, EnergyInScope, ComplianceBalanceValue } from '../value-objects';
import { DomainError } from '../errors/DomainError';

export class ShipCompliance {
    private constructor(
        public readonly id: string | null, // null if not persisted yet
        public readonly shipId: string,
        public readonly year: number,
        public readonly targetIntensity: GHGIntensity,
        public readonly actualIntensity: GHGIntensity,
        public readonly energyInScope: EnergyInScope,
        public readonly complianceBalance: ComplianceBalanceValue,
        public readonly adjustedComplianceBalance: ComplianceBalanceValue | null,
        public readonly bankedSurplus: number = 0
    ) {
        if (year < 2025) {
            throw new DomainError('Year must be >= 2025', 'INVALID_REPORTING_YEAR');
        }
    }

    public static create(
        id: string | null,
        shipId: string,
        year: number,
        targetIntensity: number,
        actualIntensity: number,
        energyInScope: number,
        complianceBalance: number,
        adjustedComplianceBalance: number | null = null,
        bankedSurplus: number = 0
    ): ShipCompliance {
        return new ShipCompliance(
            id,
            shipId,
            year,
            GHGIntensity.create(targetIntensity),
            GHGIntensity.create(actualIntensity),
            EnergyInScope.create(energyInScope),
            ComplianceBalanceValue.create(complianceBalance),
            adjustedComplianceBalance !== null ? ComplianceBalanceValue.create(adjustedComplianceBalance) : null,
            bankedSurplus
        );
    }
}
