import { PrismaClient } from '@prisma/client';
import { CreateRouteUseCase, RouteOutput } from '../../../ports/inbound/RouteUseCases';
import { CreateRouteBodyDto } from '../../dto/RoutesDTO';
import { DomainError } from '../../../domain/errors/DomainError';

export class CreateRoute implements CreateRouteUseCase {
    constructor(private readonly prisma: PrismaClient) { }

    public async execute(data: CreateRouteBodyDto): Promise<RouteOutput> {
        // Simple random routeId generation for demonstration
        const generatedRouteId = `R${Math.floor(Math.random() * 10000)}`;

        const route = await this.prisma.route.create({
            data: {
                routeId: generatedRouteId,
                shipId: data.shipId,
                vesselType: data.vesselType,
                fuelType: data.fuelType,
                year: data.year,
                ghgIntensity: data.ghgIntensity,
                fuelConsumptionTonnes: data.fuelConsumptionTonnes,
                distanceKm: data.distanceKm,
                totalEmissionsTonnes: data.totalEmissionsTonnes,
                isBaseline: false // Defaults to false
            }
        });

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
