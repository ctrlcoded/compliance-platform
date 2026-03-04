import { DrizzleShipComplianceRepository } from '../../adapters/outbound/postgres/repositories/DrizzleShipComplianceRepository';
import { ComputeComplianceBalance } from '../../core/application/use-cases/ComputeComplianceBalance';
import { ComplianceController } from '../../adapters/inbound/http/controllers/ComplianceController';
import { RoutesController } from '../../adapters/inbound/http/controllers/RoutesController';
import { BankingController } from '../../adapters/inbound/http/controllers/BankingController';
import { PoolsController } from '../../adapters/inbound/http/controllers/PoolsController';

// Banking Use Cases
import { BankSurplus } from '../../core/application/use-cases/BankSurplus';
import { ApplyBanked } from '../../core/application/use-cases/ApplyBanked';
import { GetLedger } from '../../core/application/use-cases/GetLedger';

// Compliance Use Cases
import { GetAdjustedCb } from '../../core/application/use-cases/Compliance/GetAdjustedCb';

// Route Use Cases
import { GetRoutes } from '../../core/application/use-cases/Routes/GetRoutes';
import { CreateRoute } from '../../core/application/use-cases/Routes/CreateRoute';
import { GetRouteById } from '../../core/application/use-cases/Routes/GetRouteById';
import { SetBaseline } from '../../core/application/use-cases/Routes/SetBaseline';
import { DeleteRoute } from '../../core/application/use-cases/Routes/DeleteRoute';
import { GetComparison } from '../../core/application/use-cases/Routes/GetComparison';

// Pool Use Cases
import { CreatePool } from '../../core/application/use-cases/Pools/CreatePool';
import { GetPool } from '../../core/application/use-cases/Pools/GetPool';
import { JoinPool } from '../../core/application/use-cases/Pools/JoinPool';
import { LeavePool } from '../../core/application/use-cases/Pools/LeavePool';

// Domain Services
import { ComplianceCalculator } from '../../core/domain/services/ComplianceCalculator';

// Infrastructure
import { prisma } from '../database/prisma';

class DIContainer {
    private static instance: DIContainer;

    // Repositories
    private shipComplianceRepository: DrizzleShipComplianceRepository;

    // Domain Services
    private complianceCalculator: ComplianceCalculator;

    // Use Cases - Core
    private computeComplianceBalance: ComputeComplianceBalance;
    private getAdjustedCbUseCase: GetAdjustedCb;

    // Use Cases - Banking
    private bankSurplusUseCase: BankSurplus;
    private applyBankedUseCase: ApplyBanked;
    private getLedgerUseCase: GetLedger;

    // Use Cases - Routes
    private getRoutesUseCase: GetRoutes;
    private createRouteUseCase: CreateRoute;
    private getRouteByIdUseCase: GetRouteById;
    private setBaselineUseCase: SetBaseline;
    private deleteRouteUseCase: DeleteRoute;
    private getComparisonUseCase: GetComparison;

    // Use Cases - Pools
    private createPoolUseCase: CreatePool;
    private getPoolUseCase: GetPool;
    private joinPoolUseCase: JoinPool;
    private leavePoolUseCase: LeavePool;

    // Controllers
    private complianceController: ComplianceController;
    private routesController: RoutesController;
    private bankingController: BankingController;
    private poolsController: PoolsController;

    private constructor() {
        // 1. Repositories
        this.shipComplianceRepository = new DrizzleShipComplianceRepository();

        // 2. Domain Services
        this.complianceCalculator = new ComplianceCalculator();

        // 3. Use Cases
        this.computeComplianceBalance = new ComputeComplianceBalance(this.shipComplianceRepository);
        this.getAdjustedCbUseCase = new GetAdjustedCb(prisma);

        this.bankSurplusUseCase = new BankSurplus(prisma);
        this.applyBankedUseCase = new ApplyBanked(prisma);
        this.getLedgerUseCase = new GetLedger(prisma);

        this.getRoutesUseCase = new GetRoutes(prisma);
        this.createRouteUseCase = new CreateRoute(prisma);
        this.getRouteByIdUseCase = new GetRouteById(prisma);
        this.setBaselineUseCase = new SetBaseline(prisma);
        this.deleteRouteUseCase = new DeleteRoute(prisma);
        this.getComparisonUseCase = new GetComparison(prisma);

        this.createPoolUseCase = new CreatePool(prisma, this.complianceCalculator);
        this.getPoolUseCase = new GetPool(prisma);
        this.joinPoolUseCase = new JoinPool(prisma, this.complianceCalculator);
        this.leavePoolUseCase = new LeavePool(prisma);

        // 4. Controllers
        this.complianceController = new ComplianceController(
            this.computeComplianceBalance,
            this.getAdjustedCbUseCase
        );
        this.routesController = new RoutesController(
            this.getRoutesUseCase,
            this.createRouteUseCase,
            this.getRouteByIdUseCase,
            this.setBaselineUseCase,
            this.deleteRouteUseCase,
            this.getComparisonUseCase
        );
        this.bankingController = new BankingController(
            this.bankSurplusUseCase,
            this.applyBankedUseCase,
            this.getLedgerUseCase
        );
        this.poolsController = new PoolsController(
            this.createPoolUseCase,
            this.getPoolUseCase,
            this.joinPoolUseCase,
            this.leavePoolUseCase,
            prisma
        );
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
