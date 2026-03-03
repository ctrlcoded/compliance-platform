import { PrismaClient } from '@prisma/client';
import { JoinPoolUseCase, PoolOutput } from '../../ports/inbound/PoolUseCases';
import { JoinPoolBodyDto } from '../../application/dto/PoolsDTO';
import { DomainError } from '../../domain/errors/DomainError';
import { ComplianceCalculator } from '../../domain/services/ComplianceCalculator';

export class JoinPool implements JoinPoolUseCase {
    constructor(private readonly prisma: PrismaClient, private readonly calculator: ComplianceCalculator) { }

    public async execute(poolId: string, input: JoinPoolBodyDto, allowedShipIds: string[]): Promise<PoolOutput> {
        if (!allowedShipIds.includes(input.shipId)) {
            throw new DomainError(`Not authorized to add ship ${input.shipId} to a pool`, 'UNAUTHORIZED');
        }

        return this.prisma.$transaction(async (tx) => {
            const pool = await tx.pool.findUnique({
                where: { id: poolId },
                include: { members: true }
            });

            if (!pool) {
                throw new DomainError(`Pool ${poolId} not found`, 'NOT_FOUND');
            }

            if (pool.members.find(m => m.shipId === input.shipId)) {
                throw new DomainError(`Ship ${input.shipId} is already in this pool`, 'INVALID_OPERATION');
            }

            // Lock the new ship's compliance record for the pool's year
            await tx.$executeRaw`SELECT 1 FROM ship_compliance WHERE ship_id = ${input.shipId} AND year = ${pool.year} FOR UPDATE`;

            const shipCompliance = await tx.shipCompliance.findUnique({
                where: {
                    shipId_year: {
                        shipId: input.shipId,
                        year: pool.year
                    }
                }
            });

            if (!shipCompliance) {
                throw new DomainError(`Ship ${input.shipId} lacks a compliance record for year ${pool.year}`, 'INVALID_OPERATION');
            }

            // Calculate the NEW pool total CB to ensure it remains >= 0
            const oldMembersTotalCb = pool.members.reduce((sum, m) => sum + Number(m.cbBefore), 0);
            const newShipCb = Number(shipCompliance.complianceBalance);
            const newTotalCb = oldMembersTotalCb + newShipCb;

            if (newTotalCb < 0) {
                throw new DomainError(`Cannot join pool: Adding this ship drops the total pool Compliance Balance below zero (${newTotalCb})`, 'INVALID_OPERATION');
            }

            // Add member
            await tx.poolMember.create({
                data: {
                    poolId: pool.id,
                    shipId: input.shipId,
                    cbBefore: newShipCb,
                    cbAfter: newShipCb > 0 ? 0 : newShipCb // Stub allocation, recalculus in dedicated job usually
                }
            });

            // Return updated pool
            const updatedPool = await tx.pool.findUnique({
                where: { id: poolId },
                include: { members: true }
            });

            return {
                poolId: updatedPool!.id,
                year: updatedPool!.year,
                members: updatedPool!.members.map(m => ({
                    shipId: m.shipId,
                    cbBefore: Number(m.cbBefore),
                    cbAfter: Number(m.cbAfter)
                }))
            };
        });
    }
}
