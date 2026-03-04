import { describe, it, expect } from 'vitest';
import { BankingService } from '../../../../src/core/domain/services/BankingService';
import { DomainError } from '../../../../src/core/domain/errors/DomainError';
import { ComplianceBalanceValue } from '../../../../src/core/domain/value-objects';

const cb = (n: number) => ComplianceBalanceValue.create(n);

describe('BankingService (Article 20)', () => {
    describe('bankSurplus()', () => {
        it('successfully banks valid surplus amount', () => {
            const result = BankingService.bankSurplus(cb(5000), 2000);
            expect(result.bankedAmount.value).toBe(2000);
            expect(result.remainingSurplus.value).toBe(3000);
        });

        it('successfully banks EXACT surplus amount', () => {
            const result = BankingService.bankSurplus(cb(100.5555), 100.5555);
            expect(result.bankedAmount.value).toBe(100.5555);
            expect(result.remainingSurplus.value).toBe(0);
        });

        it('throws NO_SURPLUS when trying to bank a deficit', () => {
            expect(() => BankingService.bankSurplus(cb(-500), 100)).toThrowError(DomainError);
        });

        it('throws INSUFFICIENT_SURPLUS when trying to bank more than available', () => {
            expect(() => BankingService.bankSurplus(cb(100), 150)).toThrowError(DomainError);
        });

        it('throws INVALID_BANK_AMOUNT when banking 0', () => {
            expect(() => BankingService.bankSurplus(cb(500), 0)).toThrowError(DomainError);
        });
    });

    describe('applyBanked()', () => {
        it('successfully applies bank safely to a deficit', () => {
            const result = BankingService.applyBanked(cb(-5000), 10000, 2000);
            expect(result.cbAfter.value).toBe(-3000);
            expect(result.remainingBank.value).toBe(8000);
        });

        it('throws SURPLUS_YEAR if trying to apply to an already positive year', () => {
            expect(() => BankingService.applyBanked(cb(100), 5000, 50)).toThrowError(DomainError);
        });

        it('throws INSUFFICIENT_BANK if applying more than stored ledger', () => {
            expect(() => BankingService.applyBanked(cb(-5000), 1000, 2000)).toThrowError(DomainError);
        });
    });
});
