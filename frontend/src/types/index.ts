export interface Route {
    routeId: string;
    shipId: string;
    vesselType: string;
    fuelType: string;
    year: number;
    ghgIntensity: number;
    fuelConsumptionTonnes: number;
    distanceKm: number;
    totalEmissionsTonnes: number;
    isBaseline: boolean;
}

export interface Comparison {
    target: number;
    baseline: {
        routeId: string;
        ghgIntensity: number;
    } | null;
    comparisons: {
        routeId: string;
        ghgIntensity: number;
        percentDiff: number;
        compliant: boolean;
    }[];
}

export interface BankEntry {
    id: string;
    shipId: string;
    year: number;
    amount: number;
    type: 'SURPLUS' | 'APPLY';
    createdAt: string;
}

export interface PoolMember {
    shipId: string;
    cbBefore: number;
    cbAfter: number;
}

export interface Pool {
    poolId: string;
    year: number;
    members: PoolMember[];
}

export interface DashboardData {
    cbBefore: number;
    bankApplied: number;
    cbAfter: number;
    shipId: string;
    year: number;
}

export interface PaginatedResponse<T> {
    data: T[];
    pagination: {
        page: number;
        limit: number;
        total: number;
    };
}

export interface StandardResponse<T> {
    data: T;
}
