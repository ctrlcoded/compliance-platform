import { Request, Response, NextFunction } from 'express';
import { getRoutesQuerySchema, baselineRouteParamSchema, compareRoutesQuerySchema, createRouteBodySchema, routeIdParamSchema } from '../../../../core/application/dto/RoutesDTO';
import { GetRoutesUseCase, CreateRouteUseCase, GetRouteByIdUseCase, SetBaselineUseCase, DeleteRouteUseCase, GetComparisonUseCase } from '../../../../core/ports/inbound/RouteUseCases';

export class RoutesController {
    constructor(
        private readonly getRoutesUseCase: GetRoutesUseCase,
        private readonly createRouteUseCase: CreateRouteUseCase,
        private readonly getRouteByIdUseCase: GetRouteByIdUseCase,
        private readonly setBaselineUseCase: SetBaselineUseCase,
        private readonly deleteRouteUseCase: DeleteRouteUseCase,
        private readonly getComparisonUseCase: GetComparisonUseCase
    ) { }

    public async getRoutes(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const query = getRoutesQuerySchema.parse(req.query);
            // Get user's authorized ship IDs from JWT token via auth middleware
            const allowedShipIds = req.user!.shipIds;

            const result = await this.getRoutesUseCase.execute(query, allowedShipIds);

            res.status(200).json({
                data: result.data,
                pagination: {
                    page: query.page || 1,
                    limit: query.limit || 10,
                    total: result.total
                }
            });
        } catch (error) {
            next(error);
        }
    }

    public async createRoute(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const body = createRouteBodySchema.parse(req.body);
            const allowedShipIds = req.user!.shipIds;

            // Authorization explicitly checked within the API layer before passing to the UC
            // Technically a middleware ownership verification is also possible, but this is explicit
            if (!allowedShipIds.includes(body.shipId)) {
                res.status(403).json({ error: { code: 'UNAUTHORIZED_SHIP', message: 'Not authorized for this shipId' } });
                return;
            }

            const result = await this.createRouteUseCase.execute(body);

            res.status(201).json({ data: result });
        } catch (error) {
            next(error);
        }
    }

    public async getRouteById(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const params = routeIdParamSchema.parse(req.params);
            const allowedShipIds = req.user!.shipIds;

            const result = await this.getRouteByIdUseCase.execute(params.id, allowedShipIds);

            res.status(200).json({ data: result });
        } catch (error) {
            next(error);
        }
    }

    public async setBaseline(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const params = baselineRouteParamSchema.parse(req.params);
            const allowedShipIds = req.user!.shipIds;

            const result = await this.setBaselineUseCase.execute(params.routeId, allowedShipIds);

            res.status(200).json({ data: result });
        } catch (error) {
            next(error);
        }
    }

    public async deleteRoute(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const params = routeIdParamSchema.parse(req.params);
            const allowedShipIds = req.user!.shipIds;

            await this.deleteRouteUseCase.execute(params.id, allowedShipIds);

            res.status(204).send();
        } catch (error) {
            next(error);
        }
    }

    public async getComparison(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const query = compareRoutesQuerySchema.parse(req.query);
            const allowedShipIds = req.user!.shipIds;

            // Strict route ownership constraint for comparison reports
            if (!allowedShipIds.includes(query.shipId)) {
                res.status(403).json({ error: { code: 'UNAUTHORIZED_SHIP', message: 'Not authorized for this shipId' } });
                return;
            }

            const result = await this.getComparisonUseCase.execute(query);

            res.status(200).json({ data: result });
        } catch (error) {
            next(error);
        }
    }
}
