import { BankSurplusUseCase, BankSurplusOutput } from '../../ports/inbound/BankSurplusUseCase';
import { BankSurplusBodyDto } from '../dto/BankingDTO';
import { BankingService } from '../../domain/services/BankingService';
import { DomainError } from '../../domain/errors/DomainError';
import { PrismaClient } from '@prisma/client';
import { ComplianceBalanceValue } from '../../domain/value-objects';

export class BankSurplus implements BankSurplusUseCase {
    constructor(private readonly prisma: PrismaClient) { }

    public async execute(input: BankSurplusBodyDto): Promise<BankSurplusOutput> {
        return this.prisma.$transaction(async (tx) => {
            // 1. Acquire row-level lock proactively to prevent double-banking requests from racing
            await tx.$executeRaw`SELECT 1 FROM ship_compliance WHERE ship_id = ${input.shipId} AND year = ${input.year} FOR UPDATE`;

            // 2. Fetch current Compliance Balance defensively
            const complianceRecord = await tx.shipCompliance.findUnique({
                where: {
                    shipId_year: {
                        shipId: input.shipId,
                        year: input.year,
                    },
                },
            });

            if (!complianceRecord) {
                throw new DomainError(`No compliance record found for ${input.shipId} in ${input.year}`, 'NOT_FOUND');
            }

            // Historically, the working 'current' CB might be 'adjustedComplianceBalance' or the exact original.
            const currentWorkingCbRaw = complianceRecord.adjustedComplianceBalance !== null
                ? Number(complianceRecord.adjustedComplianceBalance)
                : Number(complianceRecord.complianceBalance);

            // Wrap in Value Object
            const currentWorkingCb = ComplianceBalanceValue.create(currentWorkingCbRaw);

            // 2. Execute Pure Domain Logic
            const result = BankingService.bankSurplus(currentWorkingCb, input.amount);

            // 3. Persist Bank Entry Ledger
            await tx.bankEntry.create({
                data: {
                    shipId: input.shipId,
                    year: input.year,
                    type: 'BANK',
                    amount: result.bankedAmount.value, // Extract unboxed primitive scalar for Prisma
                },
            });

            // 4. Update the ShipCompliance Adjusted CB explicitly
            await tx.shipCompliance.update({
                where: { id: complianceRecord.id },
                data: {
                    adjustedComplianceBalance: result.remainingSurplus.value.toString(),
                    updatedAt: new Date()
                },
            });

            return {
                bankedAmount: result.bankedAmount.value,
                remainingSurplus: result.remainingSurplus.value,
            };
        });
    }
}
