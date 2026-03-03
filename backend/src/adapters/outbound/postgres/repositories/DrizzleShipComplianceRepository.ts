import { eq, and } from 'drizzle-orm';
import { db } from '../../../../infrastructure/db';
import { shipCompliance } from '../../../../infrastructure/db/schema';
import { ShipCompliance } from '../../../../core/domain/entities/ShipCompliance';
import { ShipComplianceRepository } from '../../../../core/ports/outbound/ShipComplianceRepository';

export class DrizzleShipComplianceRepository implements ShipComplianceRepository {
    public async findByShipIdAndYear(shipId: string, year: number): Promise<ShipCompliance | null> {
        const record = await db.query.shipCompliance.findFirst({
            where: and(eq(shipCompliance.shipId, shipId), eq(shipCompliance.year, year)),
        });

        if (!record) return null;

        return ShipCompliance.create(
            record.id,
            record.shipId,
            record.year,
            parseFloat(record.targetIntensity),
            parseFloat(record.actualIntensity),
            parseFloat(record.energyInScope),
            parseFloat(record.complianceBalance),
            record.adjustedComplianceBalance ? parseFloat(record.adjustedComplianceBalance) : null
        );
    }

    public async save(compliance: ShipCompliance): Promise<void> {
        await db
            .insert(shipCompliance)
            .values({
                id: compliance.id || undefined,
                shipId: compliance.shipId,
                year: compliance.year,
                targetIntensity: compliance.targetIntensity.value.toString(),
                actualIntensity: compliance.actualIntensity.value.toString(),
                energyInScope: compliance.energyInScope.value.toString(),
                complianceBalance: compliance.complianceBalance.value.toString(),
                adjustedComplianceBalance: compliance.adjustedComplianceBalance?.value.toString() || null,
            })
            .onConflictDoUpdate({
                target: [shipCompliance.shipId, shipCompliance.year],
                set: {
                    targetIntensity: compliance.targetIntensity.value.toString(),
                    actualIntensity: compliance.actualIntensity.value.toString(),
                    energyInScope: compliance.energyInScope.value.toString(),
                    complianceBalance: compliance.complianceBalance.value.toString(),
                    adjustedComplianceBalance: compliance.adjustedComplianceBalance?.value.toString() || null,
                    updatedAt: new Date(),
                },
            });
    }
}
