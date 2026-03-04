import { PrismaClient } from '@prisma/client';
import { DeleteRouteUseCase } from '../../../ports/inbound/RouteUseCases';
import { DomainError } from '../../../domain/errors/DomainError';

export class DeleteRoute implements DeleteRouteUseCase {
    constructor(private readonly prisma: PrismaClient) { }

    public async execute(id: string, allowedShipIds: string[]): Promise<void> {
        const route = await this.prisma.route.findUnique({
            where: { id }
        });

        if (!route) {
            throw new DomainError(`Route ${id} not found`, 'NOT_FOUND');
        }

        if (!allowedShipIds.includes(route.shipId)) {
            throw new DomainError(`Not authorized to delete routes for ship ${route.shipId}`, 'UNAUTHORIZED');
        }

        if (route.isBaseline) {
            throw new DomainError(`Cannot delete a route marked as baseline. Set a new baseline first.`, 'INVALID_OPERATION');
        }

        await this.prisma.route.delete({
            where: { id }
        });
    }
}
