import { DomainError } from '../errors/DomainError';

export interface PoolShip {
    shipId: string;
    cbBefore: number;
}

export interface AllocatedPoolShip extends PoolShip {
    cbAfter: number;
}

export class PoolAllocator {
    /**
     * Article 21: Pool Allocator
     * Greedy algorithm to resolve pool balances.
     * Rules:
     * - Total Pool Sum CB >= 0
     * - Must contain >= 2 ships
     * - Deficit ships do not exit worse (cbAfter >= cbBefore)
     * - Surplus ships do not exit negative (cbAfter >= 0)
     */
    public static allocate(ships: PoolShip[]): AllocatedPoolShip[] {
        if (ships.length < 2) {
            throw new DomainError('A pool must contain at least 2 ships', 'INVALID_POOL_SIZE');
        }

        let sum = 0;
        const deficits: PoolShip[] = [];
        const surpluses: PoolShip[] = [];

        // 1. Initial categorization and sum calculation
        for (const ship of ships) {
            sum += ship.cbBefore;
            if (ship.cbBefore < 0) {
                deficits.push({ ...ship });
            } else {
                surpluses.push({ ...ship });
            }
        }

        // Validation: Pool must be strictly non-negative as a whole
        if (this.round4(sum) < 0) {
            throw new DomainError('Pool total compliance balance cannot be negative', 'NEGATIVE_POOL_SUM');
        }

        // 2. Sort surpluses descending (largest surplus first)
        surpluses.sort((a, b) => b.cbBefore - a.cbBefore);
        // Sort deficits ascending (largest deficit first, e.g. -5000 before -1000)
        deficits.sort((a, b) => a.cbBefore - b.cbBefore);

        const allocations = new Map<string, number>();

        // 3. Greedy Distribution Loop
        let sIdx = 0; // Surplus index pointer
        let dIdx = 0; // Deficit index pointer

        // Track available surpluses natively
        const currentSurpluses = surpluses.map((s) => ({ ...s, remaining: s.cbBefore }));
        const currentDeficits = deficits.map((d) => ({ ...d, remainingRequired: Math.abs(d.cbBefore) }));

        while (dIdx < currentDeficits.length && sIdx < currentSurpluses.length) {
            const deficitNeeds = currentDeficits[dIdx].remainingRequired;
            const surplusAvailable = currentSurpluses[sIdx].remaining;

            // Transfer what we can (minimum of what's needed vs what's available)
            const transferAmount = Math.min(deficitNeeds, surplusAvailable);

            currentDeficits[dIdx].remainingRequired -= transferAmount;
            currentSurpluses[sIdx].remaining -= transferAmount;

            // Record state changes
            allocations.set(currentDeficits[dIdx].shipId, currentDeficits[dIdx].cbBefore + (Math.abs(currentDeficits[dIdx].cbBefore) - currentDeficits[dIdx].remainingRequired));
            allocations.set(currentSurpluses[sIdx].shipId, currentSurpluses[sIdx].remaining);

            // Advance pointers if exhausted/fulfilled
            if (this.round4(currentDeficits[dIdx].remainingRequired) === 0) dIdx++;
            if (this.round4(currentSurpluses[sIdx].remaining) === 0) sIdx++;
        }

        // 4. Construct Final Array
        return ships.map((original) => {
            const allocated = allocations.get(original.shipId);
            const cbAfter = allocated !== undefined ? allocated : original.cbBefore;

            return {
                shipId: original.shipId,
                cbBefore: original.cbBefore,
                cbAfter: this.round4(cbAfter),
            };
        });
    }

    private static round4(value: number): number {
        return Math.round(value * 10000) / 10000;
    }
}
