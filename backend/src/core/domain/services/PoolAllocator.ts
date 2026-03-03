import { DomainError } from '../errors/DomainError';
import { ComplianceBalanceValue } from '../value-objects';

export interface PoolShip {
    shipId: string;
    cbBefore: ComplianceBalanceValue;
}

export interface AllocatedPoolShip extends PoolShip {
    cbAfter: ComplianceBalanceValue;
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

        let sum = ComplianceBalanceValue.create(0);
        const deficits: PoolShip[] = [];
        const surpluses: PoolShip[] = [];

        // 1. Initial categorization and sum calculation
        for (const ship of ships) {
            sum = sum.add(ship.cbBefore.value);
            if (ship.cbBefore.isDeficit()) {
                deficits.push({ ...ship });
            } else {
                surpluses.push({ ...ship });
            }
        }

        // Validation: Pool must be strictly non-negative as a whole
        if (sum.isDeficit()) {
            throw new DomainError('Pool total compliance balance cannot be negative', 'NEGATIVE_POOL_SUM');
        }

        // 2. Sort surpluses descending (largest surplus first)
        surpluses.sort((a, b) => b.cbBefore.value - a.cbBefore.value);
        // Sort deficits ascending (largest deficit first, e.g. -5000 before -1000)
        deficits.sort((a, b) => a.cbBefore.value - b.cbBefore.value);

        const allocations = new Map<string, number>();

        // 3. Greedy Distribution Loop
        let sIdx = 0; // Surplus index pointer
        let dIdx = 0; // Deficit index pointer

        // Track available surpluses natively using value representation
        const currentSurpluses = surpluses.map((s) => ({ ...s, remaining: s.cbBefore.value }));
        const currentDeficits = deficits.map((d) => ({ ...d, remainingRequired: Math.abs(d.cbBefore.value) }));

        while (dIdx < currentDeficits.length && sIdx < currentSurpluses.length) {
            const deficitNeeds = currentDeficits[dIdx].remainingRequired;
            const surplusAvailable = currentSurpluses[sIdx].remaining;

            // Transfer what we can (minimum of what's needed vs what's available)
            const transferAmount = Math.min(deficitNeeds, surplusAvailable);

            currentDeficits[dIdx].remainingRequired -= transferAmount;
            currentSurpluses[sIdx].remaining -= transferAmount;

            // Record state changes
            allocations.set(currentDeficits[dIdx].shipId, currentDeficits[dIdx].cbBefore.value + transferAmount);
            allocations.set(currentSurpluses[sIdx].shipId, currentSurpluses[sIdx].remaining);

            // Advance pointers if exhausted/fulfilled natively (round4 logic is implicit when wrapping object downstream)
            if (ComplianceBalanceValue.create(currentDeficits[dIdx].remainingRequired).value === 0) dIdx++;
            if (ComplianceBalanceValue.create(currentSurpluses[sIdx].remaining).value === 0) sIdx++;
        }

        // 4. Construct Final Array
        return ships.map((original) => {
            const allocatedRaw = allocations.get(original.shipId);
            const cbAfterValue = allocatedRaw !== undefined ? allocatedRaw : original.cbBefore.value;

            return {
                shipId: original.shipId,
                cbBefore: original.cbBefore,
                cbAfter: ComplianceBalanceValue.create(cbAfterValue),
            };
        });
    }
}
