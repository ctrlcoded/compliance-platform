import { describe, it, expect } from 'vitest';
import { PoolAllocator, PoolShip } from '../../../../src/core/domain/services/PoolAllocator';
import { DomainError } from '../../../../src/core/domain/errors/DomainError';

describe('PoolAllocator (Article 21)', () => {
    it('correctly allocates surplus to deficits based on greedy algorithm', () => {
        const ships: PoolShip[] = [
            { shipId: 'S1', cbBefore: 5000 },
            { shipId: 'S2', cbBefore: -3000 },
            { shipId: 'S3', cbBefore: -1000 },
        ];

        const result = PoolAllocator.allocate(ships);

        // Sum = +1000. Surplus S1 should cover S2 and S3.
        expect(result).toHaveLength(3);
        expect(result.find((s) => s.shipId === 'S1')?.cbAfter).toBe(1000); // 5000 - 3000 - 1000
        expect(result.find((s) => s.shipId === 'S2')?.cbAfter).toBe(0);
        expect(result.find((s) => s.shipId === 'S3')?.cbAfter).toBe(0);
    });

    it('throws NEGATIVE_POOL_SUM when sum is < 0', () => {
        const ships: PoolShip[] = [
            { shipId: 'S1', cbBefore: 2000 },
            { shipId: 'S2', cbBefore: -3000 }, // sum = -1000
        ];

        expect(() => PoolAllocator.allocate(ships)).toThrowError(DomainError);
        expect(() => PoolAllocator.allocate(ships)).toThrowError('cannot be negative');
    });

    it('throws INVALID_POOL_SIZE for less than 2 ships', () => {
        const ships: PoolShip[] = [
            { shipId: 'S1', cbBefore: 2000 },
        ];
        expect(() => PoolAllocator.allocate(ships)).toThrowError(DomainError);
    });

    it('maintains rules for deficit ship protection and surplus ship protection', () => {
        const ships: PoolShip[] = [
            { shipId: 'S1', cbBefore: 500 },
            { shipId: 'S2', cbBefore: -200 },
            { shipId: 'S3', cbBefore: -300 },
        ];

        const result = PoolAllocator.allocate(ships);

        // S1=0, S2=0, S3=0
        expect(result.find((s) => s.shipId === 'S1')?.cbAfter).toBeGreaterThanOrEqual(0); // Surplus protection
        expect(result.find((s) => s.shipId === 'S2')?.cbAfter).toBeGreaterThanOrEqual(-200); // Deficit protection
    });
});
