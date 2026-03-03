import { ShipCompliance } from '../../domain/entities/ShipCompliance';

export interface ShipComplianceRepository {
    findByShipIdAndYear(shipId: string, year: number): Promise<ShipCompliance | null>;
    save(compliance: ShipCompliance): Promise<void>;
}
