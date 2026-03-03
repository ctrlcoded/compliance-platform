import { DrizzleShipComplianceRepository } from '../../adapters/outbound/postgres/repositories/DrizzleShipComplianceRepository';
import { ComputeComplianceBalance } from '../../core/application/use-cases/ComputeComplianceBalance';
import { ComplianceController } from '../../adapters/inbound/http/controllers/ComplianceController';
import { RoutesController } from '../../adapters/inbound/http/controllers/RoutesController';
import { BankingController } from '../../adapters/inbound/http/controllers/BankingController';
import { PoolsController } from '../../adapters/inbound/http/controllers/PoolsController';
import { BankSurplus } from '../../core/application/use-cases/BankSurplus';
import { ApplyBanked } from '../../core/application/use-cases/ApplyBanked';
import { GetLedger } from '../../core/application/use-cases/GetLedger';
import { PrismaClient } from '@prisma/client';

class DIContainer {
    private static instance: DIContainer;

    // Infrastructure
    private prisma: PrismaClient;

    // Singletons
    private shipComplianceRepository: DrizzleShipComplianceRepository;
    private computeComplianceBalance: ComputeComplianceBalance;
    private complianceController: ComplianceController;
    private routesController: RoutesController;
    private bankingController: BankingController;
    private poolsController: PoolsController;

    private bankSurplusUseCase: BankSurplus;
    private applyBankedUseCase: ApplyBanked;
    private getLedgerUseCase: GetLedger;

    private constructor() {
        this.prisma = new PrismaClient();

        // 1. Repositories
        this.shipComplianceRepository = new DrizzleShipComplianceRepository();

        // 2. Use Cases
        this.computeComplianceBalance = new ComputeComplianceBalance(this.shipComplianceRepository);
        this.bankSurplusUseCase = new BankSurplus(this.prisma);
        this.applyBankedUseCase = new ApplyBanked(this.prisma);
        this.getLedgerUseCase = new GetLedger(this.prisma);

        // 3. Controllers
        this.complianceController = new ComplianceController(this.computeComplianceBalance);
        this.routesController = new RoutesController();
        this.bankingController = new BankingController(
            this.bankSurplusUseCase,
            this.applyBankedUseCase,
            this.getLedgerUseCase
        );
        this.poolsController = new PoolsController();
    }

    public static getInstance(): DIContainer {
        if (!DIContainer.instance) {
            DIContainer.instance = new DIContainer();
        }
        return DIContainer.instance;
    }

    public getComplianceController(): ComplianceController {
        return this.complianceController;
    }

    public getRoutesController(): RoutesController {
        return this.routesController;
    }

    public getBankingController(): BankingController {
        return this.bankingController;
    }

    public getPoolsController(): PoolsController {
        return this.poolsController;
    }
}

export const container = DIContainer.getInstance();
