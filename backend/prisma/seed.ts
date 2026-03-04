import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

/**
 * ============================================================================
 * SEED DATA – FuelEU Maritime Compliance Platform
 * ============================================================================
 * All values are DETERMINISTIC for demo reproducibility and screenshot-readiness.
 *
 * Per schema.prisma, there is no User/Vessel table. Ships are identified by
 * their IMO numbers carried in the JWT token. This seed populates:
 *   - 6 Ships via ShipCompliance + Route records
 *   - 18 Routes (3 per ship, varied fuel types and distances)
 *   - 8 BankEntry ledger rows
 *   - 1 Pool with 3 members demonstrating deficit offset
 *
 * Business scenario summary:
 *   IMO-1111111  Container Ship   LNG     SURPLUS  → banks 50%
 *   IMO-2222222  Bulk Carrier     HFO     DEFICIT  → offset via pool
 *   IMO-3333333  Ro-Ro Cargo      HFO     DEFICIT  → offset via pool
 *   IMO-4444444  Cruise Ship      LNG     SURPLUS  → pool savior
 *   IMO-5555555  Oil Tanker       HFO     DEFICIT  → covered by banking APPLY
 *   IMO-6666666  Gas Carrier      LNG     SURPLUS  → untouched baseline
 * ============================================================================
 */

// ─── Ship definitions with FIXED realistic intensities ───────────────────────
const TARGET_INTENSITY = 89.34; // FuelEU 2025 target (gCO2eq/MJ)
const YEAR = 2025;

interface ShipSeed {
    shipId: string;
    vesselType: string;
    fuelType: string;
    actualIntensity: number;
    energyInScope: number;
    routes: { distance: number; consumption: number }[];
}

const SHIPS: ShipSeed[] = [
    {
        shipId: 'IMO-1111111',
        vesselType: 'Container Ship',
        fuelType: 'LNG',
        actualIntensity: 83.20,   // Well below target → surplus
        energyInScope: 420000,
        routes: [
            { distance: 2850, consumption: 427.5 },
            { distance: 1620, consumption: 243.0 },
            { distance: 980, consumption: 147.0 },
        ],
    },
    {
        shipId: 'IMO-2222222',
        vesselType: 'Bulk Carrier',
        fuelType: 'HFO',
        actualIntensity: 94.80,   // Above target → deficit
        energyInScope: 310000,
        routes: [
            { distance: 3200, consumption: 480.0 },
            { distance: 1450, consumption: 217.5 },
            { distance: 720, consumption: 108.0 },
        ],
    },
    {
        shipId: 'IMO-3333333',
        vesselType: 'Ro-Ro Cargo',
        fuelType: 'HFO',
        actualIntensity: 92.10,   // Above target → deficit
        energyInScope: 280000,
        routes: [
            { distance: 1100, consumption: 165.0 },
            { distance: 2400, consumption: 360.0 },
            { distance: 560, consumption: 84.0 },
        ],
    },
    {
        shipId: 'IMO-4444444',
        vesselType: 'Cruise Ship',
        fuelType: 'LNG',
        actualIntensity: 80.50,   // Far below target → massive surplus (pool savior)
        energyInScope: 550000,
        routes: [
            { distance: 1850, consumption: 277.5 },
            { distance: 3100, consumption: 465.0 },
            { distance: 2200, consumption: 330.0 },
        ],
    },
    {
        shipId: 'IMO-5555555',
        vesselType: 'Oil Tanker',
        fuelType: 'HFO',
        actualIntensity: 91.00,   // Slightly above target → minor deficit
        energyInScope: 200000,
        routes: [
            { distance: 900, consumption: 135.0 },
            { distance: 1300, consumption: 195.0 },
            { distance: 650, consumption: 97.5 },
        ],
    },
    {
        shipId: 'IMO-6666666',
        vesselType: 'Gas Carrier',
        fuelType: 'LNG',
        actualIntensity: 85.90,   // Below target → comfortable surplus
        energyInScope: 350000,
        routes: [
            { distance: 2100, consumption: 315.0 },
            { distance: 1750, consumption: 262.5 },
            { distance: 1400, consumption: 210.0 },
        ],
    },
];

// ─── Helpers ─────────────────────────────────────────────────────────────────
function computeCB(energyInScope: number, target: number, actual: number): number {
    // CB = Energy × (Target − Actual)
    // Positive means surplus, negative means deficit
    return Number((energyInScope * (target - actual)).toFixed(4));
}

