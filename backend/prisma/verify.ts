import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function verify() {
    console.log('\n=== SHIP COMPLIANCE RECORDS ===');
    const compliance = await prisma.shipCompliance.findMany({
        orderBy: { shipId: 'asc' },
        select: {
            shipId: true,
            complianceBalance: true,
            adjustedComplianceBalance: true,
        },
    });
    for (const c of compliance) {
        const base = Number(c.complianceBalance);
        const adj = Number(c.adjustedComplianceBalance);
        const status = base > 0 ? 'SURPLUS' : 'DEFICIT';
        console.log(`  ${c.shipId}  base=${base}  adjusted=${adj}  [${status}]`);
    }

    console.log('\n=== ROW COUNTS ===');
    const routes = await prisma.route.count();
    const banks = await prisma.bankEntry.count();
    const pools = await prisma.pool.count();
    const members = await prisma.poolMember.count();
    console.log(`  Routes: ${routes}`);
    console.log(`  BankEntries: ${banks}`);
    console.log(`  Pools: ${pools}`);
    console.log(`  PoolMembers: ${members}`);

    console.log('\n=== BANK ENTRIES ===');
    const bankEntries = await prisma.bankEntry.findMany({
        orderBy: { shipId: 'asc' },
        select: { shipId: true, type: true, amount: true },
    });
    for (const b of bankEntries) {
        console.log(`  ${b.shipId}  ${b.type}  amount=${Number(b.amount)}`);
    }

    console.log('\n=== POOL MEMBERS ===');
    const poolMembers = await prisma.poolMember.findMany({
        orderBy: { shipId: 'asc' },
        include: { pool: { select: { id: true, year: true } } },
    });
    for (const pm of poolMembers) {
        console.log(`  ${pm.shipId}  pool=${pm.pool.id.substring(0, 8)}...  before=${Number(pm.cbBefore)}  after=${Number(pm.cbAfter)}`);
    }

    await prisma.$disconnect();
}

verify();
