import { DomainError } from '../errors/DomainError';

export class GHGIntensity {
    private constructor(public readonly value: number) { }

    public static create(value: number): GHGIntensity {
        if (!Number.isFinite(value) || value < 0) {
            throw new DomainError('GHG Intensity must be a finite number >= 0', 'INVALID_GHG_INTENSITY');
        }
        return new GHGIntensity(value);
    }

    public isBelow(target: GHGIntensity): boolean {
        return this.value < target.value;
    }
}

export class EnergyInScope {
    private constructor(public readonly value: number) { }

    public static create(value: number): EnergyInScope {
        if (!Number.isFinite(value) || value < 0) {
            throw new DomainError('Energy in scope must be a finite number >= 0', 'INVALID_ENERGY');
        }
        return new EnergyInScope(value);
    }
}

export class ComplianceBalanceValue {
    private constructor(public readonly value: number) { }

    private static round4(val: number): number {
        return Math.round(val * 10000) / 10000;
    }

    public static create(value: number): ComplianceBalanceValue {
        if (!Number.isFinite(value)) {
            throw new DomainError('Compliance balance must be a finite number', 'INVALID_COMPLIANCE_BALANCE');
        }
        return new ComplianceBalanceValue(this.round4(value));
    }

    public isSurplus(): boolean {
        return this.value > 0;
    }

    public isDeficit(): boolean {
        return this.value < 0;
    }

    public add(amount: number): ComplianceBalanceValue {
        return ComplianceBalanceValue.create(this.value + amount);
    }

    public subtract(amount: number): ComplianceBalanceValue {
        return ComplianceBalanceValue.create(this.value - amount);
    }
}
