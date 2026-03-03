"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DrizzleShipComplianceRepository = void 0;
const drizzle_orm_1 = require("drizzle-orm");
const db_1 = require("../../../../infrastructure/db");
const schema_1 = require("../../../../infrastructure/db/schema");
const ShipCompliance_1 = require("../../../../core/domain/entities/ShipCompliance");
class DrizzleShipComplianceRepository {
    async findByShipIdAndYear(shipId, year) {
        const record = await db_1.db.query.shipCompliance.findFirst({
            where: (0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(schema_1.shipCompliance.shipId, shipId), (0, drizzle_orm_1.eq)(schema_1.shipCompliance.year, year)),
        });
        if (!record)
            return null;
        return ShipCompliance_1.ShipCompliance.create(record.id, record.shipId, record.year, parseFloat(record.targetIntensity), parseFloat(record.actualIntensity), parseFloat(record.energyInScope), parseFloat(record.complianceBalance), record.adjustedComplianceBalance ? parseFloat(record.adjustedComplianceBalance) : null);
    }
    async save(compliance) {
        await db_1.db
            .insert(schema_1.shipCompliance)
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
            target: [schema_1.shipCompliance.shipId, schema_1.shipCompliance.year],
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
exports.DrizzleShipComplianceRepository = DrizzleShipComplianceRepository;
