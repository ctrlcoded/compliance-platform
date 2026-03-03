import { DomainError } from '../errors/DomainError';
import { ComplianceBalanceValue } from '../value-objects';

export class BankingService {
    /**
     * Article 20: Bank Surplus
     * Rules:
     * - Must have positive CB
     * - Cannot bank more than available surplus
     * - Amount banked must be > 0
     */
    public static bankSurplus(currentCb: ComplianceBalanceValue, requestedBankAmount: number): { remainingSurplus: ComplianceBalanceValue; bankedAmount: ComplianceBalanceValue } {
        if (!currentCb.isSurplus()) {
            throw new DomainError('Cannot bank surplus: Compliance Balance is not positive', 'NO_SURPLUS');
        }

        if (requestedBankAmount <= 0) {
            throw new DomainError('Bank amount must be greater than zero', 'INVALID_BANK_AMOUNT');
        }

        // Floating-point precision handling during validation using epsilon
        const epsilon = 0.0001;
        if (requestedBankAmount > currentCb.value + epsilon) {
            throw new DomainError('Cannot bank more than the available compliance balance', 'INSUFFICIENT_SURPLUS');
        }

        const actualBankedAmount = Math.min(requestedBankAmount, currentCb.value);

        return {
            remainingSurplus: currentCb.subtract(actualBankedAmount),
            bankedAmount: ComplianceBalanceValue.create(actualBankedAmount),
        };
    }

    /**
     * Article 20: Apply Banked Surplus
     * Rules:
     * - Cannot apply more than is banked
     * - Cannot apply to a year that already has a surplus (CB > 0)
     * - Apply amount must be > 0
     * - CB cannot overshoot into positive territory
     */
    public static applyBanked(currentCb: ComplianceBalanceValue, availableBank: number, requestApplyAmount: number): { cbAfter: ComplianceBalanceValue; remainingBank: ComplianceBalanceValue } {
        if (!currentCb.isDeficit() && currentCb.value !== 0) {
            throw new DomainError('Cannot apply banked surplus to a year with a positive compliance balance', 'SURPLUS_YEAR');
        }

        if (requestApplyAmount <= 0) {
            throw new DomainError('Apply amount must be greater than zero', 'INVALID_APPLY_AMOUNT');
        }

        if (requestApplyAmount > availableBank) {
            throw new DomainError('Cannot apply more than the available banked surplus', 'INSUFFICIENT_BANK');
        }

        const appliedAmount = Math.min(requestApplyAmount, availableBank, Math.abs(currentCb.value));

        return {
            cbAfter: currentCb.add(appliedAmount),
            remainingBank: ComplianceBalanceValue.create(availableBank).subtract(appliedAmount),
        };
    }
}
