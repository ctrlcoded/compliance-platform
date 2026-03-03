import { describe, it, expect } from 'vitest';
import { RouteComparisonService } from '../../../../src/core/domain/services/RouteComparisonService';

describe('RouteComparisonService', () => {
    it('identifies an improved target as compliant', () => {
        const result = RouteComparisonService.compare(91.0, 88.0);
        expect(result.compliant).toBe(true);
        // ((88 / 91) - 1) * 100 = -3.296...
        expect(result.percentDiff).toBe(-3.3); // Rounding down to -3.3 in JS is -3.30
    });

    it('identifies a worse target as non-compliant', () => {
        const result = RouteComparisonService.compare(88.0, 91.0);
        expect(result.compliant).toBe(false);
        expect(result.percentDiff).toBeGreaterThan(0);
    });

    it('identifies equal targets properly', () => {
        const result = RouteComparisonService.compare(91.0, 91.0);
        expect(result.compliant).toBe(true);
        expect(result.percentDiff).toBe(0);
    });
});
