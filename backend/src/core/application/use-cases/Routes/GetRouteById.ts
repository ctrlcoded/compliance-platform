import { PrismaClient } from '@prisma/client';
import { GetRouteByIdUseCase, RouteOutput } from '../../../ports/inbound/RouteUseCases';
import { DomainError } from '../../../domain/errors/DomainError';

export class GetRouteById implements GetRouteByIdUseCase {
    constructor(private readonly prisma: PrismaClient) { }

    public async execute(id: string, allowedShipIds: string[]): Promise<RouteOutput> {
        const route = await this.prisma.route.findUnique({
            where: { id }
        });

        if (!route) {
            throw new DomainError(`Route ${id} not found`, 'NOT_FOUND');
        }

        if (!allowedShipIds.includes(route.shipId)) {
            throw new DomainError(`Not authorized to view route for ship ${route.shipId}`, 'UNAUTHORIZED');
        }

        return {
            id: route.id,
            routeId: route.routeId,
            shipId: route.shipId,
            vesselType: route.vesselType,
            fuelType: route.fuelType,
            year: route.year,
            ghgIntensity: route.ghgIntensity.toString(),
            fuelConsumptionTonnes: route.fuelConsumptionTonnes.toString(),
            distanceKm: route.distanceKm.toString(),
            totalEmissionsTonnes: route.totalEmissionsTonnes.toString(),
            isBaseline: route.isBaseline
        };
    }
}
