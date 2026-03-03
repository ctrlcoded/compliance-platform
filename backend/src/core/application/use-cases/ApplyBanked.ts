import { ApplyBankedUseCase, ApplyBankedOutput } from '../../ports/inbound/ApplyBankedUseCase';
import { ApplyBankedBodyDto } from '../dto/BankingDTO';
import { BankingService } from '../../domain/services/BankingService';
import { DomainError } from '../../domain/errors/DomainError';
import { PrismaClient } from '@prisma/client';
import { ComplianceBalanceValue } from '../../domain/value-objects';

export class ApplyBanked implements ApplyBankedUseCase {
    constructor(private readonly prisma: PrismaClient) { }

    public async execute(input: ApplyBankedBodyDto): Promise<ApplyBankedOutput> {
        return this.prisma.$transaction(async (tx) => {
            // 1. Fetch current Compliance Balance
            const currentYearRecord = await tx.shipCompliance.findUnique({
                where: {
                    shipId_year: {
                        shipId: input.shipId,
                        year: input.year,
                    },
                },
            });

            if (!currentYearRecord) {
                throw new DomainError(`No compliance record found for ${input.shipId} in ${input.year}`, 'NOT_FOUND');
            }

            // 2. Fetch all historical "BANK" ledgers to calculate total 'availableBanked' for this ship
            const priorBankings = await tx.bankEntry.aggregate({
                _sum: {
                    amount: true,
                },
                where: {
                    shipId: input.shipId,
                    type: 'BANK',
                    year: { lt: input.year } // Can only apply from past years
                },
            });

            const priorApplies = await tx.bankEntry.aggregate({
                _sum: {
                    amount: true,
                },
                where: {
                    shipId: input.shipId,
                    type: 'APPLY',
                    year: { lt: input.year }
                },
            });

            const totalBanked = Number(priorBankings._sum.amount || 0);
            const totalApplied = Number(priorApplies._sum.amount || 0);
            const availableBank = totalBanked - totalApplied;

            const currentWorkingCbRaw = currentYearRecord.adjustedComplianceBalance !== null
                ? Number(currentYearRecord.adjustedComplianceBalance)
                : Number(currentYearRecord.complianceBalance);

            // Wrap in Value Object
            const currentWorkingCb = ComplianceBalanceValue.create(currentWorkingCbRaw);

            // 3. Execute Pure Domain Logic
            const result = BankingService.applyBanked(currentWorkingCb, availableBank, input.amount);

            // 4. Record the specific ledger entry marking consumption of the banked surplus
            await tx.bankEntry.create({
                data: {
                    shipId: input.shipId,
                    year: input.year, // Current year consuming it
                    type: 'APPLY',
                    amount: input.amount, // Record the attempt
                }
            });

            // 5. Enhance Current Target Year Deficit
            await tx.shipCompliance.update({
                where: { id: currentYearRecord.id },
                data: {
                    adjustedComplianceBalance: result.cbAfter.value.toString(),
                    updatedAt: new Date()
                },
            });

            return {
                applied: input.amount,
                remainingBanked: result.remainingBank.value,
            };
        });
    }
}
