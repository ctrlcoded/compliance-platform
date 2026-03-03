import { Request, Response, NextFunction } from 'express';
import { createPoolBodySchema, getPoolParamSchema, joinPoolBodySchema } from '../../../../core/application/dto/PoolsDTO';
import { CreatePoolUseCase, GetPoolUseCase, JoinPoolUseCase, LeavePoolUseCase } from '../../../../core/ports/inbound/PoolUseCases';

export class PoolsController {
    constructor(
        private readonly createPoolUseCase: CreatePoolUseCase,
        private readonly getPoolUseCase: GetPoolUseCase,
        private readonly joinPoolUseCase: JoinPoolUseCase,
        private readonly leavePoolUseCase: LeavePoolUseCase
    ) { }

    public async createPool(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const body = createPoolBodySchema.parse(req.body);
            const allowedShipIds = req.user!.shipIds;

            const result = await this.createPoolUseCase.execute(body, allowedShipIds);

            res.status(201).json({ data: result });
        } catch (error) {
            next(error);
        }
    }

    public async getPool(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const params = getPoolParamSchema.parse(req.params);

            // Pool discovery might be restricted later to pool members, but commonly accessible in platforms
            const result = await this.getPoolUseCase.execute(params.poolId);

            res.status(200).json({ data: result });
        } catch (error) {
            next(error);
        }
    }

    public async joinPool(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const params = getPoolParamSchema.parse(req.params);
            const body = joinPoolBodySchema.parse(req.body);
            const allowedShipIds = req.user!.shipIds;

            const result = await this.joinPoolUseCase.execute(params.poolId, body, allowedShipIds);

            res.status(200).json({ data: result });
        } catch (error) {
            next(error);
        }
    }

    public async leavePool(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const params = getPoolParamSchema.parse(req.params);
            // Reusing join body schema since leaving just requires the exact shipId too
            const body = joinPoolBodySchema.parse(req.body);
            const allowedShipIds = req.user!.shipIds;

            const result = await this.leavePoolUseCase.execute(params.poolId, body.shipId, allowedShipIds);

            res.status(200).json({ data: result });
        } catch (error) {
            next(error);
        }
    }
}
