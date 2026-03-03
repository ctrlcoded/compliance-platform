import { Request, Response, NextFunction } from 'express';
import { ComputeComplianceBalanceUseCase } from '../../../../core/ports/inbound/ComputeComplianceBalanceUseCase';
import { GetAdjustedCbUseCase } from '../../../../core/ports/inbound/GetAdjustedCbUseCase';
import { computeCbQuerySchema } from '../../../../core/application/dto/ComplianceDTO';

export class ComplianceController {
    constructor(
        private readonly computeCbUseCase: ComputeComplianceBalanceUseCase,
        private readonly getAdjustedCbUseCase: GetAdjustedCbUseCase
    ) { }

    public async getComplianceBalance(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const query = computeCbQuerySchema.parse(req.query);

            const result = await this.computeCbUseCase.execute({
                shipId: query.shipId,
                year: query.year,
            });

            res.status(200).json({ data: result });
        } catch (error) {
            next(error);
        }
    }

    public async getAdjustedCb(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const query = computeCbQuerySchema.parse(req.query);

            const result = await this.getAdjustedCbUseCase.execute({
                shipId: query.shipId,
                year: query.year,
            });

            res.status(200).json({ data: result });
        } catch (error) {
            next(error);
        }
    }
}
