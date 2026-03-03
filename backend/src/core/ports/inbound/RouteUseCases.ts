import { CreateRouteBodyDto, GetRoutesQueryDto, CompareRoutesQueryDto } from '../../application/dto/RoutesDTO';

export interface RouteOutput {
    id: string;
    routeId: string;
    shipId: string;
    vesselType: string;
    fuelType: string;
    year: number;
    ghgIntensity: string;
    fuelConsumptionTonnes: string;
    distanceKm: string;
    totalEmissionsTonnes: string;
    isBaseline: boolean;
}

export interface GetRoutesOutput {
    data: RouteOutput[];
    total: number;
}

export interface ComparisonOutput {
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

export interface GetRoutesUseCase {
    execute(query: GetRoutesQueryDto, allowedShipIds: string[]): Promise<GetRoutesOutput>;
}

export interface CreateRouteUseCase {
    execute(data: CreateRouteBodyDto): Promise<RouteOutput>;
}

export interface GetRouteByIdUseCase {
    execute(id: string, allowedShipIds: string[]): Promise<RouteOutput>;
}

export interface DeleteRouteUseCase {
    execute(id: string, allowedShipIds: string[]): Promise<void>;
}

export interface SetBaselineUseCase {
    execute(id: string, allowedShipIds: string[]): Promise<RouteOutput>;
}

export interface GetComparisonUseCase {
    execute(query: CompareRoutesQueryDto): Promise<ComparisonOutput>;
}
