import { Request, Response } from 'express';
import { ComputeComplianceBalanceUseCase } from '../../../../core/ports/inbound/ComputeComplianceBalanceUseCase';
import { computeCbQuerySchema } from '../../../../core/application/dto/ComplianceDTO';

export class ComplianceController {
    constructor(private readonly computeCbUseCase: ComputeComplianceBalanceUseCase) { }

    public async getComplianceBalance(req: Request, res: Response): Promise<void> {
        const query = computeCbQuerySchema.parse(req.query);

        const result = await this.computeCbUseCase.execute({
            shipId: query.shipId,
            year: query.year,
        });

        res.status(200).json({ data: result });
    }

    public async getAdjustedCb(req: Request, res: Response): Promise<void> {
        const query = computeCbQuerySchema.parse(req.query);

        // Stub functionality to return adjusted CB structure
        res.status(200).json({
            data: {
                shipId: query.shipId,
                year: query.year,
                cbBefore: -3400000,
                bankApplied: 2000000,
                cbAfter: -1400000
            }
        });
    }
}
