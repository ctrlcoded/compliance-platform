"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.BankingService = void 0;
const DomainError_1 = require("../errors/DomainError");
class BankingService {
    /**
     * Article 20: Bank Surplus
     * Rules:
     * - Must have positive CB
     * - Cannot bank more than available surplus
     * - Amount banked must be > 0
     */
    static bankSurplus(currentCb, requestedBankAmount) {
        if (currentCb <= 0) {
            throw new DomainError_1.DomainError('Cannot bank surplus: Compliance Balance is not positive', 'NO_SURPLUS');
        }
        if (requestedBankAmount <= 0) {
            throw new DomainError_1.DomainError('Bank amount must be greater than zero', 'INVALID_BANK_AMOUNT');
        }
        // Floating-point precision handling during validation
        const epsilon = 0.0001; // Scale to 4 decimals of precision
        if (requestedBankAmount > currentCb + epsilon) {
            throw new DomainError_1.DomainError('Cannot bank more than the available compliance balance', 'INSUFFICIENT_SURPLUS');
        }
        const bankedAmount = Math.min(requestedBankAmount, currentCb); // Guard precision overflow
        const remainingSurplus = currentCb - bankedAmount;
        // Fix precision output
        return {
            remainingSurplus: this.round4(remainingSurplus),
            bankedAmount: this.round4(bankedAmount),
        };
    }
    /**
     * Article 20: Apply Banked Surplus
     * Rules:
     * - Cannot apply more than is banked
     * - Cannot apply to a year that already has a surplus (CB > 0)
     * - Apply amount must be > 0
     */
    static applyBanked(currentCb, availableBank, requestApplyAmount) {
        if (currentCb > 0) {
            throw new DomainError_1.DomainError('Cannot apply banked surplus to a year with a positive compliance balance', 'SURPLUS_YEAR');
        }
        if (requestApplyAmount <= 0) {
            throw new DomainError_1.DomainError('Apply amount must be greater than zero', 'INVALID_APPLY_AMOUNT');
        }
        if (requestApplyAmount > availableBank) {
            throw new DomainError_1.DomainError('Cannot apply more than the available banked surplus', 'INSUFFICIENT_BANK');
        }
        const appliedAmount = Math.min(requestApplyAmount, availableBank);
        const cbAfter = currentCb + appliedAmount;
        const remainingBank = availableBank - appliedAmount;
        return {
            cbAfter: this.round4(cbAfter),
            remainingBank: this.round4(remainingBank),
        };
    }
    static round4(value) {
        return Math.round(value * 10000) / 10000;
    }
}
exports.BankingService = BankingService;
