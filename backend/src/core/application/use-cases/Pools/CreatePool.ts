import { PrismaClient } from '@prisma/client';
import { CreatePoolUseCase, PoolOutput } from '../../ports/inbound/PoolUseCases';
import { CreatePoolBodyDto } from '../../application/dto/PoolsDTO';
import { DomainError } from '../../domain/errors/DomainError';
import { ComplianceCalculator } from '../../domain/services/ComplianceCalculator';
import { ComplianceBalanceValue, EnergyInScope, GHGIntensity } from '../../domain/value-objects';

export class CreatePool implements CreatePoolUseCase {
    constructor(private readonly prisma: PrismaClient, private readonly calculator: ComplianceCalculator) { }

    public async execute(input: CreatePoolBodyDto, allowedShipIds: string[]): Promise<PoolOutput> {
        // Verify authorization for at least one ship in the request
        const isAuthorizedForAny = input.shipIds.some(id => allowedShipIds.includes(id));
        if (!isAuthorizedForAny) {
            throw new DomainError(`Not authorized to create pools for these ships`, 'UNAUTHORIZED');
        }

        return this.prisma.$transaction(async (tx) => {
            // 1. Fetch compliance records for all requested ships defensively
            // Use map and executeRaw to lock them
            for (const shipId of input.shipIds) {
                await tx.$executeRaw`SELECT 1 FROM ship_compliance WHERE ship_id = ${shipId} AND year = ${input.year} FOR UPDATE`;
            }

            const compliances = await tx.shipCompliance.findMany({
                where: {
                    shipId: { in: input.shipIds },
                    year: input.year
                }
            });

            if (compliances.length !== input.shipIds.length) {
                throw new DomainError(`Cannot create pool: One or more ships missing compliance records for ${input.year}`, 'INVALID_OPERATION');
            }

            // 2. Pooling specific validation - verify total CB >= 0
            let totalPoolCb = 0;
            const memberData = compliances.map(c => {
                // Pool allocation logic uses the base calculated CB, not banked adjustments, to determine pool viability
                const cbRaw = Number(c.complianceBalance);
                totalPoolCb += cbRaw;

                return {
                    shipId: c.shipId,
                    cbBefore: cbRaw,
                    // Simplified pooling model: Surplus zeroed out to cover deficits, exact math in PoolAllocator
                    cbAfter: cbRaw > 0 ? 0 : cbRaw // Stub allocation
                };
            });

            if (totalPoolCb < 0) {
                throw new DomainError(`Cannot form pool: Total Compliance Balance is negative (${totalPoolCb})`, 'INVALID_OPERATION');
            }

            // 3. Persist Pool
            const pool = await tx.pool.create({
                data: { year: input.year }
            });

            // 4. Persist Pool Members
            await tx.poolMember.createMany({
                data: memberData.map(m => ({
                    poolId: pool.id,
                    shipId: m.shipId,
                    cbBefore: m.cbBefore,
                    cbAfter: m.cbAfter
                }))
            });

            return {
                poolId: pool.id,
                year: pool.year,
                members: memberData
            };
        });
    }
}
