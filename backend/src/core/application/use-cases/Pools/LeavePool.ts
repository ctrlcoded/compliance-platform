import { PrismaClient } from '@prisma/client';
import { LeavePoolUseCase, PoolOutput } from '../../ports/inbound/PoolUseCases';
import { DomainError } from '../../domain/errors/DomainError';

export class LeavePool implements LeavePoolUseCase {
    constructor(private readonly prisma: PrismaClient) { }

    public async execute(poolId: string, shipId: string, allowedShipIds: string[]): Promise<PoolOutput> {
        if (!allowedShipIds.includes(shipId)) {
            throw new DomainError(`Not authorized to remove ship ${shipId} from pool`, 'UNAUTHORIZED');
        }

        return this.prisma.$transaction(async (tx) => {
            const member = await tx.poolMember.findFirst({
                where: {
                    poolId,
                    shipId
                }
            });

            if (!member) {
                throw new DomainError(`Ship ${shipId} is not a member of pool ${poolId}`, 'NOT_FOUND');
            }

            await tx.poolMember.delete({
                where: { id: member.id }
            });

            // Return remaining pool state
            const updatedPool = await tx.pool.findUnique({
                where: { id: poolId },
                include: { members: true }
            });

            // If pool is empty, we delete the pool entirely to garbage collect
            if (updatedPool && updatedPool.members.length === 0) {
                await tx.pool.delete({ where: { id: poolId } });
                return { poolId, year: updatedPool.year, members: [] };
            }

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
