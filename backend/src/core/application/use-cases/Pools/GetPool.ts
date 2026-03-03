import { PrismaClient } from '@prisma/client';
import { GetPoolUseCase, PoolOutput } from '../../ports/inbound/PoolUseCases';
import { DomainError } from '../../domain/errors/DomainError';

export class GetPool implements GetPoolUseCase {
    constructor(private readonly prisma: PrismaClient) { }

    public async execute(poolId: string): Promise<PoolOutput> {
        const pool = await this.prisma.pool.findUnique({
            where: { id: poolId },
            include: { members: true }
        });

        if (!pool) {
            throw new DomainError(`Pool ${poolId} not found`, 'NOT_FOUND');
        }

        return {
            poolId: pool.id,
            year: pool.year,
            members: pool.members.map(m => ({
                shipId: m.shipId,
                cbBefore: Number(m.cbBefore),
                cbAfter: Number(m.cbAfter)
            }))
        };
    }
}
