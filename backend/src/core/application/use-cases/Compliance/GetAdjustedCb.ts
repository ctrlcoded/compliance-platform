import { PrismaClient } from '@prisma/client';
import { GetAdjustedCbUseCase, AdjustedCbOutput } from '../../ports/inbound/GetAdjustedCbUseCase';
import { ComputeCbQueryDto } from '../../application/dto/ComplianceDTO';
import { DomainError } from '../../domain/errors/DomainError';

export class GetAdjustedCb implements GetAdjustedCbUseCase {
    constructor(private readonly prisma: PrismaClient) { }

    public async execute(input: ComputeCbQueryDto): Promise<AdjustedCbOutput> {
        const compliance = await this.prisma.shipCompliance.findUnique({
            where: {
                shipId_year: {
                    shipId: input.shipId,
                    year: input.year
                }
            }
        });

        if (!compliance) {
            throw new DomainError(`Compliance record not found for ship ${input.shipId} in ${input.year}`, 'NOT_FOUND');
        }

        // To compute the real adjusted CB, we need to gather total Banking history applied THIS year
        const appliedThisYear = await this.prisma.bankEntry.aggregate({
            _sum: { amount: true },
            where: {
                shipId: input.shipId,
                year: input.year,
                type: 'APPLY'
            }
        });

        const bankApplied = Number(appliedThisYear._sum.amount || 0);
        const cbBefore = Number(compliance.complianceBalance);

        // In reality, this is `compliance.adjustedComplianceBalance` which naturally tracks state via the transaction mutators we built yesterday.
        const cbAfter = compliance.adjustedComplianceBalance !== null
            ? Number(compliance.adjustedComplianceBalance)
            : cbBefore;

        return {
            shipId: input.shipId,
            year: input.year,
            cbBefore,
            bankApplied,
            cbAfter
        };
    }
}
