"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.container = void 0;
const DrizzleShipComplianceRepository_1 = require("../../adapters/outbound/postgres/repositories/DrizzleShipComplianceRepository");
const ComputeComplianceBalance_1 = require("../../core/application/use-cases/ComputeComplianceBalance");
const ComplianceController_1 = require("../../adapters/inbound/http/controllers/ComplianceController");
const RoutesController_1 = require("../../adapters/inbound/http/controllers/RoutesController");
const BankingController_1 = require("../../adapters/inbound/http/controllers/BankingController");
const PoolsController_1 = require("../../adapters/inbound/http/controllers/PoolsController");
class DIContainer {
    static instance;
    // Singletons
    shipComplianceRepository;
    computeComplianceBalance;
    complianceController;
    routesController;
    bankingController;
    poolsController;
    constructor() {
        // 1. Repositories
        this.shipComplianceRepository = new DrizzleShipComplianceRepository_1.DrizzleShipComplianceRepository();
        // 2. Use Cases
        this.computeComplianceBalance = new ComputeComplianceBalance_1.ComputeComplianceBalance(this.shipComplianceRepository);
        // 3. Controllers
        this.complianceController = new ComplianceController_1.ComplianceController(this.computeComplianceBalance);
        this.routesController = new RoutesController_1.RoutesController();
        this.bankingController = new BankingController_1.BankingController();
        this.poolsController = new PoolsController_1.PoolsController();
    }
    static getInstance() {
        if (!DIContainer.instance) {
            DIContainer.instance = new DIContainer();
        }
        return DIContainer.instance;
    }
    getComplianceController() {
        return this.complianceController;
    }
    getRoutesController() {
        return this.routesController;
    }
    getBankingController() {
        return this.bankingController;
    }
    getPoolsController() {
        return this.poolsController;
    }
}
exports.container = DIContainer.getInstance();
