import { sql } from 'drizzle-orm';
import {
    pgTable,
    uuid,
    varchar,
    integer,
    numeric,
    boolean,
    timestamp,
    uniqueIndex,
} from 'drizzle-orm/pg-core';

export const routes = pgTable(
    'routes',
    {
        id: uuid('id').primaryKey().defaultRandom(),
        routeId: varchar('route_id', { length: 50 }).notNull(),
        shipId: varchar('ship_id', { length: 50 }).notNull(),
        vesselType: varchar('vessel_type', { length: 50 }).notNull(),
        fuelType: varchar('fuel_type', { length: 50 }).notNull(),
        year: integer('year').notNull(),
        ghgIntensity: numeric('ghg_intensity', { precision: 10, scale: 4 }).notNull(),
        fuelConsumptionTonnes: numeric('fuel_consumption_tonnes', { precision: 14, scale: 4 }).notNull(),
        distanceKm: numeric('distance_km', { precision: 14, scale: 2 }).notNull(),
        totalEmissionsTonnes: numeric('total_emissions_tonnes', { precision: 14, scale: 4 }).notNull(),
        isBaseline: boolean('is_baseline').notNull().default(false),
        createdAt: timestamp('created_at').notNull().defaultNow(),
        updatedAt: timestamp('updated_at').notNull().defaultNow(),
    },
    (table) => {
        return {
            uxRouteBaseline: uniqueIndex('ux_route_baseline_per_ship_year')
                .on(table.shipId, table.year)
                .where(sql`${table.isBaseline} = true`),
        };
    }
);

export const shipCompliance = pgTable('ship_compliance', {
    id: uuid('id').primaryKey().defaultRandom(),
    shipId: varchar('ship_id', { length: 50 }).notNull(),
    year: integer('year').notNull(),
    targetIntensity: numeric('target_intensity', { precision: 10, scale: 4 }).notNull(),
    actualIntensity: numeric('actual_intensity', { precision: 10, scale: 4 }).notNull(),
    energyInScope: numeric('energy_in_scope', { precision: 18, scale: 4 }).notNull(),
    complianceBalance: numeric('compliance_balance', { precision: 20, scale: 4 }).notNull(),
    adjustedComplianceBalance: numeric('adjusted_compliance_balance', { precision: 20, scale: 4 }),
    createdAt: timestamp('created_at').notNull().defaultNow(),
    updatedAt: timestamp('updated_at').notNull().defaultNow(),
});

export const bankEntries = pgTable('bank_entries', {
    id: uuid('id').primaryKey().defaultRandom(),
    shipId: varchar('ship_id', { length: 50 }).notNull(),
    year: integer('year').notNull(),
    type: varchar('type', { length: 10 }).notNull(), // BANK or APPLY
    amount: numeric('amount', { precision: 20, scale: 4 }).notNull(),
    createdAt: timestamp('created_at').notNull().defaultNow(),
});

export const pools = pgTable('pools', {
    id: uuid('id').primaryKey().defaultRandom(),
    year: integer('year').notNull(),
    createdAt: timestamp('created_at').notNull().defaultNow(),
});

export const poolMembers = pgTable('pool_members', {
    id: uuid('id').primaryKey().defaultRandom(),
    poolId: uuid('pool_id')
        .notNull()
        .references(() => pools.id, { onDelete: 'cascade' }),
    shipId: varchar('ship_id', { length: 50 }).notNull(),
    cbBefore: numeric('cb_before', { precision: 20, scale: 4 }).notNull(),
    cbAfter: numeric('cb_after', { precision: 20, scale: 4 }).notNull(),
    createdAt: timestamp('created_at').notNull().defaultNow(),
});
