import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

/**
 * ============================================================================
 * MODEL ASSUMPTION BLOCK
 * ============================================================================
 * Per the `schema.prisma`, User and Vessel tables do NOT exist in this bound
 * context. The platform identifies vessels entirely by the `shipId` (typically 
 * an IMO Number like "IMO-1234567") provided via the external JWT token 
 * (`req.user.shipIds`). 
 * 
 * Therefore, we are skipping User/Vessel rows and injecting realistic Ship 
 * logical identities directly into the Route and Compliance tables. 
 * ============================================================================
 */

async function clearDatabase() {
    console.log('🧹 Clearing existing data...');
    // Delete in reverse dependency order
    await prisma.bankEntry.deleteMany({});
    await prisma.poolMember.deleteMany({});
    await prisma.pool.deleteMany({});
    await prisma.route.deleteMany({});
    await prisma.shipCompliance.deleteMany({});
}

async function main() {
    console.log('🌱 Starting database seed...');
    await clearDatabase();

    const year = 2025;
    const targetIntensity = 89.34; // Example FuelEU 2025 target gCO2eq/MJ

    // Define our Logical Vessels
    const ships = [
        { shipId: 'IMO-1111111', type: 'Container Ship', compliant: true }, // Huge Surplus
        { shipId: 'IMO-2222222', type: 'Bulk Carrier', compliant: false },  // Deficit
        { shipId: 'IMO-3333333', type: 'Ro-Ro Cargo', compliant: false },   // Deficit
        { shipId: 'IMO-4444444', type: 'Cruise Ship', compliant: true },    // Massive Surplus, pool savior
        { shipId: 'IMO-5555555', type: 'Oil Tanker', compliant: false },    // Minor Deficit, uses banking
        { shipId: 'IMO-6666666', type: 'Gas Carrier', compliant: true },    // Baseline compliant
    ];

    console.log('🚢 Creating Ship Compliance & Routes...');

    for (const ship of ships) {
        // Vary actual intensity based on compliance expectation
        const actualIntensity = ship.compliant
            ? targetIntensity - (Math.random() * 5 + 2)  // Cleaner
            : targetIntensity + (Math.random() * 5 + 2); // Dirtier

        const energyInScope = Math.floor(Math.random() * 500000) + 100000;

        // Exact formula: Energy * (Target - Actual)
        const cbRaw = energyInScope * (targetIntensity - actualIntensity);
        const complianceBalance = Number(cbRaw.toFixed(4));

        // At initial generation, adjusted = base
        const compliance = await prisma.shipCompliance.create({
            data: {
                shipId: ship.shipId,
                year,
                targetIntensity,
                actualIntensity: Number(actualIntensity.toFixed(4)),
                energyInScope,
                complianceBalance,
                adjustedComplianceBalance: complianceBalance,
            }
        });

        // Generate 3 routes per ship (18 routes total)
        const routes = [];
        for (let i = 1; i <= 3; i++) {
            const distance = Math.floor(Math.random() * 3000) + 500;
            const consumption = Number((distance * 0.15).toFixed(4));
            routes.push({
                routeId: `${ship.shipId}-R-${year}-${i}`,
                shipId: ship.shipId,
                vesselType: ship.type,
                fuelType: ship.compliant ? 'LNG' : 'HFO', // Compliant use LNG, non use Heavy Fuel Oil
                year,
                ghgIntensity: Number(actualIntensity.toFixed(4)),
                fuelConsumptionTonnes: consumption,
                distanceKm: distance,
                totalEmissionsTonnes: Number((consumption * 3.1).toFixed(4)), // Rough CO2 conversion
                isBaseline: i === 1 // Make the first route the baseline
            });
        }

        await prisma.route.createMany({ data: routes });
    }

    console.log('🏦 Processing Banking Transactions...');

    // IMO-1 banks a portion of its surplus
    const imo1 = await prisma.shipCompliance.findUnique({ where: { shipId_year: { shipId: 'IMO-1111111', year } } });
    if (imo1 && Number(imo1.complianceBalance) > 0) {
        const bankAmount = Math.floor(Number(imo1.complianceBalance) * 0.5);
        await prisma.bankEntry.create({
            data: {
                shipId: 'IMO-1111111',
                year,
                type: 'BANK',
                amount: bankAmount
            }
        });
        await prisma.shipCompliance.update({
            where: { shipId_year: { shipId: 'IMO-1111111', year } },
            data: { adjustedComplianceBalance: Number(imo1.complianceBalance) - bankAmount }
        });
    }

    // IMO-5 applies historical banking to its deficit
    const imo5 = await prisma.shipCompliance.findUnique({ where: { shipId_year: { shipId: 'IMO-5555555', year } } });
    if (imo5 && Number(imo5.complianceBalance) < 0) {
        const deficit = Math.abs(Number(imo5.complianceBalance));
        const appliedAmount = deficit * 1.5; // Simulate having abundant historical surplus
        await prisma.bankEntry.create({
            data: {
                shipId: 'IMO-5555555',
                year,
                type: 'APPLY',
                amount: appliedAmount
            }
        });
        await prisma.shipCompliance.update({
            where: { shipId_year: { shipId: 'IMO-5555555', year } },
            data: { adjustedComplianceBalance: Number(imo5.complianceBalance) + appliedAmount }
        });
    }

    console.log('🤝 Establishing Compliance Pools...');

    // Determine the exact current balances to allocate in the pool cleanly
    const imo4 = await prisma.shipCompliance.findUnique({ where: { shipId_year: { shipId: 'IMO-4444444', year } } }); // Savior
    const imo2 = await prisma.shipCompliance.findUnique({ where: { shipId_year: { shipId: 'IMO-2222222', year } } }); // Deficit
    const imo3 = await prisma.shipCompliance.findUnique({ where: { shipId_year: { shipId: 'IMO-3333333', year } } }); // Deficit

    if (imo4 && imo2 && imo3) {
        // Create Pool
        const pool = await prisma.pool.create({
            data: { year }
        });

        const saviorBal = Number(imo4.adjustedComplianceBalance);
        const def2 = Math.abs(Number(imo2.adjustedComplianceBalance));
        const def3 = Math.abs(Number(imo3.adjustedComplianceBalance));

        // Ship 4 gives enough to cover 2 and 3 exactly
        const toGive2 = def2;
        const toGive3 = def3;

        await prisma.poolMember.createMany({
            data: [
                { poolId: pool.id, shipId: 'IMO-4444444', cbBefore: saviorBal, cbAfter: saviorBal - toGive2 - toGive3 },
                { poolId: pool.id, shipId: 'IMO-2222222', cbBefore: Number(imo2.adjustedComplianceBalance), cbAfter: 0 },
                { poolId: pool.id, shipId: 'IMO-3333333', cbBefore: Number(imo3.adjustedComplianceBalance), cbAfter: 0 }
            ]
        });

        // Update ShipCompliance for the pool members
        await prisma.shipCompliance.update({
            where: { shipId_year: { shipId: 'IMO-4444444', year } },
            data: { adjustedComplianceBalance: saviorBal - toGive2 - toGive3 }
        });
        await prisma.shipCompliance.update({
            where: { shipId_year: { shipId: 'IMO-2222222', year } },
            data: { adjustedComplianceBalance: 0 }
        });
        await prisma.shipCompliance.update({
            where: { shipId_year: { shipId: 'IMO-3333333', year } },
            data: { adjustedComplianceBalance: 0 }
        });
    }

    console.log('✅ Seed completed successfully!');
}

main()
    .catch((e) => {
        console.error('❌ Expected error during seeding:', e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
