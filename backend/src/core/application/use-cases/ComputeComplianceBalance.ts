import {
    ComputeCbInput,
    ComputeCbOutput,
    ComputeComplianceBalanceUseCase,
} from '../../ports/inbound/ComputeComplianceBalanceUseCase';
import { ShipComplianceRepository } from '../../ports/outbound/ShipComplianceRepository';
import { DomainError } from '../../domain/errors/DomainError';

export class ComputeComplianceBalance implements ComputeComplianceBalanceUseCase {
    constructor(private readonly repository: ShipComplianceRepository) { }

    public async execute(input: ComputeCbInput): Promise<ComputeCbOutput> {
        const complianceEntity = await this.repository.findByShipIdAndYear(input.shipId, input.year);

        if (!complianceEntity) {
            throw new DomainError(`Compliance record not found for ship ${input.shipId} in ${input.year}`, 'NOT_FOUND');
        }

        // In a full implementation, this might dynamically fetch routes,
        // apply ComplianceCalculator, and update the repository.
        // For this example, we return the calculated entity directly.

        return {
            shipId: complianceEntity.shipId,
            year: complianceEntity.year,
            targetIntensity: complianceEntity.targetIntensity.value,
            actualIntensity: complianceEntity.actualIntensity.value,
            energyInScope: complianceEntity.energyInScope.value,
            complianceBalance: complianceEntity.complianceBalance.value,
        };
    }
}
