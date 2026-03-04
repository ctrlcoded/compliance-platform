import { GetLedgerUseCase, GetLedgerOutput } from '../../ports/inbound/GetLedgerUseCase';
import { GetLedgerQueryDto } from '../dto/BankingDTO';
import { PrismaClient } from '@prisma/client';

export class GetLedger implements GetLedgerUseCase {
    constructor(private readonly prisma: PrismaClient) { }

    public async execute(query: GetLedgerQueryDto): Promise<GetLedgerOutput> {
        const offset = (query.page - 1) * query.limit;

        const [records, total] = await Promise.all([
            this.prisma.bankEntry.findMany({
                where: {
                    shipId: query.shipId,
                    year: query.year,
                },
                orderBy: {
                    createdAt: 'desc',
                },
                skip: offset,
                take: query.limit,
            }),
            this.prisma.bankEntry.count({
                where: {
                    shipId: query.shipId,
                    year: query.year,
                },
            })
        ]);

        return {
            data: records.map((r) => ({
                id: r.id,
                shipId: r.shipId,
                year: r.year,
                type: r.type,
                amount: Number(r.amount),
                createdAt: r.createdAt.toISOString(),
            })),
            total,
        };
    }
}
