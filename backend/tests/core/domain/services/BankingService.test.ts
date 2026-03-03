import { describe, it, expect } from 'vitest';
import { BankingService } from '../../../../src/core/domain/services/BankingService';
import { DomainError } from '../../../../src/core/domain/errors/DomainError';

describe('BankingService (Article 20)', () => {
    describe('bankSurplus()', () => {
        it('successfully banks valid surplus amount', () => {
            const result = BankingService.bankSurplus(5000, 2000);
            expect(result.bankedAmount).toBe(2000);
            expect(result.remainingSurplus).toBe(3000);
        });

        it('successfully banks EXACT surplus amount', () => {
            const result = BankingService.bankSurplus(100.5555, 100.5555);
            expect(result.bankedAmount).toBe(100.5555);
            expect(result.remainingSurplus).toBe(0);
        });

        it('throws NO_SURPLUS when trying to bank a deficit', () => {
            expect(() => BankingService.bankSurplus(-500, 100)).toThrowError(DomainError);
        });

        it('throws INSUFFICIENT_SURPLUS when trying to bank more than available', () => {
            expect(() => BankingService.bankSurplus(100, 150)).toThrowError(DomainError);
        });

        it('throws INVALID_BANK_AMOUNT when banking 0', () => {
            expect(() => BankingService.bankSurplus(500, 0)).toThrowError(DomainError);
        });
    });

    describe('applyBanked()', () => {
        it('successfully applies bank safely to a deficit', () => {
            const result = BankingService.applyBanked(-5000, 10000, 2000);
            expect(result.cbAfter).toBe(-3000);
            expect(result.remainingBank).toBe(8000);
        });

        it('throws SURPLUS_YEAR if trying to apply to an already positive year', () => {
            expect(() => BankingService.applyBanked(100, 5000, 50)).toThrowError(DomainError);
        });

        it('throws INSUFFICIENT_BANK if applying more than stored ledger', () => {
            expect(() => BankingService.applyBanked(-5000, 1000, 2000)).toThrowError(DomainError);
        });
    });
});
