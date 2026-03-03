import { Request, Response } from 'express';
import { getLedgerQuerySchema, bankSurplusBodySchema, applyBankedBodySchema } from '../../../../core/application/dto/BankingDTO';

export class BankingController {

    public async getRecords(req: Request, res: Response): Promise<void> {
        const query = getLedgerQuerySchema.parse(req.query);

        res.status(200).json({
            data: [
                {
                    bankEntryId: "B001",
                    type: "BANK",
                    amount: 5000000,
                    createdAt: "2025-02-01T10:00:00Z"
                }
            ],
            pagination: {
                page: query.page,
                limit: query.limit,
                total: 1
            }
        });
    }

    public async bank(req: Request, res: Response): Promise<void> {
        const body = bankSurplusBodySchema.parse(req.body);

        res.status(201).json({
            data: {
                bankedAmount: body.amount,
                remainingSurplus: 1000000 // Dummy value 
            }
        });
    }

    public async apply(req: Request, res: Response): Promise<void> {
        const body = applyBankedBodySchema.parse(req.body);

        res.status(200).json({
            data: {
                applied: body.amount,
                remainingBanked: 3000000 // Dummy value
            }
        });
    }
}
