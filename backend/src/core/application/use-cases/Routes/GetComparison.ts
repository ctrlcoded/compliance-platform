import { PrismaClient } from '@prisma/client';
import { GetComparisonUseCase, ComparisonOutput } from '../../../ports/inbound/RouteUseCases';
import { CompareRoutesQueryDto } from '../../dto/RoutesDTO';
import { RouteComparisonService } from '../../../domain/services/RouteComparisonService';
import { DomainError } from '../../../domain/errors/DomainError';

export class GetComparison implements GetComparisonUseCase {
    constructor(private readonly prisma: PrismaClient) { }

    public async execute(query: CompareRoutesQueryDto): Promise<ComparisonOutput> {
        const allRoutesForShipYear = await this.prisma.route.findMany({
            where: {
                shipId: query.shipId,
                year: query.year
            }
        });

        if (allRoutesForShipYear.length === 0) {
            throw new DomainError(`No routes found for ship ${query.shipId} in ${query.year}`, 'NOT_FOUND');
        }

        const baselineRoute = allRoutesForShipYear.find(r => r.isBaseline);
        const targetGhg = baselineRoute ? Number(baselineRoute.ghgIntensity) : 89.3368; // Default fallback from PRD if no baseline

        const comparisons = allRoutesForShipYear
            .filter(r => !r.isBaseline)
            .map(r => {
                const comparison = RouteComparisonService.compare(targetGhg, Number(r.ghgIntensity));
                return {
                    routeId: r.routeId,
                    ghgIntensity: Number(r.ghgIntensity),
                    percentDiff: comparison.percentDiff,
                    compliant: comparison.compliant
                };
            });

        return {
            target: targetGhg,
            baseline: baselineRoute ? {
                routeId: baselineRoute.routeId,
                ghgIntensity: Number(baselineRoute.ghgIntensity)
            } : null,
            comparisons
        };
    }
}