// ─── Database operations ─────────────────────────────────────────────────────
async function clearDatabase(): Promise<void> {
    console.log('🧹 Clearing existing data...');
    // Delete in reverse-dependency order to respect FK constraints
    await prisma.idempotencyKey.deleteMany({});
    await prisma.bankEntry.deleteMany({});
    await prisma.poolMember.deleteMany({});
    await prisma.pool.deleteMany({});
    await prisma.route.deleteMany({});
    await prisma.shipCompliance.deleteMany({});
    console.log('   Done.');
}

async function seedShipsAndRoutes(): Promise<void> {
    console.log('🚢 Creating ShipCompliance records and Routes...');

    for (const ship of SHIPS) {
        const cb = computeCB(ship.energyInScope, TARGET_INTENSITY, ship.actualIntensity);

        // Create compliance record (adjustedCB starts equal to base CB)
        await prisma.shipCompliance.create({
            data: {
                shipId: ship.shipId,
                year: YEAR,
                targetIntensity: TARGET_INTENSITY,
                actualIntensity: ship.actualIntensity,
                energyInScope: ship.energyInScope,
                complianceBalance: cb,
                adjustedComplianceBalance: cb,
            },
        });

        // Create 3 route legs per ship
        const routeData = ship.routes.map((r, idx) => ({
            routeId: `${ship.shipId}-R${YEAR}-${idx + 1}`,
            shipId: ship.shipId,
            vesselType: ship.vesselType,
            fuelType: ship.fuelType,
            year: YEAR,
            ghgIntensity: ship.actualIntensity,
            fuelConsumptionTonnes: r.consumption,
            distanceKm: r.distance,
            totalEmissionsTonnes: Number((r.consumption * 3.114).toFixed(4)),  // CO2 factor
            isBaseline: idx === 0,  // First route is the baseline
        }));

        await prisma.route.createMany({ data: routeData });

        console.log(`   ${ship.shipId} (${ship.vesselType})  CB = ${cb.toLocaleString()}`);
    }
}

async function seedBanking(): Promise<void> {
    console.log('🏦 Processing Banking Transactions...');

    // ── IMO-1111111: Banks 50% of its surplus ────────────────────────────────
    const imo1 = await prisma.shipCompliance.findUniqueOrThrow({
        where: { shipId_year: { shipId: 'IMO-1111111', year: YEAR } },
    });
    const imo1CB = Number(imo1.complianceBalance);  // Positive (surplus)
    const bankAmount = Math.floor(imo1CB * 0.5);

    await prisma.bankEntry.create({
        data: { shipId: 'IMO-1111111', year: YEAR, type: 'BANK', amount: bankAmount },
    });
    await prisma.shipCompliance.update({
        where: { shipId_year: { shipId: 'IMO-1111111', year: YEAR } },
        data: { adjustedComplianceBalance: imo1CB - bankAmount },
    });
    console.log(`   IMO-1111111  BANK  ${bankAmount.toLocaleString()} → adjusted = ${(imo1CB - bankAmount).toLocaleString()}`);

    // ── IMO-5555555: Applies historical surplus to cover deficit ─────────────
    const imo5 = await prisma.shipCompliance.findUniqueOrThrow({
        where: { shipId_year: { shipId: 'IMO-5555555', year: YEAR } },
    });
    const imo5CB = Number(imo5.complianceBalance);  // Negative (deficit)
    const applyAmount = Math.abs(imo5CB);  // Apply exactly enough to reach zero

    await prisma.bankEntry.create({
        data: { shipId: 'IMO-5555555', year: YEAR, type: 'APPLY', amount: applyAmount },
    });
    await prisma.shipCompliance.update({
        where: { shipId_year: { shipId: 'IMO-5555555', year: YEAR } },
        data: { adjustedComplianceBalance: 0 },  // Fully covered by banking
    });
    console.log(`   IMO-5555555  APPLY ${applyAmount.toLocaleString()} → adjusted = 0 (deficit fully covered)`);

    // ── Additional ledger entries for demo richness ──────────────────────────
    // IMO-6666666 banks a small surplus to show variety
    const imo6 = await prisma.shipCompliance.findUniqueOrThrow({
        where: { shipId_year: { shipId: 'IMO-6666666', year: YEAR } },
    });
    const imo6CB = Number(imo6.complianceBalance);
    const imo6Bank = Math.floor(imo6CB * 0.3);

    await prisma.bankEntry.create({
        data: { shipId: 'IMO-6666666', year: YEAR, type: 'BANK', amount: imo6Bank },
    });
    await prisma.shipCompliance.update({
        where: { shipId_year: { shipId: 'IMO-6666666', year: YEAR } },
        data: { adjustedComplianceBalance: imo6CB - imo6Bank },
    });
    console.log(`   IMO-6666666  BANK  ${imo6Bank.toLocaleString()} → adjusted = ${(imo6CB - imo6Bank).toLocaleString()}`);
}

