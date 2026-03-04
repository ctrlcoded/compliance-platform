import { PrismaClient } from '@prisma/client';
import { SetBaselineUseCase, RouteOutput } from '../../../ports/inbound/RouteUseCases';
import { DomainError } from '../../../domain/errors/DomainError';

export class SetBaseline implements SetBaselineUseCase {
    constructor(private readonly prisma: PrismaClient) { }

    public async execute(id: string, allowedShipIds: string[]): Promise<RouteOutput> {
        return this.prisma.$transaction(async (tx) => {
            const candidateRoute = await tx.route.findUnique({
                where: { id }
            });

            if (!candidateRoute) {
                throw new DomainError(`Route ${id} not found`, 'NOT_FOUND');
            }

            if (!allowedShipIds.includes(candidateRoute.shipId)) {
                throw new DomainError(`Not authorized to modify routes for ship ${candidateRoute.shipId}`, 'UNAUTHORIZED');
            }

            // Clear previous baselines for this ship and year
            await tx.route.updateMany({
                where: {
                    shipId: candidateRoute.shipId,
                    year: candidateRoute.year,
                    isBaseline: true
                },
                data: { isBaseline: false }
            });

            // Set this route as the new baseline
            const updatedRoute = await tx.route.update({
                where: { id },
                data: { isBaseline: true }
            });

            return {
                id: updatedRoute.id,
                routeId: updatedRoute.routeId,
                shipId: updatedRoute.shipId,
                vesselType: updatedRoute.vesselType,
                fuelType: updatedRoute.fuelType,
                year: updatedRoute.year,
                ghgIntensity: updatedRoute.ghgIntensity.toString(),
                fuelConsumptionTonnes: updatedRoute.fuelConsumptionTonnes.toString(),
                distanceKm: updatedRoute.distanceKm.toString(),
                totalEmissionsTonnes: updatedRoute.totalEmissionsTonnes.toString(),
                isBaseline: updatedRoute.isBaseline
            };
        });
    }
}
