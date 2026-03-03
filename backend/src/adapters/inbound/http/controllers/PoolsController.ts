import { Request, Response, NextFunction } from 'express';
import { createPoolBodySchema, getPoolParamSchema } from '../../../../core/application/dto/PoolsDTO';

export class PoolsController {

    public async createPool(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const body = createPoolBodySchema.parse(req.body);

            res.status(201).json({
                data: {
                    poolId: "P123",
                    year: body.year,
                    members: body.shipIds.map((shipId, idx) => ({
                        shipId,
                        cbBefore: idx === 0 ? 5000000 : -3000000, // Dummy initial breakdown
                        cbAfter: idx === 0 ? 2000000 : 0          // Dummy allocation outcome
                    }))
                }
            });
        } catch (error) {
            next(error);
        }
    }

    public async getPool(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const params = getPoolParamSchema.parse(req.params);

            res.status(200).json({
                data: {
                    poolId: params.poolId,
                    year: 2025,
                    members: [
                        {
                            shipId: "S1",
                            cbBefore: 5000000,
                            cbAfter: 2000000
                        },
                        {
                            shipId: "S2",
                            cbBefore: -3000000,
                            cbAfter: 0
                        }
                    ]
                }
            });
        } catch (error) {
            next(error);
        }
    }
}