async function seedPools(): Promise<void> {
    console.log('🤝 Establishing Compliance Pool...');

    // Read the current adjusted balances
    const imo4 = await prisma.shipCompliance.findUniqueOrThrow({
        where: { shipId_year: { shipId: 'IMO-4444444', year: YEAR } },
    });
    const imo2 = await prisma.shipCompliance.findUniqueOrThrow({
        where: { shipId_year: { shipId: 'IMO-2222222', year: YEAR } },
    });
    const imo3 = await prisma.shipCompliance.findUniqueOrThrow({
        where: { shipId_year: { shipId: 'IMO-3333333', year: YEAR } },
    });

    const saviorBal = Number(imo4.adjustedComplianceBalance);  // Large positive
    const deficit2 = Number(imo2.adjustedComplianceBalance);  // Negative
    const deficit3 = Number(imo3.adjustedComplianceBalance);  // Negative

    const totalDeficit = Math.abs(deficit2) + Math.abs(deficit3);

    // Verify pool solvency: savior must have enough surplus
    if (saviorBal < totalDeficit) {
        console.warn('⚠️  Pool savior has insufficient surplus. Skipping pool creation.');
        return;
    }

    // Create Pool
    const pool = await prisma.pool.create({
        data: { year: YEAR },
    });

    // Insert PoolMembers with before/after snapshots
    await prisma.poolMember.createMany({
        data: [
            {
                poolId: pool.id,
                shipId: 'IMO-4444444',
                cbBefore: saviorBal,
                cbAfter: saviorBal - totalDeficit,
            },
            {
                poolId: pool.id,
                shipId: 'IMO-2222222',
                cbBefore: deficit2,
                cbAfter: 0,
            },
            {
                poolId: pool.id,
                shipId: 'IMO-3333333',
                cbBefore: deficit3,
                cbAfter: 0,
            },
        ],
    });

    // Update adjusted compliance balances
    await prisma.shipCompliance.update({
        where: { shipId_year: { shipId: 'IMO-4444444', year: YEAR } },
        data: { adjustedComplianceBalance: saviorBal - totalDeficit },
    });
    await prisma.shipCompliance.update({
        where: { shipId_year: { shipId: 'IMO-2222222', year: YEAR } },
        data: { adjustedComplianceBalance: 0 },
    });
    await prisma.shipCompliance.update({
        where: { shipId_year: { shipId: 'IMO-3333333', year: YEAR } },
        data: { adjustedComplianceBalance: 0 },
    });

    console.log(`   Pool ${pool.id} created`);
    console.log(`   IMO-4444444  gave ${totalDeficit.toLocaleString()} → adjusted = ${(saviorBal - totalDeficit).toLocaleString()}`);
    console.log(`   IMO-2222222  received ${Math.abs(deficit2).toLocaleString()} → adjusted = 0`);
    console.log(`   IMO-3333333  received ${Math.abs(deficit3).toLocaleString()} → adjusted = 0`);
}

// ─── Main ────────────────────────────────────────────────────────────────────
async function main(): Promise<void> {
    console.log('🌱 Starting database seed...\n');

    await clearDatabase();
    await seedShipsAndRoutes();
    await seedBanking();
    await seedPools();

    // ── Final summary ────────────────────────────────────────────────────────
    console.log('\n📊 Final State Summary:');
    const allCompliance = await prisma.shipCompliance.findMany({
        orderBy: { shipId: 'asc' },
    });
    console.log('┌─────────────────┬──────────────────┬──────────────────┐');
    console.log('│ Ship ID         │ Base CB          │ Adjusted CB      │');
    console.log('├─────────────────┼──────────────────┼──────────────────┤');
    for (const c of allCompliance) {
        const base = Number(c.complianceBalance).toLocaleString().padStart(16);
        const adj = Number(c.adjustedComplianceBalance).toLocaleString().padStart(16);
        console.log(`│ ${c.shipId.padEnd(15)} │${base} │${adj} │`);
    }
    console.log('└─────────────────┴──────────────────┴──────────────────┘');

    const routeCount = await prisma.route.count();
    const bankCount = await prisma.bankEntry.count();
    const poolCount = await prisma.pool.count();
    const memberCount = await prisma.poolMember.count();
    console.log(`\n   Routes: ${routeCount}  |  BankEntries: ${bankCount}  |  Pools: ${poolCount}  |  PoolMembers: ${memberCount}`);
    console.log('\n✅ Seed completed successfully!');
}

main()
    .catch((e) => {
        console.error('❌ Seed failed:', e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
