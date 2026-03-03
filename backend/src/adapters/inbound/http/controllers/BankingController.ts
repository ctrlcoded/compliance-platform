import { Request, Response, NextFunction } from 'express';
import { getLedgerQuerySchema, bankSurplusBodySchema, applyBankedBodySchema } from '../../../../core/application/dto/BankingDTO';
import { BankSurplusUseCase } from '../../../../core/ports/inbound/BankSurplusUseCase';
import { ApplyBankedUseCase } from '../../../../core/ports/inbound/ApplyBankedUseCase';
import { GetLedgerUseCase } from '../../../../core/ports/inbound/GetLedgerUseCase';

export class BankingController {
    constructor(
        private readonly bankSurplusUseCase: BankSurplusUseCase,
        private readonly applyBankedUseCase: ApplyBankedUseCase,
        private readonly getLedgerUseCase: GetLedgerUseCase
    ) { }

    public async getRecords(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const query = getLedgerQuerySchema.parse(req.query);
            const records = await this.getLedgerUseCase.execute(query);

            res.status(200).json({
                data: records.data,
                pagination: {
                    page: query.page,
                    limit: query.limit,
                    total: records.total
                }
            });
        } catch (error) {
            next(error);
        }
    }

    public async bank(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const body = bankSurplusBodySchema.parse(req.body);
            const result = await this.bankSurplusUseCase.execute(body);

            res.status(201).json({ data: result });
        } catch (error) {
            next(error);
        }
    }

    public async apply(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const body = applyBankedBodySchema.parse(req.body);
            const result = await this.applyBankedUseCase.execute(body);

            res.status(200).json({ data: result });
        } catch (error) {
            next(error);
        }
    }
}
