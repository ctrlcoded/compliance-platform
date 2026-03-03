"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.poolMembers = exports.pools = exports.bankEntries = exports.shipCompliance = exports.routes = void 0;
const drizzle_orm_1 = require("drizzle-orm");
const pg_core_1 = require("drizzle-orm/pg-core");
exports.routes = (0, pg_core_1.pgTable)('routes', {
    id: (0, pg_core_1.uuid)('id').primaryKey().defaultRandom(),
    routeId: (0, pg_core_1.varchar)('route_id', { length: 50 }).notNull(),
    shipId: (0, pg_core_1.varchar)('ship_id', { length: 50 }).notNull(),
    vesselType: (0, pg_core_1.varchar)('vessel_type', { length: 50 }).notNull(),
    fuelType: (0, pg_core_1.varchar)('fuel_type', { length: 50 }).notNull(),
    year: (0, pg_core_1.integer)('year').notNull(),
    ghgIntensity: (0, pg_core_1.numeric)('ghg_intensity', { precision: 10, scale: 4 }).notNull(),
    fuelConsumptionTonnes: (0, pg_core_1.numeric)('fuel_consumption_tonnes', { precision: 14, scale: 4 }).notNull(),
    distanceKm: (0, pg_core_1.numeric)('distance_km', { precision: 14, scale: 2 }).notNull(),
    totalEmissionsTonnes: (0, pg_core_1.numeric)('total_emissions_tonnes', { precision: 14, scale: 4 }).notNull(),
    isBaseline: (0, pg_core_1.boolean)('is_baseline').notNull().default(false),
    createdAt: (0, pg_core_1.timestamp)('created_at').notNull().defaultNow(),
    updatedAt: (0, pg_core_1.timestamp)('updated_at').notNull().defaultNow(),
}, (table) => {
    return {
        uxRouteBaseline: (0, pg_core_1.uniqueIndex)('ux_route_baseline_per_ship_year')
            .on(table.shipId, table.year)
            .where((0, drizzle_orm_1.sql) `${table.isBaseline} = true`),
    };
});
exports.shipCompliance = (0, pg_core_1.pgTable)('ship_compliance', {
    id: (0, pg_core_1.uuid)('id').primaryKey().defaultRandom(),
    shipId: (0, pg_core_1.varchar)('ship_id', { length: 50 }).notNull(),
    year: (0, pg_core_1.integer)('year').notNull(),
    targetIntensity: (0, pg_core_1.numeric)('target_intensity', { precision: 10, scale: 4 }).notNull(),
    actualIntensity: (0, pg_core_1.numeric)('actual_intensity', { precision: 10, scale: 4 }).notNull(),
    energyInScope: (0, pg_core_1.numeric)('energy_in_scope', { precision: 18, scale: 4 }).notNull(),
    complianceBalance: (0, pg_core_1.numeric)('compliance_balance', { precision: 20, scale: 4 }).notNull(),
    adjustedComplianceBalance: (0, pg_core_1.numeric)('adjusted_compliance_balance', { precision: 20, scale: 4 }),
    createdAt: (0, pg_core_1.timestamp)('created_at').notNull().defaultNow(),
    updatedAt: (0, pg_core_1.timestamp)('updated_at').notNull().defaultNow(),
});
exports.bankEntries = (0, pg_core_1.pgTable)('bank_entries', {
    id: (0, pg_core_1.uuid)('id').primaryKey().defaultRandom(),
    shipId: (0, pg_core_1.varchar)('ship_id', { length: 50 }).notNull(),
    year: (0, pg_core_1.integer)('year').notNull(),
    type: (0, pg_core_1.varchar)('type', { length: 10 }).notNull(), // BANK or APPLY
    amount: (0, pg_core_1.numeric)('amount', { precision: 20, scale: 4 }).notNull(),
    createdAt: (0, pg_core_1.timestamp)('created_at').notNull().defaultNow(),
});
exports.pools = (0, pg_core_1.pgTable)('pools', {
    id: (0, pg_core_1.uuid)('id').primaryKey().defaultRandom(),
    year: (0, pg_core_1.integer)('year').notNull(),
    createdAt: (0, pg_core_1.timestamp)('created_at').notNull().defaultNow(),
});
exports.poolMembers = (0, pg_core_1.pgTable)('pool_members', {
    id: (0, pg_core_1.uuid)('id').primaryKey().defaultRandom(),
    poolId: (0, pg_core_1.uuid)('pool_id')
        .notNull()
        .references(() => exports.pools.id, { onDelete: 'cascade' }),
    shipId: (0, pg_core_1.varchar)('ship_id', { length: 50 }).notNull(),
    cbBefore: (0, pg_core_1.numeric)('cb_before', { precision: 20, scale: 4 }).notNull(),
    cbAfter: (0, pg_core_1.numeric)('cb_after', { precision: 20, scale: 4 }).notNull(),
    createdAt: (0, pg_core_1.timestamp)('created_at').notNull().defaultNow(),
});
