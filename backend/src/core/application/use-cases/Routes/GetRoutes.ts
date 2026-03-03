import { PrismaClient } from '@prisma/client';
import { GetRoutesUseCase, GetRoutesOutput } from '../../ports/inbound/RouteUseCases';
import { GetRoutesQueryDto } from '../../application/dto/RoutesDTO';

export class GetRoutes implements GetRoutesUseCase {
    constructor(private readonly prisma: PrismaClient) { }

    public async execute(query: GetRoutesQueryDto, allowedShipIds: string[]): Promise<GetRoutesOutput> {
        // Apply ownership filter
        let targetShipIds = allowedShipIds;

        // Build Prisma where clause
        const whereClause: any = {
            shipId: { in: targetShipIds }
        };

        if (query.vesselType) whereClause.vesselType = query.vesselType;
        if (query.fuelType) whereClause.fuelType = query.fuelType;
        if (query.year) whereClause.year = query.year;

        const page = query.page || 1;
        const limit = query.limit || 10;
        const skip = (page - 1) * limit;

        const [data, total] = await Promise.all([
            this.prisma.route.findMany({
                where: whereClause,
                skip,
                take: limit,
                orderBy: { createdAt: 'desc' }
            }),
            this.prisma.route.count({ where: whereClause })
        ]);

        return {
            data: data.map(r => ({
                id: r.id,
                routeId: r.routeId,
                shipId: r.shipId,
                vesselType: r.vesselType,
                fuelType: r.fuelType,
                year: r.year,
                ghgIntensity: r.ghgIntensity.toString(),
                fuelConsumptionTonnes: r.fuelConsumptionTonnes.toString(),
                distanceKm: r.distanceKm.toString(),
                totalEmissionsTonnes: r.totalEmissionsTonnes.toString(),
                isBaseline: r.isBaseline
            })),
            total
        };
    }
}
