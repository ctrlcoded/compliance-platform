import { describe, it, expect } from 'vitest';
import { GHGIntensity, EnergyInScope } from '../../../../src/core/domain/value-objects';
import { ComplianceCalculator } from '../../../../src/core/domain/services/ComplianceCalculator';

describe('ComplianceCalculator (Article IV Formula)', () => {
    const calculator = new ComplianceCalculator();
    const TOLERANCE = 0.0001; // Scale 4 precision as per DB schema requirements

    it('should compute surplus correctly (positive CB)', () => {
        // Math: CB = (89.3368 - 88.0) * 100,000 = 1.3368 * 100k = 133,680
        const target = GHGIntensity.create(89.3368);
        const actual = GHGIntensity.create(88.0);
        const energy = EnergyInScope.create(100_000);

        const cb = calculator.calculate(target, actual, energy);

        expect(cb.isSurplus()).toBe(true);
        expect(cb.value).toBeCloseTo(133680, 4);
    });

    it('should compute deficit correctly (negative CB)', () => {
        // Math: CB = (89.3368 - 91.0) * 100,000 = -1.6632 * 100,000 = -166,320
        const target = GHGIntensity.create(89.3368);
        const actual = GHGIntensity.create(91.0);
        const energy = EnergyInScope.create(100_000);

        const cb = calculator.calculate(target, actual, energy);

        expect(cb.isDeficit()).toBe(true);
        expect(cb.value).toBeCloseTo(-166320, 4);
    });

    it('should compute 0 CB when Actual === Target', () => {
        const target = GHGIntensity.create(89.3368);
        const actual = GHGIntensity.create(89.3368);
        const energy = EnergyInScope.create(100_000);

        const cb = calculator.calculate(target, actual, energy);

        expect(cb.isDeficit()).toBe(false);
        expect(cb.isSurplus()).toBe(false);
        expect(cb.value).toBe(0);
    });

    it('should compute 0 CB when Energy is 0', () => {
        const target = GHGIntensity.create(89.3368);
        const actual = GHGIntensity.create(91.0);
        const energy = EnergyInScope.create(0);

        const cb = calculator.calculate(target, actual, energy);

        expect(cb.value).toBe(0);
    });

    it('maintains precision under high energy limits', () => {
        const target = GHGIntensity.create(89.3368);
        const actual = GHGIntensity.create(98.1234);
        const energy = EnergyInScope.create(1e9); // 1 Billion MJ

        const cb = calculator.calculate(target, actual, energy);

        // Math: (89.3368 - 98.1234) * 1,000,000,000 = -8.7866 * 1e9 = -8786600000
        expect(cb.value).toBeCloseTo(-8786600000, 4);
    });
});
